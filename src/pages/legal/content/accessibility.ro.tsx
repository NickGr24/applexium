/**
 * Mechanically ported from `_legacy/accessibility.html`'s `.legal-content-wrap`
 * (`class` -> `className`, tags already self-closed, `data-en` attributes
 * and the dead `id="content-ro"` toggle leftover dropped, inline `style`
 * strings turned into objects). Text is verbatim from the docx-sourced
 * legacy HTML — the source of truth per CLAUDE.md's bilingual system —
 * and must not be edited here. Typography/layout comes entirely from
 * `LegalLayout`'s own CSS, scoped by tag (h2/h3/p/ul/table), not from
 * these legacy classNames, which carry no styles of their own anymore.
 */
export default function AccessibilityRo() {
  return (
    <>
      <div className="legal-content active">
      <div className="legal-info-box">
      <p>Emis de: SRL SCALELAW SOLUTIONS · Brand: Applexium</p>
      <p><span className="ib-label">Cadru de referință:</span> <span>Directiva UE 2016/2102 privind accesibilitatea web</span></p>
      <p><span className="ib-label">Standard:</span> <span className="ib-value">WCAG 2.1 nivel AA</span></p>
      <p>Această declarație se adresează atât site-ului www.applexium.com, cât și clienților instituționali ai Applexium.</p>
      </div>
      <div className="legal-info-box"><p>PARTEA I — Accesibilitatea site-ului www.applexium.com</p></div>
      <div className="legal-section">
      <div className="legal-section-num">Section 1</div>
      <h2>Angajamentul nostru</h2>
      <p>SRL SCALELAW SOLUTIONS, sub brandul Applexium, se angajează să asigure un mediu digital incluziv și accesibil tuturor utilizatorilor, indiferent de capacitățile fizice, cognitive sau tehnologice ale acestora.</p>
      <p>Prezenta Declarație de Accesibilitate se referă la site-ul www.applexium.com și descrie nivelul actual de conformitate, limitele cunoscute și modalitățile de contact pentru sesizarea problemelor de accesibilitate.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 2</div>
      <h2>Nivelul de conformitate al site-ului www.applexium.com</h2>
      <p>Site-ul www.applexium.com are caracter informativ (carte de vizită digitală) și nu intră sub incidența directă a Directivei UE 2016/2102, care se aplică obligatoriu entităților din sectorul public.</p>
      <p>Cu toate acestea, Applexium adoptă voluntar standardul WCAG 2.1 nivel AA ca referință de calitate pentru propriul site, în conformitate cu valorile companiei și cu angajamentul față de incluziunea digitală.</p>
      <h3>Elemente conforme</h3>
      <ul><li>Structură semantică HTML corectă (titluri ierarhice H1–H4);</li>
      <li>Contrast cromatic suficient între text și fundal (raport minim 4.5:1);</li>
      <li>Site responsive — utilizabil pe dispozitive mobile, tablete și desktop;</li>
      <li>Navigare funcțională prin tastatură pentru elementele principale;</li>
      <li>Texte alternative (alt text) pentru imaginile informative;</li>
      <li>Formularul de contact cu etichete clare și mesaje de eroare descriptive;</li></ul>
      <p>Fonturi lizibile și dimensiuni scalabile.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 3</div>
      <h2>Raportarea problemelor de accesibilitate</h2>
      <p>Dacă întâmpinați dificultăți în accesarea oricărui conținut de pe applexium.com, vă rugăm să ne contactați:</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Email</th>
      <th><a href="mailto:info@applexium.com">info@applexium.com</a></th>
      </tr>
      <tr>
      <td>Telefon</td>
      <td>+373 78 76 87 65</td>
      </tr>
      <tr>
      <td>Subiect recomandat</td>
      <td>"Accesibilitate — [descriere problema]"</td>
      </tr>
      <tr>
      <td>Termen de răspuns</td>
      <td>Maxim 10 zile lucrătoare</td>
      </tr>
      <tr>
      <td>Pagina de contact</td>
      <td><a href="https://applexium.com/contacts" rel="noopener" target="_blank">https://applexium.com/contacts</a></td>
      </tr>
      </tbody></table>
      </div>
      <p>Ne angajăm să analizăm orice sesizare și să implementăm soluțiile tehnice necesare în cel mai scurt timp rezonabil.</p>
      <p>PARTEA II — Accesibilitatea în produsele construite pentru clienți</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 4</div>
      <h2>Obligațiile legale ale clienților instituționali din UE</h2>
      <p>Directiva (UE) 2016/2102 privind accesibilitatea site-urilor web și a aplicațiilor mobile ale organismelor din sectorul public impune tuturor entităților publice din statele membre UE să respecte standardul WCAG 2.1 nivel AA pentru toate platformele digitale pe care le operează.</p>
      <div className="legal-info-box">
      <p>Ce înseamnă în practică pentru clienții dvs.:</p>
      <p>Dacă organizația dvs. este o instituție publică dintr-un stat UE și operează un site web sau o aplicație mobilă, aveți obligația legală de a:</p>
      <p>1. Respecta standardul WCAG 2.1 nivel AA;</p>
      <p>2. Publica o Declarație de Accesibilitate actualizată anual;</p>
      <p>3. Asigura un mecanism de feedback pentru utilizatori;</p>
      <p>4. Răspunde sesizărilor de accesibilitate în termen de 30 de zile.</p>
      <p>Neconformitatea poate atrage sancțiuni din partea autorităților naționale de supraveghere.</p>
      </div>
      <p>Atunci când Applexium construiește un produs digital pentru o instituție publică din UE, conformitatea cu Directiva 2016/2102 și cu standardul WCAG 2.1 AA este integrată în procesul de dezvoltare — nu adăugată ulterior.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 5</div>
      <h2>Ce asigurăm clienților noștri instituționali</h2>
      <p>Indiferent dacă clientul este o instituție publică din UE sau o entitate din Republica Moldova, Applexium oferă același standard de calitate în materie de accesibilitate:</p>
      <h3>Audit de accesibilitate pre-lansare</h3>
      <p>Înainte de lansarea oricărui produs digital, echipa Applexium realizează un audit de accesibilitate care verifică:</p>
      <ul><li>Perceptibilitate — conținut vizibil și audibil pentru toți utilizatorii (alt text, contrast, subtitrări);</li>
      <li>Operabilitate — navigare completă prin tastatură, fără capcane de focus, timp suficient pentru acțiuni;</li>
      <li>Inteligibilitate — limbaj clar, predicție comportament elemente UI, asistență la completarea formularelor;</li></ul>
      <p>Robustețe — compatibilitate cu tehnologii asistive (screen readers: NVDA, JAWS, VoiceOver).</p>
      <h3>Declarație de Accesibilitate pentru produsul clientului</h3>
      <p>Applexium redactează și livrează Declarația de Accesibilitate specifică produsului, document obligatoriu conform Directivei UE 2016/2102, care include:</p>
      <ul><li>Nivelul de conformitate WCAG declarat;</li>
      <li>Lista elementelor neconforme cu justificări (dacă este cazul);</li>
      <li>Mecanismul de feedback și datele de contact;</li></ul>
      <p>Data emiterii și calendarul de revizuire anuală.</p>
      <h3>Remediere și mentenanță</h3>
      <p>Prin contractele de mentenanță tehnică, Applexium asigură monitorizarea continuă a conformității de accesibilitate și remedierea oricăror regresii apărute în urma actualizărilor de conținut sau cod.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 6</div>
      <h2>De ce contează pentru clienții din Republica Moldova</h2>
      <p>Deși Directiva UE 2016/2102 nu este obligatorie direct în Republica Moldova la momentul actual, contextul național și european face ca accesibilitatea digitală să devină tot mai relevantă:</p>
      <p>Applexium recomandă tuturor clienților instituționali din Republica Moldova să adopte proactiv standardul WCAG 2.1 AA, din următoarele motive practice:</p>
      <p>Pregătire anticipată sau adoptarea acum evită costuri mari de remediere ulterioară, când cerința va deveni obligatorie prin lege;</p>
      <p>Acces la finanțare europeană sau proiectele digitale finanțate din fonduri UE necesită conformitate de accesibilitate — conformitatea deschide oportunități;</p>
      <p>Responsabilitate față de cetățeni sau persoanele cu dizabilități reprezintă aproximativ 15% din populație — un serviciu public digital inaccesibil exclude sistematic o parte semnificativă a beneficiarilor;</p>
      <p>Reputație și calitate. Standardul WCAG 2.1 AA este un indicator de maturitate digitală recunoscut internațional.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 7</div>
      <h2>Standardul Tehnic de Referință</h2>
      <p>Toate produsele digitale construite de Applexium pentru clienți instituționali respectă sau tind spre respectarea:</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Standard principal</th>
      <th>WCAG 2.1 nivel AA (Web Content Accessibility Guidelines)</th>
      </tr>
      <tr>
      <td>Emis de</td>
      <td>W3C — World Wide Web Consortium</td>
      </tr>
      <tr>
      <td>Directiva UE de referință</td>
      <td>Directiva (UE) 2016/2102 privind accesibilitatea web</td>
      </tr>
      <tr>
      <td>Standard tehnic armonizat UE</td>
      <td>EN 301 549 v3.2.1</td>
      </tr>
      <tr>
      <td>Nivel minim garantat</td>
      <td>WCAG 2.1 AA (nivelul A este substandard; AAA rămâne obiectiv aspirațional)</td>
      </tr>
      <tr>
      <td>Testare</td>
      <td>Automată (axe, Lighthouse) + manuală + cu utilizatori reali</td>
      </tr>
      </tbody></table>
      </div>
      <p>La solicitare, Applexium poate furniza clienților rapoarte de audit detaliate (VPAT — Voluntary Product Accessibility Template), utilizate frecvent în achizițiile publice din UE și SUA.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 8</div>
      <h2>Contact</h2>
      <p>Pentru orice întrebări privind accesibilitatea — fie pentru site-ul applexium.com, fie în legătură cu un proiect digital pe care îl construim pentru dvs.:</p>
      <p><span>Email:</span> <a href="mailto:info@applexium.com">info@applexium.com</a></p>
      <p>Telefon: +373 78 76 87 65</p>
      <p>Adresă birou: Mihai Viteazul 2a, Chișinău, Moldova</p>
      <p><span>Pagina de contact:</span> <a href="https://applexium.com/contacts" rel="noopener" target="_blank">https://applexium.com/contacts</a></p>
      <div className="legal-info-box">
      <p>Applexium — Accessibility by Design</p>
      <p>Accesibilitatea nu este o opțiune sau un add-on. Este parte din arhitectura oricărui produs digital pe care îl construim.</p>
      <p>Ne angajăm să actualizăm această declarație cel puțin o dată pe an sau ori de câte ori intervin modificări semnificative ale site-ului sau ale cadrului legislativ aplicabil.</p>
      </div>
      </div>
      </div>
      <p className="legal-copyright">© 2026 SRL SCALELAW SOLUTIONS — Applexium. Toate drepturile rezervate.</p>
    </>
  )
}
