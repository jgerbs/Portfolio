import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create user Alice
  const alice = await prisma.user.upsert({
    where: { uname: "jack" },
    update: {},
    create: {
      uname: "jack",
      password: "alpha",
    },
  });

  console.log("Created user:", alice.uname);

  // Demo Posts
  const post1 = await prisma.post.create({
    data: {
      title: "Mochido opens its new location in Coquitlam this week",
      link: "https://dailyhive.com/vancouver/mochido-coquitlam-open",
      description: "New mochi donut shop, Mochido, is set to open later this week.",
      creator: alice.id,
      subgroup: "food",
      timestamp: Date.now(),
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "2023 State of Databases for Serverless & Edge",
      link: "https://leerob.io/blog/backend",
      description: "Overview of databases that pair well with modern application deployments.",
      creator: alice.id,
      subgroup: "coding",
      timestamp: Date.now(),
    },
  });

  console.log("Created posts:", [post1.title, post2.title]);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
