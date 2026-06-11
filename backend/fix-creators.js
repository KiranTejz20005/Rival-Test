const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    where: { createdById: null }
  });
  
  console.log(`Found ${tasks.length} tasks without a creator`);
  
  for (const task of tasks) {
    // find the creation log
    const log = await prisma.activityLog.findFirst({
      where: { taskId: task.id, action: 'TASK_CREATED' }
    });
    
    if (log && log.userId) {
      await prisma.task.update({
        where: { id: task.id },
        data: { createdById: log.userId }
      });
      console.log(`Updated task ${task.title} with creator ${log.userId}`);
    } else {
      // fallback to the first user (admin)
      const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
      if (firstUser) {
        await prisma.task.update({
          where: { id: task.id },
          data: { createdById: firstUser.id }
        });
        console.log(`Updated task ${task.title} with fallback creator ${firstUser.email}`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
