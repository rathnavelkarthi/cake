import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Kichees Staff Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase();
        const password = String(credentials.password);

        // Staff and Candidate Accounts requested
        if (email === "selva@kichees.com" && (password === "kichees2026" || password === "chef2026" || password === "selva2026" || password === "demo")) {
          return {
            id: "chef-selva",
            name: "Selva",
            email: "selva@kichees.com",
            role: "HEAD_CHEF",
          };
        }

        if (email === "anbu@kichees.com" && (password === "kichees2026" || password === "chef2026" || password === "anbu2026" || password === "demo")) {
          return {
            id: "chef-anbu",
            name: "Anbu",
            email: "anbu@kichees.com",
            role: "CONFECTIONERY_CHEF",
          };
        }

        if ((email === "sara@kichees.com" || email === "manager@kichees.com") && (password === "kichees2026" || password === "sara2026" || password === "demo")) {
          return {
            id: "mgr-sara",
            name: "Sara Harrisons",
            email: "sara@kichees.com",
            role: "MANAGER",
          };
        }

        if (email === "admin@kichees.com" && (password === "kichees2026" || password === "admin2026" || password === "demo")) {
          return {
            id: "admin-1",
            name: "Kichees Super Admin",
            email: "admin@kichees.com",
            role: "SUPER_ADMIN",
          };
        }

        if ((email === "customer@kichees.com" || email === "priya@kichees.com") && (password === "kichees2026" || password === "customer2026" || password === "demo")) {
          return {
            id: "cust-priya",
            name: "Priya Sundaram",
            email: "customer@kichees.com",
            role: "CUSTOMER",
          };
        }

        if (email === "billing@kichees.com" && (password === "kichees2026" || password === "demo")) {
          return {
            id: "3",
            name: "Billing Staff",
            email: "billing@kichees.com",
            role: "BILLING_STAFF",
          };
        }

        if (email === "inventory@kichees.com" && (password === "kichees2026" || password === "demo")) {
          return {
            id: "4",
            name: "Inventory Staff",
            email: "inventory@kichees.com",
            role: "INVENTORY_STAFF",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role || "MANAGER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || "kichees-super-secret-auth-key-2026",
});
