import { Link } from 'react-router-dom';
import { useAcademyInfo } from '../../hooks/useAcademyInfo';
import { LegalLayout, Section } from './LegalLayout';

const EFFECTIVE_DATE = 'September 26, 2026';

const TermsAndConditions = () => {
  const { data: academy } = useAcademyInfo();
  const entityName = academy?.legalName || academy?.name || 'the Academy';
  const displayName = academy?.name || 'the Academy';
  const contactEmail = academy?.email || 'contact@example.com';

  return (
    <LegalLayout title="Terms &amp; Conditions" updatedLabel={`Effective ${EFFECTIVE_DATE}`}>
      <Section heading="Agreement to terms">
        <p>
          These Terms &amp; Conditions govern your use of {displayName}'s website and enrolment in any course offered
          by <strong>{entityName}</strong> ("we", "us", "our"). By registering for a course or using our website, you
          agree to these terms. If you don't agree, please don't use our services.
        </p>
      </Section>

      <Section heading="Eligibility &amp; registration">
        <ul>
          <li>Course registration requires accurate name, contact and course-interest details.</li>
          <li>
            If you are under 18, a parent or legal guardian must complete or expressly authorise your registration.
          </li>
          <li>You're responsible for keeping your contact details and portal login credentials accurate and secure.</li>
        </ul>
      </Section>

      <Section heading="Courses, batches &amp; scheduling">
        <p>
          Course content, batch timings, faculty and delivery mode (online/offline) are as described at the time of
          registration and may be adjusted for operational reasons (e.g. low enrolment, faculty availability, force
          majeure). We'll make reasonable efforts to notify affected students of any material change in advance.
        </p>
      </Section>

      <Section heading="Fees &amp; payments">
        <p>
          Course fees, payment schedule and accepted payment modes are communicated at admission. Please see our{' '}
          <Link to="/refund-policy">Refund Policy</Link> for cancellation and refund terms. Continued access to
          classes, tasks and the student portal may depend on fees being paid according to the agreed schedule.
        </p>
      </Section>

      <Section heading="No outcome guarantees">
        <p>
          We aim to provide high-quality, practical, industry-relevant training. However, we do not guarantee any
          specific exam result, certification outcome, job offer, salary, or placement, as these depend on factors
          outside our control (including your own effort, prior background, and the hiring market). Any placement
          assistance we offer is best-effort support, not a guarantee of employment.
        </p>
      </Section>

      <Section heading="Code of conduct">
        <ul>
          <li>Treat trainers, staff and fellow students respectfully; harassment or abuse is not tolerated.</li>
          <li>Don't share your portal login with others, or misuse the platform (e.g. attempting unauthorised access).</li>
          <li>Submitted coursework/tasks should be your own work.</li>
        </ul>
        <p>
          We may suspend or terminate access to the portal or a course for a serious or repeated breach of these
          terms, without prejudice to fees already due.
        </p>
      </Section>

      <Section heading="Intellectual property">
        <p>
          Course materials, recordings, our logo, and website content are owned by us or our licensors and are
          provided for your personal learning use only. You may not copy, redistribute, or publicly share course
          materials without our written permission.
        </p>
      </Section>

      <Section heading="Third-party links &amp; embeds">
        <p>
          Our website may link to, or embed content from, third parties (for example, an embedded Google Map, or a
          WhatsApp chat link). We aren't responsible for the content, availability or privacy practices of those
          third-party services — see our <Link to="/privacy-policy">Privacy Policy</Link> and{' '}
          <Link to="/cookie-policy">Cookie Policy</Link> for details.
        </p>
      </Section>

      <Section heading="Limitation of liability">
        <p>
          To the maximum extent permitted by law, we are not liable for indirect, incidental or consequential losses
          arising from your use of our website or courses. Nothing in these terms limits liability that cannot
          lawfully be limited (for example, in cases of fraud or gross negligence).
        </p>
      </Section>

      <Section heading="Governing law">
        <p>
          These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction
          of the courts having jurisdiction over our registered place of business.
        </p>
      </Section>

      <Section heading="Changes to these terms">
        <p>We may update these terms from time to time. Continued use of our website or courses after an update means you accept the revised terms.</p>
      </Section>

      <Section heading="Contact us">
        <p>
          Questions about these terms? Write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
};

export default TermsAndConditions;
