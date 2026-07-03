<?php

namespace App\Contracts;

interface WhatsAppGateway
{
    public function sendMessage(string $phone, string $message): bool;
}
