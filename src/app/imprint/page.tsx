
import { LegalPageLayout } from '@/components/prompt-forge/layout';
import Link from 'next/link';

export default function ImprintPage() {
  return (
    <LegalPageLayout pageTitle="Imprint / Impressum">
      <section className="space-y-6">
        <p className="text-muted-foreground">
          Information according to § 5 TMG (German Telemedia Act) or equivalent local regulations.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Operator and Responsible Party:</h2>
        <address className="not-italic">
          [Your Company Name / Your Full Name if operating as an individual]<br />
          [Your Street Address]<br />
          [Your Postal Code and City]<br />
          [Your Country]
        </address>

        <h2 className="text-2xl font-semibold text-foreground">Contact:</h2>
        <ul className="list-none pl-0">
          <li><strong>Telephone:</strong> [Your Phone Number (Optional, but often required)]</li>
          <li><strong>Email:</strong> [Your Email Address]</li>
          <li><strong>Website:</strong> <Link href="/" className="text-primary hover:underline">https://promptforge.example.com</Link> (Replace with your actual domain)</li>
        </ul>

        {/* If applicable */}
        <h2 className="text-2xl font-semibold text-foreground">Represented by:</h2>
        <p>[Name of legal representative(s), e.g., CEO, Managing Director]</p>

        {/* If applicable (e.g., for registered companies) */}
        <h2 className="text-2xl font-semibold text-foreground">Register Entry:</h2>
        <p>
          Entry in the [Commercial Register / Trade Register / etc.]<br />
          Register Court: [Name of Court]<br />
          Register Number: [Your Register Number]
        </p>

        {/* If applicable (e.g., if you require a VAT ID) */}
        <h2 className="text-2xl font-semibold text-foreground">VAT Identification Number:</h2>
        <p>
          VAT identification number according to §27a Value Added Tax Act (Germany) or equivalent:
          [Your VAT ID]
        </p>
        
        {/* If applicable (e.g., for regulated professions) */}
        <h2 className="text-2xl font-semibold text-foreground">Supervisory Authority (if applicable):</h2>
        <p>
          [Name and address of the supervisory authority]
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Dispute Resolution:</h2>
        <p>
          The European Commission provides a platform for online dispute resolution (OS):{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://ec.europa.eu/consumers/odr
          </a>.
          You can find our email address in the imprint above.
        </p>
        <p>
          We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Liability for Content:</h2>
        <p>
          As service providers, we are liable for own contents of these websites according to Paragraph 7, Sect. 1 German Telemedia Act (TMG).
          However, according to Paragraphs 8 to 10 German Telemedia Act (TMG), service providers are not obligated to permanently monitor
          submitted or stored information or to search for evidences that indicate illegal activities.
          Legal obligations to removing information or to blocking the use of information remain unchallenged.
          In this case, liability is only possible at the time of knowledge about a specific violation of law.
          Illegal contents will be removed immediately at the time we get knowledge of them.
        </p>
        
        <h2 className="text-2xl font-semibold text-foreground">Liability for Links:</h2>
        <p>
          Our offer includes links to external third party websites. We have no influence on the contents of those websites,
          therefore we cannot guarantee for those contents. Providers or administrators of linked websites are always responsible
          for their own contents.
          The linked websites had been checked for possible violations of law at the time of the establishment of the link.
          Illegal contents were not detected at the time of the linking. A permanent monitoring of the contents of linked websites
          cannot be imposed without reasonable indications that there has been a violation of law. Illegal links will be removed
          immediately at the time we get knowledge of them.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Copyright:</h2>
        <p>
          Contents and compilations published on these websites by the providers are subject to German copyright laws.
          Reproduction, editing, distribution as well as the use of any kind outside the scope of the copyright law require
          a written permission of the author or originator. Downloads and copies of these websites are permitted for private use only.
          The commercial use of our contents without permission of the originator is prohibited.
          Copyright laws of third parties are respected as long as the contents on these websites do not originate from the provider.
          Contributions of third parties on this site are indicated as such. However, if you notice any violations of copyright law,
          please inform us. Such contents will be removed immediately.
        </p>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </section>
    </LegalPageLayout>
  );
}
