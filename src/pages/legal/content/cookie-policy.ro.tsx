/**
 * Mechanically ported from `_legacy/cookie-policy.html`'s `.legal-content-wrap`
 * (`class` -> `className`, tags already self-closed, `data-en` attributes
 * and the dead `id="content-ro"` toggle leftover dropped, inline `style`
 * strings turned into objects). Text is verbatim from the docx-sourced
 * legacy HTML — the source of truth per CLAUDE.md's bilingual system —
 * and must not be edited here. Typography/layout comes entirely from
 * `LegalLayout`'s own CSS, scoped by tag (h2/h3/p/ul/table), not from
 * these legacy classNames, which carry no styles of their own anymore.
 */
export default function CookiePolicyRo() {
  return (
    <>
      <div className="legal-content active">
      <div className="legal-info-box">
      <p>Operator de date</p>
      <p><span className="ib-value">SRL SCALELAW SOLUTIONS</span> · Brand: Applexium</p>
      <p>Email: <a href="mailto:info@applexium.com">info@applexium.com</a> · Tel: +373 78 76 87 65</p>
      <p><span className="ib-label">Legislație aplicabilă:</span> <span>Legea nr. 133/2011; din 23 aug. 2026 — Legea nr. 195/2024 (aliniere GDPR)</span></p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 1</div>
      <h2>Ce sunt Cookie-urile?</h2>
      <p>Cookie-urile sunt fișiere text de mici dimensiuni pe care un site web le stochează pe dispozitivul dvs. (calculator, telefon, tabletă) atunci când vizitați acel site. Acestea permit site-ului să vă recunoască la vizitele ulterioare, să rețină preferințele dvs. și să funcționeze corect din punct de vedere tehnic.</p>
      <p>Pe lângă cookie-uri, site-ul poate utiliza tehnologii similare precum Local Storage, Session Storage sau pixeli de urmărire, cărora li se aplică aceleași reguli din prezenta politică.</p>
      <div className="legal-info-box">
      <p>Dreptul dvs. la informare și control</p>
      <p>Conform Legii nr. 133/2011 și viitoarei Legi nr. 195/2024, aveti dreptul sa fiți informat(a) cu privire la utilizarea cookie-urilor și sa va exprimați sau sa va retrageți consimțământul pentru categoriile non-esențiale.</p>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 2</div>
      <h2>Ce Cookie-uri utilizăm</h2>
      <h3>Cookie-uri strict necesare</h3>
      <p>Aceste cookie-uri sunt indispensabile funcționării tehnice a Site-ului și nu pot fi dezactivate. Ele nu colectează informații care să poată fi utilizate în scopuri de marketing.</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Nume Cookie</th>
      <th>Tip</th>
      <th>Furnizor</th>
      <th>Durata</th>
      <th>Scop</th>
      </tr>
      <tr>
      <td>PHPSESSID / session</td>
      <td>Sesiune</td>
      <td>www.applexium.com</td>
      <td>Sesiune</td>
      <td>Menținerea sesiunii utilizatorului</td>
      </tr>
      <tr>
      <td>csrf_token</td>
      <td>Sesiune</td>
      <td>www.applexium.com</td>
      <td>Sesiune</td>
      <td>Securitate formular (protecție CSRF)</td>
      </tr>
      <tr>
      <td>cookie_consent</td>
      <td>Persistent</td>
      <td>www.applexium.com</td>
      <td>12 luni</td>
      <td>Reține preferințele privind cookie-urile</td>
      </tr>
      </tbody></table>
      </div>
      <h3>Cookie-uri analitice / de performanță</h3>
      <p>Aceste cookie-uri ne ajută să înțelegem cum utilizatorii interacționează cu Site-ul (pagini vizitate, timp petrecut, erori întâlnite). Informațiile colectate sunt agregate și anonimizate. Sunt activate doar cu consimțământul dvs.</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Nume Cookie</th>
      <th>Tip</th>
      <th>Furnizor</th>
      <th>Durata</th>
      <th>Scop</th>
      </tr>
      <tr>
      <td>_ga</td>
      <td>Persistent</td>
      <td>Google Analytics</td>
      <td>2 ani</td>
      <td>Identificare utilizator unic</td>
      </tr>
      <tr>
      <td>_ga_*</td>
      <td>Persistent</td>
      <td>Google Analytics</td>
      <td>2 ani</td>
      <td>Stare sesiune Google Analytics</td>
      </tr>
      <tr>
      <td>_gid</td>
      <td>Persistent</td>
      <td>Google Analytics</td>
      <td>24 ore</td>
      <td>Diferențierea utilizatorilor</td>
      </tr>
      <tr>
      <td>_gat</td>
      <td>Sesiune</td>
      <td>Google Analytics</td>
      <td>1 minut</td>
      <td>Limitarea ratei de cereri</td>
      </tr>
      </tbody></table>
      </div>
      <div className="legal-info-box">
      <p>Notă privind Google Analytics</p>
      <p>Dacă utilizăm Google Analytics, datele pot fi transferate către servere Google aflate în SUA. Google respectă Cadrul de Confidențialitate UE-SUA (EU-U.S. Data Privacy Framework). Puteți dezactiva Google Analytics prin extensia: <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener" target="_blank">tools.google.com/dlpage/gaoptout</a></p>
      </div>
      <h3>Cookie-uri funcționale</h3>
      <p>Aceste cookie-uri permit funcționalități îmbunătățite și personalizare (ex: reținerea limbii preferate). Sunt activate doar cu consimțământul dvs.</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Nume Cookie</th>
      <th>Tip</th>
      <th>Furnizor</th>
      <th>Durata</th>
      <th>Scop</th>
      </tr>
      <tr>
      <td>lang_pref</td>
      <td>Persistent</td>
      <td>www.applexium.com</td>
      <td>6 luni</td>
      <td>Retine preferință de limba</td>
      </tr>
      </tbody></table>
      </div>
      <h3>Cookie-uri de la terți (rețele sociale)</h3>
      <p>Site-ul poate include butoane sau widget-uri ale rețelelor sociale (Facebook, Instagram, TikTok). Aceste platforme pot plasa propriile cookie-uri pe dispozitivul dvs. atunci când interacționați cu elementele lor. SRL SCALELAW SOLUTIONS nu controlează aceste cookie-uri.</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Furnizor</th>
      <th>Tip</th>
      <th>Furnizor</th>
      <th>Durata</th>
      <th>Politica proprie</th>
      </tr>
      <tr>
      <td>Facebook / Meta</td>
      <td>Analitic / Urmarire</td>
      <td>Meta Platforms</td>
      <td>Variabil</td>
      <td>www.facebook.com/privacy/policy</td>
      </tr>
      <tr>
      <td>Instagram</td>
      <td>Analitic / Urmarire</td>
      <td>Meta Platforms</td>
      <td>Variabil</td>
      <td>www.facebook.com/privacy/policy</td>
      </tr>
      <tr>
      <td>TikTok</td>
      <td>Analitic / Urmarire</td>
      <td>TikTok Inc.</td>
      <td>Variabil</td>
      <td>www.tiktok.com/legal/privacy-policy</td>
      </tr>
      </tbody></table>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 3</div>
      <h2>Consimțământul dvs.</h2>
      <p>La prima vizită pe Site, veți fi informat(ă) cu privire la utilizarea cookie-urilor printr-un banner de consimțământ (cookie banner). Aveți posibilitatea de a:</p>
      <ul><li>Accepta toate categoriile de cookie-uri;</li>
      <li>Refuza cookie-urile non-esențiale (analitice, funcționale, terți);</li></ul>
      <p>Personaliza preferințele pe categorii de cookie-uri.</p>
      <p>Cookie-urile strict necesare sunt activate automat, fără a fi necesară acțiunea dvs., deoarece sunt esențiale pentru funcționarea Site-ului.</p>
      <p>Vă puteți modifica sau retrage consimțământul oricând, accesând setările cookie-urilor din footer-ul Site-ului sau prin setările browser-ului dvs.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 4</div>
      <h2>Cum să gestionați sau să dezactivați Cookie-urile</h2>
      <p>Puteți controla și gestiona cookie-urile prin mai multe metode:</p>
      <h3>Prin browser</h3>
      <p>Cele mai frecvente browsere permit gestionarea cookie-urilor din setări:</p>
      <p>Google Chrome: Setari &gt; Confidentialitate și securitate &gt; Cookie-uri</p>
      <p>Mozilla Firefox: Optiuni &gt; Confidentialitate și securitate &gt; Cookie-uri</p>
      <p>Safari: Preferinte &gt; Confidentialitate &gt; Cookie-uri</p>
      <p>Microsoft Edge: Setari &gt; Cookie-uri și permisiuni pentru site</p>
      <p>Atenție: dezactivarea tuturor cookie-urilor poate afecta funcționarea corectă a Site-ului.</p>
      <h3>Prin instrumente specifice</h3>
      <p>Opt-out Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener" target="_blank">https://tools.google.com/dlpage/gaoptout</a></p>
      <p>Setari publicitare Google: <a href="https://adssettings.google.com" rel="noopener" target="_blank">https://adssettings.google.com</a></p>
      <p>Platforma Your Online Choices (EU): <a href="https://www.youronlinechoices.eu" rel="noopener" target="_blank">https://www.youronlinechoices.eu</a></p>
      <h3>Prin banner-ul de pe Site</h3>
      <p>Puteți reveni oricând la preferințele dvs. privind cookie-urile accesând link-ul "Setări Cookie-uri" din footer-ul site-ului applexium.com.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 5</div>
      <h2>Cookie-uri și date cu caracter personal</h2>
      <p>Unele cookie-uri pot fi considerate date cu caracter personal în sensul Legii nr. 133/2011 și al viitoarei Legi nr. 195/2024 (echivalent GDPR), în special atunci când permit identificarea directă sau indirectă a unei persoane fizice (ex: adresa IP asociată unui cookie).</p>
      <p>Prelucrarea datelor cu caracter personal prin intermediul cookie-urilor se realizează în conformitate cu Politica de Confidențialitate a Applexium, disponibilă pe Site, și cu legislația aplicabilă în domeniul protecției datelor.</p>
      <p>Temeiul legal pentru plasarea cookie-urilor non-esențiale este consimțământul dvs. explicit, conform art. 5(1)(a) din Legea nr. 133/2011 (și art. 6(1)(a) din Legea nr. 195/2024, începând cu 23 august 2026).</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 6</div>
      <h2>Modificarea Politicii de Cookie-uri</h2>
      <p>Ne rezervăm dreptul de a actualiza prezenta Politică de Cookie-uri pentru a reflecta schimbările legislative, tehnice sau operaționale. Versiunea actualizată va fi publicată pe Site, indicând data ultimei modificări.</p>
      <p>Vă recomandăm să verificați periodic această pagină. Continuarea utilizării Site-ului după publicarea modificărilor constituie acceptarea tacită a versiunii actualizate.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 7</div>
      <h2>Contact</h2>
      <p>Pentru orice întrebări privind utilizarea cookie-urilor pe applexium.com:</p>
      <p>Email: <a href="mailto:info@applexium.com">info@applexium.com</a></p>
      <p>Telefon: +373 78 76 87 65</p>
      <p>Adresă birou: Mihai Viteazul 2a, Chișinău, Moldova</p>
      <p>Pagina de contact: <a href="https://applexium.com/contacts" rel="noopener" target="_blank">https://applexium.com/contacts</a></p>
      <div className="legal-info-box">
      <p>Autoritate de supraveghere (RM)</p>
      <p><span className="ib-value">CNPDCP</span> — <span>Centrul Național pentru Protecția Datelor cu Caracter Personal</span></p>
      <p><a href="mailto:centru@datepersonale.md">centru@datepersonale.md</a> · (022) 820 801 · <a href="https://datepersonale.md" rel="noopener" target="_blank">datepersonale.md</a></p>
      </div>
      </div>
      </div>
      <p className="legal-copyright">© 2026 SRL SCALELAW SOLUTIONS — Applexium. Toate drepturile rezervate.</p>
    </>
  )
}
