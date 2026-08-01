#!/usr/bin/env python3
"""
Generate the static English site under /en/ from the Romanian source pages.

Romanian stays the single source of truth: every translatable node carries its
English text in `data-en` (see CLAUDE.md). This script bakes those attributes
into real HTML so English has crawlable URLs, instead of existing only as a
client-side toggle.

Run from the repo root after editing any Romanian page:

    python3 build-en.py

Everything under en/ is generated — never hand-edit it, the next run overwrites.
"""

from __future__ import annotations

import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).parent
OUT = ROOT / "en"
SITE = "https://applexium.com"

# Pages that must not get an English twin.
SKIP = {"404.html", "google8a286773c4e6f9b1.html"}

# English <head> metadata, keyed by source filename (see en-meta.json).
META = {
    k: v for k, v in
    json.loads((ROOT / "en-meta.json").read_text(encoding="utf-8")).items()
    if not k.startswith("_")
}

# Extensions that live at the site root and must be linked absolutely from /en/,
# otherwise a relative src would resolve to /en/<asset> and 404.
ASSET_SUFFIXES = {
    ".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".avif",
    ".mp4", ".webm", ".mp3", ".ico", ".woff", ".woff2", ".ttf", ".otf",
    ".xml", ".txt", ".pdf", ".json", ".webmanifest",
}


def is_external(href: str) -> bool:
    return href.startswith(("http://", "https://", "//", "#", "mailto:", "tel:", "data:"))


def rewrite_link(value: str) -> str:
    """Point assets at the site root and page links at their English twin."""
    if not value or is_external(value):
        return value
    path = value.split("?")[0].split("#")[0]
    suffix = Path(path).suffix.lower()
    if suffix in ASSET_SUFFIXES:
        return "/" + value.lstrip("./")
    if suffix == ".html":
        return "/en/" + value.lstrip("./")
    if value in ("/", ""):
        return "/en/"
    return value


def apply_translations(soup: BeautifulSoup) -> None:
    """Swap every data-en payload into the live markup, then drop the attributes."""
    for el in soup.select("[data-en]"):
        english = el["data-en"]
        el.clear()
        # data-en holds an HTML fragment (it is assigned via innerHTML at runtime).
        for child in list(BeautifulSoup(english, "html.parser").contents):
            el.append(child)
        del el["data-en"]
        if el.has_attr("data-ro"):
            del el["data-ro"]

    for el in soup.select("[data-en-placeholder]"):
        el["placeholder"] = el["data-en-placeholder"]
        del el["data-en-placeholder"]

    for el in soup.select("[data-en-aria-label]"):
        el["aria-label"] = el["data-en-aria-label"]
        del el["data-en-aria-label"]


def strip_runtime_switcher(soup: BeautifulSoup) -> None:
    """
    Remove the client-side language engine.

    Critical: i18n.js reads localStorage['applexium-lang'] on load. Left in
    place, a visitor whose stored preference is "ro" would land on /en/ and see
    it flip to Romanian. The inline <head> script has the same problem.
    """
    for script in soup.find_all("script"):
        src = script.get("src", "")
        if src.endswith("i18n.js"):
            script.decompose()
            continue
        if not src and "applexium-lang" in (script.string or ""):
            script.decompose()


def link_switcher_to_romanian(soup: BeautifulSoup, page: str) -> None:
    """
    Turn the JS toggle into real links between the two URLs.

    The CSS active state keys off html[data-lang] + [data-lang-switch], so both
    attributes are kept; only the element type changes (button -> a).
    """
    # Extensionless, matching sitemap.xml and canonical (GitHub Pages serves
    # /emmi for emmi.html).
    stem = Path(page).stem
    ro_href = "/" if page == "index.html" else f"/{stem}"
    en_href = "/en/" if page == "index.html" else f"/en/{stem}"

    for btn in soup.select("[data-lang-switch]"):
        lang = btn["data-lang-switch"]
        link = soup.new_tag("a")
        link["class"] = btn.get("class", [])
        link["data-lang-switch"] = lang
        link["href"] = ro_href if lang == "ro" else en_href
        link["hreflang"] = lang
        link["aria-pressed"] = "true" if lang == "en" else "false"
        link.string = btn.get_text()
        btn.replace_with(link)


def apply_meta_translations(soup: BeautifulSoup, page: str) -> list[str]:
    """
    Replace Romanian <meta> content with the English text from en-meta.json.

    Body copy has data-en attributes; meta tags do not, so without this the
    English pages would show Romanian descriptions in search results. Returns
    the fields left untranslated so the build can report them.
    """
    translations = META.get(page, {})
    missing = []

    for tag in soup.find_all("meta"):
        key = tag.get("name") or tag.get("property")
        if not key or not tag.get("content"):
            continue
        if key in ("description", "keywords") or key.startswith(("og:", "twitter:")):
            # Structural values are set elsewhere and never translated.
            if key in ("og:url", "og:locale", "og:locale:alternate", "og:type",
                       "og:site_name", "og:image", "og:image:width",
                       "og:image:height", "twitter:card", "twitter:image",
                       "robots", "author", "viewport"):
                continue
            if key in translations:
                tag["content"] = translations[key]
            else:
                missing.append(key)

    return missing


def set_head_metadata(soup: BeautifulSoup, page: str) -> None:
    ro_url = f"{SITE}/" if page == "index.html" else f"{SITE}/{Path(page).stem}"
    en_url = f"{SITE}/en/" if page == "index.html" else f"{SITE}/en/{Path(page).stem}"

    html = soup.find("html")
    if html:
        html["lang"] = "en"
        html["data-lang"] = "en"

    head = soup.find("head")
    if not head:
        return

    canonical = soup.find("link", rel="canonical")
    if canonical:
        canonical["href"] = en_url
    else:
        tag = soup.new_tag("link", rel="canonical", href=en_url)
        head.append(tag)

    for prop, value in (("og:url", en_url), ("og:locale", "en_US"),
                        ("og:locale:alternate", "ro_RO")):
        tag = soup.find("meta", property=prop)
        if tag:
            tag["content"] = value

    # hreflang: replace any existing set so reruns stay idempotent.
    for tag in soup.find_all("link", rel="alternate"):
        if tag.get("hreflang"):
            tag.decompose()
    for lang, href in (("ro", ro_url), ("en", en_url), ("x-default", ro_url)):
        tag = soup.new_tag("link", rel="alternate", href=href)
        tag["hreflang"] = lang
        head.append(tag)


def localize_links(soup: BeautifulSoup) -> None:
    for tag in soup.find_all(["a", "link"]):
        if tag.has_attr("href"):
            tag["href"] = rewrite_link(tag["href"])
    for tag in soup.find_all(["img", "script", "source", "video"]):
        if tag.has_attr("src"):
            tag["src"] = rewrite_link(tag["src"])
        if tag.has_attr("poster"):
            tag["poster"] = rewrite_link(tag["poster"])


def localize_jsonld(soup: BeautifulSoup) -> None:
    """Point structured data at the English URLs and declare the language."""
    for script in soup.find_all("script", type="application/ld+json"):
        if not script.string:
            continue
        data = script.string
        data = re.sub(rf'"{re.escape(SITE)}/?"', f'"{SITE}/en/"', data)
        data = data.replace(f'"{SITE}/', f'"{SITE}/en/')
        data = data.replace(f'{SITE}/en/en/', f'{SITE}/en/')
        data = re.sub(r'"inLanguage"\s*:\s*"[^"]*"', '"inLanguage": "en"', data)
        script.string = data


def build_page(path: Path) -> list[str]:
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")

    title = soup.find("title")
    if title and title.has_attr("data-en"):
        english_title = title["data-en"]
        title.clear()
        title.append(english_title)
        del title["data-en"]

    apply_translations(soup)
    missing = apply_meta_translations(soup, path.name)
    strip_runtime_switcher(soup)
    set_head_metadata(soup, path.name)
    localize_jsonld(soup)
    localize_links(soup)
    # Must run last: localize_links() would otherwise rewrite the switcher's
    # href="/" into "/en/", pointing the Romanian link back at English.
    link_switcher_to_romanian(soup, path.name)

    out = OUT / path.name
    out.write_text(str(soup), encoding="utf-8")
    return missing


def update_romanian_page(path: Path) -> None:
    """
    Make the Romanian page point at its English twin by URL.

    Without this the EN pill would still swap text in place on the same URL,
    leaving /en/ reachable only by crawlers, and i18n.js would flip a Romanian
    URL to English whenever localStorage said "en". Idempotent: rerunning only
    rewrites what it already produced.
    """
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    page = path.name
    stem = path.stem
    ro_url = f"{SITE}/" if page == "index.html" else f"{SITE}/{stem}"
    en_url = f"{SITE}/en/" if page == "index.html" else f"{SITE}/en/{stem}"

    strip_runtime_switcher(soup)

    html = soup.find("html")
    if html:
        html["lang"] = "ro"
        html["data-lang"] = "ro"

    head = soup.find("head")
    if head:
        for tag in soup.find_all("link", rel="alternate"):
            if tag.get("hreflang"):
                tag.decompose()
        for lang, href in (("ro", ro_url), ("en", en_url), ("x-default", ro_url)):
            tag = soup.new_tag("link", rel="alternate", href=href)
            tag["hreflang"] = lang
            head.append(tag)

    ro_href = "/" if page == "index.html" else f"/{stem}"
    en_href = "/en/" if page == "index.html" else f"/en/{stem}"
    for btn in soup.select("[data-lang-switch]"):
        lang = btn["data-lang-switch"]
        link = soup.new_tag("a")
        link["class"] = btn.get("class", [])
        link["data-lang-switch"] = lang
        link["href"] = ro_href if lang == "ro" else en_href
        link["hreflang"] = lang
        link["aria-pressed"] = "true" if lang == "ro" else "false"
        link.string = btn.get_text()
        btn.replace_with(link)

    path.write_text(str(soup), encoding="utf-8")


def build_sitemap() -> int:
    """
    Mirror every Romanian entry with its English twin and cross-link them.

    The existing sitemap is the source of truth for which pages are listed and
    at what priority — projects.html is deliberately absent (orphaned
    placeholder, see CLAUDE.md) and must stay absent.
    """
    path = ROOT / "sitemap.xml"
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "xml")

    urlset = soup.find("urlset")
    urlset["xmlns:xhtml"] = "http://www.w3.org/1999/xhtml"

    today = date.today().isoformat()

    # Drop previously generated English entries first. Without this every run
    # appended a fresh copy of all 15 of them — three runs turned a 30-URL
    # sitemap into 90 URLs of duplicates.
    for url in soup.find_all("url"):
        if "/en/" in url.find("loc").get_text():
            url.decompose()

    romanian = list(soup.find_all("url"))

    for url in list(romanian):
        ro_loc = url.find("loc").get_text()
        suffix = ro_loc[len(SITE):].lstrip("/")
        en_loc = f"{SITE}/en/{suffix}"

        add_alternates(soup, url, ro_loc, en_loc)

        en_url = soup.new_tag("url")
        loc = soup.new_tag("loc")
        loc.string = en_loc
        en_url.append(loc)
        lastmod = soup.new_tag("lastmod")
        lastmod.string = today
        en_url.append(lastmod)
        priority = soup.new_tag("priority")
        priority.string = url.find("priority").get_text() if url.find("priority") else "0.5"
        en_url.append(priority)
        add_alternates(soup, en_url, ro_loc, en_loc)
        urlset.append(en_url)

    path.write_text(str(soup), encoding="utf-8")
    return len(romanian) * 2


def add_alternates(soup: BeautifulSoup, url_tag, ro_loc: str, en_loc: str) -> None:
    for existing in url_tag.find_all("xhtml:link"):
        existing.decompose()
    for lang, href in (("ro", ro_loc), ("en", en_loc), ("x-default", ro_loc)):
        link = soup.new_tag("xhtml:link")
        link["rel"] = "alternate"
        link["hreflang"] = lang
        link["href"] = href
        url_tag.append(link)


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html") if p.name not in SKIP)
    if not pages:
        print("no source pages found", file=sys.stderr)
        return 1

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()

    untranslated = {}
    for page in pages:
        missing = build_page(page)
        update_romanian_page(page)
        if missing:
            untranslated[page.name] = missing
        print(f"  {page.name}  ->  en/{page.name}")

    total = build_sitemap()

    print(f"\ngenerated {len(pages)} English pages in {OUT}")
    print("updated the Romanian sources with hreflang + cross-language links")
    print(f"sitemap.xml now lists {total} URLs with hreflang alternates")

    if untranslated:
        print("\nWARNING — these meta fields have no English text in en-meta.json")
        print("and would ship Romanian copy in search results:")
        for page, fields in untranslated.items():
            print(f"  {page}: {', '.join(fields)}")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
