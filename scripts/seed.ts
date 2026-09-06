import { hash } from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { Admin } from "../src/models/Admin";
import { Plan } from "../src/models/Plan";

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
    description: "Try the API with a small pack. ₹10 per credit.",
    credits: 10,
    pricePerCredit: 10,
    totalPrice: 100,
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: "growth",
    name: "Growth Pack",
    description: "Better rate when you buy more. ₹9 per credit.",
    credits: 50,
    pricePerCredit: 9,
    totalPrice: 450,
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: "bulk",
    name: "Bulk Pack",
    description: "Lowest rate for 100 credits. ₹8 per credit.",
    credits: 100,
    pricePerCredit: 8,
    totalPrice: 800,
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
    console.log(`Upserted plan: ${plan.name} (${plan.credits} credits × ₹${plan.pricePerCredit})`);
  }

  const existing = await Admin.findOne({ email: TEST_ADMIN.email });
  if (existing) {
    console.log(`Test admin already exists: ${TEST_ADMIN.email}`);
  } else {
    await Admin.create({
      name: TEST_ADMIN.name,
      companyName: TEST_ADMIN.companyName,
      email: TEST_ADMIN.email,
      phone: TEST_ADMIN.phone,
      passwordHash: await hash(TEST_ADMIN.password, 12),
      credits: 0,
    });
    console.log(`Created test admin: ${TEST_ADMIN.email}`);
  }

  console.log("Plans seeded. Re-run this script anytime to update pack prices from this file.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
