/**
 * Mechanically ported from `_legacy/ai-ethics.html`'s `.legal-content-wrap`
 * (`class` -> `className`, tags already self-closed, `data-en` attributes
 * and the dead `id="content-ro"` toggle leftover dropped, inline `style`
 * strings turned into objects). Text is verbatim from the docx-sourced
 * legacy HTML — the source of truth per CLAUDE.md's bilingual system —
 * and must not be edited here. Typography/layout comes entirely from
 * `LegalLayout`'s own CSS, scoped by tag (h2/h3/p/ul/table), not from
 * these legacy classNames, which carry no styles of their own anymore.
 */
export default function AiEthicsRo() {
  return (
    <>
      <div className="legal-content active">
      <div className="legal-info-box">
      <p>Emis de: SRL SCALELAW SOLUTIONS  |  Brand: Applexium</p>
      <p>Director: Mircea Ursu  |  <a href="mailto:info@applexium.com">info@applexium.com</a>  |  +373 78 76 87 65</p>
      <p>Cadru de referință: EU AI Act (Reg. UE 2024/1689)  |  Ghiduri OCDE privind IA  |  UNESCO Rec. on AI Ethics</p>
      </div>
      <div className="legal-info-box">
      <p>Applexium oferă servicii de AI Act Advisory și AI Governance clienților săi. Acest lucru înseamnă că îi ajutăm pe alții să construiască sisteme de inteligență artificială responsabile, conforme și etice.</p>
      <p>Clienții care vin la noi pentru AI governance au dreptul să știe cum gândim noi înșine despre IA. Nu poți consilia pe alții să respecte principii pe care tu nu le-ai definit și nu le aplici. Această declarație nu este un document de PR — este poziția noastră instituțională, asumată, aplicată și revizuită periodic.</p>
      <p>Ea stă la baza oricărui proiect care implică inteligența artificială, fie că îl construim, fie că îl audităm.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 1</div>
      <h2>Contextul: EU AI Act și de ce contează</h2>
      <p>Regulamentul (UE) 2024/1689 — cunoscut sub denumirea de EU AI Act — reprezintă primul cadru legal cuprinzător din lume dedicat reglementării sistemelor de inteligență artificială. Aplicat gradual începând cu 2024 și cu efect deplin din 2026, acesta stabilește:</p>
      <ul><li>O clasificare a sistemelor AI pe niveluri de risc (inacceptabil, ridicat, limitat, minimal);</li>
      <li>Obligații clare pentru dezvoltatori, furnizori și operatori de sisteme AI;</li>
      <li>Cerințe de transparență, documentare și supraveghere umană;</li></ul>
      <p>Sancțiuni de până la 35.000.000 EUR sau 7% din cifra de afaceri globală anuală.</p>
      <div className="legal-info-box">
      <p>Poziția Applexium față de EU AI Act</p>
      <p>Applexium tratează EU AI Act ca pe un cadru de calitate — un set de standarde care protejează utilizatorii finali și cresc încrederea în produsele digitale.</p>
      <p>Oferim servicii de AI Act Advisory tocmai pentru că credem că reglementarea inteligentă a IA este necesară și benefică. Această declarație este dovada că practicăm ceea ce predicăm.</p>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 2</div>
      <h2>Principiile noastre de IA responsabilă</h2>
      <p>Toate activitățile Applexium care implică inteligența artificială — fie că dezvoltăm, integrăm sau consiliem — se ghidează după următoarele principii fundamentale:</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>1. Transparență</th>
      <th>Utilizatorii trebuie să știe când interacționează cu un sistem AI. Nu construim sisteme AI care se pretind a fi umane fără consimțământul utilizatorului. Deciziile automatizate trebuie să poată fi explicate.</th>
      </tr>
      <tr>
      <td>2. Echitate și non-discriminare</td>
      <td>Sistemele AI pe care le construim sunt testate pentru bias și discriminare. Nu construim și nu consiliem sisteme care tratează diferit persoanele pe baza rasei, genului, originii, religiei sau altor caracteristici protejate.</td>
      </tr>
      <tr>
      <td>3. Supraveghere umană</td>
      <td>Niciun sistem AI cu impact semnificativ asupra drepturilor sau deciziilor persoanelor fizice nu funcționează fără un mecanism de supraveghere și intervenție umană. Automatizarea nu înlocuiește responsabilitatea.</td>
      </tr>
      <tr>
      <td>4. Securitate și robustețe</td>
      <td>Sistemele AI trebuie să funcționeze corect, inclusiv în condiții adverse. Testăm rezistența la atacuri adversariale, date corupte și erori de distribuție.</td>
      </tr>
      <tr>
      <td>5. Protecția datelor și a vieții private</td>
      <td>Datele utilizate pentru antrenarea sau operarea sistemelor AI sunt prelucrate în conformitate cu GDPR și cadrul legal aplicabil. Minimizarea datelor este un principiu de design, nu o opțiune.</td>
      </tr>
      <tr>
      <td>6. Responsabilitate</td>
      <td>Fiecare sistem AI are un responsabil identificat. Știm în orice moment cine este operatorul, furnizorul și persoana de contact pentru orice sistem AI pe care îl livrăm sau îl consultăm.</td>
      </tr>
      <tr>
      <td>7. Beneficiu social</td>
      <td>Nu construim și nu consiliem sisteme AI al căror scop unic sau principal este să dăuneze, să manipuleze sau să exploateze persoane fizice sau grupuri vulnerabile.</td>
      </tr>
      <tr>
      <td>8. Durabilitate</td>
      <td>Luăm în considerare impactul energetic și de mediu al sistemelor AI pe care le recomandăm sau construim. Eficiența computațională este parte din arhitectura responsabilă.</td>
      </tr>
      </tbody></table>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 3</div>
      <h2>Clasificarea riscurilor și abordarea noastră</h2>
      <p>Applexium aplică taxonomia de risc a EU AI Act în evaluarea oricărui sistem AI, fie că îl construim pentru clienți, fie că îl audităm în cadrul serviciilor de AI Governance:</p>
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table className="legal-table"><tbody>
      <tr>
      <th>Clasa de risc</th>
      <th>Exemple sisteme AI</th>
      <th>Abordare Applexium</th>
      </tr>
      <tr>
      <td>RISC INACCEPTABIL</td>
      <td>Scoring social, manipulare subliminală, identificare biometrică în spații publice în timp real (uz general)</td>
      <td>REFUZĂM implicarea. Nu construim, nu consiliem, nu integrăm sisteme din această categorie, indiferent de client sau compensație financiară.</td>
      </tr>
      <tr>
      <td>RISC RIDICAT</td>
      <td>AI în educație, angajare, sănătate, infrastructură critică, justiție</td>
      <td>Acceptăm cu diligență completă: evaluare de impact (DPIA + AI impact), documentație tehnică exhaustivă, supraveghere umană obligatorie, conformitate EU AI Act garantată contractual.</td>
      </tr>
      <tr>
      <td>RISC LIMITAT</td>
      <td>Chatboți, generatoare de conținut, sisteme de recomandare</td>
      <td>Acceptăm cu obligații de transparență: utilizatorii sunt informați că interacționează cu IA, conținutul generat este marcat corespunzător.</td>
      </tr>
      <tr>
      <td>RISC MINIMAL</td>
      <td>Filtre spam, jocuri, sisteme de analiză a datelor agregate</td>
      <td>Acceptăm cu bune practici standard de securitate și protecția datelor.</td>
      </tr>
      </tbody></table>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 4</div>
      <h2>Cum aplicăm aceste principii în serviciile noastre</h2>
      <h3>Când construim produse AI</h3>
      <p>Pentru orice produs digital care include componente de inteligență artificială, Applexium integrează obligatoriu:</p>
      <ul><li>Evaluarea clasei de risc AI Act încă din faza de discovery;</li>
      <li>Documentație tehnică conform Anexei IV a EU AI Act (pentru sisteme de risc ridicat);</li>
      <li>Fișă de sistem AI (AI System Card) — descriere transparentă a capacităților, limitelor și riscurilor;</li>
      <li>Mecanism de supraveghere și intervenție umană;</li>
      <li>Jurnal de audit al deciziilor automatizate (audit log);</li>
      <li>Testare pentru bias și discriminare înainte de lansare;</li></ul>
      <p>Procedură de notificare a incidentelor de securitate AI.</p>
      <h3>Când oferim AI Act Advisory</h3>
      <p>Serviciile noastre de consultanță în AI Governance includ:</p>
      <ul><li>Clasificarea sistemelor AI existente sau planificate pe niveluri de risc EU AI Act;</li>
      <li>Gap analysis față de cerințele EU AI Act pentru furnizori și operatori;</li>
      <li>Asistență la redactarea documentației tehnice obligatorii;</li>
      <li>Evaluarea Impactului asupra Protecției Datelor (DPIA) cu componentă AI;</li>
      <li>Conformity Assessment pentru sisteme de risc ridicat;</li>
      <li>Formare și training pentru echipele interne ale clienților;</li></ul>
      <p>Suport la înregistrarea în baza de date EU AI (EU AI Database) unde este aplicabil.</p>
      <div className="legal-info-box">
      <p>Angajamentul nostru de coerență instituțională</p>
      <p>Nu consiliem clienții să respecte EU AI Act dacă noi înșine nu aplicăm aceste principii în propriile produse. Prezenta declarație este auditabilă — orice client are dreptul să ne solicite dovezi ale aplicării ei.</p>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 5</div>
      <h2>Produsele noastre AI și aplicarea principiilor</h2>
      <p>Applexium dezvoltă produse proprii care integrează componente de inteligență artificială. Prezentăm mai jos poziția de conformitate pentru fiecare:</p>
      <p>Emmi — AI Voice Agent</p>
      <p>Agent vocal AI bilingv (română/rusă) pentru gestionarea apelurilor instituționale. Clasificare preliminară EU AI Act: risc limitat. Utilizatorii sunt informați că interacționează cu un sistem AI. Nu ia decizii autonome cu impact asupra drepturilor persoanelor.</p>
      <p>Legalia — platformă de educație juridică</p>
      <p>Platformă de cursuri și quiz-uri juridice. Componentele AI (dacă sunt integrate) sunt utilizate exclusiv pentru personalizarea conținutului educațional. Clasificare: risc minimal. Nu generează sfaturi juridice cu caracter obligatoriu.</p>
      <p>Precedentia — motor de căutare juridică AI</p>
      <p>Motor de căutare AI pentru jurisprudența din Republica Moldova (CSJ, CC, CEDO). Clasificare: risc limitat. Sistemul asistă cercetarea juridică, dar nu substituie raționamentul profesionistului în drept. Rezultatele sunt marcate ca generate automat și necesită validare umană.</p>
      <div className="legal-info-box">
      <p>Notă de revizuire:</p>
      <p>Clasificările de risc de mai sus sunt evaluări preliminare și vor fi revizuite la fiecare actualizare majoră a produselor sau a cadrului legal EU AI Act. În caz de dubiu, Applexium aplică în mod conservator nivelul de risc superior.</p>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 6</div>
      <h2>Practici interzise — linii roșii</h2>
      <p>Indiferent de context, client, compensație financiară sau presiune comercială, Applexium nu va construi, integra, consilia sau susține sisteme AI care:</p>
      <ul><li>Utilizează tehnici subliminale sau manipulatorii pentru a influența comportamentul uman fără consimțământ;</li>
      <li>Exploatează vulnerabilitățile persoanelor din cauza vârstei, dizabilității sau circumstanțelor sociale;</li>
      <li>Realizează scoring social al persoanelor fizice de către autorități publice sau entități private;</li>
      <li>Efectuează identificare biometrică în timp real în spații publice în scop de supraveghere generalizată;</li>
      <li>Iau decizii complet automatizate cu impact juridic semnificativ fără supraveghere umană;</li>
      <li>Sunt proiectate pentru a dezinforma, manipula sau influența procesele democratice;</li></ul>
      <p>Folosesc date cu caracter personal obținute ilegal sau fără consimțământ valabil pentru antrenare.</p>
      <div className="legal-info-box">
      <p>Aceste linii roșii sunt absolute și nu fac obiectul negocierii comerciale.</p>
      <p>Un client sau proiect care impune încălcarea acestor principii va fi refuzat, indiferent de valoarea contractuală.</p>
      </div>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 7</div>
      <h2>Guvernanța Internă a IA la Applexium</h2>
      <p>Applexium aplică intern următorul cadru de guvernanță pentru proiectele care implică inteligența artificială:</p>
      <p>Orice proiect care include componente AI este evaluat obligatoriu pe dimensiunea de risc EU AI Act înainte de startul dezvoltării;</p>
      <p>Echipa de Compliance &amp; Legal Advisory revizuiește clasificarea de risc și documentația tehnică pentru fiecare proiect AI;</p>
      <p>Clientul este informat transparent cu privire la clasificarea de risc a sistemului AI livrat și la obligațiile sale ca operator;</p>
      <p>Incidentele de securitate sau comportament neașteptat al sistemelor AI sunt documentate și, unde este cazul, raportate conform cadrului legal aplicabil;</p>
      <p>Prezenta Declarație este revizuită semestrial sau ori de câte ori intervine o modificare semnificativă a cadrului legal EU AI Act.</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 8</div>
      <h2>Cadrul legal și documentele de referință</h2>
      <p>Prezenta Declarație se întemeiază pe și face referire la:</p>
      <ul><li>Regulamentul (UE) 2024/1689 — EU AI Act;</li>
      <li>Regulamentul (UE) 2016/679 — GDPR (prelucrat prin Legea RM nr. 195/2024 din august 2026);</li>
      <li>Ghidurile OCDE privind inteligența artificială (OECD AI Principles, 2019, revizuite 2024);</li>
      <li>Recomandarea UNESCO privind etica inteligenței artificiale (2021);</li>
      <li>Ghidul de etică pentru IA demn de încredere al Grupului de Experți de Nivel Înalt al Comisiei Europene (HLEG AI, 2019);</li></ul>
      <p>Standardele ISO/IEC 42001 (Sisteme de management AI) și ISO/IEC 23894 (Managementul riscurilor AI).</p>
      </div>
      <div className="legal-section">
      <div className="legal-section-num">Section 9</div>
      <h2>Contact și sesizări</h2>
      <p>Pentru orice întrebări, sesizări sau solicitări legate de etica IA și practicile Applexium în domeniul inteligenței artificiale:</p>
      <p><span>Email:</span> <a href="mailto:info@applexium.com">info@applexium.com</a></p>
      <p><span>Telefon: +373 78 76 87 65</span></p>
      <p>Adresă birou: Mihai Viteazul 2a, Chișinău, Moldova</p>
      <p><span>Pagina de contact:</span> <a href="https://applexium.com/contacts" rel="noopener" target="_blank">https://applexium.com/contacts</a></p>
      <p>Ne angajăm să răspundem oricărei sesizări în termen de 10 zile lucrătoare. Sesizările privind comportamentul neașteptat al sistemelor AI pe care le-am construit sau consiliat sunt tratate cu prioritate.</p>
      <div className="legal-info-box">
      <p>Versiune și revizuire</p>
      <p>Următoarea revizuire planificată: Octombrie 2026 sau la modificări majore ale EU AI Act.</p>
      <p>Responsabil: Mircea Ursu, Director — SRL SCALELAW SOLUTIONS</p>
      </div>
      </div>
      </div>
      <p className="legal-copyright">© 2026 SRL SCALELAW SOLUTIONS — Applexium. Toate drepturile rezervate.</p>
    </>
  )
}
