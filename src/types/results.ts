import type { User } from './user.ts';

interface UpdateResult {
  message: string;
  data: User;
}

export type {UpdateResult};
