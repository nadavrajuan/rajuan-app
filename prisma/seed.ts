import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error('ADMIN_PASSWORD env var required for seeding');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.admin.findFirst();
  if (existing) {
    await prisma.admin.update({ where: { id: existing.id }, data: { passwordHash } });
    console.log('Admin password updated.');
  } else {
    await prisma.admin.create({ data: { passwordHash } });
    console.log('Admin account created.');
  }

  // seed a few default categories
  const defaults = ['Web', 'Mobile', 'AI', 'Open Source', 'Experiment'];
  for (const name of defaults) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('Default categories seeded.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
