import { EntityManager } from 'typeorm';

export function withOptionalManager<T>(
  outsideManager: EntityManager | undefined,
  transactionManager: EntityManager,
  callback: (manager: EntityManager) => Promise<T>,
) {
  if (outsideManager) return callback(outsideManager);

  return transactionManager.transaction(callback);
}
