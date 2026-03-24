<?php

declare(strict_types=1);

[$router] = require dirname(__DIR__) . '/src/bootstrap.php';

use App\Http\Request;
use App\Support\HttpException;

header('Access-Control-Allow-Origin: ' . ($_ENV['CORS_ORIGIN'] ?? 'http://localhost:3000'));
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json');

try {
    $request = Request::capture();
    $payload = $router->dispatch($request);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
} catch (HttpException $exception) {
    http_response_code($exception->status());
    echo json_encode($exception->payload() + ['error' => $exception->getMessage()], JSON_UNESCAPED_SLASHES);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error'], JSON_UNESCAPED_SLASHES);
}
