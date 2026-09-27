import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "razorpay", "nodemailer"],
};

export default nextConfig;
