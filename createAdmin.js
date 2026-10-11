const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log('Usage: node createAdmin.js <email> <password>');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({ data: { email, passwordHash } });
  console.log('Admin created:', admin.email);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());