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
      logoUrl: 'https://thumbs.dreamstime.com/b/academy-logo-element-vector-illustration-decorative-design-191487693.jpg',
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

  // 3. Testimonials
  const testimonials = [
    {
      id: 'testimonial-1',
      studentName: 'Rahul Sharma',
      role: 'Frontend Developer at TechCorp',
      content: 'Academy Pro changed my life. The practical approach to learning React and Node.js helped me land a job within 2 months of completion!',
      rating: 5,
      photo: 'https://i.pravatar.cc/150?u=rahul',
    },
    {
      id: 'testimonial-2',
      studentName: 'Sneha Patel',
      role: 'UI/UX Designer at Creative Studio',
      content: 'The mentorship here is top-notch. I loved the project-based learning and the constant support from the trainers.',
      rating: 5,
      photo: 'https://i.pravatar.cc/150?u=sneha',
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: { studentName: t.studentName, role: t.role, content: t.content, rating: t.rating, photo: t.photo },
      create: t,
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
