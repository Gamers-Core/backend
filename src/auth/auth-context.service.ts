import { AsyncLocalStorage } from 'async_hooks';

import { Injectable } from '@nestjs/common';

import type { User } from 'src/users/entities/user.entity';

export interface AuthContextStore {
  user: User | null;
}

@Injectable()
export class AuthContextService {
  private readonly storage = new AsyncLocalStorage<AuthContextStore>();

  run<T>(callback: () => T, user: User | null = null): T {
    return this.storage.run({ user }, callback);
  }

  get user(): User | null {
    return this.storage.getStore()?.user ?? null;
  }

  set user(user: User | null) {
    const store = this.storage.getStore();
    if (!store) return;

    store.user = user;
  }

  get isAdmin(): boolean {
    return this.user?.isAdmin ?? false;
  }

  get userId(): number | null {
    return this.user?.id ?? null;
  }
}
