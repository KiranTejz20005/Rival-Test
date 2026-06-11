const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const p = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Test@123', 12);
  
  await p.user.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: hash, role: 'ADMIN' },
    create: { email: 'admin@example.com', passwordHash: hash, role: 'ADMIN' }
  });

  await p.user.upsert({
    where: { email: 'test1@example.com' },
    update: { passwordHash: hash, role: 'USER' },
    create: { email: 'test1@example.com', passwordHash: hash, role: 'USER' }
  });

  console.log("Passwords updated to Test@123!");
}

main().finally(() => p.$disconnect());
