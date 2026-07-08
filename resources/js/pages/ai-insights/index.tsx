import { DateTimeDisplay } from '@/components/finance/date-display';
import { MonthPickerInput } from '@/components/finance/date-picker-input';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AiAnalysis, type AiRecommendation } from '@/types/finance';
import { Head, useForm, router } from '@inertiajs/react';
import { Activity, AlertCircle, ArrowRight, Bot, ChevronDown, CheckCircle2, Lightbulb, MessageCircle, Sparkles, Target, TrendingUp, Wallet, Receipt, PiggyBank } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'AI Insight', href: '/ai-insights' }];

interface AiInsightsProps {
    analyses: AiAnalysis[];
    ai_model_label: string;
}

interface ActionableRecommendation extends AiRecommendation {
    action_steps_completed?: number[];
}

const typeIcons: Record<string, React.ReactNode> = {
    alert: <AlertCircle className="size-4 text-rose-500" />,
    opportunity: <Lightbulb className="size-4 text-emerald-500" />,
    habit: <TrendingUp className="size-4 text-cyan-500" />,
    goal: <Target className="size-4 text-teal-500" />,
    next_step: <ArrowRight className="size-4 text-indigo-500" />,
};

function poweredByLabel(analysis: AiAnalysis, configuredModelLabel: string): string {
    if (!analysis.model_name || analysis.model_name === 'deterministic-rules') {
        return configuredModelLabel;
    }

    return analysis.model_label || analysis.model_name;
}

export default function AiInsightsIndex({ analyses, ai_model_label }: AiInsightsProps) {
    const form = useForm({ period: new Date().toISOString().slice(0, 7) });
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    
    // Action Plan States
    const [selectedRecommendationId, setSelectedRecommendationId] = useState<number | null>(null);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

    const allRecommendations = analyses.flatMap((a) => a.ai_recommendations ?? a.recommendations ?? []);
    const selectedRecommendation = allRecommendations.find((r) => r.id === selectedRecommendationId) || null;

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/ai-insights', { preserveScroll: true });
    }

    const toggleCategory = (catName: string) => {
        setOpenCategories((prev) => ({ ...prev, [catName]: !prev[catName] }));
    };

    function openActionDialog(recommendation: AiRecommendation) {
        setSelectedRecommendationId(recommendation.id);
        setIsActionDialogOpen(true);
    }

    function markAsPlanned(recommendationId: number) {
        router.patch(`/ai-recommendations/${recommendationId}`, {
            status: 'planned'
        }, {
            preserveScroll: true,
            onSuccess: () => setIsActionDialogOpen(false)
        });
    }

    const toggleStep = (recommendation: ActionableRecommendation, stepIndex: number) => {
        const currentSteps = recommendation.action_steps_completed || [];
        const newSteps = currentSteps.includes(stepIndex) 
            ? currentSteps.filter((s: number) => s !== stepIndex)
            : [...currentSteps, stepIndex];
            
        router.patch(`/ai-recommendations/${recommendation.id}`, {
            action_steps_completed: newSteps
        }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="AI Insight">
            <Head title="AI Insight" />
            <div className="finance-page">
                <PageHeader
                    title="Financial Coach AI"
                    description="Dapatkan panduan keuangan personal dari AI berdasarkan data transaksi bulan ini."
                    icon={Bot}
                />
                <div className="space-y-8">
                    {/* Header Action Bar */}
                    <Card className="overflow-hidden rounded-xl border-slate-200/60 shadow-sm dark:border-slate-800/60">
                        <CardContent className="p-5 sm:p-6 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 flex flex-col gap-5">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 w-full">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Sparkles className="size-5 text-indigo-500" />
                                        Buat Analisis Baru
                                    </CardTitle>
                                    <CardDescription className="mt-1">Pilih periode bulan untuk mendapatkan panduan keuangan personal dari AI.</CardDescription>
                                </div>
                                <form noValidate className="flex w-full sm:w-auto items-center gap-3 shrink-0" onSubmit={submit}>
                                    <MonthPickerInput value={form.data.period} onValueChange={(value) => form.setData('period', value)} />
                                    <SubmitButton processing={form.processing} className="w-auto h-12 px-6 shrink-0 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">Analisis Sekarang</SubmitButton>
                                </form>
                            </div>
                            <InputError message={form.errors.ai} className="w-full text-base bg-rose-50/80 p-3 rounded-lg border border-rose-200/60 dark:bg-rose-950/30 dark:border-rose-900/50" />
                        </CardContent>
                    </Card>

                    <div className="space-y-12">
                        {analyses.length === 0 ? (
                            <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-slate-50/50 p-12 text-center dark:bg-slate-900/50">
                                <Bot className="mb-4 size-12 text-slate-300" />
                                <h3 className="text-lg font-medium">Belum Ada Analisis</h3>
                                <p className="mt-2 max-w-sm text-slate-500">
                                    Mulai analisis data keuanganmu bulan ini untuk mendapatkan insight menarik dari AI.
                                </p>
                            </Card>
                        ) : (
                            analyses.map((analysis) => {
                                const recommendations = analysis.ai_recommendations ?? analysis.recommendations ?? [];
                                const snapshot = analysis.input_snapshot;

                                return (
                                    <div key={analysis.id} className="space-y-6 border-b border-slate-200 pb-12 last:border-0 dark:border-slate-800">
                                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                            <div>
                                                <h2 className="flex items-center gap-2 text-2xl font-bold">
                                                    Insight <DateTimeDisplay value={analysis.period_start} dateOnly format="MMMM yyyy" />
                                                </h2>
                                                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 shadow-sm dark:border-indigo-800/60 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    <Sparkles className="size-4" />
                                                    Powered by {poweredByLabel(analysis, ai_model_label)}
                                                </div>
                                            </div>
                                            {analysis.health_score !== undefined && (
                                                <div className="flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/60 px-5 py-2.5 shadow-sm backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/60">
                                                    <Activity className="size-4 text-emerald-500" />
                                                    <span className="text-sm font-semibold">Health Score:</span>
                                                    <span
                                                        className={`font-bold ${analysis.health_score >= 70 ? 'text-emerald-600' : analysis.health_score >= 40 ? 'text-amber-600' : 'text-rose-600'}`}
                                                    >
                                                        {analysis.health_score}/100
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Headline Card - Glassmorphism */}
                                        <Card className="relative overflow-hidden border border-white/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-sky-500/10 shadow-xl backdrop-blur-xl dark:from-indigo-500/20 dark:via-slate-900/80 dark:to-sky-500/10">
                                            <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-10">
                                                <Bot className="size-32" />
                                            </div>
                                            <CardContent className="relative z-10 p-8">
                                                <div className="flex flex-col items-start gap-6 sm:flex-row">
                                                    <div className="shrink-0 rounded-2xl border border-indigo-100/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-indigo-900/50 dark:bg-slate-800/80">
                                                        <Sparkles className="size-8 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <h3 className="text-lg leading-tight font-extrabold tracking-tight text-slate-900 sm:text-xl dark:text-white">
                                                            {analysis.headline || 'Insight Keuangan Utama'}
                                                        </h3>
                                                        <p className="text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-300">
                                                            {analysis.result_summary}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {snapshot && (
                                            <div className="grid gap-6 md:grid-cols-2 items-start">
                                                <div className="flex flex-col gap-6">
                                                    <Card className="border-slate-200/60 bg-white/50 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/50">
                                                        <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800/60">
                                                        <CardTitle className="flex items-center gap-2 text-base">
                                                            <TrendingUp className="size-4 text-rose-500" />
                                                            Kategori Pengeluaran Terbesar
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4 pt-4">
                                                        {snapshot.expense_by_category?.slice(0, 4).map((cat, idx) => {
                                                            const maxAmount = snapshot.expense_by_category[0]?.amount || 1;
                                                            const percent = Math.min(100, Math.round((cat.amount / maxAmount) * 100));
                                                            const isOpen = openCategories[`${analysis.id}_${cat.name}`] || false;

                                                            return (
                                                                <div key={idx} className="space-y-2">
                                                                    <div
                                                                        className="flex cursor-pointer items-center justify-between text-sm font-medium transition-colors hover:text-indigo-600"
                                                                        onClick={() => toggleCategory(`${analysis.id}_${cat.name}`)}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className="h-3 w-3 rounded-full"
                                                                                style={{ backgroundColor: cat.color }}
                                                                            ></span>
                                                                            <span>{cat.name}</span>
                                                                            {cat.top_items && cat.top_items.length > 0 && (
                                                                                <ChevronDown
                                                                                    className={`size-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <MoneyDisplay
                                                                            value={cat.amount}
                                                                            className="font-bold text-slate-700 dark:text-slate-200"
                                                                        />
                                                                    </div>
                                                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                                        <div
                                                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                                                            style={{ width: `${percent}%`, backgroundColor: cat.color }}
                                                                        />
                                                                    </div>

                                                                    {/* Collapsible Top Items */}
                                                                    {cat.top_items && cat.top_items.length > 0 && isOpen && (
                                                                        <div className="animate-in slide-in-from-top-2 fade-in-50 space-y-2 pt-2 pl-5 text-xs">
                                                                            {cat.top_items.map((item, i) => (
                                                                                <div
                                                                                    key={i}
                                                                                    className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900"
                                                                                >
                                                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                                                        {item.is_whatsapp ? (
                                                                                            <MessageCircle className="size-3 shrink-0 text-emerald-500" />
                                                                                        ) : (
                                                                                            <div className="size-1.5 shrink-0 rounded-full bg-slate-300" />
                                                                                        )}
                                                                                        <span className="max-w-[120px] truncate sm:max-w-[180px]">
                                                                                            {item.merchant}
                                                                                        </span>
                                                                                    </div>
                                                                                    <MoneyDisplay
                                                                                        value={item.amount}
                                                                                        className="shrink-0 font-semibold text-slate-600 dark:text-slate-400"
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        {(!snapshot.expense_by_category || snapshot.expense_by_category.length === 0) && (
                                                            <p className="py-4 text-center text-sm text-slate-500">Belum ada pengeluaran dicatat.</p>
                                                        )}
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="border-slate-200/60 bg-white/50 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/50">
                                                        <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800/60">
                                                            <CardTitle className="flex items-center gap-2 text-base">
                                                                <Activity className="size-4 text-indigo-500" />
                                                                Ringkasan Cash Flow
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4 pt-4">
                                                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/60">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="rounded bg-emerald-100 p-1.5 dark:bg-emerald-900/30">
                                                                        <Wallet className="size-4 text-emerald-600 dark:text-emerald-400" />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Pemasukan</span>
                                                                </div>
                                                                <MoneyDisplay value={snapshot.totals?.income || 0} className="font-semibold text-slate-900 dark:text-slate-100" />
                                                            </div>
                                                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/60">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="rounded bg-rose-100 p-1.5 dark:bg-rose-900/30">
                                                                        <Receipt className="size-4 text-rose-600 dark:text-rose-400" />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Pengeluaran</span>
                                                                </div>
                                                                <MoneyDisplay value={snapshot.totals?.expense || 0} className="font-semibold text-slate-900 dark:text-slate-100" />
                                                            </div>
                                                            <div className="flex items-center justify-between pt-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="rounded bg-indigo-100 p-1.5 dark:bg-indigo-900/30">
                                                                        <PiggyBank className="size-4 text-indigo-600 dark:text-indigo-400" />
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Sisa Uang (Cash Flow)</span>
                                                                </div>
                                                                <MoneyDisplay value={snapshot.totals?.cash_flow || 0} className="font-bold text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                <Card className="border-slate-200/60 bg-white/50 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/50">
                                                    <CardHeader className="border-b border-slate-100 pb-3 dark:border-slate-800/60">
                                                        <CardTitle className="flex items-center gap-2 text-base">
                                                            <AlertCircle className="size-4 text-amber-500" />
                                                            Transaksi Terbesar (Potensi Bocor)
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3 pt-4">
                                                        {snapshot.largest_expenses?.slice(0, 5).map((expense, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
                                                            >
                                                                <div className="min-w-0 flex-1 pr-4">
                                                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                                        {expense.description}
                                                                    </p>
                                                                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                                                        <span className="rounded bg-slate-200/50 px-1.5 py-0.5 dark:bg-slate-800">
                                                                            {expense.category || 'Tanpa Kategori'}
                                                                        </span>
                                                                        {expense.date && <span>{expense.date}</span>}
                                                                    </div>
                                                                </div>
                                                                <MoneyDisplay
                                                                    value={expense.amount}
                                                                    className="shrink-0 font-bold text-rose-600 dark:text-rose-400"
                                                                />
                                                            </div>
                                                        ))}
                                                        {(!snapshot.largest_expenses || snapshot.largest_expenses.length === 0) && (
                                                            <p className="py-4 text-center text-sm text-slate-500">
                                                                Belum ada transaksi pengeluaran.
                                                            </p>
                                                        )}
                                                        {snapshot.largest_expenses && snapshot.largest_expenses.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                                <Button 
                                                                    variant="outline" 
                                                                    className="w-full justify-between group border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                                                                    onClick={() => router.get('/transactions')}
                                                                >
                                                                    <span className="text-slate-600 dark:text-slate-300">Kelola Semua Transaksi</span>
                                                                    <ArrowRight className="size-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}

                                        <div className="mt-8 mb-4 flex items-center gap-2">
                                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                                            <span className="text-sm font-semibold tracking-widest text-slate-400 uppercase">Rekomendasi AI</span>
                                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
                                            {recommendations.map((recommendation) => (
                                                <Card
                                                    key={recommendation.id}
                                                    className="flex flex-col border-slate-200/70 transition-shadow hover:shadow-md dark:border-slate-800/70"
                                                >
                                                    <CardHeader className="pb-3">
                                                        <div className="mb-2 flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="rounded-md bg-slate-100 p-1.5 dark:bg-slate-800">
                                                                    {typeIcons[recommendation.type] || <Bot className="size-4 text-slate-500" />}
                                                                </div>
                                                                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                                                    {recommendation.type.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            {recommendation.priority && <FinanceBadge value={recommendation.priority} />}
                                                        </div>
                                                        <CardTitle className="text-base leading-snug">{recommendation.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="flex flex-col">
                                                        <div className="space-y-4">
                                                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                                                {recommendation.description}
                                                            </p>
                                                            {recommendation.why_it_matters && (
                                                                <div className="rounded-lg border border-indigo-100/50 bg-indigo-50/50 p-3 text-sm dark:border-indigo-900/30 dark:bg-indigo-950/20">
                                                                    <span className="mb-1 block font-semibold text-indigo-900 dark:text-indigo-300">
                                                                        💡 Mengapa ini penting?
                                                                    </span>
                                                                    <span className="text-slate-600 dark:text-slate-400">
                                                                        {recommendation.why_it_matters}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {recommendation.estimated_saving_amount ? (
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <div className="rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-900/30">
                                                                        <TrendingUp className="size-3 text-emerald-600 dark:text-emerald-400" />
                                                                    </div>
                                                                    <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                                                        <span>Potensi Hemat:</span>
                                                                        <MoneyDisplay value={recommendation.estimated_saving_amount} />
                                                                    </p>
                                                                </div>
                                                            ) : null}
                                                        </div>

                                                        {recommendation.next_action && (
                                                            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Langkah Berikutnya</span>
                                                                {(recommendation.status === 'planned' || recommendation.status === 'done') ? (
                                                                    <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                                <Target className="size-4 text-indigo-500" />
                                                                                Sedang Dijalankan
                                                                            </span>
                                                                            <span className="text-xs font-bold text-slate-500">
                                                                                {(recommendation.action_steps_completed || []).length}/3 Selesai
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                            <div 
                                                                                className="h-full bg-indigo-500 transition-all duration-500"
                                                                                style={{ width: `${(((recommendation.action_steps_completed || []).length) / 3) * 100}%` }}
                                                                            />
                                                                        </div>

                                                                        <ul className="space-y-3 mt-4">
                                                                            {[
                                                                                'Tinjau ulang kategori pengeluaran terkait.',
                                                                                'Tetapkan limit mingguan secara manual.',
                                                                                'Cek progress sebelum bulan ini berakhir.'
                                                                            ].map((step, idx) => {
                                                                                const isChecked = (recommendation.action_steps_completed || []).includes(idx);
                                                                                return (
                                                                                    <li key={idx} className="flex items-start gap-3">
                                                                                        <Checkbox 
                                                                                            id={`card-step-${recommendation.id}-${idx}`}
                                                                                            checked={isChecked}
                                                                                            onCheckedChange={() => toggleStep(recommendation, idx)}
                                                                                            className="mt-0.5"
                                                                                        />
                                                                                        <label 
                                                                                            htmlFor={`card-step-${recommendation.id}-${idx}`}
                                                                                            className={`text-sm leading-snug cursor-pointer transition-all ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}
                                                                                        >
                                                                                            {step}
                                                                                        </label>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </ul>

                                                                        {((recommendation.action_steps_completed || []).length === 3) && (
                                                                            <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-sm font-medium flex gap-2 items-center justify-center border border-emerald-100 dark:border-emerald-900/30 animate-in fade-in zoom-in duration-300">
                                                                                <CheckCircle2 className="size-5" />
                                                                                <span>Luar biasa! Rencana ini telah selesai.</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : recommendation.id ? (
                                                                    <Button
                                                                        variant="default"
                                                                        className="w-full justify-between bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 h-auto py-2.5 text-left"
                                                                        onClick={() => openActionDialog(recommendation)}
                                                                    >
                                                                        <span className="line-clamp-2 pr-2 whitespace-normal leading-snug font-medium">
                                                                            {recommendation.next_action || 'Tinjau rekomendasi ini dan pilih satu langkah kecil yang bisa dilakukan minggu ini.'}
                                                                        </span>
                                                                        <ArrowRight className="size-4 shrink-0 opacity-70" />
                                                                    </Button>
                                                                ) : (
                                                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
                                                                        {recommendation.next_action}
                                                                        <p className="mt-2 text-xs text-slate-500 font-normal">*(Insight versi lama, buat Analisis Baru untuk fitur Action Plan interaktif)*</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            {recommendations.length < 3 && (
                                                <Card className="flex flex-col justify-center border-dashed border-slate-300 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/30 min-h-[300px]">
                                                    <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                                                        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                                            <Lightbulb className="size-8 text-amber-500 dark:text-amber-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Tingkatkan Pencatatan</h3>
                                                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                                Rutin catat pengeluaran dan pemasukan harianmu agar AI memiliki cukup data untuk memberikan rekomendasi yang lebih banyak dan akurat.
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="rounded-md bg-indigo-50 p-2 dark:bg-indigo-900/20">
                                {selectedRecommendation && typeIcons[selectedRecommendation.type] ? typeIcons[selectedRecommendation.type] : <Bot className="size-5 text-indigo-500" />}
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Rencana Aksi</DialogTitle>
                                <DialogDescription className="text-sm mt-0.5">
                                    Mulai dari langkah kecil yang paling realistis untuk kondisi bulan ini.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    {selectedRecommendation && (
                        <div className="space-y-5 py-2">
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h3 className="font-bold text-lg leading-snug">{selectedRecommendation.title}</h3>
                                    {selectedRecommendation.priority && <FinanceBadge value={selectedRecommendation.priority} />}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{selectedRecommendation.description}</p>
                            </div>

                            {selectedRecommendation.why_it_matters && (
                                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 p-3.5 rounded-lg">
                                    <span className="block font-semibold text-indigo-900 dark:text-indigo-300 text-sm mb-1.5 flex items-center gap-2">
                                        <Lightbulb className="size-4" /> Mengapa ini penting?
                                    </span>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{selectedRecommendation.why_it_matters}</p>
                                </div>
                            )}

                            {selectedRecommendation.estimated_saving_amount && (
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                                    <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Potensi Hemat:</span>
                                    <MoneyDisplay value={selectedRecommendation.estimated_saving_amount} className="font-bold text-emerald-700 dark:text-emerald-400 text-sm" />
                                </div>
                            )}

                            <div className="space-y-3 pt-2">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Checklist Tindakan:</h4>
                                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                    {[
                                        'Tinjau ulang kategori pengeluaran terkait.',
                                        'Tetapkan limit mingguan secara manual.',
                                        'Cek progress sebelum bulan ini berakhir.'
                                    ].map((step, idx) => {
                                        const isChecked = (selectedRecommendation.action_steps_completed || []).includes(idx);
                                        return (
                                            <li key={idx} className="flex gap-3 items-start">
                                                <Checkbox 
                                                    id={`dialog-step-${idx}`}
                                                    checked={isChecked}
                                                    onCheckedChange={() => toggleStep(selectedRecommendation, idx)}
                                                    className="mt-0.5"
                                                />
                                                <label 
                                                    htmlFor={`dialog-step-${idx}`}
                                                    className={`leading-snug cursor-pointer transition-all ${isChecked ? 'text-slate-400 line-through' : ''}`}
                                                >
                                                    {step}
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                            Tutup
                        </Button>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => selectedRecommendation && markAsPlanned(selectedRecommendation.id)}
                        >
                            Saya catat sebagai rencana
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
