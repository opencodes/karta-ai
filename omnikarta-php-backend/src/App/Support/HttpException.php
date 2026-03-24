<?php

declare(strict_types=1);

namespace App\Support;

use RuntimeException;

final class HttpException extends RuntimeException
{
    /** @var array<string, mixed> */
    private array $payload;

    /**
     * @param array<string, mixed> $payload
     */
    public function __construct(int $status, string $message, array $payload = [])
    {
        parent::__construct($message, $status);
        $this->payload = $payload;
    }

    public function status(): int
    {
        return $this->getCode();
    }

    /**
     * @return array<string, mixed>
     */
    public function payload(): array
    {
        return $this->payload;
    }
}
