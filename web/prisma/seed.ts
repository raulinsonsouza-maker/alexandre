import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import {
  CATALOG,
  MODULE_CODE_BY_INDEX,
  mediaUrl,
} from "../src/data/catalog";
import { moduleCaktoPrice } from "../src/data/module-cakto-prices";
import { moduleInPlan, PLAN_PRICES_CENTS } from "../src/data/plan-modules";

function priceCentsForCode(code: string, catalogPrice?: number) {
  const row = moduleCaktoPrice(code);
  if (row) return row.priceCents;
  if (typeof catalogPrice === "number") return Math.round(catalogPrice * 100);
  return 31779;
}

const prisma = new PrismaClient();

const WA = "https://wa.me/5511974389297?text=Ol%C3%A1%2C%20quero%20o%20plano%20Corporate";

async function main() {
  const adminHash = await bcrypt.hash("Admin@2026", 12);
  const studentHash = await bcrypt.hash("Aluno@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@jornadaewm.com.br" },
    update: { passwordHash: adminHash, role: "ADMIN", active: true },
    create: {
      email: "admin@jornadaewm.com.br",
      name: "Admin Jornada",
      role: "ADMIN",
      passwordHash: adminHash,
      emailVerified: new Date(),
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "aluno@jornadaewm.com.br" },
    update: { passwordHash: studentHash, role: "STUDENT", active: true },
    create: {
      email: "aluno@jornadaewm.com.br",
      name: "Aluno Demo",
      role: "STUDENT",
      passwordHash: studentHash,
      emailVerified: new Date(),
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: "jornada-sap-ewm-2026" },
    update: { published: true },
    create: {
      slug: "jornada-sap-ewm-2026",
      title: "Jornada SAP EWM 2026",
      description: "Trilha completa de SAP Extended Warehouse Management.",
      published: true,
      priceCents: 56000,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "BEMVINDO10" },
    update: { active: true, percentOff: 10 },
    create: { code: "BEMVINDO10", percentOff: 10, active: true, maxRedemptions: 1000 },
  });

  const contentPath =
    process.env.CONTENT_PATH ||
    path.join(process.cwd(), "..", "content", "aulas-conteudo.json");
  let imported = 0;
  const modulesByCode = new Map<string, { id: string; category: string | null }>();

  if (fs.existsSync(contentPath)) {
    const raw = JSON.parse(fs.readFileSync(contentPath, "utf8"));
    const entries: { code: string; title: string; description?: string; aulas: unknown[] }[] = [];

    if (Array.isArray(raw)) {
      for (const m of raw) {
        entries.push({
          code: String(m.codigo || m.code),
          title: String(m.titulo || m.title),
          description: m.descricao || m.description,
          aulas: m.aulas || m.lessons || [],
        });
      }
    } else {
      for (const [code, m] of Object.entries(raw as Record<string, Record<string, unknown>>)) {
        entries.push({
          code,
          title: String(m.title || m.titulo || code),
          description: (m.descricao || m.description) as string | undefined,
          aulas: (m.aulas || m.lessons || []) as unknown[],
        });
      }
    }

    entries.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

    if (!entries.some((e) => e.code === "M15")) {
      entries.push({
        code: "M15",
        title: "Advanced Production Integration",
        description: "Integração avançada com produção (conteúdo base).",
        aulas: [{ titulo: "Visão geral API", conteudoChave: "Conceitos, cenários e pontos de integração." }],
      });
    }

    // Map catalog vitrine metadata by module code
    const catalogByCode = new Map<string, (typeof CATALOG)[0]>();
    for (const item of CATALOG) {
      const code = MODULE_CODE_BY_INDEX[item.index];
      if (code && !catalogByCode.has(code)) catalogByCode.set(code, item);
    }

    for (let i = 0; i < entries.length; i++) {
      const m = entries[i];
      const cat = catalogByCode.get(m.code);
      const slug =
        cat?.slug ||
        `${m.code.toLowerCase()}-${m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`.slice(0, 80);

      const existingByCode = await prisma.module.findFirst({
        where: { courseId: course.id, code: m.code },
      });

      const welcomeCover = mediaUrl(CATALOG[0]?.file || "00 - ERP x EWM Basis Linkage.png");
      const data = {
        title: cat?.title || m.title,
        description: cat?.description || m.description || null,
        sortOrder: m.code === "M00" ? -1 : (cat?.index ?? i),
        published: true,
        priceCents: priceCentsForCode(m.code, cat?.price),
        coverPath: cat ? mediaUrl(cat.file) : m.code === "M00" ? welcomeCover : null,
        category: cat?.category || (m.code === "M00" ? "Boas-vindas e Fundamentos" : null),
        featured: cat?.id === "warehouse-monitoring",
        featuredOrder: cat?.id === "warehouse-monitoring" ? 1 : 0,
      };

      let mod;
      if (existingByCode) {
        mod = await prisma.module.update({
          where: { id: existingByCode.id },
          data: { ...data, slug: existingByCode.slug },
        });
      } else {
        mod = await prisma.module.create({
          data: {
            courseId: course.id,
            code: m.code,
            slug,
            ...data,
          },
        });
      }

      modulesByCode.set(m.code, { id: mod.id, category: mod.category });

      const aulas = m.aulas as Record<string, unknown>[];
      for (let j = 0; j < aulas.length; j++) {
        const a = aulas[j];
        const lessonTitle = String(a.titulo || a.title || `Aula ${j + 1}`);
        const existing = await prisma.lesson.findFirst({
          where: { moduleId: mod.id, title: lessonTitle },
        });
        if (!existing) {
          await prisma.lesson.create({
            data: {
              moduleId: mod.id,
              title: lessonTitle,
              description: (a.descricao || a.description || null) as string | null,
              contentKey: (a.conteudoChave || a.contentKey || null) as string | null,
              sortOrder: typeof a.num === "number" ? (a.num as number) - 1 : j,
              published: true,
              isFreePreview: j === 0 && i === 0,
            },
          });
          imported++;
        } else if (!existing.published) {
          await prisma.lesson.update({ where: { id: existing.id }, data: { published: true } });
        }
      }
    }
  } else {
    const welcomeCover = mediaUrl(CATALOG[0]?.file || "00 - ERP x EWM Basis Linkage.png");
    const mod = await prisma.module.upsert({
      where: { slug: "m00-welcome" },
      update: {
        published: true,
        priceCents: 0,
        category: "Boas-vindas e Fundamentos",
        coverPath: welcomeCover,
      },
      create: {
        courseId: course.id,
        code: "M00",
        slug: "m00-welcome",
        title: "Boas-vindas",
        sortOrder: -1,
        published: true,
        priceCents: 0,
        category: "Boas-vindas e Fundamentos",
        coverPath: welcomeCover,
      },
    });
    modulesByCode.set("M00", { id: mod.id, category: mod.category });
    const count = await prisma.lesson.count({ where: { moduleId: mod.id } });
    if (count === 0) {
      await prisma.lesson.create({
        data: {
          moduleId: mod.id,
          title: "Introdução à jornada",
          description: "Aula inicial",
          contentKey: "Bem-vindo à Jornada SAP EWM.",
          sortOrder: 0,
          published: true,
          isFreePreview: true,
        },
      });
    }
  }

  // Also ensure catalog-only modules exist even without JSON code
  for (const item of CATALOG) {
    const code = MODULE_CODE_BY_INDEX[item.index] || `C${String(item.index).padStart(2, "0")}`;
    if (modulesByCode.has(code)) continue;
    const existing = await prisma.module.findUnique({ where: { slug: item.slug } });
    if (existing) {
      modulesByCode.set(code, { id: existing.id, category: existing.category });
      continue;
    }
    const mod = await prisma.module.create({
      data: {
        courseId: course.id,
        code,
        slug: item.slug,
        title: item.title,
        description: item.description,
        sortOrder: item.index,
        published: true,
        priceCents: priceCentsForCode(code, item.price),
        coverPath: mediaUrl(item.file),
        category: item.category,
        featured: item.id === "warehouse-monitoring",
        featuredOrder: item.id === "warehouse-monitoring" ? 1 : 0,
      },
    });
    modulesByCode.set(code, { id: mod.id, category: mod.category });
    await prisma.lesson.create({
      data: {
        moduleId: mod.id,
        title: "Introdução",
        contentKey: item.description,
        sortOrder: 0,
        published: true,
        isFreePreview: false,
      },
    });
  }

  const allModules = await prisma.module.findMany({ where: { courseId: course.id } });

  const plansDef = [
    {
      slug: "base",
      name: "Base",
      goal: "Para iniciantes em EWM — fundamento sólido, sem experiência prévia",
      priceCents: PLAN_PRICES_CENTS.base,
      badge: null as string | null,
      bullets: [
        "6 módulos: fundamentos, estrutura e dados mestres",
        "Visão geral de inbound/outbound e Warehouse Monitor",
        "Certificado de conclusão",
        "Ponto de partida para subir ao Pro",
      ],
      sortOrder: 1,
      checkoutEnabled: true,
      ctaUrl: null as string | null,
    },
    {
      slug: "pro",
      name: "Pro",
      goal: "Dominar os processos principais do armazém no dia a dia",
      priceCents: PLAN_PRICES_CENTS.pro,
      badge: "Mais recomendado",
      bullets: [
        "Tudo do Base + 22 módulos (28 no total)",
        "Inbound, outbound, HU, lotes, serial e inventário",
        "Wave Management, RF Framework e WT/WO",
        "Certificados por módulo",
      ],
      sortOrder: 2,
      checkoutEnabled: true,
      ctaUrl: null,
    },
    {
      slug: "expert",
      name: "Expert",
      goal: "Integrações, automação e cenários avançados de ponta a ponta",
      priceCents: PLAN_PRICES_CENTS.expert,
      badge: "Maior profundidade técnica",
      bullets: [
        "Tudo do Pro + 17 módulos (45 no total)",
        "QM, produção, TM, MFS, DAS e Analytics",
        "RFID, Labor Management, Billing e migração WM→EWM",
        "Certificação avançada",
      ],
      sortOrder: 3,
      checkoutEnabled: true,
      ctaUrl: null,
    },
    {
      slug: "corporate",
      name: "Corporate",
      goal: "Mesmos 45 módulos do Expert, com gestão para times",
      priceCents: PLAN_PRICES_CENTS.corporate,
      badge: "Para empresas",
      bullets: [
        "Conteúdo técnico igual ao Expert",
        "Licenças multiusuário e trilhas por perfil",
        "Dashboard, relatórios e certificados por colaborador",
        "Proposta personalizada (Retail, Farma, 3PL…)",
      ],
      sortOrder: 4,
      checkoutEnabled: false,
      ctaUrl: WA,
    },
  ];

  for (const p of plansDef) {
    const plan = await prisma.plan.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        goal: p.goal,
        priceCents: p.priceCents,
        badge: p.badge,
        bullets: p.bullets,
        sortOrder: p.sortOrder,
        published: true,
        checkoutEnabled: p.checkoutEnabled,
        ctaUrl: p.ctaUrl,
      },
      create: {
        slug: p.slug,
        name: p.name,
        goal: p.goal,
        priceCents: p.priceCents,
        badge: p.badge,
        bullets: p.bullets,
        sortOrder: p.sortOrder,
        published: true,
        checkoutEnabled: p.checkoutEnabled,
        ctaUrl: p.ctaUrl,
      },
    });

    await prisma.planModule.deleteMany({ where: { planId: plan.id } });
    const links = allModules.filter((m) => moduleInPlan(p.slug, m.code)).map((m) => ({
      planId: plan.id,
      moduleId: m.id,
    }));
    if (links.length) {
      await prisma.planModule.createMany({ data: links, skipDuplicates: true });
    }
  }

  const proPlan = await prisma.plan.findUnique({ where: { slug: "pro" } });
  if (proPlan) {
    const enr = await prisma.enrollment.findFirst({
      where: { userId: student.id, planId: proPlan.id, status: "ACTIVE" },
    });
    if (!enr) {
      await prisma.enrollment.create({
        data: {
          userId: student.id,
          planId: proPlan.id,
          source: "seed",
          grantedBy: admin.id,
          status: "ACTIVE",
        },
      });
    }
  }

  const settings: Record<string, string> = {
    hero_title: "Domine SAP EWM com a Jornada completa",
    hero_subtitle: "Módulos práticos, planos sob medida e área de membros com progresso.",
    whatsapp_url: WA,
    contact_email: "contato@jornadaewm.com.br",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  const bannerCount = await prisma.siteBanner.count();
  if (bannerCount === 0) {
    const featured = allModules.find((m) => m.featured) || allModules[0];
    if (featured) {
      await prisma.siteBanner.create({
        data: {
          title: featured.title,
          subtitle: featured.description?.slice(0, 160) || "Módulo em destaque",
          imagePath: featured.coverPath,
          linkUrl: `/modulo/${featured.slug}`,
          active: true,
          sortOrder: 0,
        },
      });
    }
  }

  const blogCount = await prisma.blogPost.count();
  if (blogCount === 0) {
    await prisma.blogPost.createMany({
      data: [
        {
          slug: "o-que-e-sap-ewm",
          title: "O que é SAP EWM e por que aprender agora",
          excerpt: "Entenda o Extended Warehouse Management e o papel na logística moderna.",
          body: "## O que é SAP EWM\n\nSAP Extended Warehouse Management é a solução de armazém da SAP para operações complexas.\n\nNa Jornada você aprende fundamentos, processos e integrações na prática.",
          category: "Fundamentos",
          published: true,
          publishedAt: new Date(),
        },
        {
          slug: "inbound-vs-outbound",
          title: "Inbound vs Outbound no EWM",
          excerpt: "Diferenças práticas entre recebimento e expedição.",
          body: "## Inbound e Outbound\n\nInbound cobre recebimento e putaway. Outbound cobre picking, packing e goods issue.\n\nEscolha o módulo avulso ou o plano Pro para aprofundar.",
          category: "Processos",
          published: true,
          publishedAt: new Date(),
        },
        {
          slug: "como-escolher-plano",
          title: "Como escolher entre Base, Pro e Expert",
          excerpt: "Guia rápido para decidir o pacote certo.",
          body: "## Base, Pro ou Expert?\n\n- **Base**: fundamentos e master data.\n- **Pro**: processos principais do armazém.\n- **Expert**: produção, TM, MFS e analytics.\n\nCorporate? Fale com o comercial no WhatsApp.",
          category: "Planos",
          published: true,
          publishedAt: new Date(),
        },
      ],
    });
  }

  console.log("Seed OK");
  console.log("Admin: admin@jornadaewm.com.br / Admin@2026");
  console.log("Aluno: aluno@jornadaewm.com.br / Aluno@123 (plano Pro)");
  console.log("Aulas importadas/criadas nesta execução:", imported);
  console.log("Módulos:", allModules.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
