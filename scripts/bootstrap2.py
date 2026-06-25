import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def w(rel, content):
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content.rstrip() + "\n")
    print("w", rel)

w("lib/prisma.ts", '''import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
''')

w("lib/settings.ts", '''import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!settings) settings = await prisma.siteSettings.create({ data: { id: "default" } });
  return settings;
}
''')

w("lib/auth.ts", '''import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: String(credentials.email).toLowerCase() } });
        if (!user || !user.active) return null;
        const valid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
''')

w("types/next-auth.d.ts", '''import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; role: string };
  }
  interface User { role: string }
}

declare module "next-auth/jwt" {
  interface JWT { role?: string; id?: string }
}
''')

w("middleware.ts", '''import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login?callbackUrl=/admin", req.url));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/dealer", req.url));
  }
  if (pathname.startsWith("/dealer")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login?callbackUrl=/dealer", req.url));
    if (role !== "DEALER") return NextResponse.redirect(new URL("/admin", req.url));
  }
  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*", "/dealer/:path*"] };
''')

w("app/api/auth/[...nextauth]/route.ts", '''import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
''')

w("app/login/page.tsx", '''import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-secondary px-4">
      <div className="w-full max-w-md bg-white p-8 border border-brand-lightGrey">
        <h1 className="brand-heading text-2xl mb-2">Portal Login</h1>
        <p className="text-brand-muted mb-6">Admin & Dealer access</p>
        <LoginForm />
      </div>
    </div>
  );
}
''')

print("bootstrap2 done")