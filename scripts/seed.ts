import { connectDB } from "../src/lib/db";
import { Plan } from "../src/models/Plan";

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

  console.log("Plans seeded. Re-run this script anytime to update pack prices from this file.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
