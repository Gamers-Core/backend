# Copilot instructions for gamers-core/backend

## Architecture and boundaries

- NestJS 11, feature-first modules under src/\*; controllers stay thin and services own business logic. Entry wiring is in [src/app.module.ts](src/app.module.ts) and [src/main.ts](src/main.ts).
- Global runtime setup: ValidationPipe + exception filter + auth guard in [src/app.module.ts](src/app.module.ts); cookie-session + locale middleware applied to all routes there as well.
- Data layer is TypeORM with Postgres, snake naming, migrations auto-run, and entity discovery in [datasource.ts](datasource.ts).
- High-traffic domains: auth + OTP, products + media lifecycle, orders + cart, integrations (mail, redis, cloudinary, bosta, i18n).

## Request/auth lifecycle

- Auth is default-on via APP_GUARD in [src/auth/guards/auth.guard.ts](src/auth/guards/auth.guard.ts): reads req.session.userId, loads user, sets req.user, and updates locale context + response headers x-locale and x-is-logged-in.
- @Public() only skips auth errors; if session exists, handlers still receive req.user.
- Use @CurrentUser() from [src/users/decorators/current-user.decorator.ts](src/users/decorators/current-user.decorator.ts) instead of reading session directly.
- COOKIE_KEY is mandatory at boot; cookie session settings (sameSite/secure/domain) come from environment in [src/app.module.ts](src/app.module.ts).

## Auth + OTP behavior

- Current OTP purpose set is signin-only in [src/auth/const.ts](src/auth/const.ts).
- Flow: POST /auth/signin creates OTP session -> POST /auth/verify-otp resolves purpose handler and stores session.userId on success in [src/auth/auth.service.ts](src/auth/auth.service.ts).
- OTP state is Redis-backed with attempt/resend limits and TTL in [src/otp-session/otp-session.service.ts](src/otp-session/otp-session.service.ts).
- OTP email send and mismatch checks are environment-gated via withEnvironment in [src/common/with-environment.ts](src/common/with-environment.ts) (non-prod does not enforce mismatch).
- If adding a new OTP purpose, update const/types/DTOs, handler map, and mail templates together.

## DTOs, serialization, localization

- Prefer @Serialize(DTO) in controllers; serializer injects class-transformer context { locale, userId } in [src/common/interceptors/serialize.interceptor.ts](src/common/interceptors/serialize.interceptor.ts).
- Locale is request-scoped: header x-locale seeds AsyncLocalStorage in [src/i18n/locale-context.middleware.ts](src/i18n/locale-context.middleware.ts), then AuthGuard overrides from user locale.
- Domain errors use translation keys via custom exceptions (examples in [src/common/exceptions](src/common/exceptions)).

## Data and side effects

- Product writes are transactional (save product -> sync variants -> sync media attachments) in [src/products/services/products.service.ts](src/products/services/products.service.ts).
- Media uploads are drafted with expiresAt, then cleaned hourly via cron in [src/media/services/media.service.ts](src/media/services/media.service.ts).
- Use withOptionalManager when services accept an optional EntityManager to keep operations transactional.

## Integrations and environment assumptions

- DATABASE_URL is required; SSL is enabled outside local in [datasource.ts](datasource.ts).
- CORS uses FRONTEND_URL and exposes x-locale and x-is-logged-in in [src/main.ts](src/main.ts).
- Redis, Cloudinary, SMTP, and Bosta credentials are required for their modules; see related module/provider files.

## Developer workflows

- Install: npm install
- Local dev: npm run start:dev (NODE_ENV=local)
- Build/run dist: npm run build then npm run start (or start:staging / start:prod)
- Migrations: npm run migration:generate -- migrations/<Name>, then npm run migration:run
- Quality gate: npm test runs tsc + eslint + prettier --check
