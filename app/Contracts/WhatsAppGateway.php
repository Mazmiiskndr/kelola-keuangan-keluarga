<?php

namespace App\Contracts;

interface WhatsAppGateway
{
    public function sendMessage(string $phone, string $message): bool;

    public function getStatus(): array;

    public function logout(): bool;

    public function restart(): bool;
}
