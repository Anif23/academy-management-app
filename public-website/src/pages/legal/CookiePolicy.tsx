import { Link } from 'react-router-dom';
import { useAcademyInfo } from '../../hooks/useAcademyInfo';
import { LegalLayout, Section } from './LegalLayout';

const EFFECTIVE_DATE = 'September 26, 2026';

const CookiePolicy = () => {
  const { data: academy } = useAcademyInfo();
  const displayName = academy?.name || 'the Academy';
  const contactEmail = academy?.email || 'contact@example.com';

  return (
    <LegalLayout title="Cookie Policy" updatedLabel={`Effective ${EFFECTIVE_DATE}`}>
      <Section heading="What this covers">
        <p>
          This policy explains the cookies and similar technologies used on {displayName}'s public website, and how
          you can control them. It doesn't cover our staff/student portal, which uses only strictly-necessary
          session cookies to keep you signed in.
        </p>
      </Section>

      <Section heading="Categories of cookies we use">
        <ul>
          <li>
            <strong>Strictly necessary:</strong> required for the site to function (e.g. remembering your cookie
            preference itself). These can't be switched off and don't require consent.
          </li>
          <li>
            <strong>Functional (optional):</strong> used only to load the embedded Google Map on our Contact
            section. Google may set its own cookies once you choose to load the map. Nothing loads until you say
            yes — either via the cookie banner or the "Load map" button on the Contact section.
          </li>
          <li>
            <strong>Analytics (optional):</strong> we do not currently run any analytics or advertising trackers on
            this site. This category exists in our consent settings so that if we introduce analytics in future, it
            will only run for visitors who've actively opted in — not retroactively for existing consent choices.
          </li>
        </ul>
      </Section>

      <Section heading="Managing your preferences">
        <p>
          You can change your choice at any time using the "Manage cookie preferences" link in the footer of this
          site, or by clearing your browser's site data for this domain (which resets your saved choice and shows
          the banner again).
        </p>
      </Section>

      <Section heading="Third-party cookies">
        <p>
          If you choose to load the embedded map, Google may set cookies as described in{' '}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
            Google's own cookie policy
          </a>
          . We don't control these cookies and recommend reviewing Google's policy for details.
        </p>
      </Section>

      <Section heading="More information">
        <p>
          See our <Link to="/privacy-policy">Privacy Policy</Link> for how we handle personal data more broadly.
          Questions? Write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
};

export default CookiePolicy;
