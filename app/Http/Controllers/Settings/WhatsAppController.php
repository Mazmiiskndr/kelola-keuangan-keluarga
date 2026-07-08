<?php

namespace App\Http\Controllers\Settings;

use App\Contracts\WhatsAppGateway;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class WhatsAppController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('settings/whatsapp');
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'whatsapp_number' => ['nullable', 'string', 'max:20'],
        ]);

        $number = $validated['whatsapp_number'];

        // Normalize if not empty
        if ($number) {
            $number = preg_replace('/[^0-9]/', '', $number);
            if (str_starts_with($number, '0')) {
                $number = '62' . substr($number, 1);
            }
        }

        $request->user()->fill([
            'whatsapp_number' => $number,
        ])->save();

        return redirect()->route('whatsapp.edit')->with('status', 'whatsapp-number-updated');
    }

    public function status(WhatsAppGateway $gateway): JsonResponse
    {
        return response()->json($gateway->getStatus());
    }

    public function logout(WhatsAppGateway $gateway): JsonResponse
    {
        $success = $gateway->logout();

        if ($success) {
            return response()->json(['success' => true]);
        }

        return response()->json(['error' => 'Failed to log out from gateway.'], 500);
    }

    public function restart(WhatsAppGateway $gateway): JsonResponse
    {
        $success = $gateway->restart();

        if ($success) {
            return response()->json(['success' => true]);
        }

        return response()->json(['error' => 'Failed to restart gateway.'], 500);
    }
}
