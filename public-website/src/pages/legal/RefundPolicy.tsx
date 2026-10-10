import { useAcademyInfo } from '../../hooks/useAcademyInfo';
import { LegalLayout, Section } from './LegalLayout';

const EFFECTIVE_DATE = 'September 26, 2026';

const RefundPolicy = () => {
  const { data: academy } = useAcademyInfo();
  const displayName = academy?.name || 'the Academy';
  const contactEmail = academy?.email || 'contact@example.com';
  const phone = academy?.phone;

  return (
    <LegalLayout title="Refund Policy" updatedLabel={`Effective ${EFFECTIVE_DATE}`}>
      <Section heading="Overview">
        <p>
          This policy explains when a course fee paid to {displayName} is eligible for a refund. It applies to
          course enrolment fees only; it doesn't cover third-party payment-gateway charges, which aren't ours to
          refund.
        </p>
      </Section>

      <Section heading="Cooling-off window">
        <p>
          If you cancel your enrolment in writing within <strong>7 days</strong> of payment, and before your batch's
          first class has taken place, you're entitled to a full refund minus any payment-gateway transaction fee
          actually charged to us.
        </p>
      </Section>

      <Section heading="After classes have started">
        <ul>
          <li>
            Cancelling after the first class but before completing <strong>20%</strong> of total scheduled classes:
            a <strong>50%</strong> refund of the fee paid.
          </li>
          <li>
            Cancelling after completing <strong>20%</strong> or more of total scheduled classes: no refund, as
            trainer time and batch resources have already been committed.
          </li>
          <li>
            If we cancel or indefinitely postpone a batch before it starts (e.g. due to insufficient enrolment), you
            receive a full refund or, if you prefer, the option to transfer to another batch/course of equal value.
          </li>
        </ul>
      </Section>

      <Section heading="Non-refundable items">
        <p>
          Registration/application fees (where charged separately from the course fee), and any third-party
          certification or exam fees paid on your behalf, are non-refundable once paid.
        </p>
      </Section>

      <Section heading="How to request a refund">
        <p>
          Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          {phone ? (
            <>
              {' '}
              or call <a href={`tel:${phone}`}>{phone}</a>
            </>
          ) : null}{' '}
          with your registered name, mobile number, course/batch, and the reason for cancellation. We'll confirm
          receipt and the applicable refund amount within a few working days.
        </p>
      </Section>

      <Section heading="Refund processing time">
        <p>
          Approved refunds are processed to the original payment method within <strong>7–14 working days</strong> of
          approval, subject to your bank's or payment provider's own processing timelines.
        </p>
      </Section>

      <Section heading="Batch transfers">
        <p>
          Instead of a refund, you may request to transfer your enrolment to a different batch of the same course
          (subject to seat availability) at any time before completing 20% of your current batch's scheduled
          classes, at no extra charge.
        </p>
      </Section>

      <Section heading="Changes to this policy">
        <p>We may update this policy from time to time; the effective date above reflects the latest version.</p>
      </Section>
    </LegalLayout>
  );
};

export default RefundPolicy;
