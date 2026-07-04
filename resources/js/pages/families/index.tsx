import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { RequiredLabel } from '@/components/finance/required-label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Family, type FamilyMember } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Trash2, UserPlus } from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Keluarga', href: '/families' }];

const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
    { value: 'viewer', label: 'Viewer' },
];

interface FamiliesProps {
    families: Family[];
}

interface FamilyMemberFormProps {
    family: Family;
}

function FamilyMemberForm({ family }: FamilyMemberFormProps) {
    const form = useForm({ email: '', role: 'member' });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post(`/families/${family.id}/members`, {
            preserveScroll: true,
            onSuccess: () => form.reset('email'),
        });
    }

    return (
        <form
            noValidate
            className="mt-4 grid gap-3 rounded-lg border bg-slate-50 p-3 md:grid-cols-[1fr_180px_180px] md:items-start dark:bg-slate-900"
            onSubmit={submit}
        >
            <div className="relative space-y-2 pb-6">
                <RequiredLabel>Email anggota</RequiredLabel>
                <Input value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} placeholder="email@keluarga.com" />
                <FormError message={form.errors.email} className="absolute bottom-0 left-0" />
            </div>
            <div className="relative space-y-2 pb-6">
                <RequiredLabel>Role</RequiredLabel>
                <FinanceSelect value={form.data.role} onValueChange={(value) => form.setData('role', value)} options={roleOptions} />
                <FormError message={form.errors.role} className="absolute bottom-0 left-0" />
            </div>
            <div className="space-y-2 pb-6">
                <Label className="invisible">Aksi</Label>
                <Button type="submit" disabled={form.processing} className="h-10 w-full">
                    {form.processing ? (
                        'Menyimpan...'
                    ) : (
                        <>
                            <UserPlus className="size-4" /> Tambah
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

function removeMember(family: Family, member: FamilyMember) {
    router.delete(`/families/${family.id}/members/${member.id}`, {
        preserveScroll: true,
    });
}

export default function FamiliesIndex({ families }: FamiliesProps) {
    const form = useForm({ name: '', currency: 'IDR' });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/families', { preserveScroll: true, onSuccess: () => form.reset('name') });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="Keluarga">
            <Head title="Keluarga" />
            <div className="finance-page">
                <PageHeader title="Keluarga" description="Kelola owner, member, akun keluarga, dan audit akses." />
                <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                    <Card className="min-h-[400px]">
                        <CardHeader>
                            <CardTitle>{families[0]?.name ? `Anggota ${families[0].name}` : 'Anggota Keluarga'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {families[0]?.members?.map((member) => (
                                <div key={member.id} className="flex items-center gap-4">
                                    <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                                        {(member.user?.name ?? member.user?.email ?? 'A').charAt(0)}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-950 dark:text-white">{member.user?.name ?? 'Anggota'}</p>
                                        <p className="text-muted-foreground truncate text-sm">
                                            {families[0].owner_user_id === member.user_id ? 'Owner' : member.role} -{' '}
                                            {member.user?.email ?? 'akses akun keluarga aktif'}
                                        </p>
                                    </div>
                                    <div className="ml-auto flex shrink-0 items-center gap-2">
                                        <FinanceBadge value={families[0].owner_user_id === member.user_id ? 'owner' : member.role} />
                                        {families[0].can_manage && families[0].owner_user_id !== member.user_id && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMember(families[0], member)}
                                                aria-label="Hapus anggota"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {families.length === 0 && (
                                <form noValidate className="space-y-4" onSubmit={submit}>
                                    <div className="space-y-2">
                                        <RequiredLabel>Nama keluarga</RequiredLabel>
                                        <Input
                                            value={form.data.name}
                                            onChange={(event) => form.setData('name', event.target.value)}
                                            placeholder="Keluarga Azmi"
                                        />
                                        <FormError message={form.errors.name} />
                                    </div>
                                    <SubmitButton processing={form.processing}>Buat Keluarga</SubmitButton>
                                </form>
                            )}
                            {families[0]?.can_manage && <FamilyMemberForm family={families[0]} />}
                        </CardContent>
                    </Card>
                    <Card className="min-h-[400px]">
                        <CardHeader>
                            <CardTitle>Permission Matrix</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                'Owner dapat memakai akun member',
                                'Member dapat memakai akun owner',
                                'Private tetap tampil jika satu keluarga aktif',
                                'Transaksi mencatat dibuat oleh siapa',
                                'Edit saldo tercatat di aktivitas',
                            ].map((permission) => (
                                <div key={permission} className="flex items-center gap-4">
                                    <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                                        <Check className="size-4" />
                                    </span>
                                    <p className="text-sm text-slate-800 dark:text-slate-200">{permission}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                {families.length > 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Keluarga Lain</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            {families.slice(1).map((family) => (
                                <div key={family.id} className="finance-panel-list">
                                    <div>
                                        <p className="font-semibold">{family.name}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <FinanceBadge value={family.role} />
                                            <FinanceBadge value={family.currency} />
                                        </div>
                                    </div>
                                    <Badge variant="outline">{family.members?.length ?? 0} anggota</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
                {families.length > 0 && families.every((family) => !family.can_manage) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Buat Keluarga</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form noValidate className="space-y-4" onSubmit={submit}>
                                <div className="space-y-2">
                                    <RequiredLabel>Nama keluarga</RequiredLabel>
                                    <Input
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        placeholder="Keluarga Azmi"
                                    />
                                    <FormError message={form.errors.name} />
                                </div>
                                <SubmitButton processing={form.processing}>Buat Keluarga</SubmitButton>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
