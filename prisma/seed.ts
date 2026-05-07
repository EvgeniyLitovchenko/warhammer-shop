import { GameSystem, PrismaClient, ProductStatus, UserRole } from '@prisma/client';
import { hashPassword } from '../src/lib/password';

const prisma = new PrismaClient();

const uah = (whole: number) => whole * 100;

type FactionSeed = {
  slug: string;
  name: string;
  nameEn: string;
  system: GameSystem;
  description: string;
};

const factions: FactionSeed[] = [
  {
    slug: 'space-marines',
    name: 'Космодесант',
    nameEn: 'Space Marines',
    system: GameSystem.WARHAMMER_40K,
    description:
      'Генетично вдосконалені воїни Імперіума, найкращий захист людства від ксеносів та єретиків.',
  },
  {
    slug: 'tyranids',
    name: 'Тираніди',
    nameEn: 'Tyranids',
    system: GameSystem.WARHAMMER_40K,
    description: 'Безкінечний рій з-за галактики, керований Колективним Розумом.',
  },
  {
    slug: 'necrons',
    name: 'Некрони',
    nameEn: 'Necrons',
    system: GameSystem.WARHAMMER_40K,
    description: 'Стародавня раса безсмертних воїнів, що пробуджується з мільйонолітнього сну.',
  },
  {
    slug: 'aeldari',
    name: 'Аельдарі',
    nameEn: 'Aeldari',
    system: GameSystem.WARHAMMER_40K,
    description: 'Витончена раса психіків, чия цивілізація колись охоплювала всю галактику.',
  },
  {
    slug: 'chaos-space-marines',
    name: 'Космодесант Хаосу',
    nameEn: 'Chaos Space Marines',
    system: GameSystem.WARHAMMER_40K,
    description: 'Зрадники Імператора, що поклялись служити Темним Богам.',
  },
  {
    slug: 'orks',
    name: 'Орки',
    nameEn: 'Orks',
    system: GameSystem.WARHAMMER_40K,
    description: 'Войовнича раса грибоподібних ксеносів, яка живе заради бійки.',
  },
  {
    slug: 'astra-militarum',
    name: 'Астра Мілітарум',
    nameEn: 'Astra Militarum',
    system: GameSystem.WARHAMMER_40K,
    description: 'Численні полки звичайних людей-солдатів, опора військової машини Імперіума.',
  },
  {
    slug: 'stormcast-eternals',
    name: 'Грозодухи Безсмертні',
    nameEn: 'Stormcast Eternals',
    system: GameSystem.AGE_OF_SIGMAR,
    description: 'Воскреслі герої, перековані Сігмаром у живі блискавиці.',
  },
  {
    slug: 'skaven',
    name: 'Скейвени',
    nameEn: 'Skaven',
    system: GameSystem.AGE_OF_SIGMAR,
    description: 'Раса розумних щуролюдей, що живе в підземних лабіринтах.',
  },
  {
    slug: 'slaves-to-darkness',
    name: 'Раби Темряви',
    nameEn: 'Slaves to Darkness',
    system: GameSystem.AGE_OF_SIGMAR,
    description: 'Смертні воїни, що поклялись служити Богам Хаосу заради сили.',
  },
];

type CategorySeed = {
  slug: string;
  name: string;
  nameEn: string;
  children?: Array<{ slug: string; name: string; nameEn: string }>;
};

const categoryTree: CategorySeed[] = [
  {
    slug: 'miniatures',
    name: 'Мініатюри',
    nameEn: 'Miniatures',
    children: [
      { slug: 'combat-patrol', name: 'Combat Patrol', nameEn: 'Combat Patrol' },
      { slug: 'battleforce', name: 'Battleforce', nameEn: 'Battleforce' },
      { slug: 'single-units', name: 'Окремі загони', nameEn: 'Single units' },
      { slug: 'starter-sets', name: 'Стартові набори', nameEn: 'Starter sets' },
    ],
  },
  {
    slug: 'paints',
    name: 'Фарби',
    nameEn: 'Paints',
    children: [
      { slug: 'paint-base', name: 'Base', nameEn: 'Base' },
      { slug: 'paint-layer', name: 'Layer', nameEn: 'Layer' },
      { slug: 'paint-shade', name: 'Shade', nameEn: 'Shade' },
      { slug: 'paint-contrast', name: 'Contrast', nameEn: 'Contrast' },
      { slug: 'paint-sets', name: 'Набори фарб', nameEn: 'Paint sets' },
    ],
  },
  {
    slug: 'books',
    name: 'Книги',
    nameEn: 'Books',
    children: [
      { slug: 'codexes', name: 'Кодекси', nameEn: 'Codexes' },
      { slug: 'battletomes', name: 'Battletomes', nameEn: 'Battletomes' },
      { slug: 'novels', name: 'Романи', nameEn: 'Novels' },
    ],
  },
  {
    slug: 'accessories',
    name: 'Аксесуари',
    nameEn: 'Accessories',
    children: [
      { slug: 'tools', name: 'Інструменти', nameEn: 'Tools' },
      { slug: 'bases', name: 'Підставки', nameEn: 'Bases' },
      { slug: 'dice', name: 'Кубики', nameEn: 'Dice' },
    ],
  },
];

const placeholder = (text: string, bg: string, fg: string) =>
  `https://placehold.co/800x800/${bg}/${fg}?text=${encodeURIComponent(text)}&font=playfair`;

type ProductSeed = {
  slug: string;
  sku: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  priceUah: number;
  comparePriceUah?: number;
  factionSlug?: string;
  categorySlug: string;
  stock: number;
  images: string[];
};

const products: ProductSeed[] = [
  {
    slug: 'combat-patrol-space-marines',
    sku: 'CP-SM-001',
    name: 'Combat Patrol: Space Marines',
    nameEn: 'Combat Patrol: Space Marines',
    description:
      'Готовий до гри загін Космодесанту: капітан, інтерцестори, аґресори та інвіктори. Ідеальний старт для нової армії.',
    descriptionEn:
      'Ready-to-play Space Marines force: Captain, Intercessors, Aggressors and Invictor. The perfect way to start a new army.',
    priceUah: uah(5500),
    factionSlug: 'space-marines',
    categorySlug: 'combat-patrol',
    stock: 12,
    images: [placeholder('Space Marines', '0a1929', 'c9a558')],
  },
  {
    slug: 'combat-patrol-tyranids',
    sku: 'CP-TYR-001',
    name: 'Combat Patrol: Tyranids',
    nameEn: 'Combat Patrol: Tyranids',
    description:
      'Авангард рою: винищувач, термаганти, гарґойли та біовор. Хижа сила Колективного Розуму у вашому хобі.',
    descriptionEn:
      'Vanguard of the swarm: Winged Tyranid Prime, Termagants, Gargoyles and a Biovore.',
    priceUah: uah(5500),
    factionSlug: 'tyranids',
    categorySlug: 'combat-patrol',
    stock: 8,
    images: [placeholder('Tyranids', '5a1f1f', 'e7dfc6')],
  },
  {
    slug: 'combat-patrol-necrons',
    sku: 'CP-NEC-001',
    name: 'Combat Patrol: Necrons',
    nameEn: 'Combat Patrol: Necrons',
    description:
      'Стародавні воїни прокидаються: оверлорд, воїни, безсмертні та скарабеї. Залізний легіон Невмирущих династій.',
    descriptionEn: 'Ancient warriors awaken: Overlord, Warriors, Immortals and Canoptek Scarabs.',
    priceUah: uah(5500),
    factionSlug: 'necrons',
    categorySlug: 'combat-patrol',
    stock: 6,
    images: [placeholder('Necrons', '1a1a1a', '4a90a4')],
  },
  {
    slug: 'codex-space-marines',
    sku: 'BK-CDX-SM-10',
    name: 'Codex: Space Marines (10 ред.)',
    nameEn: 'Codex: Space Marines (10th ed.)',
    description:
      'Повна книга правил для армії Адептус Астартес: лор, юніти, стратагеми, відображення Розділів.',
    descriptionEn:
      'Complete rulebook for the Adeptus Astartes army: lore, units, stratagems, Chapter rules.',
    priceUah: uah(1850),
    factionSlug: 'space-marines',
    categorySlug: 'codexes',
    stock: 25,
    images: [placeholder('Codex Space Marines', '0a1929', 'c9a558')],
  },
  {
    slug: 'codex-tyranids',
    sku: 'BK-CDX-TYR-10',
    name: 'Codex: Tyranids (10 ред.)',
    nameEn: 'Codex: Tyranids (10th ed.)',
    description: 'Кодекс рою: біолоґія Тиранідів, формації Гідри, лор Колективного Розуму.',
    descriptionEn: 'Codex of the swarm: Tyranid biology, Hive Fleet formations, lore.',
    priceUah: uah(1850),
    factionSlug: 'tyranids',
    categorySlug: 'codexes',
    stock: 18,
    images: [placeholder('Codex Tyranids', '5a1f1f', 'e7dfc6')],
  },
  {
    slug: 'battletome-stormcast-eternals',
    sku: 'BK-BT-SCE-04',
    name: 'Battletome: Stormcast Eternals',
    nameEn: 'Battletome: Stormcast Eternals',
    description:
      'Книга армії Грозодухів для Age of Sigmar: правила, варскролли, історія Sigmarabulum.',
    descriptionEn: 'Stormcast Eternals army book for Age of Sigmar: rules, warscrolls, lore.',
    priceUah: uah(1750),
    factionSlug: 'stormcast-eternals',
    categorySlug: 'battletomes',
    stock: 14,
    images: [placeholder('Battletome SCE', '2a3142', 'd4af37')],
  },
  {
    slug: 'tyranid-termagants',
    sku: 'MN-TYR-TER',
    name: 'Tyranid Termagants',
    nameEn: 'Tyranid Termagants',
    description: 'Загін з 24 термагантів — основа будь-якого рою. Здешевлений ройовий пушечний м’яс.',
    descriptionEn: '24 Termagants — the swarm’s mainline troops.',
    priceUah: uah(1800),
    factionSlug: 'tyranids',
    categorySlug: 'single-units',
    stock: 20,
    images: [placeholder('Termagants', '5a1f1f', 'e7dfc6')],
  },
  {
    slug: 'necron-warriors',
    sku: 'MN-NEC-WAR',
    name: 'Necron Warriors',
    nameEn: 'Necron Warriors',
    description: 'Загін з 20 воїнів, основа війська Невмирущих династій. Гаусс-флаєри та реанімація.',
    descriptionEn: '20 Warriors, mainline troops of the Necron dynasties.',
    priceUah: uah(1850),
    factionSlug: 'necrons',
    categorySlug: 'single-units',
    stock: 16,
    images: [placeholder('Necron Warriors', '1a1a1a', '4a90a4')],
  },
  {
    slug: 'stormcast-vindictors',
    sku: 'MN-SCE-VIN',
    name: 'Stormcast Eternals: Vindictors',
    nameEn: 'Stormcast Eternals: Vindictors',
    description:
      'П’ять Віндікторів зі щитами та грозовими списами — щит будь-якої лінії Грозодухів.',
    descriptionEn: 'Five Vindictors with stormspears and storm shields.',
    priceUah: uah(1850),
    factionSlug: 'stormcast-eternals',
    categorySlug: 'single-units',
    stock: 11,
    images: [placeholder('Vindictors', '2a3142', 'd4af37')],
  },
  {
    slug: 'aeldari-guardians',
    sku: 'MN-AEL-GRD',
    name: 'Aeldari Guardian Defenders',
    nameEn: 'Aeldari Guardian Defenders',
    description: 'Класичні Захисники-Гвардійці Аельдарі: 10 воїнів та платформа важкої зброї.',
    descriptionEn: 'Classic Aeldari Guardian Defenders: 10 warriors plus a heavy weapon platform.',
    priceUah: uah(1900),
    factionSlug: 'aeldari',
    categorySlug: 'single-units',
    stock: 9,
    images: [placeholder('Aeldari Guardians', '2d1f4d', '9b7fc9')],
  },
  {
    slug: 'battleforce-chaos-space-marines',
    sku: 'BF-CSM-001',
    name: 'Battleforce: Chaos Space Marines',
    nameEn: 'Battleforce: Chaos Space Marines',
    description: 'Велика бойова сила Хаосу: лорд, легіонери, термінатори, обліторатори.',
    descriptionEn: 'Major Chaos battleforce: Lord, Legionaries, Terminators, Obliterators.',
    priceUah: uah(9500),
    comparePriceUah: uah(11500),
    factionSlug: 'chaos-space-marines',
    categorySlug: 'battleforce',
    stock: 4,
    images: [placeholder('Chaos Battleforce', '1a0808', '8b0000')],
  },
  {
    slug: 'cadian-shock-troops',
    sku: 'MN-AM-CDN',
    name: 'Cadian Shock Troops',
    nameEn: 'Cadian Shock Troops',
    description: 'Десять кадіанських ударних бійців — бекбон Імперської Гвардії.',
    descriptionEn: 'Ten Cadian Shock Troops — backbone of the Imperial Guard.',
    priceUah: uah(1700),
    factionSlug: 'astra-militarum',
    categorySlug: 'single-units',
    stock: 22,
    images: [placeholder('Cadians', '3d3a1f', 'a8a85a')],
  },
  {
    slug: 'paint-macragge-blue',
    sku: 'PT-BS-MCB',
    name: 'Citadel Base: Macragge Blue',
    nameEn: 'Citadel Base: Macragge Blue',
    description: 'Класичний синій базовий шар Ультрамаринів. 12 мл.',
    descriptionEn: 'Classic Ultramarines blue basecoat. 12 ml.',
    priceUah: uah(145),
    categorySlug: 'paint-base',
    stock: 60,
    images: [placeholder('Macragge Blue', '0a1929', 'c9a558')],
  },
  {
    slug: 'paint-calgar-blue',
    sku: 'PT-LR-CLB',
    name: 'Citadel Layer: Calgar Blue',
    nameEn: 'Citadel Layer: Calgar Blue',
    description: 'Світліший синій layer на основі Macragge Blue. Для висвітлень. 12 мл.',
    descriptionEn: 'Brighter blue layer over Macragge Blue. 12 ml.',
    priceUah: uah(145),
    categorySlug: 'paint-layer',
    stock: 58,
    images: [placeholder('Calgar Blue', '163a5e', 'c9a558')],
  },
  {
    slug: 'paint-nuln-oil',
    sku: 'PT-SH-NLN',
    name: 'Citadel Shade: Nuln Oil',
    nameEn: 'Citadel Shade: Nuln Oil',
    description: 'Найвідоміший shade у Citadel. Універсальне затемнення для будь-яких рецесів.',
    descriptionEn: 'The most famous Citadel shade. Universal recess wash.',
    priceUah: uah(165),
    categorySlug: 'paint-shade',
    stock: 75,
    images: [placeholder('Nuln Oil', '1a1c1f', 'e7dfc6')],
  },
  {
    slug: 'paint-black-templar',
    sku: 'PT-CT-BTM',
    name: 'Citadel Contrast: Black Templar',
    nameEn: 'Citadel Contrast: Black Templar',
    description: 'Чорний контраст для швидкого фарбування плащів та обладунків. 18 мл.',
    descriptionEn: 'Black contrast paint for quick cloth and armour painting. 18 ml.',
    priceUah: uah(250),
    categorySlug: 'paint-contrast',
    stock: 32,
    images: [placeholder('Black Templar', '0a0a0a', 'a8a8a8')],
  },
  {
    slug: 'paint-set-essentials',
    sku: 'PT-ST-ESS',
    name: 'Набір Citadel Essentials',
    nameEn: 'Citadel Essentials Set',
    description:
      'Стартовий набір для першого фарбування: 9 фарб, пензель, технічна рідина — все для першої моделі.',
    descriptionEn: 'Starter painting kit: 9 paints, brush, technical fluid.',
    priceUah: uah(1100),
    categorySlug: 'paint-sets',
    stock: 18,
    images: [placeholder('Essentials Set', '2a2d31', 'c9a558')],
  },
  {
    slug: 'brushes-starter',
    sku: 'AC-BR-STR',
    name: 'Citadel Starter Brushes',
    nameEn: 'Citadel Starter Brushes',
    description: 'Набір з трьох пензлів: тонкий деталюючий, базовий, сухий.',
    descriptionEn: 'Three-brush set: detail, base, drybrush.',
    priceUah: uah(850),
    categorySlug: 'tools',
    stock: 28,
    images: [placeholder('Brushes', '2a2d31', 'c9a558')],
  },
  {
    slug: 'bases-25mm-round-60',
    sku: 'AC-BS-25R',
    name: 'Підставки 25мм круглі (60 шт)',
    nameEn: 'Citadel 25mm Round Bases (60 pcs)',
    description: 'Стандартні підставки 25мм для більшості піхоти 40k та AoS.',
    descriptionEn: 'Standard 25mm round bases for most infantry models.',
    priceUah: uah(220),
    categorySlug: 'bases',
    stock: 45,
    images: [placeholder('25mm Bases', '1a1c1f', 'e7dfc6')],
  },
  {
    slug: 'dice-imperium',
    sku: 'AC-DC-IMP',
    name: 'Кубики Warhammer 40k: Imperium',
    nameEn: 'Warhammer 40k Dice: Imperium',
    description: 'Набір з 20 шестигранних кубиків з символами Імперіума.',
    descriptionEn: '20 six-sided dice with Imperium iconography.',
    priceUah: uah(750),
    categorySlug: 'dice',
    stock: 19,
    images: [placeholder('Imperium Dice', '0a1929', 'c9a558')],
  },
];

type TestUser = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
};

const testUsers: TestUser[] = [
  {
    email: 'admin@warhammer.local',
    name: 'Admin Imperator',
    password: 'Imperator2024!',
    role: UserRole.ADMIN,
  },
  {
    email: 'manager@warhammer.local',
    name: 'Cassia Manager',
    password: 'Manager2024!',
    role: UserRole.MANAGER,
  },
  {
    email: 'customer@warhammer.local',
    name: 'Sergei Cadia',
    password: 'Customer2024!',
    role: UserRole.CUSTOMER,
  },
];

async function seedFactions() {
  for (const f of factions) {
    await prisma.faction.upsert({
      where: { slug: f.slug },
      update: { name: f.name, nameEn: f.nameEn, system: f.system, description: f.description },
      create: f,
    });
  }
}

async function seedCategories() {
  for (const top of categoryTree) {
    const parent = await prisma.category.upsert({
      where: { slug: top.slug },
      update: { name: top.name, nameEn: top.nameEn, parentId: null },
      create: { slug: top.slug, name: top.name, nameEn: top.nameEn },
    });

    for (const child of top.children ?? []) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { name: child.name, nameEn: child.nameEn, parentId: parent.id },
        create: { ...child, parentId: parent.id },
      });
    }
  }
}

async function seedProducts() {
  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (!category) throw new Error(`Category ${p.categorySlug} missing for ${p.slug}`);

    const faction = p.factionSlug
      ? await prisma.faction.findUnique({ where: { slug: p.factionSlug } })
      : null;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        sku: p.sku,
        name: p.name,
        nameEn: p.nameEn,
        description: p.description,
        descriptionEn: p.descriptionEn,
        priceUah: p.priceUah,
        comparePriceUah: p.comparePriceUah ?? null,
        status: ProductStatus.ACTIVE,
        categoryId: category.id,
        factionId: faction?.id ?? null,
      },
      create: {
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        nameEn: p.nameEn,
        description: p.description,
        descriptionEn: p.descriptionEn,
        priceUah: p.priceUah,
        comparePriceUah: p.comparePriceUah ?? null,
        status: ProductStatus.ACTIVE,
        categoryId: category.id,
        factionId: faction?.id ?? null,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((url, i) => ({
        productId: product.id,
        url,
        alt: p.name,
        sortOrder: i,
      })),
    });

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: { stock: p.stock },
      create: { productId: product.id, stock: p.stock },
    });
  }
}

async function seedTestUsers() {
  for (const u of testUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash: await hashPassword(u.password),
        role: u.role,
      },
    });
  }
}

async function seedReviews() {
  const customer = await prisma.user.findUnique({
    where: { email: 'customer@warhammer.local' },
  });
  const manager = await prisma.user.findUnique({
    where: { email: 'manager@warhammer.local' },
  });
  if (!customer || !manager) return;

  const reviews = [
    {
      productSlug: 'combat-patrol-space-marines',
      userId: customer.id,
      rating: 5,
      title: 'Чудовий набір для старту',
      body: 'Брав сину на день народження. Збиралось без клею за пару годин, фарбувати буде задоволенням.',
    },
    {
      productSlug: 'codex-space-marines',
      userId: customer.id,
      rating: 4,
      title: 'Корисна, але дорогувата',
      body: 'Книга чудова, лор зачитуєш як роман. Єдине — для нової редакції варто переробити кілька стратагем.',
    },
    {
      productSlug: 'paint-nuln-oil',
      userId: manager.id,
      rating: 5,
      title: 'Маст-хев',
      body: 'Без Nuln Oil не виходжу з дому. Додає глибини будь-якій моделі за 2 секунди.',
    },
    {
      productSlug: 'combat-patrol-tyranids',
      userId: customer.id,
      rating: 5,
      title: 'Жах галактики у вашому домі',
      body: 'Деталізація моделей просто космос. Гаргойлів збирати найважче, але результат того вартий.',
    },
  ];

  for (const r of reviews) {
    const product = await prisma.product.findUnique({ where: { slug: r.productSlug } });
    if (!product) continue;

    await prisma.review.upsert({
      where: {
        productId_userId: { productId: product.id, userId: r.userId },
      },
      update: { rating: r.rating, title: r.title, body: r.body, approved: true },
      create: {
        productId: product.id,
        userId: r.userId,
        rating: r.rating,
        title: r.title,
        body: r.body,
        approved: true,
      },
    });
  }
}

async function main() {
  await seedFactions();
  await seedCategories();
  await seedProducts();
  await seedTestUsers();
  await seedReviews();

  const counts = await Promise.all([
    prisma.faction.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.review.count(),
  ]);

  console.warn(
    `seed: ${counts[0]} factions, ${counts[1]} categories, ${counts[2]} products, ${counts[3]} users, ${counts[4]} reviews`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
