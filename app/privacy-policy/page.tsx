import Link from "next/link";
import { ArrowLeft, Shield, Lock, Server, Trash2 } from "lucide-react";

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

      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: May 2023</p>

        <div className="my-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <h3 className="flex items-center gap-2 mt-0 text-primary">
            <Lock className="h-5 w-5" />
            <span>Data Protection Summary</span>
          </h3>
          <ul className="mt-2">
            <li>
              Your grades and academic data are encrypted when stored in the
              cloud
            </li>
            <li>We do not share your data with any third parties</li>
            <li>
              You can delete your data at any time from your account settings
            </li>
            <li>We use minimal analytics that respect your privacy</li>
            <li>
              Your data can be used in offline mode without internet connection
            </li>
          </ul>
        </div>

        <h2>1. Introduction</h2>
        <p>
          At GradeTracker, we respect your privacy and are committed to
          protecting your personal data. This privacy policy will inform you
          about how we look after your personal data when you visit our website
          or use our application and tell you about your privacy rights and how
          the law protects you.
        </p>

        <h2>2. Data We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul>
          <li>
            <strong>Account Information:</strong> Email address, name, and
            password (stored securely using industry-standard hashing)
          </li>
          <li>
            <strong>Educational Data:</strong> Grades, subjects, and other
            academic information you choose to enter
          </li>
          <li>
            <strong>Usage Data:</strong> Information about how you use our
            application, such as features accessed and time spent
          </li>
          <li>
            <strong>Device Information:</strong> Information about the device
            and browser you use to access our service
          </li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <p>We use your data for the following purposes:</p>
        <ul>
          <li>To provide and maintain our service</li>
          <li>To notify you about changes to our service</li>
          <li>
            To allow you to participate in interactive features of our service
            when you choose to do so
          </li>
          <li>To provide customer support</li>
          <li>
            To gather analysis or valuable information so that we can improve
            our service
          </li>
          <li>To monitor the usage of our service</li>
          <li>To detect, prevent and address technical issues</li>
        </ul>

        <h2>4. Data Security</h2>
        <div className="flex items-start gap-3">
          <Server className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
          <div>
            <p>
              We implement the following security measures to protect your
              personal data:
            </p>
            <ul>
              <li>
                <strong>Encryption:</strong> Your grades and educational data
                are encrypted when stored in our cloud database
              </li>
              <li>
                <strong>Local Storage:</strong> You can choose to store your
                data only on your device
              </li>
              <li>
                <strong>Secure Authentication:</strong> We use industry-standard
                authentication methods to protect your account
              </li>
              <li>
                <strong>Regular Security Audits:</strong> We regularly review
                our systems for vulnerabilities
              </li>
            </ul>
          </div>
        </div>

        <h2>5. Data Retention</h2>
        <div className="flex items-start gap-3">
          <Trash2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
          <div>
            <p>
              We will retain your data only for as long as necessary to fulfill
              the purposes we collected it for. You can request deletion of your
              data at any time through your account settings.
            </p>
            <p>
              When you delete your account, all your personal data, including
              your grades and subjects, will be permanently deleted from our
              systems within 30 days.
            </p>
          </div>
        </div>

        <h2>6. Cookies</h2>
        <p>We use cookies for the following purposes:</p>
        <ul>
          <li>
            <strong>Essential Cookies:</strong> Required for the operation of
            our service
          </li>
          <li>
            <strong>Preference Cookies:</strong> Enable us to remember your
            preferences and settings
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how you use
            our service (via Plausible Analytics, a privacy-friendly analytics
            platform)
          </li>
        </ul>
        <p>
          You can control cookies through your browser settings and our cookie
          consent banner. Declining cookies will not affect core functionality
          but may limit certain features.
        </p>

        <h2>7. Your Data Protection Rights</h2>
        <p>Under data protection laws, you have the following rights:</p>
        <ul>
          <li>
            <strong>Access:</strong> Request access to your personal data
          </li>
          <li>
            <strong>Rectification:</strong> Request correction of inaccurate
            data
          </li>
          <li>
            <strong>Erasure:</strong> Request deletion of your personal data
          </li>
          <li>
            <strong>Restriction:</strong> Request restriction of processing of
            your data
          </li>
          <li>
            <strong>Portability:</strong> Request transfer of your data to you
            or a third party
          </li>
          <li>
            <strong>Objection:</strong> Object to processing of your personal
            data
          </li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at
          privacy@gradetracker-example.com. We will respond to all legitimate
          requests within one month.
        </p>

        <h2>8. Children's Privacy</h2>
        <p>
          Our service is intended for users who are at least 13 years of age. We
          do not knowingly collect personal information from children under 13.
          If you are a parent or guardian and you are aware that your child has
          provided us with personal information, please contact us. If we become
          aware that we have collected personal information from a child under
          13 without verification of parental consent, we will take steps to
          remove that information from our servers.
        </p>

        <h2>9. International Data Transfers</h2>
        <p>
          Your information may be transferred to — and maintained on — computers
          located outside of your state, province, country or other governmental
          jurisdiction where the data protection laws may differ from those in
          your jurisdiction.
        </p>
        <p>
          If you are located outside Germany and choose to provide information
          to us, please note that we transfer the data, including personal data,
          to Germany and process it there.
        </p>

        <h2>10. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the "Last updated" date at the top of this page.
        </p>
        <p>
          You are advised to review this Privacy Policy periodically for any
          changes. Changes to this Privacy Policy are effective when they are
          posted on this page.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at privacy@gradetracker-example.com.
        </p>
      </div>
    </div>
  );
}
