import { formatMoney } from '@/components/finance/money-display';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlobalSearch } from '@/hooks/use-global-search';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { type SearchResult, type SearchResultGroup, type SearchResultType } from '@/types/finance';
import { router } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpDown,
    Command,
    Loader2,
    PieChart,
    PiggyBank,
    Receipt,
    Search,
    Tag,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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

function ResultRow({
    result,
    isActive,
    onClick,
}: {
    result: SearchResult;
    isActive: boolean;
    onClick: (result: SearchResult) => void;
}) {
    const Icon = TYPE_ICONS[result.type];
    const colorClass = TYPE_COLORS[result.type];

    return (
        <div
            className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                isActive ? 'bg-blue-50 dark:bg-blue-950' : 'hover:bg-slate-50 dark:hover:bg-slate-900',
            )}
            onClick={() => onClick(result)}
        >
            <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', colorClass)}>
                <Icon className="size-3.5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{result.title}</span>
                {result.subtitle && (
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">{result.subtitle}</span>
                )}
            </div>
            <div className="shrink-0 text-right">
                {result.amount !== null ? (
                    <span className="text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">
                        {formatMoney(result.amount)}
                    </span>
                ) : result.badge ? (
                    <Badge variant="outline" className="text-[10px] font-normal">
                        {result.badge}
                    </Badge>
                ) : null}
            </div>
        </div>
    );
}

export function GlobalSearch() {
    const isMobile = useIsMobile();
    const { query, setQuery, results, isLoading, isOpen, setIsOpen, isEmpty, clear } = useGlobalSearch();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    const flattenedResults = results.flatMap((group) => group.results);

    useEffect(() => {
        setActiveIndex(-1);
    }, [results]);

    useEffect(() => {
        function handleSearchShortcut(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        }
        window.addEventListener('keydown', handleSearchShortcut);
        return () => window.removeEventListener('keydown', handleSearchShortcut);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev < flattenedResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < flattenedResults.length) {
                handleSelect(flattenedResults[activeIndex]);
            } else if (query.trim().length >= 2) {
                router.get('/search', { q: query.trim() });
                setIsOpen(false);
                inputRef.current?.blur();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleSelect = (result: SearchResult) => {
        router.get(result.href);
        setIsOpen(false);
        if (!isMobile) {
            inputRef.current?.blur();
        }
    };

    const handleSeeAll = () => {
        router.get('/search', { q: query.trim() });
        setIsOpen(false);
    };

    const ResultsList = () => (
        <div className="flex flex-col gap-1 p-2">
            {isLoading ? (
                <div className="flex flex-col gap-2 p-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 py-1">
                            <Skeleton className="size-7 shrink-0 rounded-full" />
                            <div className="flex flex-col gap-1.5 flex-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : isEmpty ? (
                <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Tidak ada hasil untuk "{query}"
                </div>
            ) : (
                <>
                    {results.map((group) => {
                        const Icon = TYPE_ICONS[group.type];
                        return (
                            <div key={group.type} className="mb-2 last:mb-0">
                                <div className="mb-1 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <Icon className="size-3.5" />
                                    {group.label}
                                </div>
                                {group.results.map((result) => {
                                    const globalIndex = flattenedResults.findIndex((r) => r.id === result.id && r.type === result.type);
                                    return (
                                        <ResultRow
                                            key={result.detail_key}
                                            result={result}
                                            isActive={globalIndex === activeIndex}
                                            onClick={handleSelect}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                    {results.length > 0 && (
                        <div
                            onClick={handleSeeAll}
                            className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-slate-50 dark:text-blue-400 dark:hover:bg-slate-900"
                        >
                            Lihat semua hasil
                            <ArrowRight className="size-3.5" />
                        </div>
                    )}
                </>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <button className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-300">
                        <Search className="size-4" />
                    </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-none rounded-t-xl">
                    <SheetHeader className="p-4 border-b border-slate-200 dark:border-slate-800 text-left">
                        <SheetTitle className="sr-only">Pencarian</SheetTitle>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Cari transaksi, kategori..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pr-10 pl-9 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-950"
                            />
                            {query && (
                                <button
                                    onClick={() => {
                                        clear();
                                        inputRef.current?.focus();
                                    }}
                                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto">
                        {query.trim().length >= 2 ? (
                            <ResultsList />
                        ) : (
                            <div className="py-10 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
                                <Search className="size-8 stroke-1" />
                                <span className="text-sm">Ketik untuk mencari...</span>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div className="relative hidden w-full max-w-[500px] md:block" ref={dropdownRef}>
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
            <input
                ref={inputRef}
                type="text"
                placeholder="Cari transaksi, kategori, atau akun..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-32 pl-11 text-sm text-slate-700 shadow-sm transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-blue-950"
            />
            {query ? (
                <button
                    type="button"
                    className="absolute top-1/2 right-[4.2rem] flex size-7 -translate-y-1/2 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    onClick={() => {
                        clear();
                        inputRef.current?.focus();
                        setIsOpen(true);
                    }}
                    aria-label="Bersihkan pencarian"
                >
                    <X className="size-4" />
                </button>
            ) : null}
            <span className="pointer-events-none absolute top-1/2 right-2 inline-flex h-7 -translate-y-1/2 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <Command className="size-3.5" />K
            </span>

            {isOpen && (isLoading || results.length > 0 || isEmpty) && (
                <div className="absolute top-full left-0 z-50 mt-1.5 max-h-[400px] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                    <ResultsList />
                </div>
            )}
        </div>
    );
}
