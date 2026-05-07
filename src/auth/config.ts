import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@prisma/client';

export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role ?? 'CUSTOMER';
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role = (token.role as UserRole | undefined) ?? 'CUSTOMER';
      return session;
    },
  },
} satisfies NextAuthConfig;
