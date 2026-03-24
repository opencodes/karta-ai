<?php

declare(strict_types=1);

namespace App\Platform\Routes;

use App\Http\Request;
use App\Http\Router;
use App\Service\KartaService;

final class AuthRoutes
{
    public static function register(Router $router, KartaService $service): void
    {
        $router->add('POST', '/api/auth/signup', fn (Request $request) => $service->signup($request));
        $router->add('POST', '/api/auth/login', fn (Request $request) => $service->login($request));
        $router->add('GET', '/api/auth/me', fn (Request $request) => $service->me($request));
        $router->add('PATCH', '/api/auth/me/profile', fn (Request $request) => $service->updateMyProfile($request));
        $router->add('GET', '/api/auth/users', fn (Request $request) => $service->listUsers($request));
        $router->add('POST', '/api/auth/users', fn (Request $request) => $service->createUserByRoot($request));
        $router->add('PATCH', '/api/auth/users/:id/role', fn (Request $request) => $service->updateUserRole($request));
        $router->add('PATCH', '/api/auth/users/:id/status', fn (Request $request) => $service->updateUserStatus($request));
        $router->add('GET', '/api/auth/organizations', fn (Request $request) => $service->listOrganizations($request));
        $router->add('POST', '/api/auth/organizations', fn (Request $request) => $service->createOrganization($request));
        $router->add('PATCH', '/api/auth/organizations/:id/status', fn (Request $request) => $service->updateOrganizationStatus($request));
        $router->add('PATCH', '/api/auth/organizations/:id/owner', fn (Request $request) => $service->updateOrganizationOwner($request));
    }
}
