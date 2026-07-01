import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { RequiredLabel } from '@/components/finance/required-label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Category } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Tags, Trash2, X } from 'lucide-react';
import { useState, type React } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kategori', href: '/categories' }];

interface CategoriesProps {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: CategoriesProps) {
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const form = useForm({
        name: '',
        type: 'expense',
        color: '#2563eb',
        icon: '',
        is_essential: false,
        is_savable: false,
        is_lifestyle: false,
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => resetForm() };

        if (editingCategoryId) {
            form.put(`/categories/${editingCategoryId}`, options);

            return;
        }

        form.post('/categories', options);
    }

    function resetForm() {
        setEditingCategoryId(null);
        form.setData({
            name: '',
            type: 'expense',
            color: '#2563eb',
            icon: '',
            is_essential: false,
            is_savable: false,
            is_lifestyle: false,
        });
    }

    function editCategory(category: Category) {
        setEditingCategoryId(category.id);
        form.setData({
            name: category.name,
            type: category.type,
            color: category.color ?? '#2563eb',
            icon: category.icon ?? '',
            is_essential: Boolean(category.is_essential),
            is_savable: Boolean(category.is_savable),
            is_lifestyle: Boolean(category.is_lifestyle),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Kategori Transaksi"
                    description="Kelompokkan pemasukan dan pengeluaran agar laporan dan rekomendasi AI lebih akurat."
                    icon={Tags}
                />

                <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <CardTitle>{editingCategoryId ? 'Edit Kategori' : 'Tambah Kategori'}</CardTitle>
                                {editingCategoryId && (
                                    <button
                                        type="button"
                                        className="text-muted-foreground rounded-md p-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                                        onClick={resetForm}
                                        aria-label="Batal edit kategori"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submit}>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="name">Nama</RequiredLabel>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        placeholder="Langganan aplikasi"
                                    />
                                    <FormError message={form.errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="type">Tipe</RequiredLabel>
                                    <FinanceSelect
                                        value={form.data.type}
                                        onValueChange={(value) => form.setData('type', value)}
                                        options={[
                                            { value: 'expense', label: 'Pengeluaran' },
                                            { value: 'income', label: 'Pemasukan' },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">Warna</Label>
                                    <Input
                                        id="color"
                                        type="color"
                                        value={form.data.color}
                                        onChange={(event) => form.setData('color', event.target.value)}
                                    />
                                </div>
                                <div className="grid gap-3 text-sm">
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={form.data.is_essential}
                                            onCheckedChange={(value) => form.setData('is_essential', Boolean(value))}
                                        />{' '}
                                        Kebutuhan wajib
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={form.data.is_savable}
                                            onCheckedChange={(value) => form.setData('is_savable', Boolean(value))}
                                        />{' '}
                                        Bisa dihemat
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={form.data.is_lifestyle}
                                            onCheckedChange={(value) => form.setData('is_lifestyle', Boolean(value))}
                                        />{' '}
                                        Lifestyle
                                    </label>
                                </div>
                                <SubmitButton processing={form.processing}>
                                    {editingCategoryId ? 'Perbarui Kategori' : 'Simpan Kategori'}
                                </SubmitButton>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Daftar Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between gap-3 rounded-lg border p-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="size-3 rounded-full" style={{ backgroundColor: category.color || '#64748b' }} />
                                            <p className="font-medium">{category.name}</p>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <FinanceBadge value={category.type} />
                                            {category.is_default && <FinanceBadge value="default" />}
                                            {category.is_savable && <FinanceBadge value="savable" />}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <button
                                            className="text-muted-foreground rounded-md p-2 hover:bg-blue-50 hover:text-blue-700"
                                            onClick={() => editCategory(category)}
                                            aria-label="Edit kategori"
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                        {!category.is_default && (
                                            <button
                                                className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                                onClick={() => router.delete(`/categories/${category.id}`, { preserveScroll: true })}
                                                aria-label="Hapus kategori"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
