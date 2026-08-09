/**
 * Mechanically ported from `_legacy/en/cookie-policy.html`'s `.legal-content-wrap`
 * (`class` -> `className`, tags already self-closed, `data-en` attributes
 * and the dead `id="content-ro"` toggle leftover dropped, inline `style`
 * strings turned into objects). Text is verbatim from the docx-sourced
 * legacy HTML — the source of truth per CLAUDE.md's bilingual system —
 * and must not be edited here. Typography/layout comes entirely from
 * `LegalLayout`'s own CSS, scoped by tag (h2/h3/p/ul/table), not from
 * these legacy classNames, which carry no styles of their own anymore.
 */
export default function CookiePolicyEn() {
  return (
    <>
      <div className="legal-content active">
      <div className="legal-info-box">
      <p>Data Controller</p>
      <p><span className="ib-value">SRL SCALELAW SOLUTIONS</span> · Brand: Applexium</p>
      <p>Email: <a href="mailto:info@applexium.com">info@applexium.com</a> · Tel: +373 78 76 87 65</p>
      <p><span className="ib-label">Applicable law:</span> <span>Law No. 133/2011; from 23 Aug. 2026 — Law No. 195/2024 (GDPR-aligned)</span></p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 1</div>
      <h2>What Are Cookies?</h2>
      <p>Cookies are small text files that a website stores on your device (computer, phone, tablet) when you visit it. They allow the website to recognize you on subsequent visits, remember your preferences, and function correctly from a technical standpoint.</p>
      <p>In addition to cookies, the Website may use similar technologies such as Local Storage, Session Storage, or tracking pixels, to which the same rules set out in this policy apply.</p>
      <div className="legal-info-box">
      <p>Your right to information and control</p>
      <p>Under Law No. 133/2011 and the forthcoming Law No. 195/2024, you have the right to be informed about the use of cookies and to give or withdraw your consent for non-essential categories.</p>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 2</div>
      <h2>Cookies We Use</h2>
      <h3>Strictly Necessary Cookies</h3>
      <p>These cookies are essential for the technical operation of the Website and cannot be disabled. They do not collect information that could be used for marketing purposes.</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Cookie Name</th>
      <th>Type</th>
      <th>Provider</th>
      <th>Duration</th>
      <th>Purpose</th>
      </tr>
      <tr>
      <td>PHPSESSID / session</td>
      <td>Session</td>
      <td>www.applexium.com</td>
      <td>Session</td>
      <td>Maintaining user session</td>
      </tr>
      <tr>
      <td>csrf_token</td>
      <td>Session</td>
      <td>www.applexium.com</td>
      <td>Session</td>
      <td>Form security (CSRF protection)</td>
      </tr>
      <tr>
      <td>cookie_consent</td>
      <td>Persistent</td>
      <td>www.applexium.com</td>
      <td>12 months</td>
      <td>Stores cookie preferences</td>
      </tr>
      </tbody></table>
      </div>
      <h3>Analytical / Performance Cookies</h3>
      <p>These cookies help us understand how users interact with the Website (pages visited, time spent, errors encountered). The information collected is aggregated and anonymized. They are activated only with your consent.</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Cookie Name</th>
      <th>Type</th>
      <th>Provider</th>
      <th>Duration</th>
      <th>Purpose</th>
      </tr>
      <tr>
      <td>_ga</td>
      <td>Persistent</td>
      <td>Google Analytics</td>
      <td>2 years</td>
      <td>Unique user identification</td>
      </tr>
      <tr>
      <td>_ga_*</td>
      <td>Persistent</td>
      <td>Google Analytics</td>
      <td>2 years</td>
      <td>Google Analytics session state</td>
      </tr>
      <tr>
      <td>_gid</td>
      <td>Persistent</td>
      <td>Google Analytics</td>
      <td>24 hours</td>
      <td>User differentiation</td>
      </tr>
      <tr>
      <td>_gat</td>
      <td>Session</td>
      <td>Google Analytics</td>
      <td>1 minute</td>
      <td>Request rate throttling</td>
      </tr>
      </tbody></table>
      </div>
      <div className="legal-info-box">
      <p>Note on Google Analytics</p>
      <p>If we use Google Analytics, data may be transferred to Google servers in the USA. Google complies with the EU-U.S. Data Privacy Framework. You can disable Google Analytics via the opt-out extension: <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener" target="_blank">https://tools.google.com/dlpage/gaoptout</a></p>
      </div>
      <h3>Functional Cookies</h3>
      <p>These cookies enable enhanced functionality and personalization (e.g., remembering your preferred language). They are activated only with your consent.</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Cookie Name</th>
      <th>Type</th>
      <th>Provider</th>
      <th>Duration</th>
      <th>Purpose</th>
      </tr>
      <tr>
      <td>lang_pref</td>
      <td>Persistent</td>
      <td>www.applexium.com</td>
      <td>6 months</td>
      <td>Stores language preference</td>
      </tr>
      </tbody></table>
      </div>
      <h3>Third-Party Cookies (Social Networks)</h3>
      <p>The Website may include buttons or widgets from social networks (Facebook, Instagram, TikTok). These platforms may place their own cookies on your device when you interact with their elements. SRL SCALELAW SOLUTIONS does not control these cookies.</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Provider</th>
      <th>Type</th>
      <th>Provider</th>
      <th>Duration</th>
      <th>Own Policy</th>
      </tr>
      <tr>
      <td>Facebook / Meta</td>
      <td>Analytical / Tracking</td>
      <td>Meta Platforms</td>
      <td>Variable</td>
      <td>www.facebook.com/privacy/policy</td>
      </tr>
      <tr>
      <td>Instagram</td>
      <td>Analytical / Tracking</td>
      <td>Meta Platforms</td>
      <td>Variable</td>
      <td>www.facebook.com/privacy/policy</td>
      </tr>
      <tr>
      <td>TikTok</td>
      <td>Analytical / Tracking</td>
      <td>TikTok Inc.</td>
      <td>Variable</td>
      <td>www.tiktok.com/legal/privacy-policy</td>
      </tr>
      </tbody></table>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 3</div>
      <h2>Your Consent</h2>
      <p>On your first visit to the Website, you will be informed about the use of cookies through a consent banner (cookie banner). You will have the option to:</p>
      <ul><li>Accept all categories of cookies;</li>
      <li>Refuse non-essential cookies (analytical, functional, third-party);</li></ul>
      <p>Customize your preferences by cookie category.</p>
      <p>Strictly necessary cookies are activated automatically without any action on your part, as they are essential for the Website to function.</p>
      <p>You may modify or withdraw your consent at any time by accessing the cookie settings in the Website footer or through your browser settings.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 4</div>
      <h2>How to Manage or Disable Cookies</h2>
      <p>You can control and manage cookies through several methods:</p>
      <h3>Through Your Browser</h3>
      <p>Most common browsers allow you to manage cookies from the settings menu:</p>
      <p>Google Chrome: Settings &gt; Privacy and security &gt; Cookies</p>
      <p>Mozilla Firefox: Options &gt; Privacy &amp; Security &gt; Cookies</p>
      <p>Safari: Preferences &gt; Privacy &gt; Cookies</p>
      <p>Microsoft Edge: Settings &gt; Cookies and site permissions</p>
      <p>Please note: disabling all cookies may affect the correct functioning of the Website.</p>
      <h3>Through Specific Tools</h3>
      <p>Google Analytics opt-out: <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener" target="_blank">https://tools.google.com/dlpage/gaoptout</a></p>
      <p>Google ad settings: <a href="https://adssettings.google.com" rel="noopener" target="_blank">https://adssettings.google.com</a></p>
      <p>Your Online Choices (EU): <a href="https://www.youronlinechoices.eu" rel="noopener" target="_blank">https://www.youronlinechoices.eu</a></p>
      <h3>Through the Website Banner</h3>
      <p>You can return to your cookie preferences at any time by clicking the "Cookie Settings" link in the footer of the applexium.com website.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 5</div>
      <h2>Cookies and Personal Data</h2>
      <p>Some cookies may be considered personal data within the meaning of Law No. 133/2011 and the forthcoming Law No. 195/2024 (GDPR-equivalent), particularly where they allow direct or indirect identification of a natural person (e.g., an IP address associated with a cookie).</p>
      <p>The processing of personal data through cookies is carried out in accordance with Applexium's Privacy Policy, available on the Website, and with applicable data protection legislation.</p>
      <p>The legal basis for placing non-essential cookies is your explicit consent, pursuant to Art. 5(1)(a) of Law No. 133/2011 (and Art. 6(1)(a) of Law No. 195/2024, from 23 August 2026 onwards).</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 6</div>
      <h2>Amendments to this Cookie Policy</h2>
      <p>We reserve the right to update this Cookie Policy to reflect legislative, technical, or operational changes. The updated version will be published on the Website with the date of the last modification indicated.</p>
      <p>We recommend checking this page periodically. Continued use of the Website following the publication of changes constitutes tacit acceptance of the updated version.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 7</div>
      <h2>Contact</h2>
      <p>For any questions regarding the use of cookies on applexium.com:</p>
      <p>Email: <a href="mailto:info@applexium.com">info@applexium.com</a></p>
      <p>Phone: +373 78 76 87 65</p>
      <p>Office address: Mihai Viteazul 2a, Chisinau, Moldova</p>
      <p>Contact page: <a href="https://applexium.com/contacts" rel="noopener" target="_blank">https://applexium.com/contacts</a></p>
      <div className="legal-info-box">
      <p>Supervisory Authority (Republic of Moldova)</p>
      <p><span className="ib-value">CNPDCP</span> — <span>National Center for Personal Data Protection</span></p>
      <p><a href="mailto:centru@datepersonale.md">centru@datepersonale.md</a> · (022) 820 801 · <a href="https://datepersonale.md" rel="noopener" target="_blank">datepersonale.md</a></p>
      </div>
      </div>
      </div>
      <p className="legal-copyright">© 2026 SRL SCALELAW SOLUTIONS — Applexium. All rights reserved.</p>
    </>
  )
}
