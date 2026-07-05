<?php

namespace App\Services\Ai;

class AiProviderConnectionResult
{
    public function __construct(
        public readonly bool $success,
        public readonly string $message,
        public readonly ?string $responsePreview = null,
        public readonly string $status = 'ok',
    ) {}
}
