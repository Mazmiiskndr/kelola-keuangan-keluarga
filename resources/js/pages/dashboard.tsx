import { DashboardAiInsight } from '@/components/dashboard/dashboard-ai-insight';
import { DashboardFinancialAnalysis } from '@/components/dashboard/dashboard-financial-analysis';
import { DashboardFinancialOverview } from '@/components/dashboard/dashboard-financial-overview';
import { DashboardKeyMetrics } from '@/components/dashboard/dashboard-key-metrics';
import { DashboardScopeControls } from '@/components/dashboard/dashboard-scope-controls';
import { type DashboardAiAnalysis } from '@/components/dashboard/dashboard-types';
import { DateTimeDisplay } from '@/components/finance/date-display';
import { PageHeader } from '@/components/finance/page-header';
import { QuickMenu } from '@/components/finance/quick-menu';
import { PwaInstallBanner } from '@/components/pwa-install-banner';
import { Badge } from '@/components/ui/badge';
import { useDashboardScope } from '@/hooks/use-dashboard-scope';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Family, type SummaryMetric } from '@/types/finance';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    summary: SummaryMetric;
    families: Family[];
    latestAnalysis?: DashboardAiAnalysis | null;
    aiModelLabel: string;
}

export default function Dashboard({ summary, families = [], latestAnalysis = null, aiModelLabel }: DashboardProps) {
    const { currentScope, selectedFamilyId, selectScope, selectFamily } = useDashboardScope(summary, families);

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="Dashboard Keuangan">
            <Head title="Dashboard" />
            <div className="finance-page">
                <PageHeader
                    title="Dashboard Keuangan"
                    description="Pantau saldo, pemasukan, pengeluaran, hutang jatuh tempo, tabungan, dan pola pengeluaran terbesar dalam satu layar."
                    action={
                        <Badge variant="outline" className="rounded-md bg-white px-4 py-3 text-xs font-semibold dark:bg-slate-950">
                            Periode <DateTimeDisplay value={summary.period.start} dateOnly /> s/d{' '}
                            <DateTimeDisplay value={summary.period.end} dateOnly />
                        </Badge>
                    }
                />

                <QuickMenu />

                <DashboardScopeControls
                    summary={summary}
                    families={families}
                    currentScope={currentScope}
                    selectedFamilyId={selectedFamilyId}
                    onScopeChange={selectScope}
                    onFamilyChange={selectFamily}
                />

                <DashboardKeyMetrics summary={summary} />
                <DashboardFinancialOverview summary={summary} currentScope={currentScope} />
                <DashboardFinancialAnalysis summary={summary} currentScope={currentScope} />
                <DashboardAiInsight analysis={latestAnalysis} configuredModelLabel={aiModelLabel} />
                <PwaInstallBanner floating />
            </div>
        </AppLayout>
    );
}
