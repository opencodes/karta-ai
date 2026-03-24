<?php

declare(strict_types=1);

namespace App\Modules;

use App\Http\Router;
use App\Service\KartaService;

final class LoadModules
{
    public static function load(Router $router, KartaService $service): void
    {
        $modules = Config\Modules::enabled();
        $registry = Runtime\BackendRouteRegistry::all();

        foreach ($modules as $module) {
            $moduleName = (string) ($module['name'] ?? '');
            $routes = is_array($module['backend']['routes'] ?? null) ? $module['backend']['routes'] : [];

            foreach ($routes as $routeDef) {
                $routeKey = (string) ($routeDef[Types::ROUTE_KEY] ?? '');
                $mountPath = (string) ($routeDef[Types::MOUNT_PATH] ?? '');
                $registrar = $registry[$routeKey] ?? null;

                if (!is_string($registrar) || !class_exists($registrar)) {
                    continue;
                }

                $basePath = '/api/' . $moduleName . $mountPath;
                $registrar::register($router, $service, $basePath);
            }
        }
    }
}
