<?php

declare(strict_types=1);

namespace App\Support;

final class Cache
{
    /** @var array<string, array{expires:int, value:mixed}> */
    private array $entries = [];

    public function get(string $key): mixed
    {
        $entry = $this->entries[$key] ?? null;
        if ($entry === null) {
            return null;
        }

        if ($entry['expires'] < time()) {
            unset($this->entries[$key]);
            return null;
        }

        return $entry['value'];
    }

    public function set(string $key, mixed $value, int $ttlSeconds = 60): void
    {
        $this->entries[$key] = [
            'expires' => time() + $ttlSeconds,
            'value' => $value,
        ];
    }
}
