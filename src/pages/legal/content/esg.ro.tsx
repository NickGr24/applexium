/**
 * Mechanically ported from `_legacy/esg.html`'s `.legal-content-wrap`
 * (`class` -> `className`, tags already self-closed, `data-en` attributes
 * and the dead `id="content-ro"` toggle leftover dropped, inline `style`
 * strings turned into objects). Text is verbatim from the docx-sourced
 * legacy HTML — the source of truth per CLAUDE.md's bilingual system —
 * and must not be edited here. Typography/layout comes entirely from
 * `LegalLayout`'s own CSS, scoped by tag (h2/h3/p/ul/table), not from
 * these legacy classNames, which carry no styles of their own anymore.
 */
export default function EsgRo() {
  return (
    <>
      <div className="legal-content active">
      <p className="esg-intro">
                Applexium oferă servicii de ESG &amp; Sustainability Reporting clienților săi. Un client care ne solicită asistență în raportarea non-financiară are dreptul să știe care este propriul nostru angajament față de principiile ESG. Practicăm ceea ce predicăm.
              </p>
      <div className="esg-pillars">
      <div className="esg-pillar env-card">
      <div className="esg-pillar-icon env"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.3 3.7 5.3 3.7 8.5S14.4 18.7 12 21c-2.4-2.3-3.7-5.3-3.7-8.5S9.6 5.8 12 3.5Z" /></svg></div>
      <h3>Mediu</h3>
      <span className="esg-pillar-tag env">Environmental</span>
      <p>Suntem o companie digital-first, fără producție fizică sau flotă proprie. Impactul direct de mediu este redus — dar îl gestionăm activ, nu îl ignorăm.</p>
      <ul>
      <li>Preferăm furnizori cloud cu angajamente de energie regenerabilă (AWS, GCP carbon neutrality programs)</li>
      <li>Eficiența computațională este criteriu de arhitectură pentru sistemele AI pe care le construim — mai puțin consum = mai puțin impact</li>
      <li>Promovăm munca remote și hibridă pentru reducerea emisiilor din deplasări</li>
      <li>Evităm tipărirea documentelor — procesele interne sunt digitale end-to-end</li>
      </ul>
      <div className="esg-services-link"><span>Servicii legate:</span> ESG Reporting, AI Governance Advisory</div>
      </div>
      <div className="esg-pillar soc-card">
      <div className="esg-pillar-icon soc"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 7.8c-1.3-1.7-4-.8-4 1.2 0 1.7 1.8 2.9 4 4.6 2.2-1.7 4-2.9 4-4.6 0-2-2.7-2.9-4-1.2Z" /><path d="M4 14.8c0-1 .8-1.8 1.8-1.8H7c.5 0 1 .2 1.4.5l1.7 1.3c.4.3.9.5 1.4.5h4.7a1.3 1.3 0 1 1 0 2.7h-4" /><path d="M4 14.8V20M16.2 17.6h1.7a1.3 1.3 0 1 0 0-2.7" /></svg></div>
      <h3>Social</h3>
      <span className="esg-pillar-tag soc">Social</span>
      <p>Produsele digitale pe care le construim trebuie să fie accesibile tuturor — indiferent de capacitățile fizice sau cognitive ale utilizatorului. Angajamentul social nu se oprește la interfață.</p>
      <ul>
      <li>Accesibilitate digitală WCAG 2.1 AA integrată în livrabilele pentru clienți</li>
      <li>Platformele Legalia și Precedentia susțin educația juridică și civică deschisă</li>
      <li>Mediu de lucru echitabil, non-discriminatoriu, cu oportunități egale</li>
      <li>Răspundem în maxim 30 zile oricărei sesizări privind drepturile digitale ale utilizatorilor</li>
      <li>Nu construim sisteme AI care exclud, manipulează sau dezavantajează grupuri vulnerabile</li>
      </ul>
      <div className="esg-services-link"><span>Servicii legate:</span> Accessibility Compliance, Legal Education Platforms</div>
      </div>
      <div className="esg-pillar gov-card">
      <div className="esg-pillar-icon gov"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 9.5 12 4.5l8.5 5" /><path d="M4 9.5h16" /><path d="M6 20.5v-8M9.5 20.5v-8M14.5 20.5v-8M18 20.5v-8" /><path d="M4.5 20.5h15" /></svg></div>
      <h3>Guvernanță</h3>
      <span className="esg-pillar-tag gov">Governance</span>
      <p>Transparența nu este un slogan — este o practică verificabilă. Toate politicile noastre sunt publice, versionate și auditabile.</p>
      <ul>
      <li>Documente publice: T&amp;C, Privacy Policy, Cookie Policy, Accessibility Statement, AI Ethics Statement, ESG Statement</li>
      <li>Compliance by Design — conformitatea este integrată în arhitectura produselor, nu adăugată la final</li>
      <li>Zero toleranță față de corupție, mită sau practici comerciale incorecte</li>
      <li>Refuzăm proiectele care implică practici AI interzise, indiferent de valoarea contractuală</li>
      <li>Revizuire anuală a tuturor documentelor de politică</li>
      </ul>
      <div className="esg-services-link"><span>Servicii legate:</span> Compliance Advisory, AI Act, DORA, NIS2</div>
      </div>
      </div>
      <div className="esg-framework">
      <div className="esg-framework-title">Cadru de referință</div>
      <div className="esg-framework-items">
      <div className="esg-framework-item">GRI Standards</div>
      <div className="esg-framework-item">UN SDGs 4, 9, 16</div>
      <div className="esg-framework-item">CSRD (UE 2022/2464)</div>
      </div>
      <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '12.5px', color: 'var(--text-gray)', marginTop: '14px', lineHeight: '1.7' }}>
                  La dimensiunea actuală a companiei, prezenta declarație reprezintă un angajament voluntar solid și credibil. Pe măsură ce Applexium crește, aceasta declarație devine baza unui raport ESG formal complet.
                </p>
      </div>
      <div className="esg-signatory">
      <a className="esg-signatory-name" href="mircea-ursu" style={{ textDecoration: 'none', color: 'inherit' }}>Mircea Ursu</a>
      <div className="esg-signatory-role">Director — SRL SCALELAW SOLUTIONS | Brand Applexium</div>
      <div className="esg-signatory-date">Chișinău, Aprilie 2026 · Declarație revizuibilă anual</div>
      </div>
      </div>
      <p className="legal-copyright">© 2026 SRL SCALELAW SOLUTIONS — Applexium. Toate drepturile rezervate.</p>
    </>
  )
}
