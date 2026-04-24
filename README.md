# LOE Tracker

A web application for tracking **level of effort (LOE)** across projects: team members log weekly pulses, manage personal allocations, and administrators configure projects, monthly allocations, and review submissions and reports.

Built with **Laravel 13**, **Inertia.js** (React 19), **Tailwind CSS 4**, and **Laravel Fortify** for authentication.

## Features

- **Team users**: Dashboard, help center, personal allocations, project assignments, and weekly LOE submission flows.
- **Admins** (`is_admin` on the user): Admin dashboard, project CRUD, monthly allocations, LOE submission review, and reports.

## Requirements

- **PHP** 8.3+ with extensions required by Laravel (e.g. `mbstring`, `openssl`, `pdo`, `fileinfo`, `ctype`, `json`, `tokenizer`, `xml`)
- **Composer** 2
- **Node.js** 20+ and **npm** (or another compatible package manager)

The default local configuration uses **SQLite**; you can switch to MySQL or PostgreSQL in `.env` if you prefer.

## Quick setup

From the project root:

```bash
composer run setup
```

This script will:

1. Install PHP dependencies (`composer install`)
2. Create `.env` from `.env.example` if missing
3. Generate an `APP_KEY`
4. Run database migrations
5. Install Node dependencies and build front-end assets for production

Then start the app (see [Local development](#local-development)).

## Manual setup

If you prefer step-by-step control:

1. **Install dependencies**

   ```bash
   composer install
   npm install
   ```

2. **Environment file**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database**

   For SQLite (default in `.env.example`):

   ```bash
   touch database/database.sqlite
   ```

   For MySQL/PostgreSQL, set `DB_*` variables in `.env` and create the empty database.

4. **Migrations**

   ```bash
   php artisan migrate
   ```

5. **Front-end** (choose one)

   - Development: `npm run dev` (Vite) — use alongside your PHP server
   - Production build: `npm run build`

6. **Application URL**  
   Set `APP_URL` in `.env` to match how you access the site (e.g. `http://loe-tracker.test` with Laravel Herd, or `http://127.0.0.1:8000` with `php artisan serve`).

## Local development

The project includes a Composer script that runs the PHP dev server, queue worker, log tail (Pail), and Vite together:

```bash
composer run dev
```

This starts:

- Laravel’s server (typically `http://127.0.0.1:8000` unless configured otherwise)
- A queue worker (`database` driver by default — ensure migrations have run)
- Pail for log streaming
- Vite for hot module replacement

**Alternative:** run `php artisan serve` and `npm run dev` in two terminals if you do not need the combined script.

### Laravel Herd (macOS)

If you use [Laravel Herd](https://herd.laravel.com), point the site at this project’s `public` directory, set `APP_URL` in `.env` to your Herd URL, and run `npm run dev` (or `composer run dev`) for the front-end. No need for `php artisan serve` when Herd is serving the app.

### Route helpers (Wayfinder)

TypeScript route helpers are generated for Inertia and React. If you add or change routes and types are out of date:

```bash
php artisan wayfinder:generate
```

## First user and admin access

- **Register** a user through the app’s registration page (if enabled in Fortify).
- **Email verification** may be required for the full dashboard — check `config/fortify.php` and your mail settings.
- **Admin area** (`/admin`) is available only to users with `is_admin = true` in the database. For a local user you can promote in Tinker, for example:

  ```bash
  php artisan tinker
  >>> \App\Models\User::where('email', 'you@example.com')->update(['is_admin' => true]);
  ```

Adjust the email to match your account.

## Testing and quality

```bash
# Run PHP tests (Pest) — also runs Pint in dry-run as part of the Composer script
composer test

# Or directly
php artisan test
```

Other useful checks (see `composer.json` and `package.json`):

- `npm run types:check` — TypeScript
- `npm run lint:check` / `npm run format:check` — ESLint and Prettier
- `composer run lint:check` — Laravel Pint (PHP)

## Production build

```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Ensure `.env` on the server has `APP_DEBUG=false`, a strong `APP_KEY`, and appropriate `APP_URL`, database, session, and queue settings. Use a process manager or `php-fpm` + a web server (nginx, Apache) to serve the `public` directory.

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
