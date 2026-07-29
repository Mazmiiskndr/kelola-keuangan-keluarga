import { FinanceBadge } from '@/components/finance/finance-badge';
import { MoneyDisplay } from '@/components/finance/money-display';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type SummaryMetric } from '@/types/finance';

interface DashboardFinancialOverviewProps {
    summary: SummaryMetric;
    currentScope: 'personal' | 'family';
}

export function DashboardFinancialOverview({ summary, currentScope }: DashboardFinancialOverviewProps) {
    const accounts = summary.accounts ?? [];
    const memberBreakdown = summary.member_breakdown ?? [];
    const canViewFamilyDetails = currentScope !== 'family' || Boolean(summary.can_view_family_details);
    const totalAccountBalance = accounts.reduce((sum, account) => sum + Math.max(0, Number(account.current_balance)), 0);
    const memberGridClass = memberBreakdown.length === 1 ? 'md:grid-cols-1' : memberBreakdown.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

    return (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
            <Card>
                <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                    <div className="min-w-0">
                        <CardTitle>Detail Saldo Akun</CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">Distribusi saldo dari akun aktif yang dapat Anda lihat.</p>
                    </div>
                    {accounts.length > 0 && (
                        <Badge variant="outline" className="shrink-0 rounded-full px-2.5 py-1 text-xs">
                            {accounts.length} Akun
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="space-y-3">
                    {accounts.length === 0 ? (
                        <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                            {canViewFamilyDetails ? 'Belum ada akun aktif untuk ditampilkan.' : 'Detail saldo akun disembunyikan untuk peran Anda.'}
                        </p>
                    ) : (
                        accounts.slice(0, 4).map((account) => {
                            const balanceShare =
                                totalAccountBalance > 0 ? Math.round((Math.max(0, Number(account.current_balance)) / totalAccountBalance) * 100) : 0;

                            return (
                                <div
                                    key={account.id}
                                    className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                                            {account.name.charAt(0)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{account.display_name ?? account.name}</p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {account.owner ? `Pemilik ${account.owner}` : account.visibility}
                                            </p>
                                        </div>
                                        <MoneyDisplay value={account.current_balance} className="shrink-0 text-sm font-bold" />
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
                                        <span className="text-muted-foreground">Porsi total saldo</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{balanceShare}%</span>
                                    </div>
                                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${balanceShare}%` }} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                    <div className="min-w-0">
                        <CardTitle>Statistik Anggota Keluarga</CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Bandingkan pemasukan, pengeluaran, dan arus kas anggota pada periode ini.
                        </p>
                    </div>
                    {memberBreakdown.length > 0 && (
                        <Badge variant="outline" className="shrink-0 rounded-full px-2.5 py-1 text-xs">
                            {memberBreakdown.length} Anggota
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className={`grid gap-3 ${memberGridClass}`}>
                    {memberBreakdown.length === 0 ? (
                        <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm md:col-span-3">
                            {currentScope !== 'family'
                                ? 'Aktifkan scope keluarga untuk melihat statistik anggota.'
                                : canViewFamilyDetails
                                  ? 'Belum ada anggota keluarga aktif untuk ditampilkan.'
                                  : 'Detail finansial anggota disembunyikan untuk peran Anda.'}
                        </p>
                    ) : (
                        memberBreakdown.map((member) => (
                            <div
                                key={member.user_id}
                                className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                                        {member.name.charAt(0)}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold">{member.name}</p>
                                        <FinanceBadge value={member.role} className="mt-1" />
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/40">
                                        <p className="text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                            Pemasukan
                                        </p>
                                        <MoneyDisplay
                                            value={member.income}
                                            compact
                                            className="mt-1 block text-xs font-bold text-emerald-700 dark:text-emerald-200"
                                        />
                                    </div>
                                    <div className="rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950/40">
                                        <p className="text-[10px] font-semibold tracking-wide text-rose-700 uppercase dark:text-rose-300">
                                            Pengeluaran
                                        </p>
                                        <MoneyDisplay
                                            value={member.expense}
                                            compact
                                            className="mt-1 block text-xs font-bold text-rose-700 dark:text-rose-200"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Arus kas</span>
                                    <MoneyDisplay
                                        value={member.cash_flow}
                                        compact
                                        className={member.cash_flow < 0 ? 'text-sm font-bold text-rose-600' : 'text-sm font-bold text-emerald-600'}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
