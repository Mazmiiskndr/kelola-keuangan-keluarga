import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Family, type FamilyMember } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { Trash2, UserPlus, Users } from 'lucide-react';
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
            className="mt-4 grid gap-3 rounded-lg border bg-slate-50 p-3 md:grid-cols-[1fr_180px_180px] md:items-start dark:bg-slate-900"
            onSubmit={submit}
        >
            <div className="relative space-y-2 pb-6">
                <Label>Email anggota</Label>
                <Input value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} placeholder="email@keluarga.com" />
                <FormError message={form.errors.email} className="absolute bottom-0 left-0" />
            </div>
            <div className="relative space-y-2 pb-6">
                <Label>Role</Label>
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Keluarga" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Ruang Keluarga"
                    description="Siapkan struktur keluarga agar admin dapat melihat pemasukan, pengeluaran, hutang, dan laporan sesuai permission."
                    icon={Users}
                />
                <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Buat Keluarga</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submit}>
                                <div className="space-y-2">
                                    <Label>Nama keluarga</Label>
                                    <Input
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        placeholder="Keluarga Santoso"
                                    />
                                    <FormError message={form.errors.name} />
                                </div>
                                <SubmitButton processing={form.processing}>Buat Keluarga</SubmitButton>
                            </form>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Daftar Keluarga</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {families.map((family) => (
                                <div key={family.id} className="rounded-lg border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate font-medium">{family.name}</p>
                                                <FinanceBadge value={family.role} />
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <FinanceBadge value={family.currency} />
                                                {family.can_manage && <Badge variant="outline">Bisa kelola anggota</Badge>}
                                            </div>
                                        </div>
                                        <Badge variant="outline">{family.members?.length ?? 0} anggota</Badge>
                                    </div>

                                    {family.can_manage && <FamilyMemberForm family={family} />}

                                    <div className="mt-4 grid gap-2">
                                        {family.members?.map((member) => {
                                            const isOwner = family.owner_user_id === member.user_id;

                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">{member.user?.name ?? member.user?.email ?? 'Anggota'}</p>
                                                        <p className="text-muted-foreground truncate text-xs">{member.user?.email}</p>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        {isOwner && <FinanceBadge value="owner" />}
                                                        <FinanceBadge value={member.role} />
                                                        <FinanceBadge value={member.status} />
                                                        {family.can_manage && !isOwner && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeMember(family, member)}
                                                                aria-label="Hapus anggota"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {families.length === 0 && (
                                <p className="text-muted-foreground text-sm">
                                    Belum ada keluarga. Buat keluarga dulu untuk mulai melihat laporan keluarga.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
