# Copilot instructions for `gamers-core/backend`

## Big picture

- NestJS 11 backend with global session auth, TypeORM persistence, Redis-backed OTP sessions, Cloudinary-backed media, and SMTP mail delivery.
- Core feature boundaries: `src/auth` (identity/session/OTP), `src/users`, `src/products`, `src/media`, `src/cloudinary`, plus shared `src/mail` and `src/redis`.
- `AppModule` wires all modules globally (`src/app.module.ts`), and domain logic is service-centric (`AuthService`, `ProductsService`, `MediaService`).
- Keep imports aligned with project aliases (`src/*`, `datasource`) from `tsconfig.json`.

## Request/auth lifecycle (critical)

- `cookie-session` is global in `AppModule.configure()` (`src/app.module.ts`) and hard-fails if `COOKIE_KEY` is missing.
- `AuthGuard` is global via `APP_GUARD`; every route passes through it unless `@Public()` metadata is set.
- Guard contract (`src/guards/auth.guard.ts`): reads `req.session.userId`, loads user, sets `req.currentUser`.
- `@CurrentUser()` only returns `req.currentUser` (`src/users/decorators/current-user.decorator.ts`), never queries DB.
- Public routes still hydrate `currentUser` when a valid session exists.

## Auth + OTP flow

- Signup is a 2-step flow:
  1. `POST /auth/signup` validates user input, hashes password, and creates OTP session (`purpose: 'signup'`) in Redis.
  2. `POST /auth/verify-otp` verifies OTP and runs purpose-specific completion handler; for signup, it creates the user and sets `session.userId` in controller.
- Password reset follows the same OTP session model with `purpose: 'reset_password'`.
- Purpose/data/result typing lives in `src/auth/types.ts` (`AuthPurpose`, `OtpDataMap`, `OtpVerifyResultMap`) and should be updated together when adding a new OTP purpose.
- OTP session mechanics (TTL, attempts, resend limits) are centralized in `src/auth/otp-session/otp-session.service.ts`.
- OTP defaults are in `src/auth/otp-session/const.ts` (10m TTL, 5 attempts, 3 resends, 60s resend interval).
- `forgot-password` is intentionally non-enumerating: missing users still return a fake-looking `{ purpose, sessionId }`.

## Response/DTO conventions

- Use `@Serialize(DTO)` for controller responses (`src/interceptors/serialize.interceptor.ts`); avoid returning raw entities.
- DTOs rely on `class-transformer` (`@Expose`, `@Transform`), with transform context support for current user.
- Example: `BasicUserDTO.isMe` in `src/users/dtos/basic-user.dto.ts` compares serialized user id against `currentUserId`.
- Use DTO validators (`class-validator`) because global `ValidationPipe({ whitelist: true })` is enabled.
- Input DTOs in this repo commonly use nested validation with `@ValidateNested` + `@Type` (see `src/products/dtos/create-product.dto.ts`).

## Data + integrations

- TypeORM options are built in `datasource.ts` from `.env.${NODE_ENV}`.
- Development uses SQLite (`db.sqlite`, `synchronize: true`); staging/production branches are placeholders and not yet configured.
- Redis client is global (`src/redis/redis.module.ts`) and supports `REDIS_URL` or host/port env vars.
- Mail uses `nodemailer` + Brevo SMTP (`src/mail/mail.service.ts`); typed templates are mapped in `src/mail/const.ts` and keyed by auth purpose.
- Cloudinary is global (`src/cloudinary/cloudinary.module.ts`) and hard-fails at boot without cloud credentials.
- Media lifecycle is explicit in `src/media/media.service.ts`: uploads start as `draft` with 24h expiry, then become `attached` when linked to a product.
- Product creation (`src/products/products.service.ts`) is transactional: validate draft media IDs, save product, attach media, then reload with relations.

## Workflows that matter

- Install: `npm install`
- Dev server: `npm run start:dev` (sets `NODE_ENV=development`)
- Clean + dev: `npm run start:dev:clean`
- Debug watch: `npm run start:debug`
- Production run: `npm run build` then `npm run start`
- Migrations: `npm run migration:generate`, `npm run migration:run` (`:prod` variants exist)
- Quality gate: `npm test` runs `tsc && eslint && prettier --check .` (not Jest)
- Jest commands are separate: `npm run test:watch`, `npm run test:cov`, `npm run test:e2e`

## Editing expectations

- Keep changes local and pattern-match existing feature modules; prefer extending DTO/service/entity patterns over broad refactors.
- Preserve barrel exports (`index.ts`) when adding new public symbols (common across `src/*/index.ts` and entity subfolders).
- When adding/changing auth purposes, update all linked maps: `src/auth/const.ts`, `src/auth/types.ts`, `src/mail/const.ts`, and OTP DTO unions.
- When extending products/media, keep enum/union sources in entity constants (`src/entity/product/const.ts`, `src/entity/media/const.ts`) as single sources of truth.
- Never expose sensitive entity fields (e.g., `User.password`) directly; expose only DTO fields through `@Serialize`.

## Commit message format

- Follow: `{feat|refact|fix|docs|...etc}: {Message}`.
- The message must be an action and must start with a capitalized verb (e.g., `Update`, `Add`, `Implement`).
