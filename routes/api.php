<?php

use App\Http\Controllers\Api\WhatsAppWebhookController;
use App\Http\Middleware\VerifyInternalWhatsAppSecret;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', VerifyInternalWhatsAppSecret::class])->group(function () {
    Route::post('/internal/whatsapp/messages', [WhatsAppWebhookController::class, 'handleMessage']);
});
