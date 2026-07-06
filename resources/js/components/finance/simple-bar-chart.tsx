import { formatMoney } from '@/components/finance/money-display';

interface SimpleBarChartProps {
    data: Array<{ key?: string; label: string; income: number; expense: number }>;
}

type TrendItem = SimpleBarChartProps['data'][number];

export function SimpleBarChart({ data }: SimpleBarChartProps) {
    const maxValue = Math.max(...data.flatMap((item) => [Number(item.income), Number(item.expense)]), 1);
    const totalIncome = data.reduce((total, item) => total + Number(item.income || 0), 0);
    const totalExpense = data.reduce((total, item) => total + Number(item.expense || 0), 0);
    const netCashflow = totalIncome - totalExpense;

    return (
        <div className="w-full space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
                <TrendSummary label="Pemasukan" value={totalIncome} tone="income" />
                <TrendSummary label="Pengeluaran" value={totalExpense} tone="expense" />
                <TrendSummary label="Cash Flow" value={netCashflow} tone={netCashflow < 0 ? 'expense' : 'income'} />
            </div>

            <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white px-2 pt-3 pb-2 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
                <div className="relative h-48">
                    <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-200 dark:border-slate-800" />
                    <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-slate-200 dark:border-slate-800" />
                    <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-slate-200 dark:border-slate-800" />
                    <div className="absolute inset-x-0 bottom-7 border-t border-slate-200 dark:border-slate-800" />

                    <div
                        className="relative grid h-full min-w-[520px] gap-2"
                        style={{ gridTemplateColumns: `repeat(${data.length || 1}, minmax(0, 1fr))` }}
                    >
                        {data.map((item, index) => (
                            <MonthColumn key={`${item.key ?? item.label}-${index}`} item={item} maxValue={maxValue} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrendSummary({ label, value, tone }: { label: string; value: number; tone: 'income' | 'expense' }) {
    const toneClass =
        tone === 'income'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
            : 'border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300';

    return (
        <div className={`rounded-lg border px-3 py-2 ${toneClass}`}>
            <p className="text-xs font-medium opacity-80">{label}</p>
            <p className="mt-1 text-sm font-bold">{formatMoney(value, true)}</p>
        </div>
    );
}

function MonthColumn({ item, maxValue }: { item: TrendItem; maxValue: number }) {
    const income = Number(item.income || 0);
    const expense = Number(item.expense || 0);
    const cashflow = income - expense;

    return (
        <div className="flex min-w-0 flex-col justify-end gap-2">
            <div className="flex h-36 items-end justify-center gap-2 rounded-lg px-1">
                <TrendBar label={`Pemasukan ${item.label}`} value={income} maxValue={maxValue} tone="income" />
                <TrendBar label={`Pengeluaran ${item.label}`} value={expense} maxValue={maxValue} tone="expense" />
            </div>
            <div className="text-center">
                <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{item.label}</p>
                <p className={`mt-1 text-[11px] font-medium ${cashflow < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatMoney(cashflow, true)}</p>
            </div>
        </div>
    );
}

function TrendBar({ label, value, maxValue, tone }: { label: string; value: number; maxValue: number; tone: 'income' | 'expense' }) {
    const height = value > 0 ? Math.max(8, Math.round((value / maxValue) * 100)) : 2;
    const barClass =
        tone === 'income'
            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-emerald-500/20'
            : 'bg-gradient-to-t from-rose-600 to-pink-400 shadow-rose-500/20';

    return (
        <div className="flex h-full w-5 items-end justify-center rounded-full bg-white/70 dark:bg-slate-950/60">
            <div className={`w-3 rounded-full shadow-lg transition-all ${barClass}`} style={{ height: `${height}%` }}>
                <span className="sr-only">
                    {label}: {formatMoney(value)}
                </span>
            </div>
        </div>
    );
}
