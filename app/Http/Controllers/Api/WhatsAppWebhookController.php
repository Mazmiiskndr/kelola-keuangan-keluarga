<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WhatsApp\WhatsAppBotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function handleMessage(Request $request, WhatsAppBotService $botService)
    {
        $phone = $request->input('from_phone') ?: $request->input('from');
        $replyTo = $request->input('reply_to') ?: $request->input('from');
        $body = $request->input('body');

        Log::info('WhatsApp inbound message received.', [
            'phone' => $phone,
            'reply_to' => $replyTo,
            'message_id' => $request->input('message_id'),
            'provider' => $request->input('provider'),
            'body' => $body,
        ]);

        $replies = $botService->handleMessage($phone, (string) $body, (string) $replyTo, true);

        return response()->json([
            'success' => true,
            'replies' => $replies,
        ]);
    }
}
