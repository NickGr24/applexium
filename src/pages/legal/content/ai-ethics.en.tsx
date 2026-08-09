/**
 * Mechanically ported from `_legacy/en/ai-ethics.html`'s `.legal-content-wrap`
 * (`class` -> `className`, tags already self-closed, `data-en` attributes
 * and the dead `id="content-ro"` toggle leftover dropped, inline `style`
 * strings turned into objects). Text is verbatim from the docx-sourced
 * legacy HTML — the source of truth per CLAUDE.md's bilingual system —
 * and must not be edited here. Typography/layout comes entirely from
 * `LegalLayout`'s own CSS, scoped by tag (h2/h3/p/ul/table), not from
 * these legacy classNames, which carry no styles of their own anymore.
 */
export default function AiEthicsEn() {
  return (
    <>
      <div className="legal-content active">
      <div className="legal-info-box">
      <p>Issued by: SRL SCALELAW SOLUTIONS  |  Brand: Applexium</p>
      <p>Director: Mircea Ursu  |  <a href="mailto:info@applexium.com">info@applexium.com</a>  |  +373 78 76 87 65</p>
      <p>Reference framework: EU AI Act (Reg. UE 2024/1689)  |  OECD AI Guidelines  |  UNESCO Rec. on AI Ethics</p>
      </div>
      <div className="legal-info-box">
      <p>Applexium provides AI Act Advisory and AI Governance services to its clients. This means we help others build responsible, compliant and ethical artificial intelligence systems.</p>
      <p>Clients who come to us for AI governance have the right to know how we ourselves think about AI. You cannot advise others to follow principles that you have not defined and do not apply. This statement is not a PR document — it is our institutional position, assumed, applied and periodically reviewed.</p>
      <p>It forms the foundation of every project involving artificial intelligence, whether we build it or audit it.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 1</div>
      <h2>EU AI Act and Why It Matters</h2>
      <p>Regulamentul (UE) 2024/1689 — known as the EU AI Act — is the world's first comprehensive legal framework dedicated to regulating artificial intelligence systems. Gradually applied starting in 2024 and fully effective from 2026, it establishes:</p>
      <ul><li>A classification of AI systems by risk levels (unacceptable, high, limited, minimal);</li>
      <li>Clear obligations for developers, providers and operators of AI systems;</li>
      <li>Transparency, documentation and human oversight requirements;</li></ul>
      <p>Penalties of up to EUR 35,000,000 or 7% of annual global turnover.</p>
      <div className="legal-info-box">
      <p>Applexium's position on the EU AI Act</p>
      <p>Applexium treats the EU AI Act as a quality framework — a set of standards that protects end users and increases trust in digital products.</p>
      <p>We offer AI Act Advisory services precisely because we believe that intelligent regulation of AI is necessary and beneficial. This statement is proof that we practice what we preach.</p>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 2</div>
      <h2>Our Responsible AI Principles</h2>
      <p>All Applexium activities involving artificial intelligence — whether we develop, integrate or advise — are guided by the following fundamental principles:</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>1. Transparency</th>
      <th>Users must know when they are interacting with an AI system. We do not build AI systems that pretend to be human without the user's consent. Automated decisions must be explainable.</th>
      </tr>
      <tr>
      <td>2. Fairness and Non-Discrimination</td>
      <td>The AI systems we build are tested for bias and discrimination. We do not build or advise on systems that treat people differently based on race, gender, origin, religion or other protected characteristics.</td>
      </tr>
      <tr>
      <td>3. Human Oversight</td>
      <td>No AI system with significant impact on the rights or decisions of individuals operates without a mechanism for human oversight and intervention. Automation does not replace responsibility.</td>
      </tr>
      <tr>
      <td>4. Security and Robustness</td>
      <td>AI systems must function correctly, including under adverse conditions. We test resilience against adversarial attacks, corrupted data and distribution errors.</td>
      </tr>
      <tr>
      <td>5. Data and Privacy Protection</td>
      <td>Data used for training or operating AI systems is processed in compliance with GDPR and the applicable legal framework. Data minimization is a design principle, not an option.</td>
      </tr>
      <tr>
      <td>6. Accountability</td>
      <td>Every AI system has an identified responsible party. We know at all times who the operator, provider and contact person is for any AI system we deliver or consult on.</td>
      </tr>
      <tr>
      <td>7. Social Benefit</td>
      <td>We do not build or advise on AI systems whose sole or primary purpose is to harm, manipulate or exploit individuals or vulnerable groups.</td>
      </tr>
      <tr>
      <td>8. Sustainability</td>
      <td>We consider the energy and environmental impact of the AI systems we recommend or build. Computational efficiency is part of responsible architecture.</td>
      </tr>
      </tbody></table>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 3</div>
      <h2>Risk Classification and Our Approach</h2>
      <p>Applexium applies the EU AI Act risk taxonomy in evaluating any AI system, whether we build it for clients or audit it as part of AI Governance services:</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Risk Class</th>
      <th>AI System Examples</th>
      <th>Applexium's Approach</th>
      </tr>
      <tr>
      <td>UNACCEPTABLE RISK</td>
      <td>Social scoring, subliminal manipulation, real-time biometric identification in public spaces (general use)</td>
      <td>WE REFUSE involvement. We do not build, advise on or integrate systems in this category, regardless of the client or financial compensation.</td>
      </tr>
      <tr>
      <td>HIGH RISK</td>
      <td>AI in education, employment, healthcare, critical infrastructure, justice</td>
      <td>We accept with full due diligence: impact assessment (DPIA + AI impact), exhaustive technical documentation, mandatory human oversight, EU AI Act compliance contractually guaranteed.</td>
      </tr>
      <tr>
      <td>LIMITED RISK</td>
      <td>Chatbots, content generators, recommendation systems</td>
      <td>We accept with transparency obligations: users are informed they are interacting with AI, generated content is appropriately labeled.</td>
      </tr>
      <tr>
      <td>MINIMAL RISK</td>
      <td>Spam filters, games, aggregate data analysis systems</td>
      <td>We accept with standard security and data protection best practices.</td>
      </tr>
      </tbody></table>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 4</div>
      <h2>How We Apply These Principles in Our Services</h2>
      <h3>When we build AI products</h3>
      <p>For any digital product that includes artificial intelligence components, Applexium mandatorily integrates:</p>
      <ul><li>AI Act risk class assessment from the discovery phase;</li>
      <li>Technical documentation in accordance with Annex IV of the EU AI Act (for high-risk systems);</li>
      <li>AI System Card — a transparent description of capabilities, limitations and risks;</li>
      <li>Human oversight and intervention mechanism;</li>
      <li>Automated decision audit log;</li>
      <li>Bias and discrimination testing before launch;</li></ul>
      <p>AI security incident notification procedure.</p>
      <h3>When we provide AI Act Advisory</h3>
      <p>Our AI Governance consultancy services include:</p>
      <ul><li>Classification of existing or planned AI systems by EU AI Act risk levels;</li>
      <li>Gap analysis against EU AI Act requirements for providers and operators;</li>
      <li>Assistance in drafting mandatory technical documentation;</li>
      <li>Data Protection Impact Assessment (DPIA) with an AI component;</li>
      <li>Conformity Assessment for high-risk systems;</li>
      <li>Training and capacity building for clients' internal teams;</li></ul>
      <p>Support for registration in the EU AI Database where applicable.</p>
      <div className="legal-info-box">
      <p>Our institutional coherence commitment</p>
      <p>We do not advise clients to comply with the EU AI Act if we ourselves do not apply these principles in our own products. This statement is auditable — any client has the right to request evidence of its application.</p>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 5</div>
      <h2>Our AI Products and Principle Application</h2>
      <p>Applexium develops its own products that integrate artificial intelligence components. Below we present the compliance position for each:</p>
      <p>Emmi — AI Voice Agent</p>
      <p>Bilingual AI voice agent (Romanian/Russian) for managing institutional calls. Preliminary EU AI Act classification: limited risk. Users are informed that they are interacting with an AI system. It does not make autonomous decisions with impact on individuals' rights.</p>
      <p>Legalia — Legal Education Platform</p>
      <p>A platform for legal courses and quizzes. AI components (if integrated) are used exclusively for personalizing educational content. Classification: minimal risk. It does not generate legally binding legal advice.</p>
      <p>Precedentia — AI Legal Search Engine</p>
      <p>AI search engine for case law from the Republic of Moldova (SCJ, CC, ECHR). Classification: limited risk. The system assists legal research but does not substitute the reasoning of legal professionals. Results are marked as automatically generated and require human validation.</p>
      <div className="legal-info-box">
      <p>Review note:</p>
      <p>The risk classifications above are preliminary assessments and will be reviewed with each major product update or change to the EU AI Act legal framework. In case of doubt, Applexium conservatively applies the higher risk level.</p>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 6</div>
      <h2>Prohibited Practices — Red Lines</h2>
      <p>Regardless of context, client, financial compensation or commercial pressure, Applexium will not build, integrate, advise on or support AI systems that:</p>
      <ul><li>Use subliminal or manipulative techniques to influence human behavior without consent;</li>
      <li>Exploit the vulnerabilities of individuals due to age, disability or social circumstances;</li>
      <li>Perform social scoring of individuals by public authorities or private entities;</li>
      <li>Conduct real-time biometric identification in public spaces for the purpose of generalized surveillance;</li>
      <li>Make fully automated decisions with significant legal impact without human oversight;</li>
      <li>Are designed to disinform, manipulate or influence democratic processes;</li></ul>
      <p>Use personal data obtained illegally or without valid consent for training.</p>
      <div className="legal-info-box">
      <p>These red lines are absolute and are not subject to commercial negotiation.</p>
      <p>A client or project that requires violation of these principles will be refused, regardless of contractual value.</p>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 7</div>
      <h2>Internal AI Governance at Applexium</h2>
      <p>Applexium internally applies the following governance framework for projects involving artificial intelligence:</p>
      <p>Any project that includes AI components is mandatorily assessed on the EU AI Act risk dimension before development begins;</p>
      <p>The Compliance &amp; Legal Advisory team reviews the risk classification and technical documentation for each AI project;</p>
      <p>The client is transparently informed about the risk classification of the delivered AI system and their obligations as an operator;</p>
      <p>Security incidents or unexpected behavior of AI systems are documented and, where applicable, reported in accordance with the applicable legal framework;</p>
      <p>This Statement is reviewed semi-annually or whenever a significant change to the EU AI Act legal framework occurs.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 8</div>
      <h2>Legal Framework and Reference Documents</h2>
      <p>This Statement is based on and refers to:</p>
      <ul><li>Regulamentul (UE) 2024/1689 — EU AI Act;</li>
      <li>Regulamentul (UE) 2016/679 — GDPR (transposed via RM Law no. 195/2024 of August 2026);</li>
      <li>OECD Guidelines on Artificial Intelligence (OECD AI Principles, 2019, revised 2024);</li>
      <li>UNESCO Recommendation on the Ethics of Artificial Intelligence (2021);</li>
      <li>Ethics Guidelines for Trustworthy AI by the European Commission High-Level Expert Group (HLEG AI, 2019);</li></ul>
      <p>ISO/IEC 42001 (AI Management Systems) and ISO/IEC 23894 (AI Risk Management) standards.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 9</div>
      <h2>Contact and Reports</h2>
      <p>For any questions, reports or requests related to AI ethics and Applexium's practices in the field of artificial intelligence:</p>
      <p><span>Email:</span> <a href="mailto:info@applexium.com">info@applexium.com</a></p>
      <p><span>Phone: +373 78 76 87 65</span></p>
      <p>Office address: Mihai Viteazul 2a, Chisinau, Moldova</p>
      <p><span>Contact page:</span> <a href="https://applexium.com/contacts" rel="noopener" target="_blank">https://applexium.com/contacts</a></p>
      <p>We commit to responding to any report within 10 business days. Reports concerning unexpected behavior of AI systems that we have built or advised on are treated with priority.</p>
      <div className="legal-info-box">
      <p>Version and review</p>
      <p>Next planned review: October 2026 or upon major changes to the EU AI Act.</p>
      <p>Responsible: Mircea Ursu, Director — SRL SCALELAW SOLUTIONS</p>
      </div>
      </div>
      </div>
      <p className="legal-copyright">© 2026 SRL SCALELAW SOLUTIONS — Applexium. All rights reserved.</p>
    </>
  )
}
