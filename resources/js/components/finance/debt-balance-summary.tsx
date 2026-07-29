import { MoneyDisplay } from '@/components/finance/money-display';
import { type Debt } from '@/types/finance';
import { CalendarRange, WalletCards } from 'lucide-react';

interface DebtBalanceSummaryProps {
    debt: Pick<Debt, 'principal_amount' | 'outstanding_amount' | 'monthly_payment' | 'remaining_tenor_months'>;
}

export function DebtBalanceSummary({ debt }: DebtBalanceSummaryProps) {
    const principalAmount = Math.max(0, Number(debt.principal_amount));
    const outstandingAmount = Math.max(0, Number(debt.outstanding_amount));
    const paidAmount = Math.max(0, principalAmount - outstandingAmount);
    const paidPercentage = principalAmount > 0 ? Math.min(100, Math.round((paidAmount / principalAmount) * 100)) : 0;
    const remainingPercentage = principalAmount > 0 ? Math.max(0, 100 - paidPercentage) : 0;
    const monthlyPayment = Math.max(0, Number(debt.monthly_payment));
    const estimatedPayments = monthlyPayment > 0 ? Math.ceil(outstandingAmount / monthlyPayment) : null;

    return (
        <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Ringkasan pelunasan</p>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-200">
                    {remainingPercentage}% tersisa
                </span>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(180px,1fr)_minmax(160px,0.8fr)]">
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-muted-foreground text-xs">Sisa hutang saat ini</p>
                    <p className="mt-1 text-xl font-semibold tracking-tight">
                        <MoneyDisplay value={outstandingAmount} />
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                        dari <MoneyDisplay value={principalAmount} /> total hutang
                    </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <WalletCards className="size-4" />
                        <p className="text-xs font-medium">Cicilan bulanan</p>
                    </div>
                    <p className="mt-2 text-base font-semibold">
                        <MoneyDisplay value={monthlyPayment} />
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">per bulan</p>
                </div>

                <div className="rounded-lg bg-violet-50 p-3 dark:bg-violet-950/30">
                    <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                        <CalendarRange className="size-4" />
                        <p className="text-xs font-medium">Sisa tenor</p>
                    </div>
                    <p className="mt-2 text-base font-semibold">
                        {debt.remaining_tenor_months ? `${debt.remaining_tenor_months} bulan` : 'Belum diatur'}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">periode tersisa</p>
                </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: `${paidPercentage}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">
                    Sudah dibayar <MoneyDisplay value={paidAmount} />
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Progres pelunasan {paidPercentage}%</span>
            </div>

            <div className="mt-3 flex flex-col gap-1 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-950/50">
                <p className="text-muted-foreground text-xs">Estimasi berdasarkan saldo dan nominal cicilan saat ini</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {estimatedPayments ? `Sekitar ${estimatedPayments} kali pembayaran` : 'Estimasi belum tersedia'}
                </p>
            </div>
        </section>
    );
}
