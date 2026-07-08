<?php

namespace App\Services\Ai;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\In;

class AiProviderCatalog
{
    public const MASKED_KEY = '****************';

    /**
     * @return array<string, array{label: string, default_model: string, models: array<int, array{value: string, label: string}>}>
     */
    public function providers(): array
    {
        return [
            'gemini' => [
                'label' => 'Google Gemini',
                'default_model' => 'gemini-3.5-flash',
                'models' => [
                    ['value' => 'gemini-2.0-flash', 'label' => 'Gemini 2 Flash'],
                    ['value' => 'gemini-2.0-flash-lite', 'label' => 'Gemini 2 Flash Lite'],
                    ['value' => 'gemini-2.5-flash', 'label' => 'Gemini 2.5 Flash'],
                    ['value' => 'gemini-2.5-flash-lite', 'label' => 'Gemini 2.5 Flash Lite'],
                    ['value' => 'gemini-2.5-pro', 'label' => 'Gemini 2.5 Pro'],
                    ['value' => 'gemini-3.0-flash', 'label' => 'Gemini 3 Flash'],
                    ['value' => 'gemini-3.5-flash', 'label' => 'Gemini 3.5 Flash'],
                    ['value' => 'gemini-3.1-pro', 'label' => 'Gemini 3.1 Pro'],
                ],
            ],
            'openai' => [
                'label' => 'OpenAI',
                'default_model' => 'gpt-4o-mini',
                'models' => [
                    ['value' => 'gpt-4o-mini', 'label' => 'GPT-4o Mini'],
                    ['value' => 'gpt-4o', 'label' => 'GPT-4o'],
                    ['value' => 'o1-mini', 'label' => 'o1 Mini'],
                    ['value' => 'o3-mini', 'label' => 'o3 Mini'],
                ],
            ],
            'anthropic' => [
                'label' => 'Anthropic Claude',
                'default_model' => 'claude-3-5-haiku-latest',
                'models' => [
                    ['value' => 'claude-3-5-haiku-latest', 'label' => 'Claude 3.5 Haiku'],
                    ['value' => 'claude-3-5-sonnet-latest', 'label' => 'Claude 3.5 Sonnet'],
                ],
            ],
        ];
    }

    public function defaultProvider(): string
    {
        return 'gemini';
    }

    public function defaultModelFor(string $provider): string
    {
        return $this->providers()[$provider]['default_model'] ?? '';
    }

    public function isValidProvider(string $provider): bool
    {
        return array_key_exists($provider, $this->providers());
    }

    public function isValidModel(string $provider, string $model): bool
    {
        return in_array($model, $this->modelValuesFor($provider), true);
    }

    public function providerRule(): In
    {
        return Rule::in(array_keys($this->providers()));
    }

    public function modelRuleFor(string $provider): In
    {
        return Rule::in($this->modelValuesFor($provider));
    }

    public function labelFor(string $provider): string
    {
        return $this->providers()[$provider]['label'] ?? $provider;
    }

    public function modelLabelFor(string $provider, string $model): string
    {
        $models = $this->providers()[$provider]['models'] ?? [];

        foreach ($models as $option) {
            if ($option['value'] === $model) {
                return $option['label'];
            }
        }

        if (preg_match('/^gemini-(1|2)(?:\.|-)\d+/i', $model) === 1) {
            return 'Gemini Legacy Model';
        }

        return $this->formatModelName($model);
    }

    public function resolvedModelLabelFor(?string $provider, ?string $model): string
    {
        $resolvedProvider = $this->isValidProvider((string) $provider) ? (string) $provider : $this->defaultProvider();
        $resolvedModel = (string) $model;

        if (! $this->isValidModel($resolvedProvider, $resolvedModel)) {
            $resolvedModel = $this->defaultModelFor($resolvedProvider);
        }

        return $this->modelLabelFor($resolvedProvider, $resolvedModel);
    }

    public function displayModelName(string $model): string
    {
        $parts = explode(':', $model, 2);

        if (count($parts) === 2 && $this->isValidProvider($parts[0])) {
            return $this->modelLabelFor($parts[0], $parts[1]);
        }

        if (preg_match('/^gemini-(1|2)(?:\.|-)\d+/i', $model) === 1) {
            return 'Gemini Legacy Model';
        }

        return $this->formatModelName($model);
    }

    /**
     * @return array<int, string>
     */
    private function modelValuesFor(string $provider): array
    {
        return array_column($this->providers()[$provider]['models'] ?? [], 'value');
    }

    private function formatModelName(string $model): string
    {
        $formatted = preg_replace('/\s+/', ' ', str_replace(['-', '_'], ' ', $model));

        return collect(explode(' ', trim((string) $formatted)))
            ->filter()
            ->map(function (string $part): string {
                if (preg_match('/^\d+(?:\.\d+)?$/', $part) === 1) {
                    return $part;
                }

                return match (strtolower($part)) {
                    'gpt' => 'GPT',
                    'ai' => 'AI',
                    default => ucfirst(strtolower($part)),
                };
            })
            ->implode(' ');
    }
}
