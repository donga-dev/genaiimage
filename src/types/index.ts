export type PublicAdmin = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  credits: number;
  creditsV1: number;
  creditsV2: number;
  lastPurchaseDate: string | null;
  currentPlan: PublicPlan | null;
  createdAt: string;
};

export type PublicPlan = {
  id: string;
  slug: string;
  name: string;
  model: string;
  description: string;
  credits: number;
  pricePerCredit: number;
  totalPrice: number;
  isActive: boolean;
  sortOrder: number;
};

export type PublicPurchase = {
  id: string;
  planName: string;
  model: string | null;
  credits: number;
  pricePerCredit: number;
  amountPaid: number;
  status: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  purchasedAt: string;
};

export type PublicUsage = {
  id: string;
  userEmail: string;
  creditsUsed: number;
  remainingCredits: number;
  source: string | null;
  model: string | null;
  createdAt: string;
};

export type SessionPayload = {
  adminId: string;
  email: string;
};
