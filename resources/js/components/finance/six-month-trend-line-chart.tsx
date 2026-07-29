import { formatMoney } from '@/components/finance/money-display';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
    type ChartData,
    type ChartOptions,
    type ScriptableContext,
    type TooltipItem,
} from 'chart.js';
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

interface SixMonthTrendLineChartProps {
    data: Array<{ key?: string; label: string; income: number; expense: number }>;
}

type TrendMetric = 'income' | 'expense';

function chartGradient(context: ScriptableContext<'line'>, from: string, to: string) {
    const { chart } = context;
    const { chartArea, ctx } = chart;

    if (!chartArea) {
        return to;
    }

    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, from);
    gradient.addColorStop(0.75, to);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    return gradient;
}

function shortMoney(value: number | string) {
    const amount = Number(value || 0);

    if (amount >= 1_000_000_000) {
        return `${Math.round(amount / 1_000_000_000)}M`;
    }

    if (amount >= 1_000_000) {
        return `${Math.round(amount / 1_000_000)}jt`;
    }

    if (amount >= 1_000) {
        return `${Math.round(amount / 1_000)}rb`;
    }

    return `${amount}`;
}

export function SixMonthTrendLineChart({ data }: SixMonthTrendLineChartProps) {
    const isMobile = useIsMobile();
    const [hiddenMetrics, setHiddenMetrics] = useState<TrendMetric[]>([]);
    const totals = useMemo(
        () =>
            data.reduce(
                (summary, item) => ({
                    income: summary.income + Number(item.income || 0),
                    expense: summary.expense + Number(item.expense || 0),
                }),
                { income: 0, expense: 0 },
            ),
        [data],
    );
    const netCashflow = totals.income - totals.expense;
    const cashflowRatio = totals.income > 0 ? Math.round((netCashflow / totals.income) * 100) : 0;
    const hasData = data.some((item) => Number(item.income || 0) > 0 || Number(item.expense || 0) > 0);
    const hasVisibleMetric = hiddenMetrics.length < 2;
    const dataSignature = data.map((item) => `${item.key ?? item.label}:${item.income}:${item.expense}`).join('|');

    useEffect(() => {
        setHiddenMetrics([]);
    }, [dataSignature]);

    function toggleMetric(metric: TrendMetric) {
        setHiddenMetrics((metrics) => (metrics.includes(metric) ? metrics.filter((item) => item !== metric) : [...metrics, metric]));
    }

    const chartData = useMemo<ChartData<'line'>>(
        () => ({
            labels: data.map((item) => item.label),
            datasets: [
                {
                    label: 'Pemasukan',
                    data: data.map((item) => Number(item.income || 0)),
                    borderColor: '#059669',
                    backgroundColor: (context) => chartGradient(context, 'rgba(16, 185, 129, 0.28)', 'rgba(16, 185, 129, 0.04)'),
                    fill: true,
                    tension: 0.38,
                    cubicInterpolationMode: 'monotone',
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#059669',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#059669',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2,
                    pointHoverRadius: 6,
                    pointRadius: 3.5,
                    borderWidth: 3,
                    hidden: hiddenMetrics.includes('income'),
                },
                {
                    label: 'Pengeluaran',
                    data: data.map((item) => Number(item.expense || 0)),
                    borderColor: '#e11d48',
                    backgroundColor: (context) => chartGradient(context, 'rgba(244, 63, 94, 0.24)', 'rgba(244, 63, 94, 0.03)'),
                    fill: true,
                    tension: 0.38,
                    cubicInterpolationMode: 'monotone',
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#e11d48',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#e11d48',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2,
                    pointHoverRadius: 6,
                    pointRadius: 3.5,
                    borderWidth: 3,
                    hidden: hiddenMetrics.includes('expense'),
                },
            ],
        }),
        [data, hiddenMetrics],
    );

    const options = useMemo<ChartOptions<'line'>>(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 700,
                easing: 'easeOutQuart',
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.96)',
                    borderColor: 'rgba(148, 163, 184, 0.22)',
                    borderWidth: 1,
                    bodyColor: '#f8fafc',
                    bodyFont: { size: 12, weight: 600 },
                    boxPadding: 5,
                    caretPadding: 8,
                    cornerRadius: 12,
                    displayColors: true,
                    padding: 12,
                    titleColor: '#e2e8f0',
                    titleFont: { size: 12, weight: 700 },
                    callbacks: {
                        label(context: TooltipItem<'line'>) {
                            return ` ${context.dataset.label}: ${formatMoney(Number(context.raw || 0))}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    border: {
                        display: false,
                    },
                    grid: {
                        display: false,
                    },
                    ticks: {
                        autoSkip: true,
                        maxRotation: 0,
                        minRotation: 0,
                        color: '#64748b',
                        font: {
                            size: isMobile ? 10 : 12,
                            weight: 700,
                        },
                        padding: isMobile ? 4 : 8,
                    },
                },
                y: {
                    beginAtZero: true,
                    border: {
                        display: false,
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.16)',
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: isMobile ? 10 : 11,
                            weight: 600,
                        },
                        maxTicksLimit: isMobile ? 3 : 4,
                        padding: isMobile ? 4 : 8,
                        callback: (value) => shortMoney(value),
                    },
                },
            },
        }),
        [isMobile],
    );

    return (
        <div className="flex min-h-[360px] w-full min-w-0 flex-1 flex-col space-y-3 overflow-hidden sm:min-h-[420px] sm:space-y-4 lg:min-h-[460px]">
            <div className="grid min-w-0 gap-2 sm:grid-cols-3 sm:gap-3">
                <TrendToggleCard
                    label="Pemasukan"
                    value={totals.income}
                    tone="income"
                    isHidden={hiddenMetrics.includes('income')}
                    onClick={() => toggleMetric('income')}
                />
                <TrendToggleCard
                    label="Pengeluaran"
                    value={totals.expense}
                    tone="expense"
                    isHidden={hiddenMetrics.includes('expense')}
                    onClick={() => toggleMetric('expense')}
                />
                <CashflowSummary value={netCashflow} ratio={cashflowRatio} />
            </div>

            <div className="relative flex min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-3 shadow-sm sm:p-4 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900/70">
                <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent sm:inset-x-6" />
                <div className="h-[260px] min-h-0 w-full min-w-0 sm:h-[300px] md:h-[330px] lg:h-auto lg:flex-1">
                    {!hasData ? (
                        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                            Belum ada data tren untuk periode ini.
                        </div>
                    ) : !hasVisibleMetric ? (
                        <div className="text-muted-foreground flex h-full items-center justify-center text-center text-sm">
                            Semua garis disembunyikan. Klik Pemasukan atau Pengeluaran untuk menampilkannya kembali.
                        </div>
                    ) : (
                        <Line data={chartData} options={options} />
                    )}
                </div>
            </div>
        </div>
    );
}

interface TrendToggleCardProps {
    label: string;
    value: number;
    tone: 'income' | 'expense';
    isHidden: boolean;
    onClick: () => void;
}

function TrendToggleCard({ label, value, tone, isHidden, onClick }: TrendToggleCardProps) {
    const isIncome = tone === 'income';
    const toneClass = isIncome
        ? 'border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300'
        : 'border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300';

    return (
        <button
            type="button"
            aria-label={`${isHidden ? 'Tampilkan' : 'Sembunyikan'} garis ${label}`}
            aria-pressed={!isHidden}
            onClick={onClick}
            className={cn(
                'min-w-0 cursor-pointer rounded-lg border px-3 py-3 text-left shadow-sm transition duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-4',
                toneClass,
                isHidden ? 'opacity-50 grayscale' : 'hover:-translate-y-0.5 hover:shadow-md',
            )}
        >
            <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-semibold">
                    {isIncome ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                    {label}
                </span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold dark:bg-slate-900/60">
                    {isHidden ? 'Nonaktif' : 'Aktif'}
                </span>
            </span>
            <span className="mt-2 block truncate text-lg font-bold sm:text-xl">{formatMoney(value, true)}</span>
            <span className="mt-1.5 block text-[11px] font-medium opacity-80">
                6 bulan terakhir · klik untuk {isHidden ? 'tampilkan' : 'sembunyikan'}
            </span>
        </button>
    );
}

function CashflowSummary({ value, ratio }: { value: number; ratio: number }) {
    const isNegative = value < 0;
    const toneClass = isNegative
        ? 'border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300'
        : 'border-blue-200/70 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300';

    return (
        <div className={cn('min-w-0 rounded-lg border px-3 py-3 shadow-sm sm:px-4', toneClass)}>
            <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-semibold">
                    {isNegative ? <TrendingDown className="size-3.5" /> : <TrendingUp className="size-3.5" />}
                    Arus Kas Bersih
                </span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold dark:bg-slate-900/60">
                    {isNegative ? 'Defisit' : value === 0 ? 'Seimbang' : 'Surplus'}
                </span>
            </div>
            <span className="mt-2 block truncate text-lg font-bold sm:text-xl">{formatMoney(value, true)}</span>
            <span className="mt-1.5 block text-[11px] font-medium opacity-80">{ratio}% dari total pemasukan</span>
        </div>
    );
}
