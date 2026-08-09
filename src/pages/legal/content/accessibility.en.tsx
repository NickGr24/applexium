/**
 * Mechanically ported from `_legacy/en/accessibility.html`'s `.legal-content-wrap`
 * (`class` -> `className`, tags already self-closed, `data-en` attributes
 * and the dead `id="content-ro"` toggle leftover dropped, inline `style`
 * strings turned into objects). Text is verbatim from the docx-sourced
 * legacy HTML — the source of truth per CLAUDE.md's bilingual system —
 * and must not be edited here. Typography/layout comes entirely from
 * `LegalLayout`'s own CSS, scoped by tag (h2/h3/p/ul/table), not from
 * these legacy classNames, which carry no styles of their own anymore.
 */
export default function AccessibilityEn() {
  return (
    <>
      <div className="legal-content active">
      <div className="legal-info-box">
      <p>Issued by: SRL SCALELAW SOLUTIONS · Brand: Applexium</p>
      <p><span className="ib-label">Reference framework:</span> <span>EU Directive 2016/2102 on Web Accessibility</span></p>
      <p><span className="ib-label">Standard:</span> <span className="ib-value">WCAG 2.1 Level AA</span></p>
      <p>This statement applies to the applexium.com website and to Applexium's institutional clients.</p>
      </div>
      <div className="legal-info-box"><p>PART I — Accessibility of the applexium.com Website</p></div>
      <div className="legal-section">
      <div className="legal-section-num">Section 1</div>
      <h2>Our Commitment</h2>
      <p>SRL SCALELAW SOLUTIONS, operating under the Applexium brand, is committed to providing a digital environment that is inclusive and accessible to all users, regardless of their physical, cognitive, or technological capabilities.</p>
      <p>This Accessibility Statement covers the applexium.com website and describes the current level of conformance, known limitations, and contact details for reporting accessibility issues.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 2</div>
      <h2>Conformance Level of applexium.com</h2>
      <p>The applexium.com website is informational in nature (a digital business card) and is not directly subject to EU Directive 2016/2102, which applies mandatorily to public sector entities.</p>
      <p>Nevertheless, Applexium voluntarily adopts the WCAG 2.1 Level AA standard as a quality benchmark for its own website, in line with the company's values and commitment to digital inclusion.</p>
      <h3>Conformant elements</h3>
      <ul><li>Correct semantic HTML structure (hierarchical headings H1–H4);</li>
      <li>Sufficient color contrast between text and background (minimum ratio 4.5:1);</li>
      <li>Responsive design — usable on mobile, tablet, and desktop devices;</li>
      <li>Functional keyboard navigation for main elements;</li>
      <li>Alternative text (alt text) for informational images;</li>
      <li>Contact form with clear labels and descriptive error messages;</li></ul>
      <p>Readable fonts and scalable text sizes.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 3</div>
      <h2>Reporting Accessibility Issues</h2>
      <p>If you experience difficulties accessing any content on applexium.com, please contact us:</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Email</th>
      <th><a href="mailto:info@applexium.com">info@applexium.com</a></th>
      </tr>
      <tr>
      <td>Phone</td>
      <td>+373 78 76 87 65</td>
      </tr>
      <tr>
      <td>Recommended subject</td>
      <td>"Accessibility — [issue description]"</td>
      </tr>
      <tr>
      <td>Response time</td>
      <td>Within 10 business days</td>
      </tr>
      <tr>
      <td>Contact page</td>
      <td><a href="https://applexium.com/contacts" rel="noopener" target="_blank">https://applexium.com/contacts</a></td>
      </tr>
      </tbody></table>
      </div>
      <p>We are committed to reviewing every report and implementing the necessary technical solutions within a reasonable timeframe.</p>
      <p>PART II — Accessibility in Products Built for Clients</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 4</div>
      <h2>Legal Obligations of EU Institutional Clients</h2>
      <p>Directive (EU) 2016/2102 on the accessibility of websites and mobile applications of public sector bodies requires all public entities in EU member states to comply with the WCAG 2.1 Level AA standard for all digital platforms they operate.</p>
      <div className="legal-info-box">
      <p>What this means in practice for your organization:</p>
      <p>If your organization is a public institution in an EU member state and operates a website or mobile application, you are legally required to:</p>
      <p>1. Comply with the WCAG 2.1 Level AA standard;</p>
      <p>2. Publish an Accessibility Statement, updated annually;</p>
      <p>3. Provide a user feedback mechanism;</p>
      <p>4. Respond to accessibility complaints within 30 days.</p>
      <p>Non-compliance may result in sanctions from national supervisory authorities.</p>
      </div>
      <p>When Applexium builds a digital product for an EU public institution, compliance with Directive 2016/2102 and the WCAG 2.1 AA standard is integrated into the development process — not added as an afterthought.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 5</div>
      <h2>What We Deliver to Institutional Clients</h2>
      <p>Whether the client is an EU public institution or an entity from the Republic of Moldova, Applexium applies the same accessibility quality standard:</p>
      <h3>Pre-launch accessibility audit</h3>
      <p>Prior to launching any digital product, the Applexium team conducts an accessibility audit verifying:</p>
      <ul><li>Perceivability — content visible and audible to all users (alt text, contrast, captions);</li>
      <li>Operability — complete keyboard navigation, no focus traps, sufficient time for actions;</li>
      <li>Understandability — plain language, predictable UI behavior, form completion assistance;</li></ul>
      <p>Robustness — compatibility with assistive technologies (screen readers: NVDA, JAWS, VoiceOver).</p>
      <h3>Accessibility Statement for the client's product</h3>
      <p>Applexium drafts and delivers the product-specific Accessibility Statement — a mandatory document under EU Directive 2016/2102 — which includes:</p>
      <ul><li>The declared WCAG conformance level;</li>
      <li>A list of non-conformant elements with justifications (where applicable);</li>
      <li>The feedback mechanism and contact details;</li></ul>
      <p>The date of issue and annual review schedule.</p>
      <h3>Remediation and maintenance</h3>
      <p>Through technical maintenance contracts, Applexium ensures continuous monitoring of accessibility compliance and remediation of any regressions introduced by content or code updates.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 6</div>
      <h2>Why This Matters for Clients in the Republic of Moldova</h2>
      <p>Although EU Directive 2016/2102 is not currently directly binding in the Republic of Moldova, the national and European context makes digital accessibility increasingly relevant:</p>
      <p>Applexium recommends that all institutional clients in the Republic of Moldova proactively adopt the WCAG 2.1 AA standard for the following practical reasons:</p>
      <p>Future-proofing or adopting the standard now avoids significant remediation costs once it becomes legally mandatory;</p>
      <p>Access to EU funding or EU-funded digital projects require accessibility compliance — conformance opens new opportunities;</p>
      <p>Responsibility toward citizens or people with disabilities represent approximately 15% of the population — an inaccessible public digital service systematically excludes a significant portion of its beneficiaries;</p>
      <p>Reputation and quality. WCAG 2.1 AA is an internationally recognized indicator of digital maturity.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 7</div>
      <h2>Technical Reference Standard</h2>
      <p>All digital products built by Applexium for institutional clients comply with or aim to comply with:</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Primary standard</th>
      <th>WCAG 2.1 Level AA (Web Content Accessibility Guidelines)</th>
      </tr>
      <tr>
      <td>Issued by</td>
      <td>W3C — World Wide Web Consortium</td>
      </tr>
      <tr>
      <td>EU reference directive</td>
      <td>Directive (EU) 2016/2102 on web accessibility</td>
      </tr>
      <tr>
      <td>EU harmonized technical standard</td>
      <td>EN 301 549 v3.2.1</td>
      </tr>
      <tr>
      <td>Minimum guaranteed level</td>
      <td>WCAG 2.1 AA (Level A is substandard; AAA remains an aspirational goal)</td>
      </tr>
      <tr>
      <td>Testing approach</td>
      <td>Automated (axe, Lighthouse) + manual + real user testing</td>
      </tr>
      </tbody></table>
      </div>
      <p>Upon request, Applexium can provide clients with detailed audit reports (VPAT — Voluntary Product Accessibility Template), widely used in EU and US public procurement processes.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 8</div>
      <h2>Contact</h2>
      <p>For any questions regarding accessibility — whether for the applexium.com website or a digital product we are building for you:</p>
      <p><span>Email:</span> <a href="mailto:info@applexium.com">info@applexium.com</a></p>
      <p>Phone: +373 78 76 87 65</p>
      <p>Office address: Mihai Viteazul 2a, Chisinau, Moldova</p>
      <p><span>Contact page:</span> <a href="https://applexium.com/contacts" rel="noopener" target="_blank">https://applexium.com/contacts</a></p>
      <div className="legal-info-box">
      <p>Applexium — Accessibility by Design</p>
      <p>Accessibility is not an option or an add-on. It is part of the architecture of every digital product we build.</p>
      <p>We commit to updating this statement at least once a year or whenever significant changes occur to the website or applicable legal framework.</p>
      </div>
      </div>
      </div>
      <p className="legal-copyright">© 2026 SRL SCALELAW SOLUTIONS — Applexium. All rights reserved.</p>
    </>
  )
}
