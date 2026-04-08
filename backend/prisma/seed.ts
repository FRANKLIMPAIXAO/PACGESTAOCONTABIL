import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar escritório demo
  const office = await prisma.office.upsert({
    where: { slug: 'pac-contabilidade-demo' },
    update: {},
    create: {
      name: 'PAC Contabilidade',
      slug: 'pac-contabilidade-demo',
      cnpj: '12.345.678/0001-90',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Escritório criado: ${office.name} (${office.id})`);

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pacgestao.com.br' },
    update: {},
    create: {
      name: 'Administrador PAC',
      email: 'admin@pacgestao.com.br',
      password: hashedPassword,
      role: UserRole.OWNER,
      officeId: office.id,
    },
  });

  console.log(`✅ Usuário criado: ${admin.email} (senha: Admin@123)`);

  // Criar clientes de exemplo
  const clientsData = [
    { name: 'Construtora Horizonte Ltda', document: '12345678000190', type: 'PJ' as const, email: 'joao@horizonte.com.br', phone: '(11) 99999-0001' },
    { name: 'Tech Solutions S/A', document: '23456789000101', type: 'PJ' as const, email: 'maria@techsolutions.com.br', phone: '(11) 99999-0002' },
    { name: 'Restaurante Bom Sabor ME', document: '34567890000112', type: 'PJ' as const, email: 'pedro@bomsabor.com.br', phone: '(11) 99999-0003' },
    { name: 'Clínica Saúde Total Ltda', document: '45678901000123', type: 'PJ' as const, email: 'ana@saudetotal.com.br', phone: '(11) 99999-0004' },
    { name: 'LogMove Transportes S/A', document: '67890123000145', type: 'PJ' as const, email: 'fernanda@logmove.com.br', phone: '(11) 99999-0006' },
  ];

  for (const data of clientsData) {
    const client = await prisma.client.upsert({
      where: { document: data.document },
      update: {},
      create: {
        ...data,
        officeId: office.id,
      },
    });
    console.log(`✅ Cliente criado: ${client.name}`);
  }

  // Criar obrigações padrão
  const obligationsData = [
    { name: 'DCTF Mensal', category: 'FISCAL' as const, frequency: 'MONTHLY', dueDay: 15 },
    { name: 'SPED Fiscal', category: 'FISCAL' as const, frequency: 'MONTHLY', dueDay: 20 },
    { name: 'DAS Simples Nacional', category: 'FISCAL' as const, frequency: 'MONTHLY', dueDay: 20 },
    { name: 'eSocial Mensal', category: 'TRABALHISTA' as const, frequency: 'MONTHLY', dueDay: 7 },
    { name: 'EFD-REINF', category: 'PREVIDENCIARIA' as const, frequency: 'MONTHLY', dueDay: 15 },
    { name: 'DIRF Anual', category: 'FISCAL' as const, frequency: 'ANNUAL', dueDay: 28 },
    { name: 'ECF', category: 'CONTABIL' as const, frequency: 'ANNUAL', dueDay: 31 },
    { name: 'ECD', category: 'CONTABIL' as const, frequency: 'ANNUAL', dueDay: 30 },
    { name: 'RAIS', category: 'TRABALHISTA' as const, frequency: 'ANNUAL', dueDay: 30 },
  ];

  for (const data of obligationsData) {
    await prisma.obligation.create({
      data: {
        ...data,
        officeId: office.id,
      },
    });
  }

  console.log(`✅ ${obligationsData.length} obrigações padrão criadas`);

  // Criar tarefas de exemplo
  const tasksData = [
    { title: 'Revisar balancete de março — Horizonte', status: 'TODO' as const, priority: 'HIGH' as const, dueDate: new Date('2026-04-10') },
    { title: 'Conciliar contas bancárias — Tech Solutions', status: 'DOING' as const, priority: 'HIGH' as const, dueDate: new Date('2026-04-12') },
    { title: 'Calcular IRPJ trimestral — LogMove', status: 'DOING' as const, priority: 'URGENT' as const, dueDate: new Date('2026-04-15') },
    { title: 'Folha de pagamento — Abril/2026', status: 'TODO' as const, priority: 'URGENT' as const, dueDate: new Date('2026-04-05') },
  ];

  for (const data of tasksData) {
    await prisma.task.create({
      data: {
        ...data,
        createdById: admin.id,
        assignedToId: admin.id,
        officeId: office.id,
      },
    });
  }

  console.log(`✅ ${tasksData.length} tarefas de exemplo criadas`);
  console.log('\n🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
