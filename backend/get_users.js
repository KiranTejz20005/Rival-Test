const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ select: { email: true, role: true } })
  .then(users => console.log(users))
  .finally(() => p.$disconnect());
