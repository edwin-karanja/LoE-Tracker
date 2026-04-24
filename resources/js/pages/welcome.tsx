import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, CalendarClock, ClipboardList, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

const demoAccounts = [
    { role: 'Administrator', email: 'admin@example.com' },
    {
        role: 'Team users (10)',
        email: 'user1@example.com — user10@example.com',
    },
] as const;

function WelcomeHeroArt() {
    return (
        <div
            className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white via-cyan-50/80 to-violet-100/50 p-6 shadow-[0_20px_50px_-12px_rgba(59,130,246,0.2)] sm:p-8"
            aria-hidden
        >
            <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-cyan-200/50 blur-2xl" />
            <div className="absolute -bottom-4 left-1/3 h-28 w-32 rounded-full bg-amber-200/45 blur-2xl" />
            <div className="absolute right-1/4 top-1/2 h-20 w-20 rounded-full bg-fuchsia-200/35 blur-xl" />
            <svg
                viewBox="0 0 400 280"
                className="relative z-10 h-auto w-full text-cyan-600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient
                        id="welcome-bar"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
                    </linearGradient>
                    <linearGradient
                        id="welcome-fill"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
                <rect
                    x="32"
                    y="36"
                    width="336"
                    height="200"
                    rx="16"
                    className="fill-white/90 stroke-cyan-200/70"
                    strokeWidth="1.5"
                />
                <g opacity="0.9">
                    <rect
                        x="56"
                        y="108"
                        width="48"
                        height="76"
                        rx="6"
                        fill="url(#welcome-bar)"
                    />
                    <rect
                        x="120"
                        y="88"
                        width="48"
                        height="96"
                        rx="6"
                        fill="url(#welcome-bar)"
                    />
                    <rect
                        x="184"
                        y="100"
                        width="48"
                        height="84"
                        rx="6"
                        fill="url(#welcome-bar)"
                    />
                    <rect
                        x="248"
                        y="72"
                        width="48"
                        height="112"
                        rx="6"
                        fill="url(#welcome-bar)"
                    />
                </g>
                <rect
                    x="56"
                    y="200"
                    width="88"
                    height="10"
                    rx="4"
                    className="fill-sky-200/80"
                />
                <rect
                    x="56"
                    y="218"
                    width="64"
                    height="10"
                    rx="4"
                    className="fill-amber-200/90"
                />
                <circle
                    cx="340"
                    cy="60"
                    r="36"
                    fill="url(#welcome-fill)"
                    opacity="0.28"
                />
                <path
                    d="M 300 220 Q 320 200 360 200 L 360 220 L 300 220 Z"
                    className="fill-fuchsia-300/25"
                />
            </svg>
        </div>
    );
}

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const isAuthed = Boolean(auth.user);

    return (
        <>
            <Head title="LOE Tracker">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div
                className="relative flex min-h-screen flex-col overflow-hidden text-slate-900"
                style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}
            >
                <div
                    className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-sky-100/95 via-amber-50/90 to-fuchsia-100/70"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -left-1/3 -top-24 -z-10 h-[480px] w-[85%] rounded-full bg-gradient-to-r from-cyan-200/70 via-sky-200/50 to-transparent blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -right-1/4 top-[12%] -z-10 h-96 w-96 rounded-full bg-gradient-to-bl from-fuchsia-200/55 to-rose-200/35 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -left-10 bottom-0 -z-10 h-72 w-72 rounded-full bg-lime-200/45 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-72 w-[130%] -translate-x-1/2 translate-y-1/3 bg-gradient-to-t from-amber-200/55 via-orange-200/30 to-transparent blur-2xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute right-[8%] top-1/2 -z-10 h-40 w-40 rounded-full bg-violet-200/50 blur-2xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 -z-10 bg-[length:18px_18px] bg-[linear-gradient(to_right,rgb(14_165_233/0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgb(217_70_239/0.05)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_90%_75%_at_50%_10%,#000,transparent_75%)]"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute left-[15%] top-[20%] -z-10 h-2.5 w-2.5 rounded-full bg-cyan-300/50 sm:h-3 sm:w-3"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute right-[20%] top-[35%] -z-10 h-2 w-2 rounded-full bg-fuchsia-300/50"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute bottom-[30%] left-[8%] -z-10 h-2 w-2 rounded-full bg-amber-300/50"
                    aria-hidden
                />

                <header className="border-b border-white/50 bg-white/60 shadow-sm shadow-sky-200/20 backdrop-blur-md">
                    <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-3 px-4 py-4 sm:px-6">
                        {isAuthed ? (
                            <Button asChild size="sm">
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={login()}>Log in</Link>
                                </Button>
                                {canRegister && (
                                    <Button asChild size="sm">
                                        <Link href={register()}>
                                            Register
                                        </Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 sm:py-12">
                    <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
                        <div className="space-y-4">
                            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-800 uppercase">
                                Level of effort tracking
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl sm:text-5xl">
                                Record how your time is spent and stay aligned
                                on projects.
                            </h1>
                            <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                                The LOE Tracker helps teams and administrators
                                manage weekly effort across projects, submit
                                pulses before deadlines, and review
                                roll-ups for reporting periods.
                            </p>
                            {!isAuthed && (
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <Button asChild size="lg" className="min-w-36">
                                        <Link href={login()}>
                                            Log in
                                        </Link>
                                    </Button>
                                    {canRegister && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                            className="min-w-36 border-cyan-200/90 bg-white/80 hover:border-fuchsia-200/80 hover:bg-white"
                                        >
                                            <Link href={register()}>
                                                Create an account
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}

                            {isAuthed && (
                                <div className="pt-2">
                                    <Button asChild>
                                        <Link href={dashboard()}>
                                            Go to dashboard
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                        <WelcomeHeroArt />
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2">
                        <div className="flex gap-3 rounded-xl border border-white/70 bg-white/85 p-4 shadow-md shadow-cyan-200/15 ring-1 ring-cyan-100/70 backdrop-blur-sm">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
                                <CalendarClock className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Weekly LOE
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Enter allocations for each reporting
                                    week and keep draft work until you are
                                    ready to submit.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 rounded-xl border border-white/70 bg-white/85 p-4 shadow-md shadow-sky-200/15 ring-1 ring-sky-100/80 backdrop-blur-sm">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
                                <BarChart3 className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Your allocations
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    See how effort lines up with monthly
                                    targets and move between reporting
                                    periods to compare weeks.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 rounded-xl border border-white/70 bg-white/85 p-4 shadow-md shadow-lime-200/20 ring-1 ring-lime-100/80 backdrop-blur-sm">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-lime-100 text-lime-800">
                                <Users className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    For administrators
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Manage projects, set monthly
                                    allocations, and review team
                                    submissions and reports in the admin
                                    area.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 rounded-xl border border-white/70 bg-white/85 p-4 shadow-md shadow-amber-200/25 ring-1 ring-amber-100/90 backdrop-blur-sm">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
                                <ClipboardList className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Submissions
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Save drafts, respect submission
                                    deadlines, and add projects to your week
                                    when you need them.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section
                        className="rounded-2xl border border-fuchsia-100/60 bg-gradient-to-br from-white/95 via-cyan-50/40 to-fuchsia-50/50 p-5 shadow-md shadow-fuchsia-200/15 sm:p-6"
                        aria-labelledby="demo-accounts-heading"
                    >
                        <h2
                            id="demo-accounts-heading"
                            className="text-base font-semibold text-slate-900 sm:text-lg"
                        >
                            Demo accounts
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            After seeding the database (
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">
                                php artisan db:seed
                            </code>
                            {', '}
                            or{' '}
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">
                                php artisan migrate:fresh --seed
                            </code>
                            ), you can sign in with the following. The
                            password is the same for every demo user.
                        </p>
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[280px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                                        <th className="py-2 pr-4 font-medium">
                                            Role
                                        </th>
                                        <th className="py-2 pr-4 font-medium">
                                            Email
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {demoAccounts.map((row) => (
                                        <tr
                                            key={row.role}
                                            className="border-b border-slate-100 last:border-0"
                                        >
                                            <td className="py-2.5 pr-4 align-top text-slate-800">
                                                {row.role}
                                            </td>
                                            <td className="py-2.5 pr-0 font-mono text-xs text-slate-700 sm:text-sm">
                                                {row.email}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className="py-2.5 pr-4 align-top text-slate-800">
                                            Password
                                        </td>
                                        <td className="py-2.5 font-mono text-xs text-slate-700 sm:text-sm">
                                            password
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
