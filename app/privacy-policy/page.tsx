import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | GradeTracker",
  description: "Privacy Policy for the GradeTracker Application",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Introduction</h2>
        <p>
          With the following privacy policy, we would like to inform you about
          what types of your personal data (hereinafter also referred to as
          "data") we process, for what purposes, and to what extent.
        </p>

        <h2>2. Controller</h2>
        <p>
          The party responsible for data processing is:
          <br />
          GradeTracker
          <br />
          John Doe
          <br />
          Example Street 123
          <br />
          12345 Example City
          <br />
          United States
          <br />
          Email: contact@example.com
          <br />
        </p>

        <h2>3. Overview of Processing</h2>
        <p>
          The following overview summarizes the types of data processed and the
          purposes of their processing and refers to the data subjects.
        </p>

        <h3>Types of Processed Data</h3>
        <ul>
          <li>Inventory data (e.g., names, addresses)</li>
          <li>Contact information (e.g., email, phone numbers)</li>
          <li>Content data (e.g., entries in online forms)</li>
          <li>
            Usage data (e.g., websites visited, interest in content, access
            times)
          </li>
          <li>
            Meta/communication data (e.g., device information, IP addresses)
          </li>
        </ul>

        <h3>Categories of Data Subjects</h3>
        <ul>
          <li>Users of the GradeTracker application</li>
          <li>Website visitors</li>
        </ul>

        <h3>Purposes of Processing</h3>
        <ul>
          <li>
            Provision of the GradeTracker application and its functionalities
          </li>
          <li>Security measures</li>
          <li>Management and response to inquiries</li>
          <li>Feedback and contact</li>
        </ul>

        <h2>4. Legal Basis</h2>
        <p>
          Below we share the legal basis of the General Data Protection
          Regulation (GDPR) on which we process personal data:
        </p>
        <ul>
          <li>
            <strong>Consent (Art. 6(1)(a) GDPR)</strong> - The data subject has
            given consent to the processing of their personal data for one or
            more specific purposes.
          </li>
          <li>
            <strong>
              Performance of a contract and pre-contractual inquiries (Art.
              6(1)(b) GDPR)
            </strong>{" "}
            - Processing is necessary for the performance of a contract to which
            the data subject is party or in order to take steps at the request
            of the data subject prior to entering into a contract.
          </li>
          <li>
            <strong>Legitimate interests (Art. 6(1)(f) GDPR)</strong> -
            Processing is necessary for the purposes of the legitimate interests
            pursued by the controller or by a third party, except where such
            interests are overridden by the interests or fundamental rights and
            freedoms of the data subject which require protection of personal
            data.
          </li>
        </ul>

        <h2>5. Security Measures</h2>
        <p>
          We take appropriate technical and organizational measures in
          accordance with legal requirements, taking into account the state of
          the art, the implementation costs, and the nature, scope, context, and
          purposes of processing, as well as the risk of varying likelihood and
          severity to the rights and freedoms of natural persons, in order to
          ensure a level of security appropriate to the risk.
        </p>

        <h2>6. Storage Period</h2>
        <p>
          The data will be deleted as soon as it is no longer required for the
          purposes for which it was collected. In the case of data collected to
          provide the website, this is the case when the respective session is
          terminated.
        </p>

        <h2>7. Data Processing in Third Countries</h2>
        <p>
          If we process data in a third country (i.e., outside the European
          Union (EU), the European Economic Area (EEA)) or if this happens in
          the context of using third-party services or disclosure or transfer of
          data to other persons or companies, this will only be done in
          accordance with legal requirements.
        </p>

        <h2>8. Cookies</h2>
        <p>
          We use cookies on our website. Cookies are small text files that are
          stored on your device and save certain information.
        </p>
        <p>
          You have the option to accept or decline the use of cookies. Most
          browsers accept cookies automatically. However, you can configure your
          browser so that no cookies are stored on your device or a notice
          appears before a new cookie is created.
        </p>

        <h2>9. Rights of Data Subjects</h2>
        <p>
          As a data subject, you have various rights under the GDPR, which arise
          in particular from Art. 15 to 21 GDPR:
        </p>
        <ul>
          <li>
            <strong>Right to object:</strong> You have the right to object at
            any time, on grounds relating to your particular situation, to the
            processing of personal data concerning you which is based on Art.
            6(1)(e) or (f) GDPR.
          </li>
          <li>
            <strong>Right to information:</strong> You have the right to request
            confirmation as to whether data in question is being processed and
            to information about this data as well as further information and
            copy of the data in accordance with the legal requirements.
          </li>
          <li>
            <strong>Right to rectification:</strong> You have the right to
            request the completion of data concerning you or the rectification
            of inaccurate data concerning you in accordance with the legal
            requirements.
          </li>
          <li>
            <strong>Right to erasure and restriction of processing:</strong> You
            have the right, in accordance with the legal requirements, to
            request that data concerning you be erased without delay, or
            alternatively, in accordance with the legal requirements, to request
            restriction of the processing of the data.
          </li>
          <li>
            <strong>Right to data portability:</strong> You have the right to
            receive data concerning you, which you have provided to us, in a
            structured, commonly used and machine-readable format in accordance
            with the legal requirements, or to request its transfer to another
            controller.
          </li>
          <li>
            <strong>Complaint to supervisory authority:</strong> Without
            prejudice to any other administrative or judicial remedy, you have
            the right to lodge a complaint with a supervisory authority, in
            particular in the Member State of your habitual residence, place of
            work or place of the alleged infringement if you consider that the
            processing of personal data relating to you infringes the GDPR.
          </li>
        </ul>

        <h2>10. Changes to the Privacy Policy</h2>
        <p>
          We reserve the right to adapt this privacy policy so that it always
          complies with current legal requirements or to implement changes to
          our services in the privacy policy. The new privacy policy will then
          apply to your next visit.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about the processing of your personal data,
          for information, rectification, or deletion of data, as well as
          revocation of consent given, please contact us:
        </p>
        <p>
          GradeTracker
          <br />
          Email: contact@example.com
        </p>

        <p className="text-muted-foreground text-sm mt-8">
          Last updated: May 2023
        </p>
      </div>
    </div>
  );
}
