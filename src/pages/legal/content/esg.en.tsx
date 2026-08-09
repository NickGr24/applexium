/**
 * Mechanically ported from `_legacy/en/esg.html`'s `.legal-content-wrap`
 * (`class` -> `className`, tags already self-closed, `data-en` attributes
 * and the dead `id="content-ro"` toggle leftover dropped, inline `style`
 * strings turned into objects). Text is verbatim from the docx-sourced
 * legacy HTML — the source of truth per CLAUDE.md's bilingual system —
 * and must not be edited here. Typography/layout comes entirely from
 * `LegalLayout`'s own CSS, scoped by tag (h2/h3/p/ul/table), not from
 * these legacy classNames, which carry no styles of their own anymore.
 */
export default function EsgEn() {
  return (
    <>
      <div className="legal-content active">
      <p className="esg-intro">Applexium provides ESG &amp; Sustainability Reporting services to its clients. A client requesting our assistance with non-financial reporting has the right to know what our own commitment to ESG principles is. We practice what we preach.</p>
      <div className="esg-pillars">
      <div className="esg-pillar env-card">
      <div className="esg-pillar-icon env"><i className="fas fa-globe-europe"></i></div>
      <h3>Environmental</h3>
      <span className="esg-pillar-tag env">Environmental</span>
      <p>We are a digital-first company with no physical production or fleet. Our direct environmental impact is low — but we actively manage it, not ignore it.</p>
      <ul>
      <li>We prefer cloud providers with renewable energy commitments (AWS, GCP carbon neutrality programs)</li>
      <li>Computational efficiency is an AI architecture criterion — less consumption = less impact</li>
      <li>We promote remote and hybrid work to reduce commuting emissions</li>
      <li>We avoid printing documents — internal processes are digital end-to-end</li>
      </ul>
      <div className="esg-services-link"><span>Related services:</span> ESG Reporting, AI Governance Advisory</div>
      </div>
      <div className="esg-pillar soc-card">
      <div className="esg-pillar-icon soc"><i className="fas fa-hand-holding-heart"></i></div>
      <h3>Social</h3>
      <span className="esg-pillar-tag soc">Social</span>
      <p>The digital products we build must be accessible to all — regardless of the user's physical or cognitive capabilities.</p>
      <ul>
      <li>WCAG 2.1 AA digital accessibility integrated into client deliverables</li>
      <li>Legalia and Precedentia platforms support open legal and civic education</li>
      <li>Equitable, non-discriminatory workplace with equal opportunities</li>
      <li>We respond within 30 days to any report concerning users' digital rights</li>
      <li>We do not build AI systems that exclude, manipulate, or disadvantage vulnerable groups</li>
      </ul>
      <div className="esg-services-link"><span>Related services:</span> Accessibility Compliance, Legal Education Platforms</div>
      </div>
      <div className="esg-pillar gov-card">
      <div className="esg-pillar-icon gov"><i className="fas fa-landmark"></i></div>
      <h3>Governance</h3>
      <span className="esg-pillar-tag gov">Governance</span>
      <p>Transparency is not a slogan — it is a verifiable practice. All our policies are public, versioned, and auditable.</p>
      <ul>
      <li>Public documents: T&amp;C, Privacy Policy, Cookie Policy, Accessibility Statement, AI Ethics Statement, ESG Statement</li>
      <li>Compliance by Design — compliance is built into product architecture, not bolted on at the end</li>
      <li>Zero tolerance for corruption, bribery, or unfair commercial practices</li>
      <li>We refuse projects involving prohibited AI practices, regardless of contract value</li>
      <li>Annual review of all policy documents</li>
      </ul>
      <div className="esg-services-link"><span>Related services:</span> Compliance Advisory, AI Act, DORA, NIS2</div>
      </div>
      </div>
      <div className="esg-framework">
      <div className="esg-framework-title">Reference Framework</div>
      <div className="esg-framework-items">
      <div className="esg-framework-item">GRI Standards</div>
      <div className="esg-framework-item">UN SDGs 4, 9, 16</div>
      <div className="esg-framework-item">CSRD (EU 2022/2464)</div>
      </div>
      <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '12.5px', color: 'var(--text-gray)', marginTop: '14px', lineHeight: '1.7' }}>At the company's current scale, this statement represents a solid and credible voluntary commitment. As Applexium grows, it becomes the foundation for a full formal ESG report.</p>
      </div>
      <div className="esg-signatory">
      <a className="esg-signatory-name" href="mircea-ursu" style={{ textDecoration: 'none', color: 'inherit' }}>Mircea Ursu</a>
      <div className="esg-signatory-role">Director — SRL SCALELAW SOLUTIONS | Brand Applexium</div>
      <div className="esg-signatory-date">Chișinău, April 2026 · Statement reviewed annually</div>
      </div>
      </div>
      <p className="legal-copyright">© 2026 SRL SCALELAW SOLUTIONS — Applexium. All rights reserved.</p>
    </>
  )
}
