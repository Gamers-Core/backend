# Copilot instructions for `gamers-core/backend`

## Big picture

- NestJS 11 backend with session auth, TypeORM persistence, Redis-backed OTP sessions, and SMTP mail delivery.
- Core feature boundaries are `src/auth` (identity/session/OTP), `src/users` (user persistence + profile endpoints), `src/mail`, and `src/redis`.
- Entity layer is simple (`src/entity/user.entity.ts`), and service logic is concentrated in `AuthService` + `UsersService`.
- Use path aliases consistently (`src/*`, `datasource`), matching existing imports.

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

## Response/DTO conventions

- Use `@Serialize(DTO)` for controller responses (`src/interceptors/serialize.interceptor.ts`); avoid returning raw entities.
- DTOs rely on `class-transformer` (`@Expose`, `@Transform`), with transform context support for current user.
- Example: `BasicUserDTO.isMe` in `src/users/dtos/basic-user.dto.ts` compares serialized user id against `currentUserId`.
- Use DTO validators (`class-validator`) because global `ValidationPipe({ whitelist: true })` is enabled.

## Data + integrations

- TypeORM options are built in `datasource.ts` from `.env.${NODE_ENV}`.
- Development uses SQLite (`db.sqlite`, `synchronize: true`); production/staging are placeholders.
- Redis client is global (`src/redis/redis.module.ts`) and supports `REDIS_URL` or host/port env vars.
- Mail uses `nodemailer` + Brevo SMTP (`src/mail/mail.service.ts`); typed templates are mapped in `src/mail/const.ts` and keyed by auth purpose.

## Workflows that matter

- Install: `npm install`
- Dev server: `npm run start:dev` (sets `NODE_ENV=development`)
- Debug watch: `npm run start:debug`
- Production run: `npm run build` then `npm run start`
- Migrations: `npm run migration:generate`, `npm run migration:run` (`:prod` variants exist)
- Quality gate: `npm test` runs `tsc && eslint && prettier --check .` (not Jest)
- Jest commands are separate: `npm run test:watch`, `npm run test:cov`, `npm run test:e2e`

## Editing expectations

- Keep changes local and pattern-matching this starter-style codebase; prefer extending existing DTO/service patterns over refactors.
- Preserve barrel exports (`index.ts`) in feature folders when adding public symbols.
- When adding auth response fields, update DTOs first and ensure sensitive fields (password hashes) remain excluded.
