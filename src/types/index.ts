export type PublicAdmin = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  credits: number;
  lastPurchaseDate: string | null;
  currentPlan: PublicPlan | null;
  createdAt: string;
};

export type PublicPlan = {
  id: string;
  slug: string;
  name: string;
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
  createdAt: string;
};

export type SessionPayload = {
  adminId: string;
  email: string;
};
