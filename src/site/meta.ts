import type { Lang } from '../i18n'

export const SITE_ORIGIN = 'https://applexium.com'

export type PageMetaEntry = { title: string; description: string }

/**
 * Per-page <title> and <meta name="description"> for every page in pages.json,
 * in both languages. Sourced verbatim from `_legacy/*.html` (RO: <title> /
 * <meta name="description">) and `_legacy/en/*.html` (EN: same tags), except
 * where noted below.
 *
 * accessibility/ro+en and cookie-policy/ro+en were shorter than 51 characters
 * in the legacy source, which fails the >50-char description test. Both were
 * expanded minimally with facts already present on the same legacy page
 * (accessibility: the WCAG 2.1 AA / EU Directive 2016/2102 reference already
 * quoted in that page's own JSON-LD description; cookie-policy: what the page
 * itself covers) rather than inventing new claims.
 */
export const pageMeta: Record<string, Record<Lang, PageMetaEntry>> = {
  home: {
    ro: {
      title: 'Applexium — Produse digitale, servicii IT și consultanță pentru instituții și afaceri',
      description:
        'Applexium creează produse digitale sigure, oferă servicii IT și consultanță pentru instituții și afaceri. Platforme, agenți AI, aplicații mobile și soluții legal-tech din Moldova.',
    },
    en: {
      title: 'Applexium - Digital Products, IT Services & Consulting for Institutions and Business',
      description:
        'Applexium builds secure digital products and provides IT services and consulting for institutions and business. Platforms, AI agents, mobile apps and legal-tech solutions from Moldova.',
    },
  },
  emmi: {
    ro: {
      title: 'Emmi — AI conversațional multi-canal | Applexium',
      description:
        'Emmi este un AI conversațional multi-canal pentru afaceri — răspunde la apeluri telefonice, chat web și mesaje pe Instagram, WhatsApp și Telegram, 24/7, în română și rusă, bazat pe propriile tale documente.',
    },
    en: {
      title: 'Emmi — Multi-Channel Conversational AI | Applexium',
      description:
        'Emmi is a multi-channel conversational AI for business — it answers phone calls, web chat and messages on Instagram, WhatsApp and Telegram, 24/7, in Romanian and Russian, grounded in your own documents.',
    },
  },
  legalia: {
    ro: {
      title: 'Legalia - Platformă de educație juridică | Applexium',
      description:
        'Legalia este o platformă de educație juridică creată pentru Moldova, care ajută utilizatorii să înțeleagă legislația prin cursuri structurate, teste interactive și educație juridică accesibilă.',
    },
    en: {
      title: 'Legalia - Legal Learning Platform | Applexium',
      description:
        'Legalia is a legal education platform built for Moldova, helping users understand legislation through structured courses, interactive quizzes and accessible legal education.',
    },
  },
  precedentia: {
    ro: {
      title: 'Precedentia — Motor de căutare juridică cu AI | Applexium',
      description:
        'Precedentia este un motor de căutare juridică bazat pe AI pentru jurisprudența Moldovei și României. Peste 275.000 de hotărâri — CSJ, Curtea Constituțională, CEDO și ÎCCJ — cu căutare după cuvinte-cheie, semantică și asistent AI.',
    },
    en: {
      title: 'Precedentia - AI Legal Search Engine | Applexium',
      description:
        "Precedentia is an AI-powered legal search engine for Moldovan and Romanian case law. Over 275,000 decisions — Supreme Court of Justice, Constitutional Court, ECHR and Romania's High Court of Cassation and Justice — with keyword, semantic and AI-assistant search.",
    },
  },
  team: {
    ro: {
      title: 'Echipa noastră - Applexium',
      description:
        'Cunoaște echipa Applexium — minți pasionate dedicate construirii de soluții digitale inovatoare. Condusă de CEO Mircea Ursu și CTO Nichita Griu.',
    },
    en: {
      title: 'Our Team - Applexium',
      description:
        'Meet the Applexium team — passionate minds dedicated to building innovative digital solutions. Led by CEO Mircea Ursu and CTO Nichita Griu.',
    },
  },
  'mircea-ursu': {
    ro: {
      title: 'Mircea Ursu — CEO | Applexium',
      description:
        'Mircea Ursu — Co-fondator și CEO al Applexium. Cu experiență în drept, conformitate bancară, servicii AML și dezvoltarea de produse digitale în Moldova.',
    },
    en: {
      title: 'Mircea Ursu - CEO | Applexium',
      description:
        'Mircea Ursu — Co-founder and CEO of Applexium. Background in law, banking compliance, AML services and digital product development in Moldova.',
    },
  },
  'nichita-griu': {
    ro: {
      title: 'Nichita Griu — CTO | Applexium',
      description:
        'Nichita Griu — Co-fondator și CTO al Applexium. Inginer full-stack și mobile din spatele Legalia și Emmi, specializat în React Native, backend-uri în timp real și AI aplicat.',
    },
    en: {
      title: 'Nichita Griu - CTO | Applexium',
      description:
        'Nichita Griu — Co-founder and CTO of Applexium. Full-stack and mobile engineer behind Legalia and Emmi, specialising in React Native, real-time backends and applied AI.',
    },
  },
  'diana-tatar': {
    ro: {
      title: 'Diana Tatar - CMO | Applexium',
      description:
        'Diana Tatar — Chief Marketing Officer la Applexium. Designer grafic și creatoare de conținut AI cu 6 ani de experiență, peste 10 branduri și peste 200 de clienți în branding, social media, editorial și conținut AI.',
    },
    en: {
      title: 'Diana Tatar - CMO | Applexium',
      description:
        'Diana Tatar — Chief Marketing Officer at Applexium. Graphic designer and AI content creator with 6 years of experience, 10+ brands and 200+ clients across branding, social media, editorial and AI content.',
    },
  },
  projects: {
    ro: {
      title: 'Proiecte și studii de caz | Applexium',
      description:
        'Studii de caz din instituții publice și programe europene — INJ, EUroBRIDGE UA-MD, CMDA — și celelalte platforme livrate clienților de Applexium.',
    },
    en: {
      title: 'Projects and case studies | Applexium',
      description:
        'Case studies from public institutions and EU programmes — INJ, EUroBRIDGE UA-MD, CMDA — and the other platforms Applexium delivered to clients.',
    },
  },
  contacts: {
    ro: {
      title: 'Contactează-ne - Applexium',
      description:
        'Contactează Applexium pentru dezvoltare software personalizată, consultanță IT, consultanță pentru startup-uri și soluții de produse digitale în Moldova.',
    },
    en: {
      title: 'Contact Us - Applexium',
      description:
        'Contact Applexium for custom software development, IT consulting, startup advisory and digital product solutions in Moldova.',
    },
  },
  accessibility: {
    ro: {
      title: 'Declarație de Accesibilitate | Applexium',
      description:
        'Declarația de Accesibilitate pentru applexium.com, conform standardului WCAG 2.1 nivel AA și Directivei UE 2016/2102.',
    },
    en: {
      title: 'Accessibility Statement | Applexium',
      description:
        'Accessibility Statement for applexium.com, in line with WCAG 2.1 level AA and EU Directive 2016/2102.',
    },
  },
  'ai-ethics': {
    ro: {
      title: 'Declarație de etică AI | Applexium',
      description:
        'Declarație privind principiile etice și utilizarea responsabilă a inteligenței artificiale de către Applexium',
    },
    en: {
      title: 'AI Ethics Statement | Applexium',
      description: "Statement on Applexium's ethical principles and responsible use of artificial intelligence",
    },
  },
  'cookie-policy': {
    ro: {
      title: 'Politica de cookie-uri | Applexium',
      description:
        'Politica de cookie-uri pentru site-ul applexium.com — ce cookie-uri folosim și cum le poți controla.',
    },
    en: {
      title: 'Cookie Policy | Applexium',
      description: 'Cookie Policy for the applexium.com website — what cookies we use and how you can control them.',
    },
  },
  esg: {
    ro: {
      title: 'Declarație ESG | Applexium',
      description: 'Declarație ESG — angajamentele de mediu, sociale și de guvernanță ale Applexium',
    },
    en: {
      title: 'ESG Statement | Applexium',
      description: "ESG Statement — Applexium's environmental, social and governance commitments",
    },
  },
  'privacy-policy': {
    ro: {
      title: 'Politica de confidențialitate | Applexium',
      description:
        'Politica de confidențialitate și protecția datelor cu caracter personal pentru applexium.com',
    },
    en: {
      title: 'Privacy Policy | Applexium',
      description: 'Privacy policy and personal data protection for applexium.com',
    },
  },
  'terms-and-conditions': {
    ro: {
      title: 'Termeni și condiții | Applexium',
      description: 'Termenii și condițiile de utilizare ale site-ului applexium.com.',
    },
    en: {
      title: 'Terms & Conditions | Applexium',
      description: 'Terms and conditions of use for the applexium.com website.',
    },
  },
  // 2026-09 audit: case studies (item 2), trust page (item 7), 404 (item 10).
  'case-inj': {
    ro: {
      title: 'Studiu de caz: Emmi la Institutul Național al Justiției | Applexium',
      description:
        'Cum răspunde Emmi la mii de solicitări ale cursanților și candidaților INJ, în română, rusă și engleză, numai din documentele oficiale ale institutului.',
    },
    en: {
      title: 'Case study: Emmi at the National Institute of Justice | Applexium',
      description:
        "How Emmi answers thousands of enquiries from INJ trainees and candidates in Romanian, Russian and English, using only the institute's official documents.",
    },
  },
  'case-eurobridge': {
    ro: {
      title: 'Studiu de caz: platforma EUroBRIDGE UA-MD | Applexium',
      description:
        'Platforma programului de cooperare transfrontalieră Moldova–Ucraina și agentul Emmi care răspunde solicitanților în română, rusă, engleză și ucraineană.',
    },
    en: {
      title: 'Case study: the EUroBRIDGE UA-MD platform | Applexium',
      description:
        'The platform of the Moldova–Ukraine cross-border programme and the Emmi agent that answers applicants in Romanian, Russian, English and Ukrainian.',
    },
  },
  'case-cmda': {
    ro: {
      title: 'Studiu de caz: CMDA, site municipal cu agent AI | Applexium',
      description:
        'Site-ul Centrului Municipal pentru Dezvoltarea Antreprenoriatului din Chișinău și Emmi, care răspunde antreprenorilor în română și rusă din documentele centrului.',
    },
    en: {
      title: 'Case study: CMDA, a municipal site with an AI agent | Applexium',
      description:
        "The site of Chișinău's Municipal Centre for Entrepreneurship Development and Emmi, answering entrepreneurs in Romanian and Russian from the centre's documents.",
    },
  },
  trust: {
    ro: {
      title: 'Încredere și date: unde stau datele clienților | Applexium',
      description:
        'Găzduire în UE, izolare pe client, retenție configurabilă, protecție la prompt injection, DPA la cerere: cum tratează Applexium datele din Emmi, Legalia și Precedentia.',
    },
    en: {
      title: "Trust & data: where clients' data lives | Applexium",
      description:
        'EU hosting, per-client isolation, configurable retention, prompt-injection protection, DPA on request: how Applexium handles the data in Emmi, Legalia and Precedentia.',
    },
  },
  'not-found': {
    ro: {
      title: 'Pagina nu a fost găsită | Applexium',
      description:
        'Adresa cerută nu există pe applexium.com. Continuă de pe pagina principală, din produse sau din pagina de contact.',
    },
    en: {
      title: 'Page not found | Applexium',
      description:
        'The requested address does not exist on applexium.com. Continue from the home page, the products or the contact page.',
    },
  },
}
