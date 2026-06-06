import type { UserRecord } from './useAuthStore';

/**
 * Pre-verified accounts merged into the auth store on every hydration.
 * Passwords are hashed with the same algorithm as {@link hashPassword} in authUtils.ts
 * (generated via `node scripts/generate-permanent-user-seed.mjs`).
 */
export const PERMANENT_USER_SEEDS: UserRecord[] = [
  {
    userId: 'passingen3fixed0001',
    email: 'passingen3@gmail.com',
    displayName: 'Passingen',
    passwordHash:
      'df19da11ba20d56c2d02cc62b03a827b560b54b0cbd857612903c03a9fc91a42',
    salt: 'a1b2c3d4e5f6789012345678abcdef9012345678abcdef9012345678abcdef90',
    createdAt: 1714521600000,
    avatarInitials: 'PA',
    emailVerified: true,
  },
];
