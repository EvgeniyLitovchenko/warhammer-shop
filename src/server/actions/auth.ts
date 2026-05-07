'use server';

import { AuthError } from 'next-auth';
import { Prisma } from '@prisma/client';
import { signIn, signOut } from '@/auth';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { signInSchema, signUpSchema } from '@/lib/validation/auth';

export type AuthActionState = {
  error?: 'invalid_credentials' | 'email_taken' | 'invalid_input' | 'unknown';
  fields?: Record<string, string>;
};

export async function loginAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: 'invalid_input' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: (formData.get('callbackUrl') as string | null) ?? '/account',
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      return e.type === 'CredentialsSignin'
        ? { error: 'invalid_credentials' }
        : { error: 'unknown' };
    }
    throw e;
  }
}

export async function registerAction(
  _prev: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { error: 'invalid_input' };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  try {
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'email_taken' };
    }
    return { error: 'unknown' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/account',
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: 'unknown' };
    }
    throw e;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
