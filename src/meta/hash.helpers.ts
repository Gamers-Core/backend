import { sha256 } from 'src/common/hash';

export const hashEmail = (email: string): string => sha256(email.trim().toLowerCase());

export const hashName = (name: string): string => sha256(name.trim().toLowerCase());

export const hashCountry = (country: string): string => sha256(country.trim().toLowerCase());

export const hashCity = (city: string): string => sha256(city.trim().toLowerCase());

export const hashExternalId = (id: string): string => sha256(id.trim());

export const hashPhone = (phone: string): string => sha256(phone.replace(/\D/g, ''));
