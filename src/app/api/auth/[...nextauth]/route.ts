export const dynamic = 'force-dynamic';

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'https://universal-admin-panel-nu.vercel.app';
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'c7b5a1b6c7b5a1b6c7b5a1b6c7b5a1b6c7b5a1b6';
}

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };