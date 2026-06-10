import { PrismaClient, Status, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  const passwordHash = await bcrypt.hash('Test@123', 12);

  // Test User 1
  const user1 = await prisma.user.upsert({
    where: { email: 'test1@example.com' },
    update: {},
    create: {
      email: 'test1@example.com',
      passwordHash,
    },
  });

  // Test User 2
  const user2 = await prisma.user.upsert({
    where: { email: 'test2@example.com' },
    update: {},
    create: {
      email: 'test2@example.com',
      passwordHash,
    },
  });

  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Users created.');

  // Delete all existing tasks
  await prisma.task.deleteMany({});
  await prisma.activityLog.deleteMany({});

  // User 1 tasks
  for (let i = 1; i <= 10; i++) {
    const task = await prisma.task.create({
      data: {
        userId: user1.id,
        title: `User 1 Task ${i}`,
        description: `Description for task ${i}`,
        status: i % 3 === 0 ? Status.DONE : i % 2 === 0 ? Status.IN_PROGRESS : Status.TODO,
        priority: i % 3 === 0 ? Priority.HIGH : i % 2 === 0 ? Priority.MEDIUM : Priority.LOW,
        dueDate: i % 2 === 0 ? new Date(Date.now() + 86400000 * i) : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        action: 'created',
      },
    });
  }

  // User 2 tasks
  for (let i = 1; i <= 5; i++) {
    const task = await prisma.task.create({
      data: {
        userId: user2.id,
        title: `User 2 Task ${i}`,
        description: `Description for user 2 task ${i}`,
        status: Status.TODO,
        priority: Priority.MEDIUM,
        dueDate: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        action: 'created',
      },
    });
  }

  console.log('Tasks and activity logs created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });