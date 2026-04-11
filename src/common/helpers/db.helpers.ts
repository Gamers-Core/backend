import { QueryFailedError } from 'typeorm';

export interface DriverError {
  code?: string;
  message?: string;
}

export function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;

  const driver = error.driverError as DriverError | undefined;

  if (!driver) return false;

  return (
    driver.code === '23505' || driver.code === 'SQLITE_CONSTRAINT' || !!driver.message?.toLowerCase().includes('unique')
  );
}
