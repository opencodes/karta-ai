<?php

declare(strict_types=1);

namespace App\Platform\Routes;

use App\Http\Request;
use App\Http\Router;
use App\Service\KartaService;

final class OrgAdminRoutes
{
    public static function register(Router $router, KartaService $service): void
    {
        $router->add('POST', '/api/org-admin/module-requests', fn (Request $request) => $service->orgAdminCreateModuleRequest($request));
        $router->add('GET', '/api/org-admin/module-requests/mine', fn (Request $request) => $service->orgAdminMyModuleRequests($request));
        $router->add('GET', '/api/org-admin/module-requests', fn (Request $request) => $service->orgAdminModuleRequests($request));
        $router->add('PATCH', '/api/org-admin/module-requests/:id', fn (Request $request) => $service->orgAdminResolveModuleRequest($request));
        $router->add('GET', '/api/org-admin/overview', fn (Request $request) => $service->orgAdminOverview($request));
        $router->add('GET', '/api/org-admin/users', fn (Request $request) => $service->orgAdminUsers($request));
        $router->add('POST', '/api/org-admin/users', fn (Request $request) => $service->orgAdminCreateUser($request));
        $router->add('PATCH', '/api/org-admin/users/:id/role', fn (Request $request) => $service->orgAdminUpdateUserRole($request));
        $router->add('PATCH', '/api/org-admin/users/:id/status', fn (Request $request) => $service->orgAdminUpdateUserStatus($request));
        $router->add('GET', '/api/org-admin/users/:id/modules', fn (Request $request) => $service->orgAdminUserModules($request));
        $router->add('PATCH', '/api/org-admin/users/:id/modules', fn (Request $request) => $service->orgAdminUpdateUserModules($request));
        $router->add('GET', '/api/org-admin/roles', fn (Request $request) => $service->orgAdminRoles($request));
        $router->add('POST', '/api/org-admin/roles', fn (Request $request) => $service->orgAdminCreateRole($request));
        $router->add('GET', '/api/org-admin/permissions', fn (Request $request) => $service->orgAdminPermissions($request));
        $router->add('GET', '/api/org-admin/roles/:id/permissions', fn (Request $request) => $service->orgAdminRolePermissions($request));
        $router->add('PUT', '/api/org-admin/roles/:id/permissions', fn (Request $request) => $service->orgAdminSaveRolePermissions($request));
        $router->add('GET', '/api/org-admin/modules', fn (Request $request) => $service->orgAdminModules($request));
        $router->add('PATCH', '/api/org-admin/modules/:moduleId', fn (Request $request) => $service->orgAdminUpdateModule($request));
        $router->add('GET', '/api/org-admin/settings', fn (Request $request) => $service->orgAdminSettings($request));
        $router->add('PATCH', '/api/org-admin/settings', fn (Request $request) => $service->orgAdminUpdateSettings($request));
        $router->add('POST', '/api/org-admin/ebooks', fn (Request $request) => $service->orgAdminUploadEbook($request));
        $router->add('GET', '/api/org-admin/school-config', fn (Request $request) => $service->orgAdminSchoolConfig($request));
        $router->add('PUT', '/api/org-admin/school-config', fn (Request $request) => $service->orgAdminSaveSchoolConfig($request));
        $router->add('GET', '/api/org-admin/reports', fn (Request $request) => $service->orgAdminReports($request));
        $router->add('GET', '/api/org-admin/billing/catalog/modules', fn (Request $request) => $service->orgAdminBillingCatalog($request));
        $router->add('GET', '/api/org-admin/billing/subscriptions', fn (Request $request) => $service->orgAdminBillingSubscriptions($request));
        $router->add('POST', '/api/org-admin/billing/buy-module', fn (Request $request) => $service->orgAdminBillingBuyModule($request));
        $router->add('GET', '/api/org-admin/billing', fn (Request $request) => $service->orgAdminBilling($request));
        $router->add('GET', '/api/org-admin/api-keys', fn (Request $request) => $service->orgAdminApiKeys($request));
        $router->add('POST', '/api/org-admin/api-keys', fn (Request $request) => $service->orgAdminCreateApiKey($request));
        $router->add('DELETE', '/api/org-admin/api-keys/:id', fn (Request $request) => $service->orgAdminDeleteApiKey($request));
    }
}
