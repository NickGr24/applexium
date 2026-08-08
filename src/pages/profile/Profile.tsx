import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MonoLabel } from '../../components/MonoLabel'
import { SplitHeading } from '../../components/SplitHeading'
import { StatCount } from '../../components/StatCount'
import './profile.css'

export type ProfileFact = { value: number; suffix?: string; label: string }
export type ProfileLink = { label: string; href: string; external?: boolean }

type ProfileProps = {
  photo: string
  /** Short caps status tag — the shared hero's MonoLabel (index "01"), the
   * editorial-template equivalent of the legacy `.profile-status` badge
   * that used to float on the photo (see `mircea-ursu.tsx` for why it
   * moved into the text column instead — every other page's hero MonoLabel
   * lives there, not overlaid on an image). */
  status: string
  name: string
  /** Formal job title, e.g. "Co-fondator și CEO" — matches this person's
   * `personSource.jobTitle` in `site/jsonld.ts`. */
  role: string
  location: string
  /** "mono-факты" per the Task 17 brief: 1–3 `StatCount`s summarising the
   * person (experience, specialisation, …). Counts are derived from real
   * listed content (see each profile's own data file), never invented. */
  facts: ProfileFact[]
  /** RevealText-wrapped paragraph(s), already resolved by the caller —
   * omitted where the legacy source has no bio (`mircea-ursu.tsx`; see its
   * own comment for why one isn't invented here). */
  bio?: ReactNode
  links: ProfileLink[]
  backHref: string
  backLabel: string
  /** This person's own extra chapters (experience/education, products/
   * stack, services/work/…) — same slot pattern as `ProductPage`'s
   * `chapters`, rendered as `Section`s by the page that owns them. */
  sections?: ReactNode
}

/**
 * Shared editorial shell for the three team profiles. Unlike `ProductPage`
 * (one hero shape shared by genuinely interchangeable product pages), the
 * three people behind this template have different real content — a
 * timeline, a product list, a stats band — so only the hero (photo, name,
 * role, facts, bio, links) is truly identical; everything below it is each
 * page's own `sections`.
 */
export function Profile({ photo, status, name, role, location, facts, bio, links, backHref, backLabel, sections }: ProfileProps) {
  return (
    <div className="profile-page">
      <section className="profile-hero container">
        <div className="profile-hero__photo photo-hover">
          <img src={photo} alt={name} />
        </div>

        <div className="profile-hero__info">
          <Link className="profile-hero__back" to={backHref}>
            <span aria-hidden="true">←</span> {backLabel}
          </Link>

          <MonoLabel index="01">{status}</MonoLabel>

          <SplitHeading as="h1" className="profile-hero__name">
            {name}
          </SplitHeading>

          <p className="profile-hero__role">{role}</p>

          {facts.length > 0 && (
            <div className="profile-hero__facts">
              {facts.map(fact => (
                <StatCount key={fact.label} value={fact.value} suffix={fact.suffix} label={fact.label} />
              ))}
            </div>
          )}

          {bio}

          <div className="profile-hero__meta">
            <span className="profile-hero__location mono-label">{location}</span>
            <div className="profile-hero__links">
              {links.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="profile-link"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {sections}
    </div>
  )
}
