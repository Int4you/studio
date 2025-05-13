
import LegalPageLayout from '@/components/layout/LegalPageLayout';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <LegalPageLayout pageTitle="Privacy Policy">
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
        <p>
          PromptForge ("us", "we", or "our") operates the PromptForge website and service (the "Service").
          This page informs you of our policies regarding the collection, use, and disclosure of personal data
          when you use our Service and the choices you have associated with that data.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">2. Information Collection and Use</h2>
        <p>
          We collect several different types of information for various purposes to provide and improve our
          Service to you.
        </p>
        <h3 className="text-xl font-medium text-foreground/90">Types of Data Collected:</h3>
        <ul className="list-disc list-inside space-y-1 pl-4">
            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Email address, First name and last name (optional), Usage Data.</li>
            <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
            <li><strong>Tracking & Cookies Data:</strong> We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">3. Use of Data</h2>
        <p>
          PromptForge uses the collected data for various purposes:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-4">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">4. Data Storage and Security</h2>
        <p>
          Your project data (ideas, proposals, etc.) is stored locally in your browser's localStorage. Authentication tokens are also stored locally. We strive to use commercially acceptable means to protect your Personal Data, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">5. Third-Party Services</h2>
        <p>
          We may employ third-party companies and individuals to facilitate our Service ("Service Providers"),
          to provide the Service on our behalf, to perform Service-related services or to assist us in
          analyzing how our Service is used. This includes AI model providers (e.g., Google AI for Genkit) and payment processors (e.g., Stripe).
          These third parties have access to your Personal Data only to perform these tasks on our behalf and
          are obligated not to disclose or use it for any other purpose.
        </p>
        
        <h2 className="text-2xl font-semibold text-foreground">6. Your Data Protection Rights</h2>
        <p>
            You have certain data protection rights. PromptForge aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
            If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact us.
            As project data is stored locally, you can clear it by clearing your browser's localStorage for this site.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">7. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
          new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">8. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us via our <Link href="/contact" className="text-primary hover:underline">Contact Page</Link>.
        </p>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </section>
    </LegalPageLayout>
  );
}
