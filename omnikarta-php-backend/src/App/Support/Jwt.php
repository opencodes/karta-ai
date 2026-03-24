<?php

declare(strict_types=1);

namespace App\Support;

final class Jwt
{
    /**
     * @param array<string, mixed> $payload
     */
    public static function encode(array $payload, string $secret, string $expiresIn): string
    {
        $payload['exp'] = time() + self::expiresInSeconds($expiresIn);
        $encoded = self::base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));
        $signature = hash_hmac('sha256', $encoded, $secret, true);
        return $encoded . '.' . self::base64UrlEncode($signature);
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function decode(string $token, string $secret): ?array
    {
        [$encoded, $signature] = array_pad(explode('.', $token, 2), 2, null);
        if (!$encoded || !$signature) {
            return null;
        }

        $expected = self::base64UrlEncode(hash_hmac('sha256', $encoded, $secret, true));
        if (!hash_equals($expected, $signature)) {
            return null;
        }

        $json = self::base64UrlDecode($encoded);
        if ($json === false) {
            return null;
        }

        $payload = json_decode($json, true);
        if (!is_array($payload)) {
            return null;
        }

        if (!isset($payload['exp']) || (int) $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    private static function expiresInSeconds(string $value): int
    {
        if (preg_match('/^(\d+)([smhd])$/', $value, $matches) !== 1) {
            return 7 * 24 * 60 * 60;
        }

        $amount = (int) $matches[1];
        return match ($matches[2]) {
            's' => $amount,
            'm' => $amount * 60,
            'h' => $amount * 3600,
            'd' => $amount * 86400,
            default => 7 * 24 * 60 * 60,
        };
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string|false
    {
        $padding = strlen($value) % 4;
        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        return base64_decode(strtr($value, '-_', '+/'), true);
    }
}
