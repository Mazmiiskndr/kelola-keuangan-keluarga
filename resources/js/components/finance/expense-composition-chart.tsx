import { formatMoney } from '@/components/finance/money-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArcElement, Chart as ChartJS, Legend, Tooltip, type ChartData, type ChartOptions, type TooltipItem } from 'chart.js';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseCompositionChartProps {
    data: Array<{ name: string; amount: number; color?: string }>;
    total: number;
    className?: string;
}

interface ExpenseSegment {
    name: string;
    amount: number;
    color: string;
    percent: number;
}

const fallbackColors = ['#64748b', '#ef4444', '#f97316', '#0ea5e9', '#a855f7', '#14b8a6'];
const OTHER_CATEGORY_NAME = 'Lainnya';

function normalizedCategoryName(name: string): string {
    return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function mergeMatchingCategories(data: Array<{ name: string; amount: number; color?: string }>) {
    return Array.from(
        data.reduce((categories, item) => {
            const name = item.name.trim().replace(/\s+/g, ' ') || 'Tanpa kategori';
            const key = normalizedCategoryName(name);
            const existing = categories.get(key);

            categories.set(key, {
                name: key === normalizedCategoryName(OTHER_CATEGORY_NAME) ? OTHER_CATEGORY_NAME : (existing?.name ?? name),
                amount: Number(existing?.amount ?? 0) + Number(item.amount || 0),
                color: existing?.color ?? item.color,
            });

            return categories;
        }, new Map<string, { name: string; amount: number; color?: string }>()),
    ).map(([, category]) => category);
}

function limitCategories(data: Array<{ name: string; amount: number; color?: string }>) {
    const sortedData = [...data].sort((a, b) => b.amount - a.amount);

    if (sortedData.length <= 5) {
        return sortedData;
    }

    const otherCategoryKey = normalizedCategoryName(OTHER_CATEGORY_NAME);
    const explicitOther = sortedData.find((item) => normalizedCategoryName(item.name) === otherCategoryKey);
    const primaryCategories = sortedData.filter((item) => normalizedCategoryName(item.name) !== otherCategoryKey);
    const visibleCategories = primaryCategories.slice(0, 4);
    const combinedOtherAmount = primaryCategories.slice(4).reduce((sum, item) => sum + Number(item.amount || 0), Number(explicitOther?.amount ?? 0));

    return [
        ...visibleCategories,
        {
            name: OTHER_CATEGORY_NAME,
            amount: combinedOtherAmount,
            color: explicitOther?.color ?? '#94a3b8',
        },
    ];
}

export function ExpenseCompositionChart({ data, total, className }: ExpenseCompositionChartProps) {
    const [hiddenCategoryNames, setHiddenCategoryNames] = useState<string[]>([]);
    const chartData = useMemo<ExpenseSegment[]>(() => {
        const displayData = limitCategories(mergeMatchingCategories(data.filter((item) => Number(item.amount || 0) > 0)));

        return displayData.map((item, index) => ({
            name: item.name,
            amount: Number(item.amount || 0),
            color: item.color || fallbackColors[index % fallbackColors.length],
            percent: total > 0 ? Math.round((Number(item.amount || 0) / total) * 100) : 0,
        }));
    }, [data, total]);
    const chartSignature = chartData.map((segment) => `${segment.name}:${segment.amount}`).join('|');

    useEffect(() => {
        setHiddenCategoryNames([]);
    }, [chartSignature]);

    function toggleCategory(name: string) {
        setHiddenCategoryNames((categories) =>
            categories.includes(name) ? categories.filter((category) => category !== name) : [...categories, name],
        );
    }

    const pieData = useMemo<ChartData<'pie'>>(
        () => ({
            labels: chartData.map((item) => item.name),
            datasets: [
                {
                    data: chartData.map((item) => (hiddenCategoryNames.includes(item.name) ? 0 : item.amount)),
                    backgroundColor: chartData.map((item) => item.color),
                    borderColor: 'rgba(255, 255, 255, 0.92)',
                    borderWidth: 2,
                    hoverBorderWidth: 2,
                    hoverOffset: 10,
                },
            ],
        }),
        [chartData, hiddenCategoryNames],
    );

    const options = useMemo<ChartOptions<'pie'>>(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                duration: 750,
                easing: 'easeOutQuart',
            },
            layout: {
                padding: 12,
            },
            plugins: {
                legend: {
                    display: false,
                    position: 'top',
                    align: 'center',
                    labels: {
                        boxHeight: 12,
                        boxWidth: 36,
                        color: '#475569',
                        font: {
                            size: 12,
                            weight: 700,
                        },
                        padding: 16,
                        usePointStyle: false,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.96)',
                    borderColor: 'rgba(148, 163, 184, 0.22)',
                    borderWidth: 1,
                    bodyColor: '#f8fafc',
                    bodyFont: { size: 12, weight: 600 },
                    caretPadding: 8,
                    cornerRadius: 12,
                    padding: 12,
                    titleColor: '#e2e8f0',
                    titleFont: { size: 12, weight: 700 },
                    callbacks: {
                        label(context: TooltipItem<'pie'>) {
                            const segment = chartData[context.dataIndex];

                            return ` ${formatMoney(Number(context.raw || 0))} (${segment?.percent ?? 0}%)`;
                        },
                    },
                },
            },
        }),
        [chartData],
    );

    if (!chartData.length || total <= 0) {
        return (
            <Card className={cn('flex h-full min-w-0 flex-col rounded-lg', className)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="size-4" /> Komposisi Pengeluaran
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center">
                    <p className="text-muted-foreground text-sm">Belum ada pengeluaran dicatat.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('flex h-full min-w-0 flex-col overflow-hidden rounded-lg xl:min-h-[560px]', className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="size-4" /> Komposisi Pengeluaran
                </CardTitle>
            </CardHeader>
            <CardContent className="flex min-w-0 flex-1 flex-col gap-4 px-3 pt-0 pb-4 sm:px-5 sm:pb-5">
                <div className="mx-auto flex h-[220px] w-full max-w-[360px] min-w-0 items-center justify-center sm:h-[280px] sm:max-w-[420px] lg:h-[300px] xl:h-[320px] xl:max-w-[480px]">
                    <Pie data={pieData} options={options} />
                </div>

                <div className="grid min-w-0 gap-2 sm:grid-cols-2 sm:gap-2.5">
                    {chartData.map((segment, index) => {
                        const isHidden = hiddenCategoryNames.includes(segment.name);

                        return (
                            <button
                                key={`${segment.name}-${index}`}
                                type="button"
                                aria-label={`${isHidden ? 'Tampilkan' : 'Sembunyikan'} kategori ${segment.name} pada grafik`}
                                aria-pressed={!isHidden}
                                onClick={() => toggleCategory(segment.name)}
                                className={cn(
                                    'flex min-h-14 min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm shadow-sm transition duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:min-h-16 sm:py-2.5 dark:focus-visible:ring-offset-slate-950',
                                    isHidden
                                        ? 'border-slate-200/70 bg-slate-50/70 opacity-50 grayscale dark:border-slate-800 dark:bg-slate-900/50'
                                        : 'border-slate-200/80 bg-gradient-to-br from-slate-50 to-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-950 dark:hover:border-blue-900',
                                )}
                            >
                                <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                                    <span className="size-3.5 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: segment.color }} />
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                            {segment.name}
                                        </span>
                                        <span className="text-muted-foreground text-xs">{formatMoney(segment.amount, true)}</span>
                                    </span>
                                </span>
                                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    {isHidden ? 'Nonaktif' : `${segment.percent}%`}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
