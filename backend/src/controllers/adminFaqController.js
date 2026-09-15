const asyncHandler = require('../utils/asyncHandler');
const faqService = require('../services/adminFaqService');

const getAll = asyncHandler(async (req, res) => {
  const faqs = await faqService.getAll();
  res.json({ success: true, data: faqs });
});

const create = asyncHandler(async (req, res) => {
  const faq = await faqService.create(req.body);
  res.status(201).json({ success: true, data: faq });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faq = await faqService.update(id, req.body);
  res.json({ success: true, data: faq });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await faqService.remove(id);
  res.json({ success: true, message: 'FAQ removed successfully' });
});

module.exports = {
  getAll,
  create,
  update,
  remove,
};
