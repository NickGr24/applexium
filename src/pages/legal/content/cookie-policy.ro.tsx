/**
 * Version 2.0 (2026-10), rewritten to describe what the site actually
 * stores (checked on the live site, 2026-10-03: zero cookies; two
 * localStorage/sessionStorage entries) instead of v1.0's generic template
 * (Google Analytics, PHPSESSID, csrf_token, lang_pref — none of which this
 * static site ever set). Law No. 195/2024; Law No. 133/2011 is repealed.
 * Written directly here, not ported from
 * `docs/03. Applexium_Politica_Cookie_v1.0.docx` — the docx is behind.
 * If a tracker is ever added, this page AND `components/CookieNotice.tsx`
 * (which must then become a real Accept/Refuse banner) need updating.
 */
export default function CookiePolicyRo() {
  return (
    <>
      <div className="legal-content active">
      <div className="legal-info-box">
      <p>Operator de date</p>
      <p><span className="ib-value">SRL SCALELAW SOLUTIONS</span> · Brand: Applexium</p>
      <p>Email: <a href="mailto:info@applexium.com">info@applexium.com</a> · Tel: +373 78 76 87 65</p>
      <p><span className="ib-label">Legislație aplicabilă:</span> <span>Legea nr. 195/2024 privind protecția datelor cu caracter personal</span></p>
      <p><span className="ib-label">Versiunea politicii:</span> <span className="ib-value">2026-10</span></p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 1</div>
      <h2>Pe scurt</h2>
      <p>Site-ul applexium.com <strong>nu plasează cookie-uri</strong> și nu folosește instrumente de analiză a traficului, pixeli de urmărire sau publicitate. În browser-ul dvs. se păstrează doar câteva informații strict necesare funcționării site-ului, descrise mai jos. De aceea nu vă cerem să alegeți între „Accept” și „Refuz”: nu există nimic opțional de refuzat. La prima vizită afișăm doar o notificare informativă.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 2</div>
      <h2>Ce se stochează în browser</h2>
      <p>Cookie-urile sunt fișiere text mici pe care un site le salvează pe dispozitivul dvs. Tehnologiile similare (Local Storage, Session Storage) funcționează asemănător, dar datele lor nu sunt trimise automat către server. Pe applexium.com se folosesc numai următoarele:</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Nume</th>
      <th>Tip</th>
      <th>Furnizor</th>
      <th>Durata</th>
      <th>Scop</th>
      </tr>
      <tr>
      <td>applexium:cookie-notice</td>
      <td>Local Storage</td>
      <td>applexium.com</td>
      <td>12 luni</td>
      <td>Reține că ați închis notificarea despre cookie-uri (versiunea și data), ca să nu o mai afișăm la fiecare pagină</td>
      </tr>
      <tr>
      <td>va:visit:&lt;id&gt;</td>
      <td>Local Storage și Session Storage</td>
      <td>Widget-ul Emmi (applexium.com)</td>
      <td>Până la ștergerea din browser / sfârșitul sesiunii</td>
      <td>Reține local momentul vizitei anterioare, ca asistentul Emmi să nu repete mesajul de întâmpinare; nu este trimis către niciun server</td>
      </tr>
      </tbody></table>
      </div>
      <p>Ambele intrări sunt strict necesare pentru funcționarea solicitată de dvs. și nu permit identificarea dvs.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 3</div>
      <h2>Servicii terțe</h2>
      <p>Fonturile și imaginile site-ului sunt găzduite pe propriul domeniu; nu încărcăm resurse de la rețele de publicitate sau de socializare. Asistentul Emmi se încarcă de pe app.emmi-agent.com fără cookie-uri; dacă deschideți conversația, aceasta rulează într-o fereastră a platformei Emmi, conform <a href="/privacy-policy">Politicii de confidențialitate</a>. Formularul de contact trimite datele către Formspree doar în momentul în care îl trimiteți.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 4</div>
      <h2>Cum controlați datele stocate</h2>
      <p>Puteți șterge oricând datele de mai sus din setările browser-ului (secțiunea despre cookie-uri și datele site-urilor). După ștergere, notificarea informativă va apărea din nou la următoarea vizită.</p>
      <p>Dacă vom adăuga vreodată cookie-uri opționale (de exemplu, de analiză), le vom activa doar după consimțământul dvs. explicit, exprimat printr-un banner cu opțiuni egale „Accept” și „Refuz”, și vom actualiza această politică.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 5</div>
      <h2>Modificarea politicii</h2>
      <p>Actualizăm această politică atunci când se schimbă tehnologiile folosite pe site. Fiecare versiune este datată (versiunea curentă: 2026-10).</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 6</div>
      <h2>Contact</h2>
      <p>Pentru orice întrebări privind datele stocate de applexium.com:</p>
      <p>Email: <a href="mailto:info@applexium.com">info@applexium.com</a></p>
      <p>Telefon: +373 78 76 87 65</p>
      <p>Adresă birou: Mihai Viteazul 2a, Chișinău, Moldova</p>
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
