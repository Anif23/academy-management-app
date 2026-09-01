const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { PaymentModeMap } = require('../utils/enumMaps');

function summarize(fee) {
  const courseFee = Number(fee.courseFee);
  const discount = Number(fee.discount);
  const finalFee = courseFee - discount;
  const paidAmount = fee.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  return { courseFee, discount, finalFee, paidAmount, pendingAmount: Math.max(0, finalFee - paidAmount) };
}

function toPublic(fee) {
  return {
    id: fee.id,
    studentId: fee.studentId,
    courseFee: Number(fee.courseFee),
    discount: Number(fee.discount),
    nextPaymentDate: fee.nextPaymentDate,
    remarks: fee.remarks || '',
    payments: fee.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      date: p.date,
      mode: PaymentModeMap.fromDb(p.mode),
      remarks: p.remarks || '',
    })),
    summary: summarize(fee),
    createdAt: fee.createdAt,
    updatedAt: fee.updatedAt,
  };
}

const includePayments = { payments: { orderBy: { date: 'desc' } } };

async function getAllRaw() {
  const rows = await prisma.fee.findMany({ include: includePayments, orderBy: { createdAt: 'desc' } });
  return rows.map(toPublic);
}

async function getByStudentId(studentId) {
  const fee = await prisma.fee.findUnique({ where: { studentId }, include: includePayments });
  return fee ? toPublic(fee) : null;
}

async function getById(id) {
  const fee = await prisma.fee.findUnique({ where: { id }, include: includePayments });
  if (!fee) throw ApiError.notFound('Fee record not found.');
  return toPublic(fee);
}

async function update(id, patch) {
  const data = {};
  if (patch.courseFee !== undefined) data.courseFee = patch.courseFee;
  if (patch.discount !== undefined) data.discount = patch.discount;
  if (patch.nextPaymentDate !== undefined) data.nextPaymentDate = patch.nextPaymentDate;
  if (patch.remarks !== undefined) data.remarks = patch.remarks;

  const fee = await prisma.fee.update({ where: { id }, data, include: includePayments });
  return toPublic(fee);
}

async function addPayment(feeId, input) {
  const fee = await prisma.fee.findUnique({ where: { id: feeId } });
  if (!fee) throw ApiError.notFound('Fee record not found.');

  await prisma.payment.create({
    data: {
      feeId,
      amount: input.amount,
      date: input.date,
      mode: PaymentModeMap.toDb(input.mode),
      remarks: input.remarks,
    },
  });

  await prisma.fee.update({
    where: { id: feeId },
    data: { nextPaymentDate: null },
  });

  const updated = await prisma.fee.findUnique({ where: { id: feeId }, include: includePayments });
  return toPublic(updated);
}

module.exports = { getAllRaw, getByStudentId, getById, update, addPayment, summarize, toPublic };
