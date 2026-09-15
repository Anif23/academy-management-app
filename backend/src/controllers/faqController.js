const asyncHandler = require('../utils/asyncHandler');
const faqService = require('../services/faqService');

const getFAQs = asyncHandler(async (req, res) => {
  const faqs = await faqService.getActiveFAQs();
  res.json({ success: true, data: faqs });
});

module.exports = {
  getFAQs,
};
