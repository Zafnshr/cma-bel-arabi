import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const users = [
          { id: "1", email: "hanigomaa137@gmail.com", password: "12345678" },
          { id: "2", email: "abdalrahmanhani29@gmail.com", password: "12345678" },
        ];

        const user = users.find(
          (u) =>
            u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          return { id: user.id, email: user.email };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email || session.user.email;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "cma-bel-arabi-secret-placeholder-key-xyz",
};

const handler = (req: any, ctx: any) => {
  // Dynamically set NEXTAUTH_URL to the exact host being requested
  // This prevents CSRF and URL mismatch errors on Vercel custom domains
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  process.env.NEXTAUTH_URL = `${protocol}://${host}`;
  
  // Initialize NextAuth inside the handler so it captures the updated NEXTAUTH_URL
  const authHandler = NextAuth(authOptions);
  return authHandler(req, ctx);
};

export { handler as GET, handler as POST };
