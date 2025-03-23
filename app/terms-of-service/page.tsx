import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Terms of Service | GradeTracker",
  description: "Terms of service for the GradeTracker application",
};

export default function TermsOfServicePage() {
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
        <h1 className="text-3xl font-bold">Terms of Service</h1>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: May 2023</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to GradeTracker ("we," "our," or "us"). These Terms of Service
          ("Terms") govern your access to and use of the GradeTracker website
          and application (the "Service").
        </p>
        <p>
          By accessing or using the Service, you agree to be bound by these
          Terms. If you disagree with any part of the Terms, you may not access
          the Service.
        </p>

        <h2>2. Accounts</h2>
        <p>
          When you create an account with us, you must provide information that
          is accurate, complete, and current at all times. Failure to do so
          constitutes a breach of the Terms, which may result in immediate
          termination of your account.
        </p>
        <p>
          You are responsible for safeguarding the password you use to access
          the Service and for any activities or actions under your password. You
          agree not to disclose your password to any third party. You must
          notify us immediately upon becoming aware of any breach of security or
          unauthorized use of your account.
        </p>

        <h2>3. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are
          and will remain the exclusive property of GradeTracker and its
          licensors. The Service is protected by copyright, trademark, and other
          laws of both the United States and foreign countries. Our trademarks
          and trade dress may not be used in connection with any product or
          service without the prior written consent of GradeTracker.
        </p>

        <h2>4. User Data</h2>
        <p>
          We take the privacy of your educational data seriously. Your grades,
          subjects, and any other academic information you enter into the
          Service belong to you. We store this data to provide you with the
          Service, and we do not claim ownership over your data.
        </p>
        <p>
          You can request deletion of your data at any time through the settings
          in your account. For more information on how we handle your data,
          please refer to our{" "}
          <Link href="/privacy-policy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>

        <h2>5. Service Availability and Modifications</h2>
        <p>
          We reserve the right to withdraw or amend our Service, and any service
          or material we provide via the Service, in our sole discretion without
          notice. We will not be liable if for any reason all or any part of the
          Service is unavailable at any time or for any period.
        </p>
        <p>
          We reserve the right to modify these Terms at any time. We will
          provide notice of changes by updating the "Last updated" date at the
          top of these Terms.
        </p>

        <h2>6. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior
          notice or liability, for any reason whatsoever, including, without
          limitation, if you breach the Terms.
        </p>
        <p>
          Upon termination, your right to use the Service will immediately
          cease. If you wish to terminate your account, you may simply
          discontinue using the Service or delete your account through the
          settings page.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          In no event shall GradeTracker, nor its directors, employees,
          partners, agents, suppliers, or affiliates, be liable for any
          indirect, incidental, special, consequential or punitive damages,
          including without limitation, loss of profits, data, use, goodwill, or
          other intangible losses, resulting from:
        </p>
        <ol>
          <li>
            Your access to or use of or inability to access or use the Service;
          </li>
          <li>Any conduct or content of any third party on the Service;</li>
          <li>Any content obtained from the Service; and</li>
          <li>
            Unauthorized access, use or alteration of your transmissions or
            content.
          </li>
        </ol>

        <h2>8. Disclaimer</h2>
        <p>
          Your use of the Service is at your sole risk. The Service is provided
          "AS IS" and "AS AVAILABLE". The Service is provided without warranties
          of any kind, whether express or implied.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the
          laws of Germany, without regard to its conflict of law provisions.
        </p>
        <p>
          Our failure to enforce any right or provision of these Terms will not
          be considered a waiver of those rights. If any provision of these
          Terms is held to be invalid or unenforceable by a court, the remaining
          provisions of these Terms will remain in effect.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at
          support@gradetracker-example.com.
        </p>
      </div>
    </div>
  );
}
