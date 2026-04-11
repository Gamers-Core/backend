# Copilot instructions for `gamers-core/backend`

## Big picture

- NestJS 11 API with feature-first modules under `src/*`; controllers stay thin and business logic lives in services.
- `src/app.module.ts` is the integration hub: global `ValidationPipe`, global exception filter, global auth guard, `cookie-session`, and locale middleware.
- Data layer is TypeORM + Postgres only (`datasource.ts`), with entities exported from `src/entity/index.ts`.
- High-traffic boundaries: `auth` (OTP session login), `products` + `media` (catalog/media attachment lifecycle), `orders` + `cart`, and integrations (`bosta`, `mail`, `cloudinary`, `redis`, `i18n`).

## Request/auth lifecycle (critical)

- Auth is default-on via `APP_GUARD` (`src/guards/auth.guard.ts`): reads `req.session.userId`, loads user, sets `req.user`, and syncs locale context from the user.
- `@Public()` only skips auth errors; when session exists, handlers still receive `req.user`.
- Use `@CurrentUser()` (`src/users/decorators/current-user.decorator.ts`) instead of reading session directly in controllers.
- `COOKIE_KEY` is mandatory at boot (`AppModule.configure` throws if missing).

## Auth + OTP behavior

- Current OTP purpose set is signin-only (`src/auth/const.ts` has `authPurposes = ['signin']`).
- Flow: `POST /auth/signin` creates OTP session -> `POST /auth/verify-otp` resolves purpose handler and stores `session.userId` on success.
- OTP state is Redis-backed (`src/auth/otp-session/otp-session.service.ts`) with attempt/resend limits and TTL.
- OTP email send/verification checks are environment-gated via `withEnvironment`; non-prod does not enforce OTP mismatch checks.
- If adding a new OTP purpose, update in lockstep: `src/auth/{const.ts,types.ts}`, OTP DTOs, auth handler map in `auth.service.ts`, and mail option/template mappings.

## Data, DTO, and localization patterns

- Prefer `@Serialize(DTO)` in controllers; `SerializeInterceptor` injects class-transformer context `{ locale, userId }`.
- Locale is request-scoped through `LocaleContextService` (AsyncLocalStorage) seeded by `x-locale` header (`src/i18n/locale-context.middleware.ts`), then overridden by logged-in user locale in `AuthGuard`.
- Product writes are transactional in `src/products/services/products.service.ts` (save product -> sync variants -> sync media attachments).
- Media uploads are drafted with `expiresAt` (+24h) and cleaned hourly if unattached (`src/media/media.service.ts`).
- Domain errors use translation keys (for example `products.productNotFound`, `auth.otp.invalid`) via custom exceptions.

## Integrations and environment assumptions

- `DATABASE_URL` is required; SSL is enabled outside `local` (`datasource.ts`).
- Redis client is global and built from `REDIS_URL` or host/port envs (`src/redis/redis.module.ts`).
- Cloudinary credentials are required at startup (`src/cloudinary/cloudinary.provider.ts`).
- SMTP credentials (`EMAIL_USER`, `EMAIL_PASS`) are required when mail is sent (`src/mail/mail.service.ts`).
- Bosta integration uses `BOSTA_TOKEN`; production webhook validation requires `BOSTA_WEBHOOK_SECRET` (`src/bosta/bosta-webhook-auth.guard.ts`).

## Developer workflows

- Install: `npm install`
- Local dev (watch): `npm run start:dev` (`NODE_ENV=local`)
- Build + run dist: `npm run build` then `npm run start` (or `start:staging` / `start:prod`)
- Migrations: `npm run migration:generate -- migrations/<Name>` then `npm run migration:run`
- Quality gate: `npm test` runs `tsc + eslint + prettier --check` (not unit tests)

## Editing conventions for agents

- Keep edits module-local and preserve existing flow: DTO -> controller -> service -> entity/repository.
- Preserve barrel exports (`index.ts`) when adding public symbols.
- In `products`, follow split layout (`controllers/`, `services/`, `dtos/`) rather than adding flat files.
- Reuse env-gating helper `withEnvironment` for side effects that should differ by environment (mail, external API calls).
