<?php

use App\Http\Controllers\AiInsightController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\FamilyController;
use App\Http\Controllers\FinanceTransactionController;
use App\Http\Controllers\FinancialAccountController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SavingGoalController;
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

    Route::resource('accounts', FinancialAccountController::class)->only(['index', 'store', 'destroy']);
    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'destroy']);
    Route::resource('transactions', FinanceTransactionController::class)->only(['index', 'store', 'destroy']);
    Route::post('transfers', [TransferController::class, 'store'])->name('transfers.store');
    Route::resource('budgets', BudgetController::class)->only(['index', 'store', 'destroy']);
    Route::resource('saving-goals', SavingGoalController::class)->only(['index', 'store', 'destroy'])->parameters(['saving-goals' => 'savingGoal']);
    Route::resource('debts', DebtController::class)->only(['index', 'store', 'destroy']);
    Route::post('debts/{debt}/payments', [DebtController::class, 'pay'])->name('debts.payments.store');
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [ReportController::class, 'export'])->name('reports.export');
    Route::resource('ai-insights', AiInsightController::class)->only(['index', 'store']);
    Route::resource('families', FamilyController::class)->only(['index', 'store']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
