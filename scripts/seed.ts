import { hash } from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { Admin } from "../src/models/Admin";
import { ApiToken } from "../src/models/ApiToken";
import { Plan } from "../src/models/Plan";
import { Purchase } from "../src/models/Purchase";
import { Ticket } from "../src/models/Ticket";
import { Usage } from "../src/models/Usage";

const TEST_ADMIN = {
  name: "Test Admin",
  companyName: "GenAI Img Test",
  email: "test@lumina.ai",
  phone: "9876543210",
  password: "Test@1234",
};

const plans = [
  {
    slug: "starter",
    name: "Starter Pack",
    model: "genaiimg-v1",
    description: "Try genaiimg-v1 with a small pack. ₹15 per credit.",
    credits: 100,
    pricePerCredit: 15,
    totalPrice: 1500,
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: "growth",
    name: "Growth Pack",
    model: "genaiimg-v1",
    description: "Better genaiimg-v1 rate when you buy more. ₹10 per credit.",
    credits: 2000,
    pricePerCredit: 10,
    totalPrice: 20000,
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: "bulk",
    name: "Bulk Pack",
    model: "genaiimg-v1",
    description: "Lowest genaiimg-v1 rate for 5000 credits. ₹8 per credit.",
    credits: 5000,
    pricePerCredit: 8,
    totalPrice: 40000,
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: "starter-v2",
    name: "Starter Pack",
    model: "genaiimg-v2",
    description: "Try genaiimg-v2 with a small pack. ₹20 per credit.",
    credits: 100,
    pricePerCredit: 20,
    totalPrice: 2000,
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: "growth-v2",
    name: "Growth Pack",
    model: "genaiimg-v2",
    description: "Better genaiimg-v2 rate when you buy more. ₹15 per credit.",
    credits: 2000,
    pricePerCredit: 15,
    totalPrice: 30000,
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: "bulk-v2",
    name: "Bulk Pack",
    model: "genaiimg-v2",
    description: "Lowest genaiimg-v2 rate for 5000 credits. ₹12 per credit.",
    credits: 5000,
    pricePerCredit: 12,
    totalPrice: 60000,
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: "starter-v3",
    name: "Starter Pack",
    model: "genaiimg-v3",
    description: "Try genaiimg-v3 with a small pack. ₹20 per credit.",
    credits: 100,
    pricePerCredit: 20,
    totalPrice: 2000,
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: "growth-v3",
    name: "Growth Pack",
    model: "genaiimg-v3",
    description: "Better genaiimg-v3 rate when you buy more. ₹15 per credit.",
    credits: 2000,
    pricePerCredit: 15,
    totalPrice: 30000,
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: "bulk-v3",
    name: "Bulk Pack",
    model: "genaiimg-v3",
    description: "Lowest genaiimg-v3 rate for 5000 credits. ₹12 per credit.",
    credits: 5000,
    pricePerCredit: 12,
    totalPrice: 60000,
    isActive: true,
    sortOrder: 3,
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to .env.local");
  }

  await connectDB();

  for (const plan of plans) {
    await Plan.findOneAndUpdate({ slug: plan.slug }, plan, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
    console.log(
      `Upserted plan: ${plan.model} · ${plan.name} (${plan.credits} credits × ₹${plan.pricePerCredit})`,
    );
  }

  if (process.argv.includes("--plans-only")) {
    console.log("Plans seeded. Admin data left unchanged.");
    process.exit(0);
  }

  const starter = await Plan.findOne({ slug: "starter" });
  const purchasedAt = new Date("2026-09-05T11:20:00+05:30");

  let admin = await Admin.findOne({ email: TEST_ADMIN.email });
  if (!admin) {
    admin = await Admin.create({
      name: TEST_ADMIN.name,
      companyName: TEST_ADMIN.companyName,
      email: TEST_ADMIN.email,
      phone: TEST_ADMIN.phone,
      passwordHash: await hash(TEST_ADMIN.password, 12),
      credits: 36,
      creditsV1: 36,
      creditsV2: 0,
    });
    console.log(`Created test admin: ${TEST_ADMIN.email}`);
  }

  await Promise.all([
    Purchase.deleteMany({ adminId: admin._id }),
    Usage.deleteMany({ adminId: admin._id }),
    ApiToken.deleteMany({ adminId: admin._id }),
    Ticket.deleteMany({ adminId: admin._id }),
  ]);

  if (!starter) {
    throw new Error("Starter pack is missing");
  }

  admin.credits = 36;
  admin.creditsV1 = 36;
  admin.creditsV2 = 0;
  admin.currentPlanId = starter._id;
  admin.lastPurchaseDate = purchasedAt;
  await admin.save();

  await Purchase.create({
    adminId: admin._id,
    planId: starter._id,
    planName: `${starter.name} · genaiimg-v1`,
    model: "genaiimg-v1",
    credits: 100,
    pricePerCredit: 15,
    amountPaid: 1500,
    status: "completed",
    razorpayOrderId: "order_test_starter_05092026",
    razorpayPaymentId: "pay_test_starter_05092026",
    purchasedAt,
  });

  let seed = 17;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  function hitsOnDay(day: string, count: number, startHour: number, endHour: number) {
    return Array.from({ length: count }, () => {
      const start = new Date(`${day}T${String(startHour).padStart(2, "0")}:00:00+05:30`).getTime();
      const end = new Date(`${day}T${String(endHour).padStart(2, "0")}:00:00+05:30`).getTime();
      return new Date(start + Math.floor(rand() * (end - start)));
    });
  }

  const hits = [
    ...hitsOnDay("2026-09-05", 18, 12, 22),
    ...hitsOnDay("2026-09-06", 26, 9, 21),
    ...hitsOnDay("2026-09-07", 20, 8, 19),
  ].sort((left, right) => left.getTime() - right.getTime());

  await Usage.insertMany(
    hits.map((at, index) => ({
      adminId: admin._id,
      adminEmail: admin.email,
      userEmail: "akashvirani174@gmail.com",
      creditsUsed: 1,
      remainingCredits: 99 - index,
      source: "image",
      model: "genaiimg-v1",
      createdAt: at,
      updatedAt: at,
    })),
  );

  console.log(`Test admin ready: ${TEST_ADMIN.email} · Starter Pack on 5 Sep · 36 credits left · 64 usage rows`);

  console.log("Plans seeded. Re-run this script anytime to update pack prices from this file.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
