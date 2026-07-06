<?php

use App\Http\Controllers\AiInsightController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\FamilyController;
use App\Http\Controllers\FamilyMemberController;
use App\Http\Controllers\FinanceTransactionController;
use App\Http\Controllers\FinancialAccountController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SavingGoalController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TransferController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (Request $request) {
    if ($request->user()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('auth/login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => $request->session()->get('status'),
    ]);
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::post('dashboard/scope', [DashboardController::class, 'scope'])->name('dashboard.scope');

    Route::get('search', [SearchController::class, 'index'])->name('search');
    Route::get('search/suggestions', [SearchController::class, 'suggestions'])->name('search.suggestions');

    Route::resource('accounts', FinancialAccountController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('transactions', FinanceTransactionController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('transfers', [TransferController::class, 'store'])->name('transfers.store');
    Route::resource('budgets', BudgetController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('saving-goals', SavingGoalController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['saving-goals' => 'savingGoal']);
    Route::resource('debts', DebtController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('debts/{debt}/payments', [DebtController::class, 'pay'])->name('debts.payments.store');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::patch('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [ReportController::class, 'export'])->name('reports.export');
    Route::resource('ai-insights', AiInsightController::class)->only(['index', 'store']);
    Route::resource('families', FamilyController::class)->only(['index', 'store']);
    Route::post('families/{family}/members', [FamilyMemberController::class, 'store'])->name('families.members.store');
    Route::delete('families/{family}/members/{member}', [FamilyMemberController::class, 'destroy'])->name('families.members.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
