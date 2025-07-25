import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('password', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create project manager user
  const pmUser = await prisma.user.upsert({
    where: { email: 'pm@demo.com' },
    update: {},
    create: {
      email: 'pm@demo.com',
      name: 'Project Manager',
      password: hashedPassword,
      role: 'PROJECT_MANAGER',
    },
  });

  console.log('✅ Created project manager user:', pmUser.email);

  // Create sample resources
  const resource1 = await prisma.resource.create({
    data: {
      resourceId: 'RES-001',
      name: 'John Developer',
      email: 'john@company.com',
      phone: '+1-555-0101',
      hourlyRate: 75,
      yearsOfExp: 5,
      skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'TypeScript']),
      certifications: JSON.stringify(['AWS Certified Developer']),
      createdBy: adminUser.id,
    },
  });

  const resource2 = await prisma.resource.create({
    data: {
      resourceId: 'RES-002',
      name: 'Sarah Designer',
      email: 'sarah@company.com',
      phone: '+1-555-0102',
      hourlyRate: 65,
      yearsOfExp: 3,
      skills: JSON.stringify(['UI/UX Design', 'Figma', 'Adobe Creative Suite']),
      certifications: JSON.stringify(['Google UX Design Certificate']),
      createdBy: adminUser.id,
    },
  });

  console.log('✅ Created resources');

  // Create sample project
  const project1 = await prisma.project.create({
    data: {
      name: 'E-commerce Platform Development',
      projectId: 'PROJ-2024-001',
      description: 'Development of a modern e-commerce platform with advanced features',
      poNumber: 'PO-2024-E001',
      poDate: new Date('2024-01-15'),
      poAmount: 150000,
      clientName: 'TechCorp Inc.',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-08-31'),
      budget: 105000, // 70% of PO amount
      status: 'IN_PROGRESS',
      createdBy: pmUser.id,
    },
  });

  // Create project milestones
  const milestone1 = await prisma.milestone.create({
    data: {
      name: 'Requirements Analysis Complete',
      description: 'Complete analysis of functional and non-functional requirements',
      scheduledDate: new Date('2024-02-28'),
      actualDate: new Date('2024-02-25'),
      status: 'COMPLETED',
      isBillingMilestone: true,
      billingAmount: 15000,
      projectId: project1.id,
    },
  });

  const milestone2 = await prisma.milestone.create({
    data: {
      name: 'UI/UX Design Phase',
      description: 'Complete user interface and user experience design',
      scheduledDate: new Date('2024-04-15'),
      status: 'IN_PROGRESS',
      isBillingMilestone: true,
      billingAmount: 25000,
      projectId: project1.id,
    },
  });

  const milestone3 = await prisma.milestone.create({
    data: {
      name: 'Backend Development',
      description: 'Complete backend API development and testing',
      scheduledDate: new Date('2024-06-30'),
      status: 'PLANNED',
      isBillingMilestone: true,
      billingAmount: 40000,
      projectId: project1.id,
    },
  });

  console.log('✅ Created project milestones');

  // Create resource allocations
  await prisma.resourceAllocation.create({
    data: {
      projectId: project1.id,
      resourceId: resource1.id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-08-31'),
      allocation: 80,
      hourlyRate: 75,
    },
  });

  await prisma.resourceAllocation.create({
    data: {
      projectId: project1.id,
      resourceId: resource2.id,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-05-31'),
      allocation: 60,
      hourlyRate: 65,
    },
  });

  console.log('✅ Created resource allocations');

  // Create some expenses
  await prisma.expense.create({
    data: {
      description: 'AWS Infrastructure Setup',
      amount: 1500,
      category: 'INFRASTRUCTURE',
      date: new Date('2024-02-05'),
      projectId: project1.id,
    },
  });

  await prisma.expense.create({
    data: {
      description: 'Design Software Licenses',
      amount: 800,
      category: 'LICENSE',
      date: new Date('2024-02-10'),
      projectId: project1.id,
    },
  });

  console.log('✅ Created expenses');

  // Create an invoice
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-000001',
      amount: 15000,
      issueDate: new Date('2024-03-01'),
      dueDate: new Date('2024-03-31'),
      status: 'PAID',
      paidDate: new Date('2024-03-20'),
      projectId: project1.id,
      milestoneId: milestone1.id,
    },
  });

  console.log('✅ Created invoice');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\nDemo credentials:');
  console.log('Admin: admin@demo.com / password');
  console.log('PM: pm@demo.com / password');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });