import { formatMoney } from '@/components/finance/money-display';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
    type ChartData,
    type ChartOptions,
    type ScriptableContext,
    type TooltipItem,
} from 'chart.js';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface SimpleBarChartProps {
    data: Array<{ key?: string; label: string; income: number; expense: number }>;
}

function chartGradient(context: ScriptableContext<'bar'>, from: string, to: string) {
    const { chart } = context;
    const { chartArea, ctx } = chart;

    if (!chartArea) {
        return from;
    }

    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, from);
    gradient.addColorStop(1, to);

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

export function SimpleBarChart({ data }: SimpleBarChartProps) {
    const isMobile = useIsMobile();
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
    const hasData = data.some((item) => Number(item.income || 0) > 0 || Number(item.expense || 0) > 0);

    const chartData = useMemo<ChartData<'bar'>>(
        () => ({
            labels: data.map((item) => item.label),
            datasets: [
                {
                    label: 'Pemasukan',
                    data: data.map((item) => Number(item.income || 0)),
                    backgroundColor: (context) => chartGradient(context, 'rgba(16, 185, 129, 0.95)', 'rgba(20, 184, 166, 0.55)'),
                    borderColor: 'rgba(5, 150, 105, 0.85)',
                    borderWidth: 1,
                    borderRadius: 10,
                    borderSkipped: false,
                    barPercentage: 0.72,
                    categoryPercentage: 0.64,
                    maxBarThickness: 28,
                },
                {
                    label: 'Pengeluaran',
                    data: data.map((item) => Number(item.expense || 0)),
                    backgroundColor: (context) => chartGradient(context, 'rgba(244, 63, 94, 0.95)', 'rgba(236, 72, 153, 0.6)'),
                    borderColor: 'rgba(225, 29, 72, 0.85)',
                    borderWidth: 1,
                    borderRadius: 10,
                    borderSkipped: false,
                    barPercentage: 0.72,
                    categoryPercentage: 0.64,
                    maxBarThickness: 28,
                },
            ],
        }),
        [data],
    );

    const options = useMemo<ChartOptions<'bar'>>(
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
                        label(context: TooltipItem<'bar'>) {
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
                <TrendSummary label="Pemasukan" value={totals.income} tone="income" />
                <TrendSummary label="Pengeluaran" value={totals.expense} tone="expense" />
                <TrendSummary label="Cash Flow" value={netCashflow} tone={netCashflow < 0 ? 'expense' : 'income'} />
            </div>

            <div className="relative flex min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-3 shadow-sm sm:p-4 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900/70">
                <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent sm:inset-x-6" />
                <div className="h-[260px] min-h-0 w-full min-w-0 sm:h-[300px] md:h-[330px] lg:h-auto lg:flex-1">
                    {hasData ? (
                        <Bar data={chartData} options={options} />
                    ) : (
                        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                            Belum ada data tren untuk periode ini.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TrendSummary({ label, value, tone }: { label: string; value: number; tone: 'income' | 'expense' }) {
    const toneClass =
        tone === 'income'
            ? 'border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300'
            : 'border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300';

    return (
        <div className={`min-w-0 rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 ${toneClass}`}>
            <p className="text-xs font-semibold opacity-85">{label}</p>
            <p className="mt-1.5 truncate text-base font-bold sm:mt-2">{formatMoney(value, true)}</p>
        </div>
    );
}
