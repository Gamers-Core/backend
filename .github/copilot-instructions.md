# Copilot instructions for `gamers-core/backend`

## Big picture

- NestJS 11 backend with TypeORM; feature modules are centered in `src/auth` and `src/users`, with entities in `src/entity`.
- Auth model is server-session (cookie-session), not JWT. Treat this as the primary identity flow.
- Imports use aliases: `src/*` and top-level `interceptors` (from `interceptors/`). Keep this style consistent.

## Request/auth lifecycle (critical)

- Global `cookie-session` middleware is configured in `AppModule.configure()` (`src/app.module.ts`) and requires `COOKIE_KEY`.
- Global `AuthGuard` is registered via `APP_GUARD` (`src/app.module.ts`), so every request passes through it unless route metadata marks it public.
- Guard behavior (`src/guards/auth.guard.ts`):
  - reads `req.session.userId`
  - loads user via `UsersService.findOne(...)`
  - sets `req.currentUser`
- `@CurrentUser()` only returns `req.currentUser` (`src/users/decorators/current-user.decorator.ts`). It does not query DB.
- `@Public()` (`src/auth/decorators/public.decorator.ts`) skips auth rejection but still allows optional user hydration when session exists.

## Response shaping pattern

- Use `@Serialize(DTO)` from `interceptors/serialize.interceptor.ts` for controller responses.
- DTOs are explicit via `class-transformer` (`@Expose`, `@Transform`).
- Interceptor injects `currentUserId` into transform context from `request.currentUser.id`.
- Example: `BasicUserDTO.isMe` in `src/users/dtos/basic-user.dto.ts` compares `obj.id` to `options.context.currentUserId`.
- When changing response fields, update DTOs first; do not expose raw entity internals (especially password data).

## Conventions and code patterns

- Global validation is `ValidationPipe({ whitelist: true })`; request bodies should be DTO classes with validators (`src/auth/dtos/*`).
- Session persistence happens in controllers with `@Session() session: any` and `session.userId = user.id` (see `src/auth/auth.controller.ts`).
- Barrel exports are expected (`index.ts`) in `src/auth`, `src/users`, `src/entity`, and `src/guards`.
- Keep edits focused and local; avoid broad refactors in this starter-style codebase.

## Data and env behavior

- `datasource.ts` loads env from `.env.${NODE_ENV ?? 'development'}`.
- Development uses SQLite (`db.sqlite`) with `synchronize: true`; migrations are still configured and used by scripts.
- Ensure `NODE_ENV` and `COOKIE_KEY` are present in runtime environments.

## Commands and workflows

- Install: `npm install`
- Dev server: `npm run start:dev`
- Build/prod: `npm run build` then `npm run start`
- Migrations: `npm run migration:generate`, `npm run migration:run` (`:prod` variants available)
- Important: `npm test` is quality gate (`tsc && eslint && prettier --check .`), not Jest unit tests.
- Jest is separate: `npm run test:watch`, `npm run test:cov`, `npm run test:e2e`.
