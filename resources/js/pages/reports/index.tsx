import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader } from '@/components/finance/page-header';
import { ProgressRow } from '@/components/finance/progress-row';
import { SimpleBarChart } from '@/components/finance/simple-bar-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Family, type SummaryMetric } from '@/types/finance';
import { Head, Link, router } from '@inertiajs/react';
import { ChartNoAxesCombined, Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan', href: '/reports' }];

interface ReportsProps {
    report: SummaryMetric;
    families: Family[];
}

export default function ReportsIndex({ report, families }: ReportsProps) {
    const currentScope = report.scope ?? 'personal';
    const selectedFamilyId = report.family?.id ? String(report.family.id) : families[0]?.id ? String(families[0].id) : '';
    const exportParams = new URLSearchParams();

    if (currentScope === 'family' && selectedFamilyId) {
        exportParams.set('scope', 'family');
        exportParams.set('family_id', selectedFamilyId);
    }

    function openScope(scope: string) {
        router.get('/reports', scope === 'family' && selectedFamilyId ? { scope: 'family', family_id: selectedFamilyId } : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function openFamily(familyId: string) {
        router.get('/reports', { scope: 'family', family_id: familyId }, { preserveState: true, preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="Laporan">
            <Head title="Laporan" />
            <div className="finance-page">
                <PageHeader
                    title="Laporan Bulanan"
                    description="Ringkasan performa keuangan, pengeluaran per kategori, hutang, tabungan, dan tren untuk bahan evaluasi bulanan."
                    icon={ChartNoAxesCombined}
                    action={
                        <Button asChild>
                            <Link href={`/reports/export${exportParams.size ? `?${exportParams.toString()}` : ''}`}>
                                <Download className="size-4" /> Export CSV
                            </Link>
                        </Button>
                    }
                />

                <Card className="rounded-lg">
                    <CardContent className="grid gap-4 p-4 md:grid-cols-[240px_1fr]">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Mode laporan</p>
                            <FinanceSelect
                                value={currentScope}
                                onValueChange={openScope}
                                options={[
                                    { value: 'personal', label: 'Pribadi' },
                                    ...(families.length > 0 ? [{ value: 'family', label: 'Keluarga' }] : []),
                                ]}
                            />
                        </div>
                        {currentScope === 'family' && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Keluarga aktif</p>
                                <FinanceSelect
                                    value={selectedFamilyId}
                                    onValueChange={openFamily}
                                    options={families.map((family) => ({ value: String(family.id), label: family.name }))}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-lg">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">Pemasukan</p>
                            <p className="mt-2 text-xl font-semibold">
                                <MoneyDisplay value={report.totals.income} />
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">Pengeluaran</p>
                            <p className="mt-2 text-xl font-semibold">
                                <MoneyDisplay value={report.totals.expense} />
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">Sisa Cash Flow</p>
                            <p className="mt-2 text-xl font-semibold">
                                <MoneyDisplay value={report.totals.cash_flow} />
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Tren</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pt-0 pb-3">
                            <SimpleBarChart data={report.trend} />
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Pengeluaran Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {report.expense_by_category.map((category) => (
                                <ProgressRow
                                    key={category.name}
                                    label={category.name}
                                    value={category.amount}
                                    target={report.totals.expense || 1}
                                    tone="red"
                                />
                            ))}
                            {report.expense_by_category.length === 0 && (
                                <p className="text-muted-foreground text-sm">Belum ada pengeluaran pada periode ini.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {currentScope === 'family' && (
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Breakdown Anggota</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(report.member_breakdown ?? []).map((member) => (
                                <div
                                    key={member.user_id}
                                    className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_repeat(4,minmax(120px,auto))]"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{member.name}</p>
                                        <FinanceBadge value={member.role} className="mt-2" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Pemasukan</p>
                                        <MoneyDisplay value={member.income} className="font-medium text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Pengeluaran</p>
                                        <MoneyDisplay value={member.expense} className="font-medium text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Tabungan</p>
                                        <MoneyDisplay value={member.saving} className="font-medium text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Cash Flow</p>
                                        <MoneyDisplay value={member.cash_flow} className="font-medium" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
