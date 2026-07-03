<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WhatsAppWebhookController;

Route::middleware(['api', \App\Http\Middleware\VerifyInternalWhatsAppSecret::class])->group(function () {
    Route::post('/internal/whatsapp/messages', [WhatsAppWebhookController::class, 'handleMessage']);
});
