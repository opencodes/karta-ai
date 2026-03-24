<?php

declare(strict_types=1);

namespace App\Http;

final class Request
{
    public string $method;
    public string $path;

    /** @var array<string, mixed> */
    public array $query;

    /** @var array<string, mixed> */
    public array $body;

    /** @var array<string, mixed> */
    public array $params = [];

    /** @var array<string, mixed> */
    public array $files;

    /** @var array<string, string> */
    public array $headers;

    /** @var array<string, mixed> */
    public array $attributes = [];

    /**
     * @param array<string, mixed> $query
     * @param array<string, mixed> $body
     * @param array<string, mixed> $files
     * @param array<string, string> $headers
     */
    public function __construct(
        string $method,
        string $path,
        array $query,
        array $body,
        array $files,
        array $headers
    ) {
        $this->method = strtoupper($method);
        $this->path = $path;
        $this->query = $query;
        $this->body = $body;
        $this->files = $files;
        $this->headers = $headers;
    }

    public static function capture(): self
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';

        $body = $_POST;
        if (empty($body)) {
            $raw = file_get_contents('php://input');
            $decoded = is_string($raw) ? json_decode($raw, true) : null;
            if (is_array($decoded)) {
                $body = $decoded;
            }
        }

        return new self(
            $method,
            $path,
            is_array($_GET) ? $_GET : [],
            is_array($body) ? $body : [],
            is_array($_FILES) ? $_FILES : [],
            self::headers()
        );
    }

    public function header(string $name): ?string
    {
        $key = strtolower($name);
        return $this->headers[$key] ?? null;
    }

    public function user(): ?array
    {
        $user = $this->attributes['user'] ?? null;
        return is_array($user) ? $user : null;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function uploadedFiles(string $field): array
    {
        $file = $this->files[$field] ?? null;
        if (!is_array($file) || !isset($file['name'])) {
            return [];
        }

        if (!is_array($file['name'])) {
            return [$file];
        }

        $items = [];
        foreach ($file['name'] as $index => $name) {
            $items[] = [
                'name' => $name,
                'type' => $file['type'][$index] ?? '',
                'tmp_name' => $file['tmp_name'][$index] ?? '',
                'error' => $file['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                'size' => $file['size'][$index] ?? 0,
            ];
        }

        return $items;
    }

    /**
     * @return array<string, string>
     */
    private static function headers(): array
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        if (!is_array($headers)) {
            $headers = [];
        }

        $normalized = [];
        foreach ($headers as $key => $value) {
            $normalized[strtolower((string) $key)] = (string) $value;
        }

        return $normalized;
    }
}
