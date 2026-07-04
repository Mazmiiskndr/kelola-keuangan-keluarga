import { DateTimeDisplay } from '@/components/finance/date-display';
import { MonthPickerInput } from '@/components/finance/date-picker-input';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AiAnalysis } from '@/types/finance';
import { Head, useForm } from '@inertiajs/react';
import { Bot } from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'AI Insight', href: '/ai-insights' }];

interface AiInsightsProps {
    analyses: AiAnalysis[];
}

export default function AiInsightsIndex({ analyses }: AiInsightsProps) {
    const form = useForm({ period: new Date().toISOString().slice(0, 7) });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/ai-insights', { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="AI Insight">
            <Head title="AI Insight" />
            <div className="finance-page">
                <PageHeader
                    title="AI Insight Keuangan"
                    description="Buat rekomendasi hemat, prioritas tabungan, dan arahan investasi dari metrik yang sudah dihitung backend."
                    icon={Bot}
                />
                <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Generate Analisis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form noValidate className="space-y-4" onSubmit={submit}>
                                <div className="space-y-2">
                                    <Label>Periode</Label>
                                    <MonthPickerInput value={form.data.period} onValueChange={(value) => form.setData('period', value)} />
                                    <FormError message={form.errors.period} />
                                </div>
                                <SubmitButton processing={form.processing}>Analisis dengan AI</SubmitButton>
                                <p className="text-muted-foreground text-xs">
                                    OpenAI API key disimpan di server Laravel. Browser tidak pernah menerima secret.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        {analyses.map((analysis) => (
                            <Card key={analysis.id} className="rounded-lg">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <CardTitle>
                                                Analisis <DateTimeDisplay value={analysis.period_start} dateOnly /> -{' '}
                                                <DateTimeDisplay value={analysis.period_end} dateOnly />
                                            </CardTitle>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                Model: {analysis.model_name || 'openai'} · {analysis.status}
                                            </p>
                                        </div>
                                        <FinanceBadge value={analysis.analysis_type} />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm leading-6">{analysis.result_summary}</p>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {(analysis.aiRecommendations ?? analysis.recommendations ?? []).map((recommendation) => (
                                            <div key={recommendation.id} className="rounded-lg border p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <p className="font-medium">{recommendation.title}</p>
                                                    <FinanceBadge value={recommendation.type} />
                                                </div>
                                                <p className="text-muted-foreground mt-2 text-sm">{recommendation.description}</p>
                                                {recommendation.estimated_saving_amount && (
                                                    <p className="mt-3 text-sm font-medium">
                                                        Estimasi hemat <MoneyDisplay value={recommendation.estimated_saving_amount} />
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
