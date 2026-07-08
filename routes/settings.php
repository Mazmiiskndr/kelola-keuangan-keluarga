<?php

use App\Http\Controllers\Settings\AiController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/ai', [AiController::class, 'edit'])->name('ai.edit');
    Route::put('settings/ai', [AiController::class, 'update'])->name('ai.update');
    Route::post('settings/ai/test', [AiController::class, 'test'])->name('ai.test');

    Route::get('settings/whatsapp', [\App\Http\Controllers\Settings\WhatsAppController::class, 'edit'])->name('whatsapp.edit');
    Route::patch('settings/whatsapp', [\App\Http\Controllers\Settings\WhatsAppController::class, 'update'])->name('whatsapp.update');
    Route::get('settings/whatsapp/status', [\App\Http\Controllers\Settings\WhatsAppController::class, 'status'])->name('whatsapp.status');
    Route::post('settings/whatsapp/logout', [\App\Http\Controllers\Settings\WhatsAppController::class, 'logout'])->name('whatsapp.logout');
    Route::post('settings/whatsapp/restart', [\App\Http\Controllers\Settings\WhatsAppController::class, 'restart'])->name('whatsapp.restart');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
