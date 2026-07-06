import { DateTimeDisplay } from '@/components/finance/date-display';
import { MonthPickerInput } from '@/components/finance/date-picker-input';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AiAnalysis } from '@/types/finance';
import { Head, useForm } from '@inertiajs/react';
import { Bot, Activity, ArrowRight, Target, AlertCircle, Lightbulb, TrendingUp, Sparkles, ChevronDown, MessageCircle } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'AI Insight', href: '/ai-insights' }];

interface AiInsightsProps {
    analyses: AiAnalysis[];
}

const typeIcons: Record<string, React.ReactNode> = {
    alert: <AlertCircle className="size-4 text-rose-500" />,
    opportunity: <Lightbulb className="size-4 text-emerald-500" />,
    habit: <TrendingUp className="size-4 text-cyan-500" />,
    goal: <Target className="size-4 text-teal-500" />,
    next_step: <ArrowRight className="size-4 text-indigo-500" />,
};

export default function AiInsightsIndex({ analyses }: AiInsightsProps) {
    const form = useForm({ period: new Date().toISOString().slice(0, 7) });
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/ai-insights', { preserveScroll: true });
    }

    function handleQuickAction(actionType: string) {
        window.alert(`Fitur ${actionType} sedang dalam pengembangan.`);
    }

    const toggleCategory = (catName: string) => {
        setOpenCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
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
                <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                    <div className="space-y-6">
                        <Card className="rounded-xl border-slate-200/60 shadow-sm dark:border-slate-800/60">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Analisis Baru</CardTitle>
                                <CardDescription>Pilih bulan untuk dianalisis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form noValidate className="space-y-4" onSubmit={submit}>
                                    <div className="space-y-2">
                                        <Label>Bulan</Label>
                                        <MonthPickerInput value={form.data.period} onValueChange={(value) => form.setData('period', value)} />
                                        <FormError message={form.errors.period} />
                                    </div>
                                    <SubmitButton processing={form.processing} className="w-full">Analisis Sekarang</SubmitButton>
                                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                        Data dijamin aman dan hanya digunakan untuk memberikan metrik rekomendasi.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-12">
                        {analyses.length === 0 ? (
                            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/50">
                                <Bot className="size-12 text-slate-300 mb-4" />
                                <h3 className="font-medium text-lg">Belum Ada Analisis</h3>
                                <p className="text-slate-500 mt-2 max-w-sm">Mulai analisis data keuanganmu bulan ini untuk mendapatkan insight menarik dari AI.</p>
                            </Card>
                        ) : (
                            analyses.map((analysis) => {
                                const recommendations = analysis.aiRecommendations ?? analysis.recommendations ?? [];
                                const snapshot = analysis.input_snapshot;
                                
                                return (
                                    <div key={analysis.id} className="space-y-6 pb-12 border-b border-slate-200 dark:border-slate-800 last:border-0">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                                    Insight <DateTimeDisplay value={analysis.period_start} dateOnly format="MMMM yyyy" />
                                                </h2>
                                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                                                    <Sparkles className="size-3.5" />
                                                    Powered by {analysis.model_label || analysis.model_name || 'deterministic-rules'}
                                                </p>
                                            </div>
                                            {analysis.health_score !== undefined && (
                                                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md dark:bg-slate-900/60 px-5 py-2.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                                    <Activity className="size-4 text-emerald-500" />
                                                    <span className="font-semibold text-sm">Health Score:</span>
                                                    <span className={`font-bold ${analysis.health_score >= 70 ? 'text-emerald-600' : analysis.health_score >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                                                        {analysis.health_score}/100
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Headline Card - Glassmorphism */}
                                        <Card className="overflow-hidden border border-white/20 shadow-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-sky-500/10 dark:from-indigo-500/20 dark:via-slate-900/80 dark:to-sky-500/10 backdrop-blur-xl relative">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                                <Bot className="size-32" />
                                            </div>
                                            <CardContent className="p-8 relative z-10">
                                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                                    <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-indigo-100/50 dark:border-indigo-900/50 shrink-0">
                                                        <Sparkles className="size-8 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="space-y-3 flex-1">
                                                        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                                                            {analysis.headline || 'Insight Keuangan Utama'}
                                                        </h3>
                                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg font-medium">
                                                            {analysis.result_summary}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Premium Dashboard Deep Dive (If snapshot exists) */}
                                        {snapshot && (
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <Card className="border-slate-200/60 shadow-sm dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                                                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            <TrendingUp className="size-4 text-rose-500" />
                                                            Kategori Pengeluaran Terbesar
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-4 space-y-4">
                                                        {snapshot.expense_by_category?.slice(0, 4).map((cat, idx) => {
                                                            const maxAmount = snapshot.expense_by_category[0]?.amount || 1;
                                                            const percent = Math.min(100, Math.round((cat.amount / maxAmount) * 100));
                                                            const isOpen = openCategories[`${analysis.id}_${cat.name}`] || false;
                                                            
                                                            return (
                                                                <div key={idx} className="space-y-2">
                                                                    <div 
                                                                        className="flex justify-between items-center text-sm font-medium cursor-pointer hover:text-indigo-600 transition-colors"
                                                                        onClick={() => toggleCategory(`${analysis.id}_${cat.name}`)}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                                                            <span>{cat.name}</span>
                                                                            {cat.top_items && cat.top_items.length > 0 && (
                                                                                <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                                            )}
                                                                        </div>
                                                                        <MoneyDisplay value={cat.amount} className="font-bold text-slate-700 dark:text-slate-200" />
                                                                    </div>
                                                                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                        <div 
                                                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                                                            style={{ width: `${percent}%`, backgroundColor: cat.color }}
                                                                        />
                                                                    </div>
                                                                    
                                                                    {/* Collapsible Top Items */}
                                                                    {cat.top_items && cat.top_items.length > 0 && isOpen && (
                                                                        <div className="pl-5 pt-2 space-y-2 text-xs animate-in slide-in-from-top-2 fade-in-50">
                                                                            {cat.top_items.map((item, i) => (
                                                                                <div key={i} className="flex justify-between items-center py-1.5 px-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800">
                                                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                                                        {item.is_whatsapp ? (
                                                                                            <MessageCircle className="size-3 text-emerald-500 shrink-0" />
                                                                                        ) : (
                                                                                            <div className="size-1.5 rounded-full bg-slate-300 shrink-0" />
                                                                                        )}
                                                                                        <span className="truncate max-w-[120px] sm:max-w-[180px]">{item.merchant}</span>
                                                                                    </div>
                                                                                    <MoneyDisplay value={item.amount} className="font-semibold text-slate-600 dark:text-slate-400 shrink-0" />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        {(!snapshot.expense_by_category || snapshot.expense_by_category.length === 0) && (
                                                            <p className="text-sm text-slate-500 text-center py-4">Belum ada pengeluaran dicatat.</p>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-slate-200/60 shadow-sm dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                                                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            <AlertCircle className="size-4 text-amber-500" />
                                                            Transaksi Terbesar (Potensi Bocor)
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-4 space-y-3">
                                                        {snapshot.largest_expenses?.slice(0, 5).map((expense, idx) => (
                                                            <div key={idx} className="flex justify-between items-start p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                <div className="flex-1 min-w-0 pr-4">
                                                                    <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
                                                                        {expense.description}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                                        <span className="bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                                            {expense.category || 'Tanpa Kategori'}
                                                                        </span>
                                                                        {expense.date && <span>{expense.date}</span>}
                                                                    </div>
                                                                </div>
                                                                <MoneyDisplay value={expense.amount} className="font-bold text-rose-600 dark:text-rose-400 shrink-0" />
                                                            </div>
                                                        ))}
                                                        {(!snapshot.largest_expenses || snapshot.largest_expenses.length === 0) && (
                                                            <p className="text-sm text-slate-500 text-center py-4">Belum ada transaksi pengeluaran.</p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}

                                        <div className="mt-8 mb-4 flex items-center gap-2">
                                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Rekomendasi AI</span>
                                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {recommendations.map((recommendation) => (
                                                <Card key={recommendation.id} className="h-full flex flex-col hover:shadow-md transition-shadow border-slate-200/70 dark:border-slate-800/70">
                                                    <CardHeader className="pb-3">
                                                        <div className="flex justify-between items-start gap-2 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                                                                    {typeIcons[recommendation.type] || <Bot className="size-4 text-slate-500" />}
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                                    {recommendation.type.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            {recommendation.priority && (
                                                                <FinanceBadge value={recommendation.priority} />
                                                            )}
                                                        </div>
                                                        <CardTitle className="text-base leading-snug">{recommendation.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="flex-1 flex flex-col">
                                                        <div className="space-y-4 flex-1">
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                {recommendation.description}
                                                            </p>
                                                            {recommendation.why_it_matters && (
                                                                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg text-sm border border-indigo-100/50 dark:border-indigo-900/30">
                                                                    <span className="font-semibold block mb-1 text-indigo-900 dark:text-indigo-300">💡 Mengapa ini penting?</span>
                                                                    <span className="text-slate-600 dark:text-slate-400">{recommendation.why_it_matters}</span>
                                                                </div>
                                                            )}
                                                            {recommendation.estimated_saving_amount ? (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                                                        <TrendingUp className="size-3 text-emerald-600 dark:text-emerald-400" />
                                                                    </div>
                                                                    <p className="text-sm font-semibold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                                                                        <span>Potensi Hemat:</span>
                                                                        <MoneyDisplay value={recommendation.estimated_saving_amount} />
                                                                    </p>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        
                                                        {recommendation.next_action && (
                                                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                                                                <Button 
                                                                    variant="default" 
                                                                    className="w-full justify-between bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                                                    onClick={() => handleQuickAction(recommendation.next_action || '')}
                                                                >
                                                                    <span className="truncate">{recommendation.next_action}</span>
                                                                    <ArrowRight className="size-4 shrink-0 opacity-70" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
