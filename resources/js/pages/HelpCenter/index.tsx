import { Head } from '@inertiajs/react';
import { BookOpen, Compass, LayoutGrid, ListChecks } from 'lucide-react';

type ArticleSection = {
    content: string[];
    title: string;
};

type Article = {
    id: string;
    sections: ArticleSection[];
    summary: string;
    title: string;
};

type Props = {
    articles: Article[];
};

const articleIcons = [BookOpen, LayoutGrid, ListChecks, Compass];

export default function HelpCenterIndex({ articles }: Props) {
    return (
        <>
            <Head title="Help Center" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section className="space-y-3">
                        <div className="space-y-1.5">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                                Help Center
                            </h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                                Learn how to move through the LoE Tracker, save
                                and submit your weekly pulse, and review your
                                monthly allocations with confidence.
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
                        <article className="rounded-[1.8rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                            <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-slate-500 uppercase">
                                Articles
                            </p>
                            <div className="mt-4 space-y-3">
                                {articles.map((article, index) => {
                                    const ArticleIcon =
                                        articleIcons[index % articleIcons.length];

                                    return (
                                        <a
                                            key={article.id}
                                            href={`#${article.id}`}
                                            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100"
                                        >
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                                                <ArticleIcon className="size-4.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {article.title}
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                    {article.summary}
                                                </p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </article>

                        <div className="space-y-5">
                            {articles.map((article, index) => {
                                const ArticleIcon =
                                    articleIcons[index % articleIcons.length];

                                return (
                                    <article
                                        key={article.id}
                                        id={article.id}
                                        className="rounded-[1.8rem] border border-slate-200/80 bg-white shadow-sm"
                                    >
                                        <div className="border-b border-slate-200/80 px-6 py-5">
                                            <div className="flex items-start gap-4">
                                                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                                    <ArticleIcon className="size-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                                                        {article.title}
                                                    </h2>
                                                    <p className="text-sm leading-6 text-slate-500">
                                                        {article.summary}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 px-6 py-6">
                                            {article.sections.map((section) => (
                                                <section
                                                    key={section.title}
                                                    className="space-y-3"
                                                >
                                                    <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                                        {section.title}
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {section.content.map(
                                                            (paragraph) => (
                                                                <p
                                                                    key={
                                                                        paragraph
                                                                    }
                                                                    className="text-sm leading-7 text-slate-700"
                                                                >
                                                                    {paragraph}
                                                                </p>
                                                            ),
                                                        )}
                                                    </div>
                                                </section>
                                            ))}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
