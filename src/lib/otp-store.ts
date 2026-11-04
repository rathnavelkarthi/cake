export interface OtpRecord {
  otp: string;
  expiresAt: number;
  name?: string;
}

// In-memory fallback cache for OTPs (persists during server runtime)
const globalForOtp = globalThis as unknown as {
  globalOtpStore?: Map<string, OtpRecord>;
};

export const globalOtpStore =
  globalForOtp.globalOtpStore ?? new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForOtp.globalOtpStore = globalOtpStore;
}
