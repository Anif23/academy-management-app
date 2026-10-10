const prisma = require('../config/prisma');

const DEFAULTS = { appName: 'Academy Management', tagline: 'For Managing Everything', logoUrl: null };

async function getBranding() {
  const branding = await prisma.appBranding.findUnique({ where: { id: 'singleton' } });
  return branding || { id: 'singleton', ...DEFAULTS };
}

async function updateBranding(data) {
  return prisma.appBranding.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...DEFAULTS, ...data },
  });
}

module.exports = { getBranding, updateBranding };
