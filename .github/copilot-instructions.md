# Copilot instructions for `gamers-core/backend`

## Big picture

- NestJS 11 API built around feature modules in `src/*`; domain behavior lives in services, not controllers.
- `AppModule` is the integration hub: global validation pipe, global exception filter, global auth guard, and request middleware (`cookie-session` + locale context).
- Persistence is TypeORM + Postgres only (`datasource.ts`); entity exports in `src/entity/index.ts` are the shared model surface.
- Key boundaries: `auth` (session + OTP), `users`, `products`/`media` (catalog + attachments), `orders`, `cart`, plus infra modules (`redis`, `cloudinary`, `mail`, `i18n`).

## Request/auth lifecycle (critical)

- Session auth is mandatory by default: `AuthGuard` is registered as `APP_GUARD` in `src/app.module.ts`.
- Guard contract (`src/guards/auth.guard.ts`): read `req.session.userId` -> load user -> set `req.user` (not `req.currentUser`) -> set locale context from user.
- `@Public()` only bypasses auth errors; public endpoints still get `req.user` when a valid session exists.
- `@CurrentUser()` is a thin accessor for `req.user` (`src/users/decorators/current-user.decorator.ts`).
- `COOKIE_KEY` is required at boot; missing value throws during middleware setup.

## OTP + auth flow

- Signup and reset-password use purpose-based OTP sessions (`src/auth/types.ts`, `src/auth/const.ts`).
- `POST /auth/signup` and `POST /auth/forgot-password` may bypass OTP in `local|development|staging` via `withEnvironment` and directly apply handlers.
- `POST /auth/verify-otp` resolves purpose-specific handlers and sets `session.userId` only when result is a `User`.
- Forgot-password is intentionally non-enumerating: unknown emails still return `{ purpose, sessionId }`.
- When adding a purpose, update these together: `src/auth/const.ts`, `src/auth/types.ts`, OTP DTOs (`verify-otp.dto.ts`, `resend-otp.dto.ts`), and mail option mapping (`src/mail/const.ts` + templates).

## Data, serialization, and i18n patterns

- Prefer `@Serialize(DTO)` in controllers; `SerializeInterceptor` injects class-transformer context with `{ userId, locale }`.
- DTOs are strict input/output boundaries (`class-validator` + `@Expose`/`@Transform`); example: `BasicUserDTO.isMe` compares against context `userId`.
- Products writes are transactional (`src/products/products.service.ts`): save product -> sync variants -> sync media attachments.
- Media lifecycle (`src/media/media.service.ts`): upload to Cloudinary, save as draft with 24h expiry, hourly cleanup for expired unattached media.
- Localized data uses `Localized`/`@IsLocalized()` and locale context from `x-locale` header with AsyncLocalStorage (`src/i18n/*`).

## Integrations and env assumptions

- `DATABASE_URL` is required in all environments; SSL is enabled automatically outside `local` (`datasource.ts`).
- Redis is global and created from `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT` (`src/redis/redis.module.ts`).
- Cloudinary credentials are required at startup (`src/cloudinary/cloudinary.provider.ts`).
- SMTP creds (`EMAIL_USER`, `EMAIL_PASS`) are required when sending mail (`src/mail/mail.service.ts`).

## Developer workflows

- Install deps: `npm install`
- Dev watch: `npm run start:dev` (`NODE_ENV=local`)
- Build/start: `npm run build` then `npm run start` (or `start:prod` / `start:staging`)
- Generate migration: `npm run migration:generate -- migrations/<Name>`
- Run migrations: `npm run migration:run`
- Quality gate: `npm test` (runs TypeScript compile + ESLint + Prettier check; not Jest)

## Editing conventions in this repo

- Keep changes module-local and follow existing DTO -> service -> entity flow.
- Preserve barrel exports (`index.ts`) when adding public symbols.
- Keep enum/union source-of-truth in entity constants (for example `src/entity/product/const.ts`, `src/entity/media/const.ts`).
- Use translation keys in domain exceptions (for example `auth.invalidCredentials`, `products.brandNotFound`) instead of hard-coded user-facing text.
