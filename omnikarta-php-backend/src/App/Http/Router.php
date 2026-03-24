<?php

declare(strict_types=1);

namespace App\Http;

use App\Support\HttpException;

final class Router
{
    /** @var array<int, array{method:string, path:string, handler:callable}> */
    private array $routes = [];

    public function add(string $method, string $path, callable $handler): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
        ];
    }

    public function dispatch(Request $request): mixed
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $request->method) {
                continue;
            }

            $params = $this->match($route['path'], $request->path);
            if ($params === null) {
                continue;
            }

            $request->params = $params;
            return ($route['handler'])($request);
        }

        throw new HttpException(404, 'Not found', ['error' => 'Not found']);
    }

    /**
     * @return array<string, string>|null
     */
    private function match(string $routePath, string $requestPath): ?array
    {
        $pattern = preg_replace_callback('/\:([A-Za-z_][A-Za-z0-9_]*)/', static function (array $matches): string {
            return '(?P<' . $matches[1] . '>[^/]+)';
        }, $routePath);

        $regex = '#^' . $pattern . '$#';
        if (preg_match($regex, $requestPath, $matches) !== 1) {
            return null;
        }

        $params = [];
        foreach ($matches as $key => $value) {
            if (!is_int($key)) {
                $params[$key] = urldecode($value);
            }
        }

        return $params;
    }
}
