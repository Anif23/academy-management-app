const prisma = require('../src/config/prisma');

async function seedAcademy() {
  console.log('🌱 Seeding academy content...');

  // 1. Academy Settings
  await prisma.academySettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      name: 'Academy Pro',
      // No seeded logo: the previous placeholder linked to a watermarked
      // Dreamstime preview image, which isn't licensed for use — that's a
      // real copyright risk once the site is live. Upload a properly
      // licensed/owned logo from Academy Settings; until then the site
      // falls back to a plain letter avatar.
      logoUrl: null,
      email: 'info@academypro.com',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      address: '123 Education Lane',
      city: 'Tech City',
      state: 'Maharashtra',
      country: 'India',
      description: 'Academy Pro is a premier technical training center specializing in full-stack development and modern design. We bridge the gap between academic theory and industry practice.',
      mission: 'To empower students with practical, industry-ready skills through hands-on mentorship.',
      vision: 'To be the most trusted hub for technical excellence and career acceleration.',
      workingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
      // Left blank intentionally — these must be the academy's real
      // registered name/number and a real grievance contact (required by
      // India's DPDP Act). Fill them in from Academy Settings → Legal &
      // Compliance before going live; the Privacy Policy page reads these
      // fields directly.
      legalName: null,
      registrationNumber: null,
      grievanceOfficerName: null,
      grievanceOfficerEmail: null,
      grievanceOfficerPhone: null,
    },
  });

  // 2. FAQs
  const faqs = [
    {
      id: 'faq-1',
      question: 'How do I register for a course?',
      answer: 'You can register directly through our website by clicking the "Register" button on any course page or by chatting with us on WhatsApp.',
      category: 'Admissions',
      order: 1,
    },
    {
      id: 'faq-2',
      question: 'Do you provide certificates?',
      answer: 'Yes, all students receive a professional industry-recognized certificate upon successful completion of the course and final project.',
      category: 'Certification',
      order: 2,
    },
    {
      id: 'faq-3',
      question: 'Are there online and offline batches available?',
      answer: 'Yes, we offer both modes. You can choose your preferred mode during the registration process.',
      category: 'Logistics',
      order: 3,
    },
    {
      id: 'faq-4',
      question: 'Do you provide placement assistance?',
      answer: 'Absolutely! We have a dedicated placement cell that helps students with resume building, interview prep, and connecting with top hiring partners.',
      category: 'Career',
      order: 4,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { id: faq.id },
      update: { question: faq.question, answer: faq.answer, category: faq.category, order: faq.order },
      create: faq,
    });
  }

  // 3. Testimonials — intentionally none by default. Seeded placeholder
  // "reviews" attributed to invented people (with stock avatar-generator
  // photos) would be a false/fake testimonial once the site is live and
  // could expose the academy to consumer-protection and advertising-law
  // risk. Add only real, verifiable student testimonials via Academy
  // Content → Student Testimonials in the admin panel.

  // 4. Announcements — the running offer/alert strip at the top of the public site.
  const announcements = [
    {
      id: 'announcement-1',
      message: 'Admissions open for the new Full-Stack Development batch — limited seats.',
      tag: 'New Batch',
      order: 1,
    },
    {
      id: 'announcement-2',
      message: 'Refer a friend and both of you get a fee discount on enrollment.',
      tag: 'Offer',
      order: 2,
    },
  ];

  for (const a of announcements) {
    await prisma.announcement.upsert({
      where: { id: a.id },
      update: { message: a.message, tag: a.tag, order: a.order },
      create: a,
    });
  }

  console.log('✅ Seeding completed successfully!');
}

seedAcademy()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
