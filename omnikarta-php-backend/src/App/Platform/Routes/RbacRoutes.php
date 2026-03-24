<?php

declare(strict_types=1);

namespace App\Platform\Routes;

use App\Http\Request;
use App\Http\Router;
use App\Service\KartaService;

final class RbacRoutes
{
    public static function register(Router $router, KartaService $service): void
    {
        $router->add('GET', '/api/rbac/me', fn (Request $request) => $service->rbacMe($request));
        $router->add('GET', '/api/rbac/can/:permission', fn (Request $request) => $service->rbacCan($request));
        $router->add('POST', '/api/rbac/test/users/create', fn (Request $request) => $service->rbacTest($request, 'users.create'));
        $router->add('POST', '/api/rbac/test/tickets/assign', fn (Request $request) => $service->rbacTest($request, 'tickets.assign'));
        $router->add('GET', '/api/rbac/test/billing/view', fn (Request $request) => $service->rbacTest($request, 'billing.view'));
    }
}
