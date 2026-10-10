import { Link } from 'react-router-dom';
import { useAcademyInfo } from '../../hooks/useAcademyInfo';
import { LegalLayout, Section } from './LegalLayout';

const EFFECTIVE_DATE = 'September 26, 2026';

const PrivacyPolicy = () => {
  const { data: academy } = useAcademyInfo();
  const entityName = academy?.legalName || academy?.name || 'the Academy';
  const displayName = academy?.name || 'the Academy';
  const contactEmail = academy?.grievanceOfficerEmail || academy?.email || 'privacy@example.com';
  const officerName = academy?.grievanceOfficerName;
  const officerPhone = academy?.grievanceOfficerPhone || academy?.phone;
  const address = [academy?.address, academy?.city, academy?.state, academy?.country].filter(Boolean).join(', ');

  return (
    <LegalLayout title="Privacy Policy" updatedLabel={`Effective ${EFFECTIVE_DATE}`}>
      <Section heading="Who we are">
        <p>
          This Privacy Policy explains how <strong>{entityName}</strong> ("{displayName}", "we", "us", "our"), a
          training academy{address ? ` based in ${address}` : ''}, collects, uses, stores and shares your personal
          data when you visit our website, register for a course, or use our student/staff portal. We are a "Data
          Fiduciary" as defined under India's Digital Personal Data Protection Act, 2023 ("DPDP Act") in respect of
          the personal data described below.
        </p>
      </Section>

      <Section heading="What personal data we collect">
        <p>We collect only what we need to run admissions, teaching and the academy's operations:</p>
        <ul>
          <li>
            <strong>Registration/enquiry data:</strong> name, mobile number, email address, qualification, location
            and course of interest, submitted through our registration form or a walk-in enquiry.
          </li>
          <li>
            <strong>Student records</strong> (once enrolled): batch and attendance records, class reports, task
            submissions, performance and progress data, and fee/payment records.
          </li>
          <li>
            <strong>Account data:</strong> login email and encrypted password for anyone with portal access
            (students, trainers, counsellors, staff).
          </li>
          <li>
            <strong>Communications:</strong> messages you send us via the contact form, email, phone or WhatsApp.
          </li>
          <li>
            <strong>Technical data:</strong> basic device/browser information needed to operate the website
            securely. We do not currently run any third-party analytics or advertising trackers — see our{' '}
            <Link to="/cookie-policy">Cookie Policy</Link> for the limited, optional cookies we do use.
          </li>
        </ul>
        <p>We do not knowingly collect more data than a field asks for, and we do not sell personal data.</p>
      </Section>

      <Section heading="Why we collect it (purpose &amp; legal basis)">
        <ul>
          <li>To respond to enquiries and process course registrations.</li>
          <li>To enrol, teach, assess and communicate with students during their course.</li>
          <li>To process fee payments and maintain financial records we're legally required to keep.</li>
          <li>To operate staff/trainer/counsellor accounts needed to run the academy.</li>
          <li>To send course-, batch- or fee-related updates by email, SMS or WhatsApp.</li>
          <li>To comply with applicable law (e.g. tax and education-related record-keeping).</li>
        </ul>
        <p>
          Where we rely on your consent (for example, when you submit the registration form), you may withdraw that
          consent at any time by contacting us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>; this won't
          affect processing already carried out, and enrolled students may need to provide certain data to continue
          receiving the service.
        </p>
      </Section>

      <Section heading="Children's data">
        <p>
          Our courses are generally intended for adults. If a prospective student is under 18, registration must be
          completed by, or with the verifiable consent of, a parent or legal guardian, in line with the DPDP Act's
          requirements for processing a child's personal data. We do not knowingly process a child's data for
          tracking, behavioural monitoring or targeted advertising.
        </p>
      </Section>

      <Section heading="Who we share data with">
        <ul>
          <li>
            <strong>Staff who need it:</strong> trainers see data for students in their own batches; counsellors see
            their own leads/registrations; admins can see academy-wide data. Access is permission-controlled.
          </li>
          <li>
            <strong>Service providers</strong> who process data on our behalf under contract (e.g. our cloud hosting
            and file-storage provider), only to the extent needed to run the service.
          </li>
          <li>
            <strong>Google Maps</strong>, only if you choose to load the embedded map on our Contact page — see our{' '}
            <Link to="/cookie-policy">Cookie Policy</Link>.
          </li>
          <li>Law enforcement or regulators, where legally required.</li>
        </ul>
        <p>We do not sell or rent your personal data to third parties for their own marketing.</p>
      </Section>

      <Section heading="Where your data is stored">
        <p>
          Your data is stored on servers operated by our hosting/infrastructure provider. If that provider processes
          data outside India, we take reasonable steps to ensure it remains protected consistent with this policy
          and applicable law.
        </p>
      </Section>

      <Section heading="How long we keep it">
        <p>
          We retain enquiry data that never converts to a registration for a limited period for follow-up purposes,
          and then delete or anonymise it. Enrolled-student and financial records are retained for as long as
          needed to provide the course, meet our legal/tax obligations, and resolve any disputes, after which they
          are deleted or anonymised.
        </p>
      </Section>

      <Section heading="Security">
        <p>
          We use reasonable technical and organisational measures — including encrypted password storage,
          access-controlled staff accounts and permission-based data access — to protect your data against
          unauthorised access, loss or misuse. No system is 100% secure, and we will notify affected individuals and
          the relevant authority where required by law if a breach materially affects your data.
        </p>
      </Section>

      <Section heading="Your rights">
        <p>Under the DPDP Act, you (as a "Data Principal") have the right to:</p>
        <ul>
          <li>Obtain a summary of the personal data we hold about you and how it is processed.</li>
          <li>Request correction, completion, or updating of your personal data.</li>
          <li>Request erasure of your personal data, unless we need to keep it for a legal or contractual reason.</li>
          <li>Withdraw consent at any time, as described above.</li>
          <li>Nominate another individual to exercise these rights on your behalf in the event of death or incapacity.</li>
          <li>Register a grievance with us, and escalate to the Data Protection Board of India if unresolved.</li>
        </ul>
        <p>
          To exercise any of these rights, contact {officerName ? `our Grievance Officer, ${officerName}, ` : 'us '}
          at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          {officerPhone ? (
            <>
              {' '}
              or <a href={`tel:${officerPhone}`}>{officerPhone}</a>
            </>
          ) : null}
          . We aim to respond within a reasonable time and in line with the timelines prescribed under the DPDP
          Act and its rules.
        </p>
      </Section>

      <Section heading="Cookies">
        <p>
          See our <Link to="/cookie-policy">Cookie Policy</Link> for the categories of cookies we use and how to
          manage your preferences.
        </p>
      </Section>

      <Section heading="Changes to this policy">
        <p>
          We may update this policy from time to time to reflect changes in our practices or the law. We'll update
          the effective date above when we do; material changes will be highlighted on this page.
        </p>
      </Section>

      <Section heading="Contact us">
        <p>
          For any privacy questions or requests, write to{' '}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          {address ? <> or reach us at {address}</> : null}.
        </p>
      </Section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
