import { describe, it, expect } from 'vitest';
import { signInSchema, signUpSchema } from './auth';

describe('signInSchema', () => {
  it('accepts valid input', () => {
    const r = signInSchema.safeParse({ email: 'TEST@example.com', password: '12345678' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe('test@example.com');
  });

  it('rejects bad email', () => {
    expect(signInSchema.safeParse({ email: 'no-at', password: '12345678' }).success).toBe(false);
  });

  it('rejects too-short password', () => {
    expect(signInSchema.safeParse({ email: 'a@b.io', password: '1234' }).success).toBe(false);
  });

  it('rejects too-long password', () => {
    expect(signInSchema.safeParse({ email: 'a@b.io', password: 'x'.repeat(80) }).success).toBe(
      false,
    );
  });
});

describe('signUpSchema', () => {
  const valid = {
    name: 'John Doe',
    email: 'john@example.com',
    password: '12345678',
    confirmPassword: '12345678',
  };

  it('accepts valid input', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects when passwords do not match', () => {
    const r = signUpSchema.safeParse({ ...valid, confirmPassword: 'different1' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const issue = r.error.issues.find((i) => i.path[0] === 'confirmPassword');
      expect(issue?.message).toBe('passwords_mismatch');
    }
  });

  it('trims and lowercases email', () => {
    const r = signUpSchema.safeParse({ ...valid, email: '  John@Example.COM  ' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe('john@example.com');
  });

  it('rejects too-short name', () => {
    expect(signUpSchema.safeParse({ ...valid, name: 'J' }).success).toBe(false);
  });
});
