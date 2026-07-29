import { StatCard } from '@/components/finance/stat-card';
import { type SummaryMetric } from '@/types/finance';
import { ArrowDownRight, ArrowUpRight, CreditCard, PiggyBank } from 'lucide-react';

interface DashboardKeyMetricsProps {
    summary: SummaryMetric;
}

export function DashboardKeyMetrics({ summary }: DashboardKeyMetricsProps) {
    const trend = summary.trend ?? [];

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Total Saldo"
                value={summary.totals.balance}
                description="Saldo aktif semua akun"
                icon={CreditCard}
                tone="blue"
                sparkline={trend.map((item) => item.income + item.expense)}
            />
            <StatCard
                title="Pemasukan Bulan Ini"
                value={summary.totals.income}
                description="Income periode berjalan"
                icon={ArrowUpRight}
                tone="green"
                sparkline={trend.map((item) => item.income)}
            />
            <StatCard
                title="Pengeluaran Bulan Ini"
                value={summary.totals.expense}
                description="Expense periode berjalan"
                icon={ArrowDownRight}
                tone="red"
                sparkline={trend.map((item) => item.expense)}
            />
            <StatCard
                title="Cicilan Jatuh Tempo"
                value={summary.totals.debt_due}
                description="Hutang aktif bulan ini"
                icon={PiggyBank}
                tone="amber"
            />
        </div>
    );
}
