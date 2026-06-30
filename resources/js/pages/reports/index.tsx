import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader } from '@/components/finance/page-header';
import { ProgressRow } from '@/components/finance/progress-row';
import { SimpleBarChart } from '@/components/finance/simple-bar-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type SummaryMetric } from '@/types/finance';
import { Head, Link } from '@inertiajs/react';
import { ChartNoAxesCombined, Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan', href: '/reports' }];

interface ReportsProps {
    report: SummaryMetric;
}

export default function ReportsIndex({ report }: ReportsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Laporan Bulanan"
                    description="Ringkasan performa keuangan, pengeluaran per kategori, hutang, tabungan, dan tren untuk bahan evaluasi bulanan."
                    icon={ChartNoAxesCombined}
                    action={
                        <Button asChild>
                            <Link href="/reports/export">
                                <Download className="size-4" /> Export CSV
                            </Link>
                        </Button>
                    }
                />
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
                        <CardContent>
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
