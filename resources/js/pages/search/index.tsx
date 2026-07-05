import { formatMoney } from '@/components/finance/money-display';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { type SearchResultGroup, type SearchResultType } from '@/types/finance';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, PieChart, PiggyBank, Receipt, Search, Tag, Users, Wallet, X } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { useState } from 'react';

const TYPE_ICONS: Record<SearchResultType, LucideIcon> = {
    transaction: ArrowUpDown,
    account: Wallet,
    category: Tag,
    budget: PieChart,
    saving_goal: PiggyBank,
    debt: Receipt,
    family: Users,
};

const TYPE_COLORS: Record<SearchResultType, string> = {
    transaction: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    account: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    category: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
    budget: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    saving_goal: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
    debt: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    family: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
};

interface SearchIndexProps {
    results: SearchResultGroup[];
    query: string;
    selected: string | null;
}

export default function SearchIndex({ results, query, selected }: SearchIndexProps) {
    const [localQuery, setLocalQuery] = useState(query);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pencarian', href: '/search' },
    ];

    const totalResults = results.reduce((sum, group) => sum + group.results.length, 0);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (localQuery.trim().length >= 2) {
            router.get('/search', { q: localQuery.trim() });
        } else if (localQuery.trim().length === 0) {
            router.get('/search');
        }
    };

    const clearSearch = () => {
        setLocalQuery('');
        router.get('/search');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pencarian Global" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex max-w-3xl flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Pencarian</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Cari transaksi, akun, kategori, dan lainnya di seluruh akun yang dapat Anda akses.
                    </p>
                </div>

                <div className="flex max-w-2xl flex-col gap-4">
                    <form onSubmit={handleSearch} className="relative flex items-center w-full">
                        <Search className="absolute left-4 size-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Ketik untuk mencari..."
                            value={localQuery}
                            onChange={(e) => setLocalQuery(e.target.value)}
                            className="h-14 w-full rounded-xl border border-slate-200 bg-white pr-24 pl-12 text-base text-slate-900 shadow-sm transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/20"
                        />
                        {localQuery && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-20 flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                        <Button
                            type="submit"
                            className="absolute right-2 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={localQuery.trim().length > 0 && localQuery.trim().length < 2}
                        >
                            Cari
                        </Button>
                    </form>

                    {query && localQuery.trim().length < 2 && (
                        <p className="text-sm text-red-500">Kata kunci pencarian minimal 2 karakter.</p>
                    )}
                </div>

                {query && query.trim().length >= 2 && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Hasil Pencarian untuk "{query}"
                            </h2>
                            <Badge variant="secondary" className="font-normal">
                                {totalResults} ditemukan
                            </Badge>
                        </div>

                        {totalResults === 0 ? (
                            <Card className="border-dashed shadow-none">
                                <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
                                        <Search className="size-6 text-slate-400" />
                                    </div>
                                    <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        Tidak ada hasil
                                    </h3>
                                    <p className="text-sm text-slate-500 max-w-sm dark:text-slate-400">
                                        Kami tidak dapat menemukan apa pun yang cocok dengan pencarian Anda. Coba periksa ejaan atau gunakan kata kunci lain.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {results.map((group) => {
                                    const Icon = TYPE_ICONS[group.type];
                                    return (
                                        <Card key={group.type} className="flex flex-col overflow-hidden">
                                            <CardHeader className="bg-slate-50/50 p-4 pb-3 dark:bg-slate-900/50">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="size-4 text-slate-500" />
                                                    <CardTitle className="text-base font-semibold">
                                                        {group.label}
                                                    </CardTitle>
                                                    <Badge variant="outline" className="ml-auto text-xs font-normal">
                                                        {group.results.length}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <Separator />
                                            <CardContent className="flex-1 p-0">
                                                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                                                    {group.results.map((result) => {
                                                        const ResultIcon = TYPE_ICONS[result.type];
                                                        const colorClass = TYPE_COLORS[result.type];
                                                        const isSelected = selected === result.detail_key;

                                                        return (
                                                            <Link
                                                                key={result.detail_key}
                                                                href={result.href}
                                                                className={cn(
                                                                    'flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50',
                                                                    isSelected && 'bg-blue-50/50 dark:bg-blue-900/20'
                                                                )}
                                                            >
                                                                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', colorClass)}>
                                                                    <ResultIcon className="size-5" />
                                                                </div>
                                                                <div className="flex min-w-0 flex-1 flex-col">
                                                                    <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                                        {result.title}
                                                                    </span>
                                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                                        {result.subtitle && (
                                                                            <span className="truncate">{result.subtitle}</span>
                                                                        )}
                                                                        {result.date && (
                                                                            <>
                                                                                <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                                                <span className="whitespace-nowrap">{result.date}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {result.description && (
                                                                        <span className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                                                            {result.description}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="shrink-0 text-right">
                                                                    {result.amount !== null ? (
                                                                        <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                                                                            {formatMoney(result.amount)}
                                                                        </span>
                                                                    ) : result.badge ? (
                                                                        <Badge variant="outline" className="text-[11px] font-medium">
                                                                            {result.badge}
                                                                        </Badge>
                                                                    ) : null}
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
