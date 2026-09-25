import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Supabase Authentication",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error || !data.user) {
            console.warn("Supabase auth failed:", email, error?.message);
            return null;
          }

          // Fetch profile from public.profiles
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("role, name")
            .eq("id", data.user.id)
            .single();

          const role = profile?.role || data.user.user_metadata?.role || "CUSTOMER";
          const name = profile?.name || data.user.user_metadata?.name || email.split("@")[0];

          return {
            id: data.user.id,
            name,
            email: data.user.email || email,
            role,
          };
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        (token as any).id = user.id;
        (token as any).role = (user as any).role || "CUSTOMER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || "kichees-super-secret-auth-key-2026-production",
});
