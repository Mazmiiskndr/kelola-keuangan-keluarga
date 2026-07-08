import { formatMoney } from '@/components/finance/money-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArcElement, Chart as ChartJS, Legend, Tooltip, type ChartData, type ChartOptions, type TooltipItem } from 'chart.js';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useMemo } from 'react';
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

export function ExpenseCompositionChart({ data, total, className }: ExpenseCompositionChartProps) {
    const chartData = useMemo<ExpenseSegment[]>(() => {
        const sortedData = [...data].filter((item) => Number(item.amount || 0) > 0).sort((a, b) => b.amount - a.amount);
        const displayData =
            sortedData.length > 5
                ? [
                      ...sortedData.slice(0, 4),
                      {
                          name: 'Lainnya',
                          amount: sortedData.slice(4).reduce((sum, item) => sum + Number(item.amount || 0), 0),
                          color: '#94a3b8',
                      },
                  ]
                : sortedData;

        return displayData.map((item, index) => ({
            name: item.name,
            amount: Number(item.amount || 0),
            color: item.color || fallbackColors[index % fallbackColors.length],
            percent: total > 0 ? Math.round((Number(item.amount || 0) / total) * 100) : 0,
        }));
    }, [data, total]);

    const pieData = useMemo<ChartData<'pie'>>(
        () => ({
            labels: chartData.map((item) => item.name),
            datasets: [
                {
                    data: chartData.map((item) => item.amount),
                    backgroundColor: chartData.map((item) => item.color),
                    borderColor: 'rgba(255, 255, 255, 0.92)',
                    borderWidth: 2,
                    hoverBorderWidth: 2,
                    hoverOffset: 10,
                },
            ],
        }),
        [chartData],
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
                <div className="mx-auto flex h-[220px] w-full min-w-0 max-w-[360px] items-center justify-center sm:h-[280px] sm:max-w-[420px] lg:h-[300px] xl:h-[320px] xl:max-w-[480px]">
                    <Pie data={pieData} options={options} />
                </div>

                <div className="grid min-w-0 gap-2 sm:grid-cols-2 sm:gap-2.5">
                    {chartData.map((segment, index) => (
                        <div
                            key={`${segment.name}-${index}`}
                            className="flex min-h-14 min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white px-3 py-2 text-sm shadow-sm sm:min-h-16 sm:py-2.5 dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-950"
                        >
                            <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                                <span className="size-3.5 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: segment.color }} />
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{segment.name}</span>
                                    <span className="text-muted-foreground text-xs">{formatMoney(segment.amount, true)}</span>
                                </span>
                            </span>
                            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                {segment.percent}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
