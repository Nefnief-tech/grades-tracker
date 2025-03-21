import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Datenschutzerklärung | GradeTracker",
  description: "Datenschutzerklärung für die GradeTracker Anwendung",
};

export default function DatenschutzPage() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Zurück zur Startseite
      </Link>

      <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung</h1>

      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Einleitung</h2>
        <p>
          Mit der folgenden Datenschutzerklärung möchten wir Sie darüber
          aufklären, welche Arten Ihrer personenbezogenen Daten (nachfolgend
          auch kurz als "Daten" bezeichnet) wir zu welchen Zwecken und in
          welchem Umfang verarbeiten.
        </p>

        <h2>2. Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung ist:
          <br />
          GradeTracker
          <br />
          Max Mustermann
          <br />
          Musterstraße 123
          <br />
          12345 Musterstadt
          <br />
          Deutschland
          <br />
          E-Mail: kontakt@beispiel.de
          <br />
        </p>

        <h2>3. Übersicht der Verarbeitungen</h2>
        <p>
          Die nachfolgende Übersicht fasst die Arten der verarbeiteten Daten und
          die Zwecke ihrer Verarbeitung zusammen und verweist auf die
          betroffenen Personen.
        </p>

        <h3>Arten der verarbeiteten Daten</h3>
        <ul>
          <li>Bestandsdaten (z.B. Namen, Adressen)</li>
          <li>Kontaktdaten (z.B. E-Mail, Telefonnummern)</li>
          <li>Inhaltsdaten (z.B. Eingaben in Onlineformularen)</li>
          <li>
            Nutzungsdaten (z.B. besuchte Webseiten, Interesse an Inhalten,
            Zugriffszeiten)
          </li>
          <li>
            Meta-/Kommunikationsdaten (z.B. Geräte-Informationen, IP-Adressen)
          </li>
        </ul>

        <h3>Kategorien betroffener Personen</h3>
        <ul>
          <li>Nutzer der GradeTracker-Anwendung</li>
          <li>Besucher der Website</li>
        </ul>

        <h3>Zwecke der Verarbeitung</h3>
        <ul>
          <li>
            Bereitstellung der GradeTracker-Anwendung und ihrer Funktionalitäten
          </li>
          <li>Sicherheitsmaßnahmen</li>
          <li>Verwaltung und Beantwortung von Anfragen</li>
          <li>Feedback und Kontaktaufnahme</li>
        </ul>

        <h2>4. Rechtsgrundlagen</h2>
        <p>
          Im Folgenden teilen wir die Rechtsgrundlagen der
          Datenschutzgrundverordnung (DSGVO), auf deren Basis wir die
          personenbezogenen Daten verarbeiten, mit:
        </p>
        <ul>
          <li>
            <strong>Einwilligung (Art. 6 Abs. 1 S. 1 lit. a. DSGVO)</strong> -
            Die betroffene Person hat ihre Einwilligung in die Verarbeitung der
            sie betreffenden personenbezogenen Daten für einen spezifischen
            Zweck oder mehrere bestimmte Zwecke gegeben.
          </li>
          <li>
            <strong>
              Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1
              lit. b. DSGVO)
            </strong>{" "}
            - Die Verarbeitung ist für die Erfüllung eines Vertrags, dessen
            Vertragspartei die betroffene Person ist, oder zur Durchführung
            vorvertraglicher Maßnahmen erforderlich, die auf Anfrage der
            betroffenen Person erfolgen.
          </li>
          <li>
            <strong>
              Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO)
            </strong>{" "}
            - Die Verarbeitung ist zur Wahrung der berechtigten Interessen des
            Verantwortlichen oder eines Dritten erforderlich, sofern nicht die
            Interessen oder Grundrechte und Grundfreiheiten der betroffenen
            Person, die den Schutz personenbezogener Daten erfordern,
            überwiegen.
          </li>
        </ul>

        <h2>5. Sicherheitsmaßnahmen</h2>
        <p>
          Wir treffen nach Maßgabe der gesetzlichen Vorgaben unter
          Berücksichtigung des Stands der Technik, der Implementierungskosten
          und der Art, des Umfangs, der Umstände und der Zwecke der Verarbeitung
          sowie der unterschiedlichen Eintrittswahrscheinlichkeiten und des
          Ausmaßes der Bedrohung der Rechte und Freiheiten natürlicher Personen
          geeignete technische und organisatorische Maßnahmen, um ein dem Risiko
          angemessenes Schutzniveau zu gewährleisten.
        </p>

        <h2>6. Speicherdauer</h2>
        <p>
          Die Daten werden gelöscht, sobald sie für die Erreichung der Zwecke
          ihrer Erhebung nicht mehr erforderlich sind. Im Falle der Erfassung
          der Daten zur Bereitstellung der Website ist dies der Fall, wenn die
          jeweilige Sitzung beendet ist.
        </p>

        <h2>7. Datenverarbeitung in Drittländern</h2>
        <p>
          Sofern wir Daten in einem Drittland (d.h. außerhalb der Europäischen
          Union (EU), des Europäischen Wirtschaftsraums (EWR)) verarbeiten oder
          dies im Rahmen der Inanspruchnahme von Diensten Dritter oder
          Offenlegung, bzw. Übermittlung von Daten an andere Personen oder
          Unternehmen geschieht, erfolgt dies nur im Einklang mit den
          gesetzlichen Vorgaben.
        </p>

        <h2>8. Cookies</h2>
        <p>
          Wir verwenden Cookies auf unserer Website. Cookies sind kleine
          Textdateien, die auf Ihrem Gerät gespeichert werden und bestimmte
          Informationen speichern.
        </p>
        <p>
          Sie haben die Möglichkeit, die Verwendung von Cookies zu akzeptieren
          oder abzulehnen. Die meisten Browser akzeptieren Cookies automatisch.
          Sie können Ihren Browser jedoch so konfigurieren, dass keine Cookies
          auf Ihrem Gerät gespeichert werden oder stets ein Hinweis erscheint,
          bevor ein neuer Cookie angelegt wird.
        </p>

        <h2>9. Rechte der betroffenen Personen</h2>
        <p>
          Ihnen stehen als Betroffene nach der DSGVO verschiedene Rechte zu, die
          sich insbesondere aus Art. 15 bis 21 DSGVO ergeben:
        </p>
        <ul>
          <li>
            <strong>Widerspruchsrecht:</strong> Sie haben das Recht, aus
            Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit
            gegen die Verarbeitung der Sie betreffenden personenbezogenen Daten,
            die aufgrund von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt,
            Widerspruch einzulegen.
          </li>
          <li>
            <strong>Auskunftsrecht:</strong> Sie haben das Recht, eine
            Bestätigung darüber zu verlangen, ob betreffende Daten verarbeitet
            werden und auf Auskunft über diese Daten sowie auf weitere
            Informationen und Kopie der Daten entsprechend den gesetzlichen
            Vorgaben.
          </li>
          <li>
            <strong>Recht auf Berichtigung:</strong> Sie haben entsprechend den
            gesetzlichen Vorgaben das Recht, die Vervollständigung der Sie
            betreffenden Daten oder die Berichtigung der Sie betreffenden
            unrichtigen Daten zu verlangen.
          </li>
          <li>
            <strong>
              Recht auf Löschung und Einschränkung der Verarbeitung:
            </strong>{" "}
            Sie haben nach Maßgabe der gesetzlichen Vorgaben das Recht, zu
            verlangen, dass Sie betreffende Daten unverzüglich gelöscht werden,
            bzw. alternativ nach Maßgabe der gesetzlichen Vorgaben eine
            Einschränkung der Verarbeitung der Daten zu verlangen.
          </li>
          <li>
            <strong>Recht auf Datenübertragbarkeit:</strong> Sie haben das
            Recht, Sie betreffende Daten, die Sie uns bereitgestellt haben, nach
            Maßgabe der gesetzlichen Vorgaben in einem strukturierten, gängigen
            und maschinenlesbaren Format zu erhalten oder deren Übermittlung an
            einen anderen Verantwortlichen zu fordern.
          </li>
          <li>
            <strong>Beschwerde bei Aufsichtsbehörde:</strong> Sie haben
            unbeschadet eines anderweitigen verwaltungsrechtlichen oder
            gerichtlichen Rechtsbehelfs das Recht auf Beschwerde bei einer
            Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres
            gewöhnlichen Aufenthaltsorts, ihres Arbeitsplatzes oder des Orts des
            mutmaßlichen Verstoßes, wenn Sie der Ansicht sind, dass die
            Verarbeitung der Sie betreffenden personenbezogenen Daten gegen die
            Vorgaben der DSGVO verstößt.
          </li>
        </ul>

        <h2>10. Änderung der Datenschutzbestimmungen</h2>
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie
          stets den aktuellen rechtlichen Anforderungen entspricht oder um
          Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen.
          Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
        </p>

        <h2>11. Kontakt zu uns</h2>
        <p>
          Bei Fragen zur Verarbeitung Ihrer personenbezogenen Daten, bei
          Auskünften, Berichtigung oder Löschung von Daten sowie Widerruf
          erteilter Einwilligungen wenden Sie sich bitte an uns:
        </p>
        <p>
          GradeTracker
          <br />
          E-Mail: kontakt@beispiel.de
        </p>

        <p className="text-muted-foreground text-sm mt-8">Stand: Mai 2023</p>
      </div>
    </div>
  );
}
