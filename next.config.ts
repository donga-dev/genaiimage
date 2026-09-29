import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "razorpay", "nodemailer", "sharp"],
};

export default nextConfig;
