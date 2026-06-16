import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { checkRateLimit } from './rate-limit'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  // Allow session cookie to be shared across *.balible.com subdomains
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.balible.com' : undefined,
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'TOURIST',
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const ip = (req?.headers?.['x-forwarded-for'] as string) ?? 'unknown'
        const { allowed } = await checkRateLimit(`login:${ip}`, 10, 60_000)
        if (!allowed) throw new Error('Too many login attempts. Please try again in a minute.')

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user?.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } })
        if (existing) {
          const linked = await prisma.account.findFirst({
            where: { userId: existing.id, provider: 'google' },
          })
          if (!linked) {
            await prisma.account.create({
              data: {
                userId: existing.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            })
          }
          return true
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      // Refresh role from DB on each token refresh
      if (token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id }, select: { role: true } })
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/sign-in',
  },
}
