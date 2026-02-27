import { PrismaClient, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  const passwordHash = await bcrypt.hash('Password123!', saltRounds);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      displayName: 'Demo User',
      passwordHash
    }
  });

  await prisma.task.deleteMany({ where: { userId: user.id } });

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: 'Review project brief',
        description: 'Read the specification and outline tasks.',
        completed: true,
        priority: TaskPriority.medium,
        tags: ['planning', 'docs'],
        dueDate: new Date()
      },
      {
        userId: user.id,
        title: 'Implement authentication',
        description: 'Add registration, login, and JWT handling.',
        completed: false,
        priority: TaskPriority.high,
        tags: ['backend', 'auth'],
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)
      },
      {
        userId: user.id,
        title: 'Design dashboard UI',
        description: 'Create task list with filters and pagination.',
        completed: false,
        priority: TaskPriority.low,
        tags: ['frontend'],
        dueDate: null
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
