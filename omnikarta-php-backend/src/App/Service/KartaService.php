<?php

declare(strict_types=1);

namespace App\Service;

use App\Http\Request;
use App\Support\Cache;
use App\Support\Database;
use App\Support\Env;
use App\Support\HttpException;
use App\Support\Jwt;
use DateTimeImmutable;
use Exception;

final class KartaService
{
    private Database $db;
    private Cache $cache;
    private string $jwtSecret;
    private string $jwtExpiresIn;

    public function __construct(Database $db, Cache $cache)
    {
        $this->db = $db;
        $this->cache = $cache;
        $this->jwtSecret = Env::get('JWT_SECRET', 'change-this-to-a-long-random-secret') ?? 'change-this-to-a-long-random-secret';
        $this->jwtExpiresIn = Env::get('JWT_EXPIRES_IN', '7d') ?? '7d';
    }

    public function health(): array
    {
        try {
            $this->db->one('SELECT 1 AS ok');
            return ['status' => 'ok', 'db' => 'connected'];
        } catch (\Throwable) {
            return ['status' => 'error', 'db' => 'disconnected'];
        }
    }

    public function signup(Request $request): array
    {
        $email = $this->requiredEmail($request->body, 'email');
        $password = $this->requiredString($request->body, 'password', 6, 200);

        if ($this->db->one('SELECT id FROM users WHERE email = ? LIMIT 1', [$email])) {
            throw new HttpException(409, 'Email is already registered', ['error' => 'Email is already registered']);
        }

        $userId = $this->uuid();
        $organizationId = $this->uuid();
        $organizationName = explode('@', $email)[0] . ' Organization';
        $organizationSlug = $this->makeOrganizationSlug($email);

        $this->db->transaction(function () use ($organizationId, $organizationName, $organizationSlug, $userId, $email, $password): void {
            $this->db->execute(
                "INSERT INTO organizations (id, name, slug, owner_user_id, plan, is_active)
                 VALUES (?, ?, ?, NULL, 'starter', 1)",
                [$organizationId, $organizationName, $organizationSlug]
            );

            $displayName = substr(explode('@', $email)[0] ?: '', 0, 120);
            $this->db->execute(
                "INSERT INTO users (id, email, full_name, phone_number, password_hash, role, organization_id, status, is_active)
                 VALUES (?, ?, ?, NULL, SHA2(?, 256), 'member', ?, 'active', 1)",
                [$userId, $email, $displayName, $password, $organizationId]
            );

            $this->db->execute(
                'UPDATE organizations SET owner_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [$userId, $organizationId]
            );

            $this->db->execute(
                "INSERT IGNORE INTO user_roles (id, user_id, role_id)
                 SELECT UUID(), ?, id FROM roles WHERE slug = 'member' AND is_system_role = 1 LIMIT 1",
                [$userId]
            );
        });

        $row = $this->db->one('SELECT * FROM users WHERE id = ? LIMIT 1', [$userId]);
        if ($row === null) {
            throw new HttpException(500, 'Failed to create user', ['error' => 'Failed to create user']);
        }

        return [
            'token' => $this->issueToken($row),
            'user' => $this->toUserDto($row),
        ];
    }

    public function login(Request $request): array
    {
        $email = $this->requiredEmail($request->body, 'email');
        $password = $this->requiredString($request->body, 'password', 1, 200);

        $row = $this->db->one(
            'SELECT * FROM users WHERE email = ? AND password_hash = SHA2(?, 256) AND is_active = 1 LIMIT 1',
            [$email, $password]
        );

        if ($row === null) {
            throw new HttpException(401, 'Invalid email or password', ['error' => 'Invalid email or password']);
        }

        return [
            'token' => $this->issueToken($row),
            'user' => $this->toUserDto($row),
        ];
    }

    public function me(Request $request): array
    {
        $user = $this->requireAuth($request);
        $row = $this->db->one('SELECT * FROM users WHERE id = ? AND is_active = 1 LIMIT 1', [$user['id']]);
        if ($row === null) {
            throw new HttpException(401, 'User not found or inactive', ['error' => 'User not found or inactive']);
        }

        return ['user' => $this->toUserDto($row)];
    }

    public function updateMyProfile(Request $request): array
    {
        $user = $this->requireAuth($request);
        $fullName = $this->requiredString($request->body, 'fullName', 2, 120);
        $phoneNumber = $this->requiredString($request->body, 'phoneNumber', 7, 20);

        if (!preg_match('/^[0-9+\-\s()]{7,20}$/', $phoneNumber)) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }

        $this->db->execute(
            'UPDATE users SET full_name = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [$fullName, $phoneNumber, $user['id']]
        );

        $row = $this->db->one('SELECT * FROM users WHERE id = ? AND is_active = 1 LIMIT 1', [$user['id']]);
        if ($row === null) {
            throw new HttpException(404, 'User not found or inactive', ['error' => 'User not found or inactive']);
        }

        return ['user' => $this->toUserDto($row), 'message' => 'Profile updated'];
    }

    public function listUsers(Request $request): array
    {
        $this->requireRoot($this->requireAuth($request));
        $rows = $this->db->all(
            "SELECT u.id, u.email, u.full_name, u.phone_number, u.role, u.status, u.is_root, u.is_active, u.organization_id, u.created_at,
                    o.name AS organization_name, o.slug AS organization_slug
             FROM users u
             LEFT JOIN organizations o ON o.id = u.organization_id
             ORDER BY u.created_at ASC"
        );

        return [
            'users' => array_map(function (array $row): array {
                return array_merge($this->toUserDto($row), [
                    'isActive' => (int) ($row['is_active'] ?? 0) === 1,
                    'status' => $row['status'] ?? 'active',
                    'organizationId' => $row['organization_id'] ?? null,
                    'organizationName' => $row['organization_name'] ?? null,
                    'organizationSlug' => $row['organization_slug'] ?? null,
                    'createdAt' => $row['created_at'] ?? null,
                ]);
            }, $rows),
        ];
    }

    public function createUserByRoot(Request $request): array
    {
        $this->requireRoot($this->requireAuth($request));
        $email = $this->requiredEmail($request->body, 'email');
        $password = $this->requiredString($request->body, 'password', 6, 200);
        $organizationId = $this->requiredString($request->body, 'organizationId', 36, 36);
        $role = $this->requiredEnum($request->body, 'role', ['admin', 'superadmin', 'member']);
        $status = $this->optionalEnum($request->body, 'status', ['active', 'invited', 'disabled']) ?? 'active';

        if ($this->db->one('SELECT id FROM users WHERE email = ? LIMIT 1', [$email])) {
            throw new HttpException(409, 'Email is already registered', ['error' => 'Email is already registered']);
        }
        if (!$this->db->one('SELECT id FROM organizations WHERE id = ? LIMIT 1', [$organizationId])) {
            throw new HttpException(404, 'Organization not found', ['error' => 'Organization not found']);
        }

        $this->db->transaction(function () use ($email, $password, $organizationId, $role, $status): void {
            $this->db->execute(
                'INSERT INTO users (id, email, password_hash, role, is_root, organization_id, status, is_active)
                 VALUES (UUID(), ?, SHA2(?, 256), ?, 0, ?, ?, ?)',
                [$email, $password, $role, $organizationId, $status, $status === 'disabled' ? 0 : 1]
            );

            $this->db->execute(
                'INSERT IGNORE INTO user_roles (id, user_id, role_id)
                 SELECT UUID(), u.id, r.id
                 FROM users u
                 INNER JOIN roles r ON r.slug = ? AND r.is_system_role = 1
                 WHERE u.email = ?
                 LIMIT 1',
                [$role, $email]
            );
        });

        return ['message' => 'User created'];
    }

    public function updateUserRole(Request $request): array
    {
        $this->requireRoot($this->requireAuth($request));
        $id = $request->params['id'] ?? '';
        $role = $this->requiredEnum($request->body, 'role', ['admin', 'superadmin', 'member']);
        $target = $this->db->one('SELECT id, email, role, is_root FROM users WHERE id = ? LIMIT 1', [$id]);
        if ($target === null) {
            throw new HttpException(404, 'User not found', ['error' => 'User not found']);
        }
        if ((int) ($target['is_root'] ?? 0) === 1) {
            throw new HttpException(403, 'Root role cannot be modified', ['error' => 'Root role cannot be modified']);
        }

        $this->db->execute('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [$role, $id]);
        $updated = $this->db->one('SELECT * FROM users WHERE id = ? LIMIT 1', [$id]);
        return ['user' => $updated ? $this->toUserDto($updated) : null];
    }

    public function updateUserStatus(Request $request): array
    {
        $this->requireRoot($this->requireAuth($request));
        $id = $request->params['id'] ?? '';
        $status = $this->requiredEnum($request->body, 'status', ['active', 'invited', 'disabled']);
        $target = $this->db->one('SELECT id, is_root FROM users WHERE id = ? LIMIT 1', [$id]);
        if ($target === null) {
            throw new HttpException(404, 'User not found', ['error' => 'User not found']);
        }
        if ((int) ($target['is_root'] ?? 0) === 1) {
            throw new HttpException(403, 'Root user status cannot be modified', ['error' => 'Root user status cannot be modified']);
        }

        $this->db->execute(
            'UPDATE users SET status = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [$status, $status === 'disabled' ? 0 : 1, $id]
        );

        return ['message' => 'User status updated'];
    }

    public function listOrganizations(Request $request): array
    {
        $this->requireRoot($this->requireAuth($request));
        $rows = $this->db->all(
            "SELECT o.id, o.name, o.slug, o.plan, o.is_active, o.owner_user_id, o.created_at, o.updated_at,
                    owner.email AS owner_email, COUNT(u.id) AS user_count
             FROM organizations o
             LEFT JOIN users owner ON owner.id = o.owner_user_id
             LEFT JOIN users u ON u.organization_id = o.id
             GROUP BY o.id, o.name, o.slug, o.plan, o.is_active, o.owner_user_id, o.created_at, o.updated_at, owner.email
             ORDER BY o.created_at ASC"
        );

        return [
            'organizations' => array_map(static fn (array $row): array => [
                'id' => $row['id'],
                'name' => $row['name'],
                'slug' => $row['slug'],
                'plan' => $row['plan'],
                'isActive' => (int) ($row['is_active'] ?? 0) === 1,
                'ownerUserId' => $row['owner_user_id'] ?? null,
                'ownerEmail' => $row['owner_email'] ?? null,
                'userCount' => (int) ($row['user_count'] ?? 0),
                'createdAt' => $row['created_at'],
                'updatedAt' => $row['updated_at'],
            ], $rows),
        ];
    }

    public function createOrganization(Request $request): array
    {
        $this->requireRoot($this->requireAuth($request));
        $name = $this->requiredString($request->body, 'name', 2, 255);
        $slug = $this->optionalString($request->body, 'slug', 2, 255)
            ?? preg_replace('/^-+|-+$/', '', preg_replace('/[^a-z0-9]+/', '-', strtolower($name)) ?? '');
        $plan = $this->optionalString($request->body, 'plan', 1, 120) ?? 'starter';
        $ownerUserId = $this->optionalString($request->body, 'ownerUserId', 0, 64);

        $this->db->execute(
            'INSERT INTO organizations (id, name, slug, owner_user_id, plan, is_active) VALUES (UUID(), ?, ?, ?, ?, 1)',
            [$name, $slug, $ownerUserId ?: null, $plan]
        );

        return ['message' => 'Organization created'];
    }

    public function updateOrganizationStatus(Request $request): array
    {
        $this->requireRoot($this->requireAuth($request));
        $id = $request->params['id'] ?? '';
        $isActive = $this->requiredBool($request->body, 'isActive');
        $this->db->execute(
            'UPDATE organizations SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [$isActive ? 1 : 0, $id]
        );
        return ['message' => 'Organization status updated'];
    }

    public function updateOrganizationOwner(Request $request): array
    {
        $this->requireRoot($this->requireAuth($request));
        $id = $request->params['id'] ?? '';
        $ownerUserId = $request->body['ownerUserId'] ?? null;
        $ownerUserId = is_string($ownerUserId) && trim($ownerUserId) !== '' ? trim($ownerUserId) : null;
        $this->db->execute(
            'UPDATE organizations SET owner_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [$ownerUserId, $id]
        );
        return ['message' => 'Organization owner updated'];
    }

    public function catalogModules(): array
    {
        $rows = $this->db->all(
            "SELECT m.name AS module_name, m.display_name, m.description, m.icon, m.route_prefix, m.version,
                    sp.name AS plan_name, sp.price_monthly, sp.price_yearly, sp.currency
             FROM modules m
             INNER JOIN plan_modules pm ON pm.module_id = m.id AND pm.is_enabled = 1
             INNER JOIN (
               SELECT plan_id FROM plan_modules WHERE is_enabled = 1 GROUP BY plan_id HAVING COUNT(*) = 1
             ) single_module_plans ON single_module_plans.plan_id = pm.plan_id
             INNER JOIN subscription_plans sp ON sp.id = single_module_plans.plan_id AND sp.is_active = 1
             WHERE m.is_active = 1 AND IFNULL(sp.price_monthly, 0) > 0
             ORDER BY m.display_name ASC"
        );
        return ['modules' => $rows];
    }

    public function adminModules(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireRoot($user);
        return [
            'modules' => $this->db->all(
                'SELECT id, name, slug, display_name, description, icon, route_prefix, version, is_core, is_active, created_at
                 FROM modules ORDER BY name ASC'
            ),
        ];
    }

    public function createAdminModule(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireRoot($user);
        $name = $this->requiredString($request->body, 'name', 2, 120);
        $slug = $this->requiredString($request->body, 'slug', 2, 120);
        $displayName = $this->optionalString($request->body, 'displayName', 0, 255);
        $description = $this->optionalString($request->body, 'description', 0, 2000);
        $icon = $this->optionalString($request->body, 'icon', 0, 255);
        $routePrefix = $this->optionalString($request->body, 'routePrefix', 0, 255);
        $version = $this->optionalString($request->body, 'version', 0, 50);
        $isCore = $this->optionalBool($request->body, 'isCore') ?? false;
        $isActive = $this->optionalBool($request->body, 'isActive') ?? true;

        if ($this->db->one('SELECT id FROM modules WHERE slug = ? OR name = ? LIMIT 1', [$slug, $name])) {
            throw new HttpException(409, 'Module name or slug already exists', ['error' => 'Module name or slug already exists']);
        }

        $this->db->execute(
            'INSERT INTO modules (id, name, slug, display_name, description, icon, route_prefix, version, is_core, is_active)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [$name, $slug, $displayName, $description, $icon, $routePrefix, $version, $isCore ? 1 : 0, $isActive ? 1 : 0]
        );

        return ['message' => 'Module created'];
    }

    public function listOrgModuleRequests(Request $request): array
    {
        $this->requireRoot($this->requireAuth($request));
        $rows = $this->db->all(
            "SELECT os.id AS subscription_id, os.organization_id, os.plan_id, os.status, os.start_date, os.end_date,
                    os.created_at, os.updated_at, o.name AS organization_name, o.slug AS organization_slug,
                    sp.name AS plan_name, sp.display_name AS plan_display_name,
                    IFNULL(GROUP_CONCAT(DISTINCT m.name ORDER BY m.name SEPARATOR ','), '') AS modules
             FROM organization_subscriptions os
             INNER JOIN organizations o ON o.id = os.organization_id
             INNER JOIN subscription_plans sp ON sp.id = os.plan_id
             LEFT JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
             LEFT JOIN modules m ON m.id = pm.module_id
             WHERE os.status IN ('pending_approval', 'approved', 'rejected')
             GROUP BY os.id, os.organization_id, os.plan_id, os.status, os.start_date, os.end_date, os.created_at, os.updated_at,
                      o.name, o.slug, sp.name, sp.display_name
             ORDER BY os.updated_at DESC"
        );

        return [
            'requests' => array_map(fn (array $row): array => [
                'subscriptionId' => $row['subscription_id'],
                'organizationId' => $row['organization_id'],
                'planId' => $row['plan_id'],
                'status' => $row['status'],
                'startDate' => $row['start_date'],
                'endDate' => $row['end_date'],
                'createdAt' => $row['created_at'],
                'updatedAt' => $row['updated_at'],
                'organizationName' => $row['organization_name'],
                'organizationSlug' => $row['organization_slug'],
                'planName' => $row['plan_name'],
                'planDisplayName' => $row['plan_display_name'],
                'modules' => $this->splitCsv($row['modules'] ?? ''),
            ], $rows),
        ];
    }

    public function resolveOrgModuleRequest(Request $request): array
    {
        $this->requireRoot($this->requireAuth($request));
        $subscriptionId = $request->params['subscriptionId'] ?? '';
        $action = $this->requiredEnum($request->body, 'action', ['approved', 'rejected']);
        $subscription = $this->db->one(
            'SELECT id, organization_id, plan_id, status FROM organization_subscriptions WHERE id = ? LIMIT 1',
            [$subscriptionId]
        );
        if ($subscription === null) {
            throw new HttpException(404, 'Organization module request not found', ['error' => 'Organization module request not found']);
        }
        if (($subscription['status'] ?? '') !== 'pending_approval') {
            throw new HttpException(400, 'Only pending requests can be processed', ['error' => 'Only pending requests can be processed']);
        }

        $this->db->transaction(function () use ($subscriptionId, $subscription, $action): void {
            if ($action === 'approved') {
                $this->db->execute(
                    "UPDATE organization_subscriptions
                     SET status = 'approved', start_date = UTC_TIMESTAMP(), end_date = NULL, updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?",
                    [$subscriptionId]
                );

                $this->db->execute(
                    "INSERT INTO organization_modules (id, organization_id, module_id, status, starts_at, expires_at)
                     SELECT UUID(), ?, pm.module_id, 'active', UTC_TIMESTAMP(), NULL
                     FROM plan_modules pm
                     WHERE pm.plan_id = ? AND pm.is_enabled = 1
                     ON DUPLICATE KEY UPDATE status = 'active', starts_at = UTC_TIMESTAMP(), expires_at = NULL",
                    [$subscription['organization_id'], $subscription['plan_id']]
                );

                $this->db->execute(
                    "UPDATE organization_subscriptions SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [$subscriptionId]
                );
            } else {
                $this->db->execute(
                    "UPDATE organization_subscriptions
                     SET status = 'rejected', end_date = UTC_TIMESTAMP(), updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?",
                    [$subscriptionId]
                );
            }
        });

        return ['message' => $action === 'approved' ? 'Request approved' : 'Request rejected'];
    }

    public function myAccess(Request $request): array
    {
        $user = $this->requireAuth($request);
        if (($user['isRoot'] ?? false) || ($user['role'] ?? '') === 'root') {
            $rows = $this->db->all('SELECT name FROM modules WHERE is_active = 1 ORDER BY name ASC');
            return ['modules' => array_map(static fn (array $row): string => (string) $row['name'], $rows)];
        }

        return ['modules' => $this->getUserEntitledModules((string) $user['id'])];
    }

    public function mySubscriptions(Request $request): array
    {
        $user = $this->requireAuth($request);
        return ['subscriptions' => $this->getUserSubscriptionDetails((string) $user['id'])];
    }

    public function buyModule(Request $request): array
    {
        $user = $this->requireAuth($request);
        if (in_array($user['role'] ?? '', ['admin', 'superadmin'], true)) {
            throw new HttpException(403, 'Organization admins must use organization billing purchase flow', ['error' => 'Organization admins must use organization billing purchase flow']);
        }

        $moduleName = $this->requiredString($request->body, 'moduleName', 1, 120);
        $planRow = $this->db->one(
            "SELECT sp.id AS plan_id
             FROM subscription_plans sp
             INNER JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
             INNER JOIN modules m ON m.id = pm.module_id AND m.is_active = 1
             WHERE m.name = ? AND sp.is_active = 1 AND IFNULL(sp.price_monthly, 0) > 0
             GROUP BY sp.id HAVING COUNT(pm.module_id) = 1 LIMIT 1",
            [$moduleName]
        );
        if ($planRow === null) {
            throw new HttpException(404, 'Module purchase plan not found', ['error' => 'Module purchase plan not found']);
        }

        $this->db->execute(
            "INSERT INTO user_subscriptions (id, user_id, plan_id, status, start_date, end_date, auto_renew)
             VALUES (UUID(), ?, ?, 'active', UTC_TIMESTAMP(), NULL, 1)
             ON DUPLICATE KEY UPDATE status = 'active', start_date = UTC_TIMESTAMP(), end_date = NULL, updated_at = CURRENT_TIMESTAMP",
            [$user['id'], $planRow['plan_id']]
        );

        return ['message' => 'Module purchased', 'modules' => $this->getUserEntitledModules((string) $user['id'])];
    }

    public function rbacMe(Request $request): array
    {
        $user = $this->requireAuth($request);
        $snapshot = $this->getUserAuthorizationSnapshot((string) $user['id']);
        if ($snapshot === null) {
            throw new HttpException(404, 'User not found', ['error' => 'User not found']);
        }
        return $snapshot;
    }

    public function rbacCan(Request $request): array
    {
        $user = $this->requireAuth($request);
        return $this->canUser((string) $user['id'], (string) ($request->params['permission'] ?? ''));
    }

    public function rbacTest(Request $request, string $permission): array
    {
        $user = $this->requireAuth($request);
        $result = $this->canUser((string) $user['id'], $permission);
        if (!($result['allowed'] ?? false)) {
            throw new HttpException(403, $result['reason'] ?? 'Forbidden', ['error' => $result['reason'] ?? 'Forbidden']);
        }
        return ['ok' => true, 'message' => $permission . ' permission granted'];
    }

    public function createTask(Request $request): array
    {
        $this->requireAuth($request);
        $rawInput = $this->requiredString($request->body, 'rawInput', 1, 400);
        $parsed = $this->parseTaskInput($rawInput);
        $id = $this->uuid();

        $this->db->execute(
            "INSERT INTO tasks (id, raw_input, title, category, tags, task_time, task_date, recurring, due_date, featured, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending')",
            [
                $id,
                $rawInput,
                $parsed['title'],
                $parsed['category'],
                json_encode($parsed['tags'], JSON_THROW_ON_ERROR),
                $parsed['time'],
                $parsed['date'],
                $parsed['recurring'],
                $parsed['dueDate'],
            ]
        );

        $row = $this->db->one('SELECT * FROM tasks WHERE id = ? LIMIT 1', [$id]);
        return ['task' => $row ? $this->toTaskDto($row) : null];
    }

    public function listTasks(Request $request): array
    {
        $this->requireAuth($request);
        $bucket = is_string($request->query['bucket'] ?? null) ? $request->query['bucket'] : 'all';
        $rows = $this->db->all('SELECT * FROM tasks ORDER BY due_date ASC');
        $tasks = array_map(fn (array $row): array => $this->toTaskDto($row), $rows);

        if ($bucket === 'featured') {
            $tasks = array_values(array_filter($tasks, static fn (array $task): bool => (bool) ($task['featured'] ?? false)));
        } elseif ($bucket === 'now') {
            $tasks = array_values(array_filter($tasks, fn (array $task): bool => $this->isInNextHours((string) $task['dueDate'], 4)));
        } elseif ($bucket === 'later') {
            $tasks = array_values(array_filter($tasks, fn (array $task): bool => !$this->isInNextHours((string) $task['dueDate'], 4)));
        }

        return ['tasks' => $tasks];
    }

    public function updateTaskFeature(Request $request): array
    {
        $this->requireAuth($request);
        $featured = $this->requiredBool($request->body, 'featured');
        $id = $request->params['id'] ?? '';
        $count = $this->db->execute('UPDATE tasks SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [$featured ? 1 : 0, $id]);
        if ($count < 1) {
            throw new HttpException(404, 'Task not found', ['error' => 'Task not found']);
        }
        $row = $this->db->one('SELECT * FROM tasks WHERE id = ? LIMIT 1', [$id]);
        return ['task' => $row ? $this->toTaskDto($row) : null];
    }

    public function edukartaOverview(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        unset($user);
        return ['module' => 'edukarta', 'status' => 'active', 'features' => ['tasks', 'lesson-plan']];
    }

    public function edukartaGetProfile(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        $row = $this->db->one(
            'SELECT user_id, name, board, class_level, subjects, completed_at, updated_at
             FROM edukarta_student_profiles WHERE user_id = ? LIMIT 1',
            [$user['id']]
        );
        if ($row === null) {
            return ['profile' => null];
        }

        return [
            'profile' => [
                'name' => $row['name'],
                'board' => $row['board'],
                'classLevel' => $row['class_level'],
                'subjects' => $this->normalizeStringList($row['subjects'] ?? null),
                'completedAt' => $this->iso($row['completed_at'] ?? null),
                'updatedAt' => $this->iso($row['updated_at'] ?? null),
            ],
        ];
    }

    public function edukartaSaveProfile(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        $name = $this->requiredString($request->body, 'name', 2, 120);
        $board = $this->requiredString($request->body, 'board', 2, 80);
        $classLevel = $this->requiredString($request->body, 'classLevel', 1, 20);
        $subjects = $this->requiredStringArray($request->body, 'subjects', 1, 20, 1, 80);

        $this->db->execute(
            "INSERT INTO edukarta_student_profiles (user_id, organization_id, name, board, class_level, subjects, completed_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE organization_id = VALUES(organization_id), name = VALUES(name), board = VALUES(board),
                 class_level = VALUES(class_level), subjects = VALUES(subjects), updated_at = CURRENT_TIMESTAMP",
            [$user['id'], $user['organizationId'] ?? null, $name, $board, $classLevel, json_encode($subjects, JSON_THROW_ON_ERROR)]
        );

        return ['message' => 'EduKarta student profile saved'];
    }

    public function edukartaGetChapters(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        $rows = $this->db->all(
            'SELECT subject, chapter_name FROM edukarta_subject_chapters WHERE user_id = ? ORDER BY subject ASC, created_at ASC',
            [$user['id']]
        );

        $grouped = [];
        foreach ($rows as $row) {
            $grouped[$row['subject']] ??= [];
            $grouped[$row['subject']][] = $row['chapter_name'];
        }

        return ['chaptersBySubject' => $grouped];
    }

    public function edukartaSaveChapters(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        $subject = $this->requiredString($request->body, 'subject', 1, 80);
        $chapters = $this->requiredStringArray($request->body, 'chapters', 0, 200, 1, 500);
        $chapters = array_values(array_unique(array_filter(array_map([$this, 'sanitizeChapter'], $chapters))));

        $this->db->transaction(function () use ($user, $subject, $chapters): void {
            $this->db->execute(
                'DELETE FROM edukarta_subject_chapters WHERE user_id = ? AND subject = ?',
                [$user['id'], $subject]
            );

            foreach ($chapters as $chapter) {
                $this->db->execute(
                    'INSERT INTO edukarta_subject_chapters (id, user_id, organization_id, subject, chapter_name, created_at, updated_at)
                     VALUES (UUID(), ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                    [$user['id'], $user['organizationId'] ?? null, $subject, $chapter]
                );
            }
        });

        return ['message' => 'Subject chapters saved', 'subject' => $subject, 'count' => count($chapters)];
    }

    public function edukartaSuggestChapters(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        $subject = $this->requiredString($request->body, 'subject', 1, 80);
        $isbn = $this->optionalString($request->body, 'isbn', 10, 20);
        if ($isbn !== null) {
            $isbn = $this->normalizeIsbn($isbn);
            if (!$this->isValidIsbn($isbn)) {
                throw new HttpException(400, 'Invalid ISBN format. Use a valid ISBN-10 or ISBN-13.', ['error' => 'Invalid ISBN format. Use a valid ISBN-10 or ISBN-13.']);
            }
        }

        $profile = $this->db->one('SELECT board, class_level FROM edukarta_student_profiles WHERE user_id = ? LIMIT 1', [$user['id']]);
        $board = (string) ($profile['board'] ?? 'General');
        $classLevel = (string) ($profile['class_level'] ?? 'General');

        $bookChapters = $isbn ? $this->fetchBookChaptersByIsbn($isbn) : [];
        if ($bookChapters !== []) {
            return ['chapters' => $bookChapters, 'source' => 'book'];
        }

        $aiChapters = $this->suggestChaptersWithAi($subject, $board, $classLevel, $isbn);
        if ($aiChapters !== []) {
            return ['chapters' => $aiChapters, 'source' => 'ai'];
        }

        return ['chapters' => $this->fallbackChapterSuggestions($subject), 'source' => 'fallback'];
    }

    public function edukartaExtractChaptersFromImage(Request $request): array
    {
        $this->requireModuleUser($request, 'edukarta');
        $subject = $this->requiredString($request->body, 'subject', 1, 80);
        $imageDataUrl = $this->requiredString($request->body, 'imageDataUrl', 32, 4_000_000);
        if (!preg_match('/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+\/=]+$/i', $imageDataUrl)) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        if (!Env::get('HF_TOKEN')) {
            throw new HttpException(400, 'AI vision is not configured. Please set HF_TOKEN.', ['error' => 'AI vision is not configured. Please set HF_TOKEN.']);
        }

        $chapters = $this->extractChaptersFromImage($subject, $imageDataUrl);
        if ($chapters === []) {
            throw new HttpException(422, 'Could not extract chapters from the image. Try a clearer TOC photo.', ['error' => 'Could not extract chapters from the image. Try a clearer TOC photo.']);
        }

        return ['chapters' => $chapters, 'source' => 'ocr-ai'];
    }

    public function edukartaSummary(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        if (!Env::get('HF_TOKEN')) {
            throw new HttpException(400, 'AI summary is not configured. Please set HF_TOKEN.', ['error' => 'AI summary is not configured. Please set HF_TOKEN.']);
        }

        $subject = $this->requiredString($request->body, 'subject', 1, 80);
        $chapter = $this->requiredString($request->body, 'chapter', 1, 200);
        $ask = $this->optionalString($request->body, 'ask', 0, 400);
        $history = $this->optionalHistory($request->body['history'] ?? null);
        $profile = $this->db->one('SELECT board, class_level FROM edukarta_student_profiles WHERE user_id = ? LIMIT 1', [$user['id']]);
        $prompt = $this->buildChapterSummaryPrompt((string) ($profile['board'] ?? 'General'), (string) ($profile['class_level'] ?? 'General'), $subject, $chapter, $ask, $history);
        $summary = $this->hfGenerate($prompt, min($this->hfMaxTokens(), 900));
        if ($summary === null) {
            throw new HttpException(502, 'Failed to generate chapter summary. Please try again.', ['error' => 'Failed to generate chapter summary. Please try again.']);
        }

        return [
            'summary' => trim($summary),
            'context' => [
                'board' => (string) ($profile['board'] ?? 'General'),
                'classLevel' => (string) ($profile['class_level'] ?? 'General'),
                'subject' => $subject,
                'chapter' => $chapter,
            ],
        ];
    }

    public function edukartaGetQa(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        $subject = $this->requiredQueryString($request, 'subject', 1, 80);
        $chapter = $this->requiredQueryString($request, 'chapter', 1, 200);
        $rows = $this->db->all(
            'SELECT id, question, answer, created_at FROM edukarta_chapter_qa WHERE user_id = ? AND subject = ? AND chapter = ? ORDER BY created_at ASC',
            [$user['id'], $subject, $chapter]
        );
        return ['turns' => array_map(fn (array $row): array => [
            'id' => $row['id'],
            'question' => $row['question'],
            'answer' => $row['answer'],
            'createdAt' => $this->iso($row['created_at']),
        ], $rows)];
    }

    public function edukartaSaveQa(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        $subject = $this->requiredString($request->body, 'subject', 1, 80);
        $chapter = $this->requiredString($request->body, 'chapter', 1, 200);
        $question = $this->requiredString($request->body, 'question', 1, 400);
        $answer = $this->requiredString($request->body, 'answer', 1, 8000);

        $this->db->execute(
            'INSERT INTO edukarta_chapter_qa (id, user_id, organization_id, subject, chapter, question, answer, created_at)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [$user['id'], $user['organizationId'] ?? null, $subject, $chapter, $question, $answer]
        );

        $row = $this->db->one(
            'SELECT id, question, answer, created_at FROM edukarta_chapter_qa WHERE user_id = ? AND subject = ? AND chapter = ? ORDER BY created_at DESC LIMIT 1',
            [$user['id'], $subject, $chapter]
        );

        return ['turn' => [
            'id' => $row['id'] ?? '',
            'question' => $row['question'] ?? $question,
            'answer' => $row['answer'] ?? $answer,
            'createdAt' => $this->iso($row['created_at'] ?? gmdate('c')),
        ]];
    }

    public function edukartaGetProgress(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        $row = $this->db->one('SELECT progress_data, updated_at FROM edukarta_progress_profiles WHERE user_id = ? LIMIT 1', [$user['id']]);
        if ($row === null) {
            return ['progress' => null];
        }
        return ['progress' => $row['progress_data'], 'updatedAt' => $this->iso($row['updated_at'])];
    }

    public function edukartaSaveProgress(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'edukarta');
        $payload = $request->body;
        $json = json_encode($payload, JSON_THROW_ON_ERROR);
        $this->db->execute(
            "INSERT INTO edukarta_progress_profiles (user_id, organization_id, progress_data, created_at, updated_at)
             VALUES (?, ?, CAST(? AS JSON), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE organization_id = VALUES(organization_id), progress_data = VALUES(progress_data), updated_at = CURRENT_TIMESTAMP",
            [$user['id'], $user['organizationId'] ?? null, $json]
        );
        return ['message' => 'EduKarta progress saved'];
    }

    public function prepkartaExams(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        return ['module' => 'prepkarta', 'exams' => ['JEE', 'NEET', 'SAT']];
    }

    public function prepkartaSubjects(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'prepkarta');
        $subjects = $this->db->all('SELECT id, name, created_at FROM prepkarta_subjects ORDER BY name ASC');
        $progressRows = $this->db->all(
            'SELECT c.subject_id, up.mastery_score, up.attempts_count
             FROM prepkarta_user_concept_progress up
             INNER JOIN prepkarta_concepts c ON c.id = up.concept_id
             WHERE up.user_id = ?',
            [$user['id']]
        );
        $grouped = [];
        foreach ($progressRows as $row) {
            $subjectId = (string) $row['subject_id'];
            $grouped[$subjectId] ??= ['masterySum' => 0.0, 'conceptCount' => 0, 'attempts' => 0];
            $grouped[$subjectId]['masterySum'] += (float) ($row['mastery_score'] ?? 0);
            $grouped[$subjectId]['conceptCount'] += 1;
            $grouped[$subjectId]['attempts'] += (int) ($row['attempts_count'] ?? 0);
        }

        return ['subjects' => array_map(static function (array $subject) use ($grouped): array {
            $stats = $grouped[$subject['id']] ?? ['masterySum' => 0.0, 'conceptCount' => 0, 'attempts' => 0];
            $progress = $stats['conceptCount'] > 0 ? $stats['masterySum'] / $stats['conceptCount'] : 0;
            return [
                'id' => $subject['id'],
                'name' => $subject['name'],
                'progress' => round($progress, 4),
                'attempts' => $stats['attempts'],
            ];
        }, $subjects)];
    }

    public function prepkartaCreateSubject(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $name = $this->requiredString($request->body, 'name', 2, 80);
        if ($this->db->one('SELECT id FROM prepkarta_subjects WHERE name = ? LIMIT 1', [$name])) {
            throw new HttpException(409, 'Subject already exists', ['error' => 'Subject already exists']);
        }
        $this->db->execute('INSERT INTO prepkarta_subjects (id, name, created_at) VALUES (UUID(), ?, CURRENT_TIMESTAMP)', [$name]);
        return ['ok' => true];
    }

    public function prepkartaUpdateSubject(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $id = $request->params['id'] ?? '';
        $name = $this->requiredString($request->body, 'name', 2, 80);
        if (!$this->db->one('SELECT id FROM prepkarta_subjects WHERE id = ? LIMIT 1', [$id])) {
            throw new HttpException(404, 'Subject not found', ['error' => 'Subject not found']);
        }
        $this->db->execute('UPDATE prepkarta_subjects SET name = ? WHERE id = ?', [$name, $id]);
        return ['ok' => true];
    }

    public function prepkartaDeleteSubject(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $this->db->execute('DELETE FROM prepkarta_subjects WHERE id = ?', [$request->params['id'] ?? '']);
        return ['message' => 'Subject deleted'];
    }

    public function prepkartaConcepts(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'prepkarta');
        $subjectId = $request->params['id'] ?? '';
        $concepts = $this->db->all(
            'SELECT id, subject_id, name, total_questions, created_at FROM prepkarta_concepts WHERE subject_id = ? ORDER BY name ASC',
            [$subjectId]
        );
        $progressRows = $this->db->all(
            'SELECT id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at
             FROM prepkarta_user_concept_progress WHERE user_id = ?',
            [$user['id']]
        );
        $progressByConcept = [];
        foreach ($progressRows as $row) {
            $progressByConcept[$row['concept_id']] = $row;
        }

        return ['concepts' => array_map(fn (array $concept): array => $this->toConceptPayload($concept, $progressByConcept[$concept['id']] ?? null), $concepts)];
    }

    public function prepkartaChapters(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $subjectId = $request->params['id'] ?? '';
        $rows = $this->db->all(
            'SELECT id, subject_id, name, total_questions, created_at FROM prepkarta_concepts WHERE subject_id = ? ORDER BY name ASC',
            [$subjectId]
        );
        return ['chapters' => array_map(static fn (array $row): array => [
            'id' => $row['id'],
            'subjectId' => $row['subject_id'],
            'name' => $row['name'],
            'totalQuestions' => (int) ($row['total_questions'] ?? 0),
        ], $rows)];
    }

    public function prepkartaCreateChapter(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $subjectId = $request->params['id'] ?? '';
        $name = $this->requiredString($request->body, 'name', 2, 120);
        if (!$this->db->one('SELECT id FROM prepkarta_subjects WHERE id = ? LIMIT 1', [$subjectId])) {
            throw new HttpException(404, 'Subject not found', ['error' => 'Subject not found']);
        }
        $this->db->execute(
            'INSERT INTO prepkarta_concepts (id, subject_id, name, total_questions, created_at) VALUES (UUID(), ?, ?, 0, CURRENT_TIMESTAMP)',
            [$subjectId, $name]
        );
        return ['ok' => true];
    }

    public function prepkartaUpdateChapter(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $id = $request->params['id'] ?? '';
        $name = $this->requiredString($request->body, 'name', 2, 120);
        if (!$this->db->one('SELECT id FROM prepkarta_concepts WHERE id = ? LIMIT 1', [$id])) {
            throw new HttpException(404, 'Chapter not found', ['error' => 'Chapter not found']);
        }
        $this->db->execute('UPDATE prepkarta_concepts SET name = ? WHERE id = ?', [$name, $id]);
        return ['ok' => true];
    }

    public function prepkartaDeleteChapter(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $this->db->execute('DELETE FROM prepkarta_concepts WHERE id = ?', [$request->params['id'] ?? '']);
        return ['message' => 'Chapter deleted'];
    }

    public function prepkartaSubchapters(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $chapterId = $request->params['id'] ?? '';
        $rows = $this->db->all(
            'SELECT id, chapter_id, name, created_at FROM prepkarta_subchapters WHERE chapter_id = ? ORDER BY name ASC',
            [$chapterId]
        );
        return ['subchapters' => array_map(static fn (array $row): array => [
            'id' => $row['id'],
            'chapterId' => $row['chapter_id'],
            'name' => $row['name'],
        ], $rows)];
    }

    public function prepkartaCreateSubchapter(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $chapterId = $request->params['id'] ?? '';
        $name = $this->requiredString($request->body, 'name', 2, 160);
        if (!$this->db->one('SELECT id FROM prepkarta_concepts WHERE id = ? LIMIT 1', [$chapterId])) {
            throw new HttpException(404, 'Chapter not found', ['error' => 'Chapter not found']);
        }
        $this->db->execute(
            'INSERT INTO prepkarta_subchapters (id, chapter_id, name, created_at) VALUES (UUID(), ?, ?, CURRENT_TIMESTAMP)',
            [$chapterId, $name]
        );
        return ['ok' => true];
    }

    public function prepkartaUpdateSubchapter(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $id = $request->params['id'] ?? '';
        $name = $this->requiredString($request->body, 'name', 2, 160);
        if (!$this->db->one('SELECT id FROM prepkarta_subchapters WHERE id = ? LIMIT 1', [$id])) {
            throw new HttpException(404, 'Subchapter not found', ['error' => 'Subchapter not found']);
        }
        $this->db->execute('UPDATE prepkarta_subchapters SET name = ? WHERE id = ?', [$name, $id]);
        return ['ok' => true];
    }

    public function prepkartaDeleteSubchapter(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $this->db->execute('DELETE FROM prepkarta_subchapters WHERE id = ?', [$request->params['id'] ?? '']);
        return ['message' => 'Subchapter deleted'];
    }

    public function prepkartaSubchapterDetail(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        $id = $request->params['id'] ?? '';
        $row = $this->db->one(
            "SELECT sc.id AS subchapter_id, sc.name AS subchapter_name, c.id AS chapter_id, c.name AS chapter_name,
                    s.id AS subject_id, s.name AS subject_name
             FROM prepkarta_subchapters sc
             INNER JOIN prepkarta_concepts c ON c.id = sc.chapter_id
             INNER JOIN prepkarta_subjects s ON s.id = c.subject_id
             WHERE sc.id = ? LIMIT 1",
            [$id]
        );
        if ($row === null) {
            throw new HttpException(404, 'Subchapter not found', ['error' => 'Subchapter not found']);
        }
        return ['subchapter' => $row];
    }

    public function prepkartaSubchapterSummary(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        if (!Env::get('HF_TOKEN')) {
            throw new HttpException(400, 'AI summary is not configured. Please set HF_TOKEN.', ['error' => 'AI summary is not configured. Please set HF_TOKEN.']);
        }
        $id = $request->params['id'] ?? '';
        $ask = $this->optionalString($request->body, 'ask', 0, 400);
        $history = $this->optionalHistory($request->body['history'] ?? null, 8);
        $row = $this->getPrepkartaSubchapterContext($id);
        if ($row === null) {
            throw new HttpException(404, 'Subchapter not found', ['error' => 'Subchapter not found']);
        }
        $prompt = $this->buildPrepkartaSubchapterPrompt($row['subject_name'], $row['chapter_name'], $row['subchapter_name'], $ask, $history);
        $summary = $this->hfGenerate($prompt, $this->hfMaxTokens());
        if ($summary === null) {
            throw new HttpException(502, 'Failed to generate subchapter summary. Please try again.', ['error' => 'Failed to generate subchapter summary. Please try again.']);
        }
        return ['summary' => trim($summary), 'context' => [
            'subject' => $row['subject_name'],
            'chapter' => $row['chapter_name'],
            'subchapter' => $row['subchapter_name'],
        ]];
    }

    public function prepkartaSubchapterMcq(Request $request): array
    {
        $this->requireModuleUser($request, 'prepkarta');
        if (!Env::get('HF_TOKEN')) {
            throw new HttpException(400, 'AI summary is not configured. Please set HF_TOKEN.', ['error' => 'AI summary is not configured. Please set HF_TOKEN.']);
        }
        $count = (int) ($request->body['count'] ?? 5);
        $count = max(1, min(5, $count));
        $id = $request->params['id'] ?? '';
        $row = $this->getPrepkartaSubchapterContext($id);
        if ($row === null) {
            throw new HttpException(404, 'Subchapter not found', ['error' => 'Subchapter not found']);
        }
        $prompt = $this->buildPrepkartaMcqPrompt($row['subject_name'], $row['chapter_name'], $row['subchapter_name'], $count);
        $mcqs = $this->hfGenerate($prompt, $this->hfMaxTokens());
        if ($mcqs === null) {
            throw new HttpException(502, 'Failed to generate MCQs. Please try again.', ['error' => 'Failed to generate MCQs. Please try again.']);
        }
        return ['mcqs' => trim($mcqs), 'context' => [
            'subject' => $row['subject_name'],
            'chapter' => $row['chapter_name'],
            'subchapter' => $row['subchapter_name'],
            'count' => $count,
        ]];
    }

    public function prepkartaGetQa(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'prepkarta');
        $id = $request->params['id'] ?? '';
        $rows = $this->db->all(
            'SELECT id, question, answer, created_at FROM prepkarta_subchapter_qa WHERE user_id = ? AND subchapter_id = ? ORDER BY created_at ASC',
            [$user['id'], $id]
        );
        return ['turns' => array_map(fn (array $row): array => [
            'id' => $row['id'],
            'question' => $row['question'],
            'answer' => $row['answer'],
            'createdAt' => $this->iso($row['created_at']),
        ], $rows)];
    }

    public function prepkartaSaveQa(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'prepkarta');
        $id = $request->params['id'] ?? '';
        if (!$this->db->one('SELECT id FROM prepkarta_subchapters WHERE id = ? LIMIT 1', [$id])) {
            throw new HttpException(404, 'Subchapter not found', ['error' => 'Subchapter not found']);
        }
        $question = $this->requiredString($request->body, 'question', 1, 400);
        $answer = $this->requiredString($request->body, 'answer', 1, 8000);
        $this->db->execute(
            'INSERT INTO prepkarta_subchapter_qa (id, user_id, organization_id, subchapter_id, question, answer, created_at)
             VALUES (UUID(), ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [$user['id'], $user['organizationId'] ?? null, $id, $question, $answer]
        );
        $row = $this->db->one(
            'SELECT id, question, answer, created_at FROM prepkarta_subchapter_qa WHERE user_id = ? AND subchapter_id = ? ORDER BY created_at DESC LIMIT 1',
            [$user['id'], $id]
        );
        return ['turn' => [
            'id' => $row['id'] ?? '',
            'question' => $row['question'] ?? $question,
            'answer' => $row['answer'] ?? $answer,
            'createdAt' => $this->iso($row['created_at'] ?? gmdate('c')),
        ]];
    }

    public function prepkartaQuestion(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'prepkarta');
        $conceptId = $request->params['id'] ?? '';
        $mode = (string) ($request->query['mode'] ?? 'resume');
        if (!in_array($mode, ['resume', 'weak', 'random'], true)) {
            throw new HttpException(400, 'Invalid query', ['error' => 'Invalid query']);
        }
        $result = $this->fetchConceptQuestion((string) $user['id'], $conceptId, $mode);
        if ($result === null) {
            throw new HttpException(404, 'No questions found for concept', ['error' => 'No questions found for concept']);
        }
        return $result;
    }

    public function prepkartaAnswer(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'prepkarta');
        $questionId = $request->params['id'] ?? '';
        $selectedOptionIds = $this->requiredStringArray($request->body, 'selectedOptionIds', 1, 50, 1, 80);
        $timeSpentSeconds = (int) ($request->body['timeSpentSeconds'] ?? 0);
        $timeSpentSeconds = max(0, min(1800, $timeSpentSeconds));
        $result = $this->answerConceptQuestion((string) $user['id'], $questionId, $selectedOptionIds, $timeSpentSeconds);
        if ($result === null) {
            throw new HttpException(404, 'Question not found', ['error' => 'Question not found']);
        }
        return ['attempt' => $result];
    }

    public function prepkartaProgress(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'prepkarta');
        $conceptId = $request->params['id'] ?? '';
        $concept = $this->db->one('SELECT id, total_questions FROM prepkarta_concepts WHERE id = ? LIMIT 1', [$conceptId]);
        if ($concept === null) {
            throw new HttpException(404, 'Concept not found', ['error' => 'Concept not found']);
        }
        $progress = $this->db->one(
            'SELECT * FROM prepkarta_user_concept_progress WHERE user_id = ? AND concept_id = ? LIMIT 1',
            [$user['id'], $conceptId]
        );
        $attempts = (int) ($progress['attempts_count'] ?? 0);
        $correct = (int) ($progress['correct_answers'] ?? 0);
        $accuracy = $attempts > 0 ? $correct / $attempts : 0.0;
        return ['progress' => [
            'conceptId' => $conceptId,
            'attemptedQuestions' => $attempts,
            'totalQuestions' => (int) ($concept['total_questions'] ?? 0),
            'masteryScore' => (float) ($progress['mastery_score'] ?? 0),
            'masteryStatus' => $this->masteryStatus((float) ($progress['mastery_score'] ?? 0), $attempts),
            'correctAnswers' => $correct,
            'wrongAnswers' => (int) ($progress['wrong_answers'] ?? 0),
            'accuracy' => round($accuracy, 4),
            'totalPracticeSeconds' => (int) ($progress['total_practice_seconds'] ?? 0),
        ]];
    }

    public function prepkartaResume(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'prepkarta');
        $conceptId = $request->params['id'] ?? '';
        $concept = $this->db->one('SELECT id, total_questions FROM prepkarta_concepts WHERE id = ? LIMIT 1', [$conceptId]);
        if ($concept === null) {
            throw new HttpException(404, 'Concept not found', ['error' => 'Concept not found']);
        }
        $progress = $this->db->one(
            'SELECT * FROM prepkarta_user_concept_progress WHERE user_id = ? AND concept_id = ? LIMIT 1',
            [$user['id'], $conceptId]
        );
        $weakRows = $this->db->all(
            "SELECT question_id,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
                    SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count
             FROM prepkarta_user_answer_history
             WHERE user_id = ? AND concept_id = ?
             GROUP BY question_id",
            [$user['id'], $conceptId]
        );
        $weakCount = count(array_filter($weakRows, static fn (array $row): bool => (int) $row['wrong_count'] > (int) $row['correct_count']));
        $attempted = (int) ($progress['attempts_count'] ?? 0);
        $total = (int) ($concept['total_questions'] ?? 0);
        return ['resume' => [
            'conceptId' => $conceptId,
            'totalQuestions' => $total,
            'attemptedQuestions' => $attempted,
            'remainingQuestions' => max(0, $total - $attempted),
            'lastQuestionIndex' => (int) ($progress['last_question_index'] ?? 0),
            'weakQuestionsCount' => $weakCount,
            'modes' => ['resume', 'weak', 'random'],
        ]];
    }

    public function prepkartaAnalytics(Request $request): array
    {
        $user = $this->requireModuleUser($request, 'prepkarta');
        $aggregate = $this->db->one(
            "SELECT COUNT(*) AS solved_count,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
                    SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count,
                    COALESCE(SUM(time_spent_seconds), 0) AS practice_seconds
             FROM prepkarta_user_answer_history WHERE user_id = ?",
            [$user['id']]
        ) ?? ['solved_count' => 0, 'correct_count' => 0, 'practice_seconds' => 0];

        $solved = (int) ($aggregate['solved_count'] ?? 0);
        $correct = (int) ($aggregate['correct_count'] ?? 0);
        $accuracy = $solved > 0 ? $correct / $solved : 0.0;

        $concepts = $this->db->all(
            "SELECT c.id, c.name, up.mastery_score, up.attempts_count
             FROM prepkarta_user_concept_progress up
             INNER JOIN prepkarta_concepts c ON c.id = up.concept_id
             WHERE up.user_id = ?
             ORDER BY up.mastery_score DESC",
            [$user['id']]
        );
        $strongest = array_map(static fn (array $item): array => [
            'conceptId' => $item['id'],
            'name' => $item['name'],
            'masteryScore' => (float) ($item['mastery_score'] ?? 0),
        ], array_slice($concepts, 0, 5));

        $weakestSorted = $concepts;
        usort($weakestSorted, static fn (array $a, array $b): int => ((float) $a['mastery_score']) <=> ((float) $b['mastery_score']));
        $weakest = array_map(static fn (array $item): array => [
            'conceptId' => $item['id'],
            'name' => $item['name'],
            'masteryScore' => (float) ($item['mastery_score'] ?? 0),
        ], array_slice($weakestSorted, 0, 5));

        $days = $this->db->all(
            'SELECT DATE(attempted_at) AS day, COALESCE(SUM(time_spent_seconds), 0) AS seconds
             FROM prepkarta_user_answer_history
             WHERE user_id = ?
             GROUP BY DATE(attempted_at)
             ORDER BY day DESC',
            [$user['id']]
        );

        $streak = 0;
        $cursor = new DateTimeImmutable('today', new \DateTimeZone('UTC'));
        foreach ($days as $row) {
            $day = new DateTimeImmutable((string) $row['day'], new \DateTimeZone('UTC'));
            if ($day->format('Y-m-d') === $cursor->format('Y-m-d')) {
                $streak++;
                $cursor = $cursor->modify('-1 day');
            } else {
                break;
            }
        }

        $avgDuration = $days !== [] ? (int) round(array_sum(array_map(static fn (array $row): int => (int) ($row['seconds'] ?? 0), $days)) / count($days)) : 0;
        $masteredCount = count(array_filter($concepts, fn (array $item): bool => $this->masteryStatus((float) ($item['mastery_score'] ?? 0), (int) ($item['attempts_count'] ?? 0)) === 'mastered'));
        $readiness = min(100, (int) round(($accuracy * 70) + ($masteredCount * 6) + min(20, $streak * 2)));

        return ['analytics' => [
            'accuracyRate' => round($accuracy, 4),
            'strongestConcepts' => $strongest,
            'weakestConcepts' => $weakest,
            'questionsSolved' => $solved,
            'practiceTimeSeconds' => (int) ($aggregate['practice_seconds'] ?? 0),
            'interviewReadinessScore' => $readiness,
            'dailyPracticeStreak' => $streak,
            'avgDailyPracticeDurationSeconds' => $avgDuration,
            'conceptsMasteredCount' => $masteredCount,
        ]];
    }

    public function knowledgeUpload(Request $request): array
    {
        $user = $this->requireAuth($request);
        if (($user['organizationId'] ?? null) === null) {
            throw new HttpException(400, 'Organization not assigned', ['error' => 'Organization not assigned']);
        }
        $file = $this->firstUploadedFile($request, ['document', 'book', 'file']);
        if ($file === null) {
            throw new HttpException(400, 'Missing PDF upload', ['error' => 'Missing PDF upload']);
        }
        if (!in_array((string) ($file['type'] ?? ''), ['application/pdf', 'application/x-pdf'], true)) {
            throw new HttpException(400, 'Only PDF files are allowed', ['error' => 'Only PDF files are allowed']);
        }
        throw new HttpException(501, 'Knowledge PDF indexing is not available in the PHP port without a PDF text extractor and vector-store adapter.', [
            'error' => 'Knowledge PDF indexing is not available in the PHP port without a PDF text extractor and vector-store adapter.',
        ]);
    }

    public function knowledgeAsk(Request $request): array
    {
        $user = $this->requireAuth($request);
        if (($user['organizationId'] ?? null) === null) {
            throw new HttpException(400, 'Organization not assigned', ['error' => 'Organization not assigned']);
        }
        throw new HttpException(501, 'Knowledge Q&A is not available in the PHP port without a vector-store adapter.', [
            'error' => 'Knowledge Q&A is not available in the PHP port without a vector-store adapter.',
        ]);
    }

    public function orgAdminCreateModuleRequest(Request $request): array
    {
        $user = $this->requireAuth($request);
        $orgId = $this->organizationId($user);
        if ($this->isOrgAdmin($user) || ($user['isRoot'] ?? false) || ($user['role'] ?? '') === 'root') {
            throw new HttpException(403, 'Only members can raise module access requests', ['error' => 'Only members can raise module access requests']);
        }
        $moduleSlug = $this->requiredString($request->body, 'moduleSlug', 1, 120);
        $reason = $this->optionalString($request->body, 'reason', 0, 500);
        $module = $this->db->one(
            "SELECT m.id AS module_id
             FROM organization_modules
             INNER JOIN modules m ON m.id = organization_modules.module_id
             WHERE organization_id = ? AND m.slug = ? AND status = 'active' LIMIT 1",
            [$orgId, $moduleSlug]
        );
        if ($module === null) {
            throw new HttpException(400, 'Module is not enabled for this organization', ['error' => 'Module is not enabled for this organization']);
        }
        $this->db->execute(
            "INSERT INTO module_access_requests (id, organization_id, user_id, module_id, status, reason)
             VALUES (UUID(), ?, ?, ?, 'pending', ?)",
            [$orgId, $user['id'], $module['module_id'], $reason]
        );
        return ['message' => 'Module access request submitted'];
    }

    public function orgAdminMyModuleRequests(Request $request): array
    {
        $user = $this->requireAuth($request);
        $orgId = $this->organizationId($user);
        $rows = $this->db->all(
            "SELECT mar.id, mar.status, mar.reason, mar.review_note, mar.created_at, mar.updated_at,
                    m.name AS module_name, m.display_name AS module_display_name
             FROM module_access_requests mar
             INNER JOIN modules m ON m.id = mar.module_id
             WHERE mar.organization_id = ? AND mar.user_id = ?
             ORDER BY mar.created_at DESC",
            [$orgId, $user['id']]
        );
        return ['requests' => $rows];
    }

    public function orgAdminModuleRequests(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $rows = $this->db->all(
            "SELECT mar.id, mar.status, mar.reason, mar.review_note, mar.created_at, mar.updated_at,
                    mar.user_id, mar.module_id, u.email AS user_email, m.name AS module_name, m.display_name AS module_display_name
             FROM module_access_requests mar
             INNER JOIN users u ON u.id = mar.user_id
             INNER JOIN modules m ON m.id = mar.module_id
             WHERE mar.organization_id = ?
             ORDER BY mar.created_at DESC",
            [$orgId]
        );
        return ['requests' => $rows];
    }

    public function orgAdminResolveModuleRequest(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $id = $request->params['id'] ?? '';
        $action = $this->requiredEnum($request->body, 'action', ['approved', 'rejected']);
        $note = $this->optionalString($request->body, 'note', 0, 500);
        $row = $this->db->one(
            'SELECT id, user_id, module_id, status FROM module_access_requests WHERE id = ? AND organization_id = ? LIMIT 1',
            [$id, $orgId]
        );
        if ($row === null) {
            throw new HttpException(404, 'Request not found', ['error' => 'Request not found']);
        }
        if (($row['status'] ?? '') !== 'pending') {
            throw new HttpException(400, 'Request already processed', ['error' => 'Request already processed']);
        }

        $this->db->transaction(function () use ($id, $user, $note, $action, $row): void {
            $this->db->execute(
                'UPDATE module_access_requests
                 SET status = ?, reviewed_by = ?, review_note = ?, reviewed_at = UTC_TIMESTAMP(), updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?',
                [$action, $user['id'], $note, $id]
            );
            if ($action === 'approved') {
                $this->db->execute(
                    'INSERT INTO user_module_access (id, user_id, module_id, access_granted, expires_at)
                     VALUES (UUID(), ?, ?, 1, NULL)
                     ON DUPLICATE KEY UPDATE access_granted = 1, expires_at = NULL',
                    [$row['user_id'], $row['module_id']]
                );
            }
        });

        return ['message' => $action === 'approved' ? 'Request approved' : 'Request rejected'];
    }

    public function orgAdminOverview(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        return [
            'organization' => $this->db->one('SELECT id, name, slug, plan, is_active, owner_user_id, created_at, updated_at FROM organizations WHERE id = ? LIMIT 1', [$orgId]),
            'userBreakdown' => $this->db->all('SELECT role, status, COUNT(*) AS count FROM users WHERE organization_id = ? GROUP BY role, status', [$orgId]),
            'moduleBreakdown' => $this->db->all('SELECT status, COUNT(*) AS count FROM organization_modules WHERE organization_id = ? GROUP BY status', [$orgId]),
        ];
    }

    public function orgAdminUsers(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        return ['users' => $this->db->all(
            'SELECT id, email, role, status, is_root, is_active, created_at, updated_at FROM users WHERE organization_id = ? ORDER BY created_at ASC',
            [$orgId]
        )];
    }

    public function orgAdminCreateUser(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $email = $this->requiredEmail($request->body, 'email');
        $password = $this->requiredString($request->body, 'password', 6, 200);
        $role = $this->requiredEnum($request->body, 'role', ['admin', 'superadmin', 'member']);
        $status = $this->optionalEnum($request->body, 'status', ['active', 'invited', 'disabled']) ?? 'active';
        if ($this->db->one('SELECT id FROM users WHERE email = ? LIMIT 1', [$email])) {
            throw new HttpException(409, 'Email is already registered', ['error' => 'Email is already registered']);
        }
        $this->db->transaction(function () use ($email, $password, $role, $status, $orgId): void {
            $this->db->execute(
                'INSERT INTO users (id, email, password_hash, role, is_root, organization_id, status, is_active)
                 VALUES (UUID(), ?, SHA2(?, 256), ?, 0, ?, ?, ?)',
                [$email, $password, $role, $orgId, $status, $status === 'disabled' ? 0 : 1]
            );
            $this->db->execute(
                'INSERT IGNORE INTO user_roles (id, user_id, role_id)
                 SELECT UUID(), u.id, r.id
                 FROM users u
                 INNER JOIN roles r ON r.slug = ? AND (r.organization_id IS NULL OR r.organization_id = ?)
                 WHERE u.email = ?
                 LIMIT 1',
                [$role, $orgId, $email]
            );
        });
        return ['message' => 'User created'];
    }

    public function orgAdminUpdateUserRole(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $userId = $request->params['id'] ?? '';
        $role = $this->requiredEnum($request->body, 'role', ['admin', 'superadmin', 'member']);
        $row = $this->db->one('SELECT id, is_root FROM users WHERE id = ? AND organization_id = ? LIMIT 1', [$userId, $orgId]);
        if ($row === null) {
            throw new HttpException(404, 'User not found in organization', ['error' => 'User not found in organization']);
        }
        if ((int) ($row['is_root'] ?? 0) === 1) {
            throw new HttpException(403, 'Root user cannot be modified', ['error' => 'Root user cannot be modified']);
        }
        $this->db->execute('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [$role, $userId]);
        return ['message' => 'User role updated'];
    }

    public function orgAdminUpdateUserStatus(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $userId = $request->params['id'] ?? '';
        $status = $this->requiredEnum($request->body, 'status', ['active', 'invited', 'disabled']);
        $row = $this->db->one('SELECT id, is_root FROM users WHERE id = ? AND organization_id = ? LIMIT 1', [$userId, $orgId]);
        if ($row === null) {
            throw new HttpException(404, 'User not found in organization', ['error' => 'User not found in organization']);
        }
        if ((int) ($row['is_root'] ?? 0) === 1) {
            throw new HttpException(403, 'Root user cannot be modified', ['error' => 'Root user cannot be modified']);
        }
        $this->db->execute(
            'UPDATE users SET status = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [$status, $status === 'disabled' ? 0 : 1, $userId]
        );
        return ['message' => 'User status updated'];
    }

    public function orgAdminUserModules(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $userId = $request->params['id'] ?? '';
        $targetUser = $this->db->one('SELECT id, role FROM users WHERE id = ? AND organization_id = ? LIMIT 1', [$userId, $orgId]);
        if ($targetUser === null) {
            throw new HttpException(404, 'User not found in organization', ['error' => 'User not found in organization']);
        }
        if (($targetUser['role'] ?? '') !== 'member') {
            throw new HttpException(400, 'Module grants are only allowed for member users', ['error' => 'Module grants are only allowed for member users']);
        }
        $rows = $this->db->all(
            "SELECT m.id, m.name, m.slug, m.display_name, om.status AS organization_module_status, uma.access_granted, uma.expires_at
             FROM organization_modules om
             INNER JOIN modules m ON m.id = om.module_id AND m.is_active = 1
             LEFT JOIN user_module_access uma ON uma.user_id = ? AND uma.module_id = m.id
             WHERE om.organization_id = ? AND om.status = 'active'
             ORDER BY m.name ASC",
            [$userId, $orgId]
        );
        return ['modules' => $rows];
    }

    public function orgAdminUpdateUserModules(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $userId = $request->params['id'] ?? '';
        $moduleId = $this->requiredString($request->body, 'moduleId', 36, 64);
        $grant = $this->requiredBool($request->body, 'grant');
        $expiresAt = $this->optionalString($request->body, 'expiresAt', 0, 64);
        $targetUser = $this->db->one('SELECT id, role FROM users WHERE id = ? AND organization_id = ? LIMIT 1', [$userId, $orgId]);
        if ($targetUser === null) {
            throw new HttpException(404, 'User not found in organization', ['error' => 'User not found in organization']);
        }
        if (($targetUser['role'] ?? '') !== 'member') {
            throw new HttpException(400, 'Module grants are only allowed for member users', ['error' => 'Module grants are only allowed for member users']);
        }
        if (!$this->db->one('SELECT 1 FROM organization_modules WHERE organization_id = ? AND module_id = ? AND status = ? LIMIT 1', [$orgId, $moduleId, 'active'])) {
            throw new HttpException(400, 'Module is not enabled for this organization', ['error' => 'Module is not enabled for this organization']);
        }
        $this->db->execute(
            'INSERT INTO user_module_access (id, user_id, module_id, access_granted, expires_at)
             VALUES (UUID(), ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE access_granted = VALUES(access_granted), expires_at = VALUES(expires_at)',
            [$userId, $moduleId, $grant ? 1 : 0, $expiresAt ?: null]
        );
        return ['message' => $grant ? 'Module access granted' : 'Module access revoked'];
    }

    public function orgAdminRoles(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        return ['roles' => $this->db->all(
            "SELECT id, organization_id, name, slug, description, is_system_role, created_at, updated_at
             FROM roles
             WHERE organization_id = ? OR (organization_id IS NULL AND slug IN ('admin','superadmin','member'))
             ORDER BY is_system_role DESC, name ASC",
            [$orgId]
        )];
    }

    public function orgAdminCreateRole(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $name = $this->requiredString($request->body, 'name', 2, 120);
        $slug = $this->requiredString($request->body, 'slug', 2, 120);
        $description = $this->optionalString($request->body, 'description', 0, 1000);
        $this->db->execute(
            'INSERT INTO roles (id, organization_id, name, slug, description, is_system_role) VALUES (UUID(), ?, ?, ?, ?, 0)',
            [$orgId, $name, $slug, $description]
        );
        return ['message' => 'Role created'];
    }

    public function orgAdminPermissions(Request $request): array
    {
        $this->requireOrgAdmin($this->requireAuth($request));
        return ['permissions' => $this->db->all(
            'SELECT id, name, slug, resource, action, description FROM permissions ORDER BY resource ASC, action ASC'
        )];
    }

    public function orgAdminRolePermissions(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $roleId = $request->params['id'] ?? '';
        if (!$this->db->one('SELECT id FROM roles WHERE id = ? AND (organization_id = ? OR organization_id IS NULL) LIMIT 1', [$roleId, $orgId])) {
            throw new HttpException(404, 'Role not found', ['error' => 'Role not found']);
        }
        $rows = $this->db->all(
            'SELECT p.id, p.slug FROM role_permissions rp INNER JOIN permissions p ON p.id = rp.permission_id WHERE rp.role_id = ?',
            [$roleId]
        );
        return ['permissions' => $rows];
    }

    public function orgAdminSaveRolePermissions(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $roleId = $request->params['id'] ?? '';
        $permissionIds = $this->requiredStringArray($request->body, 'permissionIds', 0, 500, 1, 64);
        $role = $this->db->one('SELECT id, is_system_role FROM roles WHERE id = ? AND (organization_id = ? OR organization_id IS NULL) LIMIT 1', [$roleId, $orgId]);
        if ($role === null) {
            throw new HttpException(404, 'Role not found', ['error' => 'Role not found']);
        }
        if ((int) ($role['is_system_role'] ?? 0) === 1) {
            throw new HttpException(403, 'System role permissions cannot be modified here', ['error' => 'System role permissions cannot be modified here']);
        }
        $this->db->transaction(function () use ($roleId, $permissionIds): void {
            $this->db->execute('DELETE FROM role_permissions WHERE role_id = ?', [$roleId]);
            foreach ($permissionIds as $permissionId) {
                $this->db->execute(
                    'INSERT INTO role_permissions (id, role_id, permission_id) VALUES (UUID(), ?, ?)',
                    [$roleId, $permissionId]
                );
            }
        });
        return ['message' => 'Role permissions updated'];
    }

    public function orgAdminModules(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $rows = $this->db->all(
            "SELECT m.id, m.name, m.slug, m.display_name, m.description, m.is_core, m.is_active,
                    om.id AS organization_module_id, om.status, om.starts_at, om.expires_at
             FROM modules m
             LEFT JOIN organization_modules om ON om.module_id = m.id AND om.organization_id = ?
             WHERE m.is_active = 1
             ORDER BY m.name ASC",
            [$orgId]
        );
        return ['modules' => $rows];
    }

    public function orgAdminUpdateModule(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireRoot($user);
        $orgId = $this->organizationId($user);
        $moduleId = $request->params['moduleId'] ?? '';
        $status = $this->requiredEnum($request->body, 'status', ['active', 'expired', 'suspended']);
        $startsAt = $this->optionalString($request->body, 'startsAt', 0, 64);
        $expiresAt = $this->optionalString($request->body, 'expiresAt', 0, 64);
        $this->db->execute(
            'INSERT INTO organization_modules (id, organization_id, module_id, status, starts_at, expires_at)
             VALUES (UUID(), ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), starts_at = VALUES(starts_at), expires_at = VALUES(expires_at)',
            [$orgId, $moduleId, $status, $startsAt ?: null, $expiresAt ?: null]
        );
        return ['message' => 'Module configuration updated'];
    }

    public function orgAdminSettings(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        return ['organization' => $this->db->one(
            'SELECT id, name, slug, plan, is_active, owner_user_id, created_at, updated_at FROM organizations WHERE id = ? LIMIT 1',
            [$orgId]
        )];
    }

    public function orgAdminUpdateSettings(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $name = $this->optionalString($request->body, 'name', 2, 255);
        $plan = $this->optionalString($request->body, 'plan', 1, 120);
        $this->db->execute(
            'UPDATE organizations SET name = COALESCE(?, name), plan = COALESCE(?, plan), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [$name, $plan, $orgId]
        );
        return ['message' => 'Organization settings updated'];
    }

    public function orgAdminSchoolConfig(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $boards = $this->db->all('SELECT id, name FROM organization_boards WHERE organization_id = ? ORDER BY name ASC', [$orgId]);
        $classes = $this->db->all('SELECT id, name FROM organization_classes WHERE organization_id = ? ORDER BY name ASC', [$orgId]);
        if ($boards === [] || $classes === []) {
            return ['boards' => array_map(static fn (array $row): array => ['name' => $row['name']], $boards), 'classes' => []];
        }
        $classIds = array_map(static fn (array $row): string => (string) $row['id'], $classes);
        $placeholders = implode(',', array_fill(0, count($classIds), '?'));
        $classBoardRows = $this->db->all(
            "SELECT ocb.class_id, ob.name AS board_name
             FROM organization_class_boards ocb
             INNER JOIN organization_boards ob ON ob.id = ocb.board_id
             WHERE ocb.class_id IN ($placeholders)",
            $classIds
        );
        $classSubjectRows = $this->db->all(
            "SELECT class_id, name AS subject_name FROM organization_class_subjects WHERE class_id IN ($placeholders)",
            $classIds
        );
        $boardsByClass = [];
        foreach ($classBoardRows as $row) {
            $boardsByClass[$row['class_id']] ??= [];
            $boardsByClass[$row['class_id']][] = $row['board_name'];
        }
        $subjectsByClass = [];
        foreach ($classSubjectRows as $row) {
            $subjectsByClass[$row['class_id']] ??= [];
            $subjectsByClass[$row['class_id']][] = $row['subject_name'];
        }

        return [
            'boards' => array_map(static fn (array $row): array => ['name' => $row['name']], $boards),
            'classes' => array_map(static fn (array $row) => [
                'name' => $row['name'],
                'boards' => $boardsByClass[$row['id']] ?? [],
                'subjects' => $subjectsByClass[$row['id']] ?? [],
            ], $classes),
        ];
    }

    public function orgAdminSaveSchoolConfig(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $boards = is_array($request->body['boards'] ?? null) ? $request->body['boards'] : [];
        $classes = is_array($request->body['classes'] ?? null) ? $request->body['classes'] : [];

        $this->db->transaction(function () use ($orgId, $boards, $classes): void {
            $this->db->execute('DELETE FROM organization_class_subjects WHERE class_id IN (SELECT id FROM organization_classes WHERE organization_id = ?)', [$orgId]);
            $this->db->execute('DELETE FROM organization_class_boards WHERE class_id IN (SELECT id FROM organization_classes WHERE organization_id = ?)', [$orgId]);
            $this->db->execute('DELETE FROM organization_classes WHERE organization_id = ?', [$orgId]);
            $this->db->execute('DELETE FROM organization_boards WHERE organization_id = ?', [$orgId]);

            $boardIds = [];
            foreach ($boards as $board) {
                if (!is_array($board)) {
                    continue;
                }
                $name = $this->requiredString($board, 'name', 1, 120);
                $id = $this->uuid();
                $boardIds[$name] = $id;
                $this->db->execute('INSERT INTO organization_boards (id, organization_id, name) VALUES (?, ?, ?)', [$id, $orgId, $name]);
            }

            foreach ($classes as $class) {
                if (!is_array($class)) {
                    continue;
                }
                $classId = $this->uuid();
                $className = $this->requiredString($class, 'name', 1, 120);
                $this->db->execute('INSERT INTO organization_classes (id, organization_id, name) VALUES (?, ?, ?)', [$classId, $orgId, $className]);
                foreach ($this->optionalStringArray($class, 'boards', 0, 100, 1, 120) ?? [] as $boardName) {
                    if (!isset($boardIds[$boardName])) {
                        continue;
                    }
                    $this->db->execute('INSERT INTO organization_class_boards (id, class_id, board_id) VALUES (?, ?, ?)', [$this->uuid(), $classId, $boardIds[$boardName]]);
                }
                foreach ($this->optionalStringArray($class, 'subjects', 0, 100, 1, 120) ?? [] as $subject) {
                    $this->db->execute('INSERT INTO organization_class_subjects (id, class_id, name) VALUES (?, ?, ?)', [$this->uuid(), $classId, $subject]);
                }
            }
        });

        return ['message' => 'School configuration saved'];
    }

    public function orgAdminReports(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        return [
            'userByStatus' => $this->db->all('SELECT status, COUNT(*) AS count FROM users WHERE organization_id = ? GROUP BY status', [$orgId]),
            'userByRole' => $this->db->all('SELECT role, COUNT(*) AS count FROM users WHERE organization_id = ? GROUP BY role', [$orgId]),
            'moduleByStatus' => $this->db->all('SELECT status, COUNT(*) AS count FROM organization_modules WHERE organization_id = ? GROUP BY status', [$orgId]),
        ];
    }

    public function orgAdminBillingCatalog(Request $request): array
    {
        $this->requireOrgAdmin($this->requireAuth($request));
        $rows = $this->db->all(
            "SELECT m.id AS module_id, m.name AS module_name, m.slug AS module_slug, m.display_name, m.description,
                    sp.name AS plan_name, sp.display_name AS plan_display_name, sp.price_monthly, sp.price_yearly, sp.currency
             FROM modules m
             INNER JOIN plan_modules pm ON pm.module_id = m.id AND pm.is_enabled = 1
             INNER JOIN (
               SELECT plan_id FROM plan_modules WHERE is_enabled = 1 GROUP BY plan_id HAVING COUNT(*) = 1
             ) single_module_plans ON single_module_plans.plan_id = pm.plan_id
             INNER JOIN subscription_plans sp ON sp.id = single_module_plans.plan_id AND sp.is_active = 1
             WHERE m.is_active = 1
             ORDER BY m.display_name ASC"
        );
        return ['modules' => $rows];
    }

    public function orgAdminBillingSubscriptions(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        return ['subscriptions' => $this->getOrganizationSubscriptionDetails($this->organizationId($user))];
    }

    public function orgAdminBillingBuyModule(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $moduleName = $this->requiredString($request->body, 'moduleName', 1, 120);
        $plan = $this->db->one(
            "SELECT sp.id AS plan_id
             FROM subscription_plans sp
             INNER JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
             INNER JOIN modules m ON m.id = pm.module_id AND m.is_active = 1
             WHERE m.name = ? AND sp.is_active = 1
             GROUP BY sp.id HAVING COUNT(pm.module_id) = 1 LIMIT 1",
            [$moduleName]
        );
        if ($plan === null) {
            throw new HttpException(404, 'Module purchase plan not found', ['error' => 'Module purchase plan not found']);
        }
        $this->db->execute(
            "INSERT INTO organization_subscriptions (id, organization_id, plan_id, status, start_date, end_date, auto_renew)
             VALUES (UUID(), ?, ?, 'pending_approval', NULL, NULL, 1)
             ON DUPLICATE KEY UPDATE status = 'pending_approval', start_date = NULL, end_date = NULL, updated_at = CURRENT_TIMESTAMP",
            [$orgId, $plan['plan_id']]
        );
        return ['message' => 'Module purchase request submitted for root approval', 'subscriptions' => $this->getOrganizationSubscriptionDetails($orgId)];
    }

    public function orgAdminBilling(Request $request): array
    {
        return $this->orgAdminBillingSubscriptions($request);
    }

    public function orgAdminApiKeys(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        return ['apiKeys' => $this->db->all(
            'SELECT id, name, key_prefix, is_active, last_used_at, created_at FROM organization_api_keys WHERE organization_id = ? ORDER BY created_at DESC',
            [$orgId]
        )];
    }

    public function orgAdminCreateApiKey(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $name = $this->requiredString($request->body, 'name', 2, 255);
        $rawKey = 'karta_' . bin2hex(random_bytes(24));
        $keyHash = hash('sha256', $rawKey);
        $keyPrefix = substr($rawKey, 0, 12);
        $this->db->execute(
            'INSERT INTO organization_api_keys (id, organization_id, name, key_hash, key_prefix, is_active) VALUES (UUID(), ?, ?, ?, ?, 1)',
            [$orgId, $name, $keyHash, $keyPrefix]
        );
        return ['apiKey' => $rawKey, 'keyPrefix' => $keyPrefix];
    }

    public function orgAdminDeleteApiKey(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $id = $request->params['id'] ?? '';
        $this->db->execute(
            'UPDATE organization_api_keys SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND organization_id = ?',
            [$id, $orgId]
        );
        return ['message' => 'API key revoked'];
    }

    public function orgAdminUploadEbook(Request $request): array
    {
        $user = $this->requireAuth($request);
        $this->requireOrgAdmin($user);
        $orgId = $this->organizationId($user);
        $files = $request->uploadedFiles('ebook');
        $file = $files[0] ?? null;
        if ($file === null || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new HttpException(400, 'Missing ebook PDF upload', ['error' => 'Missing ebook PDF upload']);
        }
        if (!in_array((string) ($file['type'] ?? ''), ['application/pdf', 'application/x-pdf'], true)) {
            throw new HttpException(400, 'Only PDF files are allowed', ['error' => 'Only PDF files are allowed']);
        }

        $subject = $this->requiredString($request->body, 'subject', 1, 120);
        $board = $this->requiredString($request->body, 'board', 1, 120);
        $classLevel = $this->requiredString($request->body, 'classLevel', 1, 40);
        $title = $this->optionalString($request->body, 'title', 1, 255) ?? $this->deriveTitleFromFilename((string) $file['name']);
        $author = $this->optionalString($request->body, 'author', 0, 255);
        $isbn = $this->optionalString($request->body, 'isbn', 0, 32);
        $description = $this->optionalString($request->body, 'description', 0, 2000);

        $uploadId = $this->uuid();
        $relativeDir = 'uploads/ebooks/' . $orgId;
        $absoluteDir = dirname(__DIR__, 3) . '/' . $relativeDir;
        if (!is_dir($absoluteDir) && !mkdir($absoluteDir, 0775, true) && !is_dir($absoluteDir)) {
            throw new HttpException(500, 'Failed to create upload directory', ['error' => 'Failed to create upload directory']);
        }
        $storedName = $uploadId . '.pdf';
        $absolutePath = $absoluteDir . '/' . $storedName;
        if (!move_uploaded_file((string) $file['tmp_name'], $absolutePath)) {
            throw new HttpException(500, 'Upload failed', ['error' => 'Upload failed']);
        }
        $storagePath = $relativeDir . '/' . $storedName;

        try {
            $this->db->execute(
                "INSERT INTO organization_ebooks (
                    id, organization_id, uploaded_by, subject, board, class_level, title, author, isbn, description,
                    original_name, stored_name, mime_type, file_size, storage_path, status
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded')",
                [
                    $uploadId,
                    $orgId,
                    $user['id'],
                    $subject,
                    $board,
                    $classLevel,
                    $title,
                    $author,
                    $isbn,
                    $description,
                    $file['name'],
                    $storedName,
                    $file['type'],
                    (int) ($file['size'] ?? 0),
                    $storagePath,
                ]
            );
        } catch (\Throwable $exception) {
            @unlink($absolutePath);
            throw $exception;
        }

        return [
            'message' => 'Ebook uploaded',
            'ebook' => [
                'id' => $uploadId,
                'subject' => $subject,
                'board' => $board,
                'classLevel' => $classLevel,
                'title' => $title,
                'originalName' => $file['name'],
                'size' => (int) ($file['size'] ?? 0),
                'storagePath' => $storagePath,
            ],
        ];
    }

    /** @return array<string, mixed> */
    public function requireAuth(Request $request): array
    {
        $header = $request->header('authorization');
        if ($header === null || !str_starts_with($header, 'Bearer ')) {
            throw new HttpException(401, 'Unauthorized', ['error' => 'Unauthorized']);
        }
        $token = substr($header, 7);
        $payload = Jwt::decode($token, $this->jwtSecret);
        if ($payload === null) {
            throw new HttpException(401, 'Invalid or expired token', ['error' => 'Invalid or expired token']);
        }
        $request->attributes['user'] = [
            'id' => $payload['sub'],
            'email' => $payload['email'],
            'role' => $payload['role'],
            'isRoot' => (bool) ($payload['isRoot'] ?? false),
            'organizationId' => $payload['organizationId'] ?? null,
            'subscription' => $payload['subscription'] ?? 'FREE',
        ];
        return $request->attributes['user'];
    }

    /** @return array<string, mixed> */
    private function requireModuleUser(Request $request, string $moduleName): array
    {
        $user = $this->requireAuth($request);
        if (($user['isRoot'] ?? false) || ($user['role'] ?? '') === 'root') {
            return $user;
        }

        if (in_array($user['role'] ?? '', ['admin', 'superadmin'], true)) {
            $orgId = $this->organizationId($user);
            if (!$this->isOrganizationEntitledToModule($orgId, $moduleName)) {
                throw new HttpException(403, 'Organization subscription required or pending approval for module: ' . $moduleName, [
                    'error' => 'Organization subscription required or pending approval for module: ' . $moduleName,
                ]);
            }
            return $user;
        }

        if (($user['organizationId'] ?? null) !== null && !$this->isOrganizationEntitledToModule((string) $user['organizationId'], $moduleName)) {
            throw new HttpException(403, 'Organization subscription required or pending approval for module: ' . $moduleName, [
                'error' => 'Organization subscription required or pending approval for module: ' . $moduleName,
            ]);
        }

        if (!$this->isUserEntitledToModule((string) $user['id'], $moduleName)) {
            throw new HttpException(403, 'Purchase required for module: ' . $moduleName, ['error' => 'Purchase required for module: ' . $moduleName]);
        }

        return $user;
    }

    private function requireRoot(array $user): void
    {
        if (!($user['isRoot'] ?? false) && ($user['role'] ?? '') !== 'root') {
            throw new HttpException(403, 'Root access required', ['error' => 'Root access required']);
        }
    }

    private function requireOrgAdmin(array $user): void
    {
        if (!$this->isOrgAdmin($user)) {
            throw new HttpException(403, 'Organization admin access required', ['error' => 'Organization admin access required']);
        }
        $this->organizationId($user);
    }

    private function organizationId(array $user): string
    {
        $orgId = $user['organizationId'] ?? null;
        if (!is_string($orgId) || trim($orgId) === '') {
            throw new HttpException(400, 'Organization not assigned', ['error' => 'Organization not assigned']);
        }
        return $orgId;
    }

    private function isOrgAdmin(array $user): bool
    {
        return (bool) ($user['isRoot'] ?? false) || in_array($user['role'] ?? '', ['admin', 'superadmin'], true);
    }

    private function toUserDto(array $row): array
    {
        return [
            'id' => $row['id'],
            'email' => $row['email'],
            'fullName' => $row['full_name'] ?? null,
            'phoneNumber' => $row['phone_number'] ?? null,
            'role' => $row['role'],
            'isRoot' => (int) ($row['is_root'] ?? 0) === 1,
            'subscription' => $this->roleToSubscription((string) $row['role']),
        ];
    }

    private function roleToSubscription(string $role): string
    {
        return $role === 'member' ? 'FREE' : 'ENTERPRISE';
    }

    private function issueToken(array $row): string
    {
        $user = $this->toUserDto($row);
        return Jwt::encode([
            'sub' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'isRoot' => $user['isRoot'],
            'organizationId' => $row['organization_id'] ?? null,
            'subscription' => $user['subscription'],
        ], $this->jwtSecret, $this->jwtExpiresIn);
    }

    private function makeOrganizationSlug(string $email): string
    {
        $local = explode('@', $email)[0] ?? 'org';
        $base = preg_replace('/^-+|-+$/', '', preg_replace('/[^a-z0-9]+/', '-', strtolower($local)) ?? 'org');
        return ($base !== '' ? $base : 'org') . '-' . base_convert((string) time(), 10, 36);
    }

    private function splitCsv(?string $value): array
    {
        if ($value === null || trim($value) === '') {
            return [];
        }
        return array_values(array_filter(array_map('trim', explode(',', $value)), static fn (string $item): bool => $item !== ''));
    }

    private function parseTaskInput(string $rawInput): array
    {
        $lower = strtolower($rawInput);
        $title = trim(preg_replace('/\s+at\s+\d{1,2}(:\d{2})?\s*(am|pm)?/i', '', str_ireplace(['remind me to', 'tomorrow'], '', $rawInput)) ?? $rawInput);
        $due = new DateTimeImmutable('now');
        if (str_contains($lower, 'tomorrow')) {
            $due = $due->modify('+1 day');
        }
        if (preg_match('/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i', $lower, $matches) === 1) {
            $hour = (int) $matches[1];
            $minute = isset($matches[2]) ? (int) $matches[2] : 0;
            $meridiem = strtolower($matches[3] ?? '');
            if ($meridiem === 'pm' && $hour < 12) {
                $hour += 12;
            }
            if ($meridiem === 'am' && $hour === 12) {
                $hour = 0;
            }
            $due = $due->setTime($hour, $minute);
        } else {
            $due = $due->modify('+1 hour')->setTime((int) $due->format('H'), 0);
        }

        $categoryMap = [
            'Finance' => ['pay', 'bill', 'invoice', 'tax'],
            'Contact' => ['call', 'meet', 'client', 'email'],
            'Work' => ['deploy', 'review', 'build', 'bug'],
            'Personal' => ['gym', 'health', 'family', 'groceries'],
        ];
        $category = 'General';
        foreach ($categoryMap as $label => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($lower, $keyword)) {
                    $category = $label;
                    break 2;
                }
            }
        }

        $recurring = 'none';
        if (str_contains($lower, 'every day') || str_contains($lower, 'daily')) {
            $recurring = 'daily';
        } elseif (str_contains($lower, 'every week') || str_contains($lower, 'weekly')) {
            $recurring = 'weekly';
        } elseif (str_contains($lower, 'every month') || str_contains($lower, 'monthly')) {
            $recurring = 'monthly';
        } elseif (str_contains($lower, 'every year') || str_contains($lower, 'yearly')) {
            $recurring = 'yearly';
        }

        return [
            'title' => $title !== '' ? $title : $rawInput,
            'category' => $category,
            'tags' => [],
            'time' => $due->format('H:i'),
            'date' => $due->format('Y-m-d'),
            'dueDate' => $due->setTimezone(new \DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.v\Z'),
            'recurring' => $recurring,
        ];
    }

    private function toTaskDto(array $row): array
    {
        return [
            'id' => $row['id'],
            'rawInput' => $row['raw_input'],
            'title' => $row['title'],
            'category' => $row['category'],
            'tags' => $this->normalizeStringList($row['tags'] ?? '[]'),
            'time' => substr((string) ($row['task_time'] ?? '00:00'), 0, 5),
            'date' => substr((string) ($row['task_date'] ?? ''), 0, 10),
            'recurring' => $row['recurring'],
            'dueDate' => $this->iso($row['due_date']),
            'featured' => (int) ($row['featured'] ?? 0) === 1,
            'status' => $row['status'],
            'createdAt' => $this->iso($row['created_at']),
            'updatedAt' => $this->iso($row['updated_at']),
        ];
    }

    private function isInNextHours(string $dateIso, int $hours): bool
    {
        $due = strtotime($dateIso);
        if ($due === false) {
            return false;
        }
        $now = time();
        return $due >= $now && $due <= ($now + ($hours * 3600));
    }

    /** @return array<int, string> */
    private function normalizeStringList(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map(static fn ($item): string => trim((string) $item), $value), static fn (string $item): bool => $item !== ''));
        }
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                return $this->normalizeStringList($decoded);
            }
        }
        return [];
    }

    /** @return array<int, string> */
    private function getUserEntitledModules(string $userId): array
    {
        $user = $this->db->one('SELECT role FROM users WHERE id = ? LIMIT 1', [$userId]);
        $role = (string) ($user['role'] ?? '');
        $rows = $this->db->all(
            "SELECT DISTINCT m.name AS module_name
             FROM user_module_access uma
             INNER JOIN modules m ON m.id = uma.module_id
             WHERE uma.user_id = ?
               AND uma.access_granted = 1
               AND (uma.expires_at IS NULL OR uma.expires_at > UTC_TIMESTAMP())
               AND m.is_active = 1",
            [$userId]
        );
        $modules = array_fill_keys(array_map(static fn (array $row): string => (string) $row['module_name'], $rows), true);
        if ($role !== 'member') {
            $subRows = $this->db->all(
                "SELECT DISTINCT m.name AS module_name
                 FROM user_subscriptions us
                 INNER JOIN subscription_plans sp ON sp.id = us.plan_id AND sp.is_active = 1
                 INNER JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
                 INNER JOIN modules m ON m.id = pm.module_id AND m.is_active = 1
                 WHERE us.user_id = ? AND us.status = 'active' AND (us.end_date IS NULL OR us.end_date > UTC_TIMESTAMP())",
                [$userId]
            );
            foreach ($subRows as $row) {
                $modules[(string) $row['module_name']] = true;
            }
        }
        return array_keys($modules);
    }

    private function isOrganizationEntitledToModule(string $organizationId, string $moduleName): bool
    {
        return $this->db->one(
            "SELECT 1
             FROM organization_modules om
             INNER JOIN modules m ON m.id = om.module_id
             WHERE om.organization_id = ? AND m.name = ? AND om.status = 'active'
               AND (om.starts_at IS NULL OR om.starts_at <= UTC_TIMESTAMP())
               AND (om.expires_at IS NULL OR om.expires_at > UTC_TIMESTAMP())
               AND m.is_active = 1
             LIMIT 1",
            [$organizationId, $moduleName]
        ) !== null;
    }

    private function isUserEntitledToModule(string $userId, string $moduleName): bool
    {
        return in_array($moduleName, $this->getUserEntitledModules($userId), true);
    }

    /** @return array<int, array<string, mixed>> */
    private function getUserSubscriptionDetails(string $userId): array
    {
        $rows = $this->db->all(
            "SELECT us.id AS subscription_id, us.status, us.start_date, us.end_date, us.auto_renew, us.payment_provider, us.provider_subscription_id,
                    sp.id AS plan_id, sp.name AS plan_name, sp.display_name, sp.description, sp.price_monthly, sp.price_yearly, sp.currency,
                    IFNULL(GROUP_CONCAT(DISTINCT m.name ORDER BY m.name SEPARATOR ','), '') AS modules, COUNT(DISTINCT pm.module_id) AS module_count
             FROM user_subscriptions us
             INNER JOIN subscription_plans sp ON sp.id = us.plan_id
             LEFT JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
             LEFT JOIN modules m ON m.id = pm.module_id
             WHERE us.user_id = ?
             GROUP BY us.id, us.status, us.start_date, us.end_date, us.auto_renew, us.payment_provider, us.provider_subscription_id,
                      sp.id, sp.name, sp.display_name, sp.description, sp.price_monthly, sp.price_yearly, sp.currency
             ORDER BY us.created_at DESC",
            [$userId]
        );
        return array_map(fn (array $row): array => [
            'subscriptionId' => $row['subscription_id'],
            'status' => $row['status'],
            'startDate' => $row['start_date'],
            'endDate' => $row['end_date'],
            'renewDate' => $row['end_date'],
            'autoRenew' => (int) ($row['auto_renew'] ?? 0) === 1,
            'paymentProvider' => $row['payment_provider'] ?? null,
            'providerSubscriptionId' => $row['provider_subscription_id'] ?? null,
            'plan' => [
                'id' => $row['plan_id'],
                'name' => $row['plan_name'],
                'displayName' => $row['display_name'] ?? null,
                'description' => $row['description'] ?? null,
                'priceMonthly' => $row['price_monthly'],
                'priceYearly' => $row['price_yearly'],
                'currency' => $row['currency'],
                'type' => (int) ($row['module_count'] ?? 0) > 1 ? 'package' : 'module',
                'modules' => $this->splitCsv($row['modules'] ?? ''),
            ],
        ], $rows);
    }

    /** @return array<int, array<string, mixed>> */
    private function getOrganizationSubscriptionDetails(string $organizationId): array
    {
        $rows = $this->db->all(
            "SELECT os.id AS subscription_id, os.status, os.start_date, os.end_date, os.auto_renew,
                    sp.id AS plan_id, sp.name AS plan_name, sp.display_name, sp.description, sp.price_monthly, sp.price_yearly, sp.currency,
                    IFNULL(GROUP_CONCAT(DISTINCT m.name ORDER BY m.name SEPARATOR ','), '') AS modules, COUNT(DISTINCT pm.module_id) AS module_count
             FROM organization_subscriptions os
             INNER JOIN subscription_plans sp ON sp.id = os.plan_id
             LEFT JOIN plan_modules pm ON pm.plan_id = sp.id AND pm.is_enabled = 1
             LEFT JOIN modules m ON m.id = pm.module_id
             WHERE os.organization_id = ?
             GROUP BY os.id, os.status, os.start_date, os.end_date, os.auto_renew,
                      sp.id, sp.name, sp.display_name, sp.description, sp.price_monthly, sp.price_yearly, sp.currency
             ORDER BY os.created_at DESC",
            [$organizationId]
        );
        return array_map(fn (array $row): array => [
            'subscriptionId' => $row['subscription_id'],
            'status' => $row['status'],
            'startDate' => $row['start_date'],
            'endDate' => $row['end_date'],
            'autoRenew' => (int) ($row['auto_renew'] ?? 0) === 1,
            'plan' => [
                'id' => $row['plan_id'],
                'name' => $row['plan_name'],
                'displayName' => $row['display_name'] ?? null,
                'description' => $row['description'] ?? null,
                'priceMonthly' => $row['price_monthly'],
                'priceYearly' => $row['price_yearly'],
                'currency' => $row['currency'],
                'type' => (int) ($row['module_count'] ?? 0) > 1 ? 'package' : 'module',
                'modules' => $this->splitCsv($row['modules'] ?? ''),
            ],
        ], $rows);
    }

    private function canUser(string $userId, string $permissionSlug): array
    {
        $cacheKey = 'rbac:context:' . $userId;
        $context = $this->cache->get($cacheKey);
        if (!is_array($context)) {
            $row = $this->db->one(
                'SELECT id, organization_id, role, is_root, status FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
                [$userId]
            );
            if ($row === null) {
                $this->cache->set($cacheKey, null, 30);
                return ['allowed' => false, 'reason' => 'User not found'];
            }
            $context = [
                'userId' => $row['id'],
                'organizationId' => $row['organization_id'] ?? null,
                'role' => $row['role'],
                'isRoot' => (int) ($row['is_root'] ?? 0) === 1 || ($row['role'] ?? '') === 'root',
                'status' => $row['status'] ?? 'active',
            ];
            $this->cache->set($cacheKey, $context, 30);
        }

        if (($context['isRoot'] ?? false) === true) {
            return ['allowed' => true];
        }
        if (($context['status'] ?? '') !== 'active') {
            return ['allowed' => false, 'reason' => 'User status ' . $context['status'] . ' is not allowed'];
        }
        if (!is_string($context['organizationId'] ?? null) || $context['organizationId'] === '') {
            return ['allowed' => false, 'reason' => 'User organization is not assigned'];
        }
        if ($this->db->one('SELECT 1 FROM organizations WHERE id = ? AND is_active = 1 LIMIT 1', [$context['organizationId']]) === null) {
            return ['allowed' => false, 'reason' => 'Organization is not active'];
        }

        $this->ensureLegacyRoleBound($userId, $context['organizationId'], (string) $context['role']);
        $permissionCacheKey = 'rbac:permissions:' . $userId . ':' . $context['organizationId'];
        $permissions = $this->cache->get($permissionCacheKey);
        if (!is_array($permissions)) {
            $rows = $this->db->all(
                "SELECT DISTINCT p.slug
                 FROM user_roles ur
                 INNER JOIN roles r ON r.id = ur.role_id
                 INNER JOIN role_permissions rp ON rp.role_id = r.id
                 INNER JOIN permissions p ON p.id = rp.permission_id
                 WHERE ur.user_id = ? AND (r.organization_id IS NULL OR r.organization_id = ?)",
                [$userId, $context['organizationId']]
            );
            $permissions = array_map(static fn (array $row): string => (string) $row['slug'], $rows);
            $this->cache->set($permissionCacheKey, $permissions, 60);
        }
        if (!in_array($permissionSlug, $permissions, true)) {
            return ['allowed' => false, 'reason' => 'Missing permission: ' . $permissionSlug];
        }

        $module = $this->db->one(
            'SELECT m.slug
             FROM module_permissions mp
             INNER JOIN modules m ON m.id = mp.module_id
             INNER JOIN permissions p ON p.id = mp.permission_id
             WHERE p.slug = ? LIMIT 1',
            [$permissionSlug]
        );
        if ($module === null) {
            return ['allowed' => true];
        }

        if ($this->db->one(
            "SELECT 1
             FROM organization_modules om
             INNER JOIN modules m ON m.id = om.module_id
             WHERE om.organization_id = ? AND m.slug = ? AND om.status = 'active'
               AND (om.starts_at IS NULL OR om.starts_at <= UTC_TIMESTAMP())
               AND (om.expires_at IS NULL OR om.expires_at > UTC_TIMESTAMP())
               AND m.is_active = 1
             LIMIT 1",
            [$context['organizationId'], $module['slug']]
        ) === null) {
            return ['allowed' => false, 'reason' => 'Module not enabled: ' . $module['slug']];
        }

        return ['allowed' => true];
    }

    private function ensureLegacyRoleBound(string $userId, ?string $organizationId, string $legacyRole): void
    {
        if ($this->db->one('SELECT 1 FROM user_roles WHERE user_id = ? LIMIT 1', [$userId]) !== null) {
            return;
        }
        $role = $this->db->one(
            "SELECT id
             FROM roles
             WHERE slug = ?
               AND (((organization_id IS NULL) AND is_system_role = 1) OR organization_id = ?)
             ORDER BY is_system_role DESC
             LIMIT 1",
            [$legacyRole, $organizationId]
        );
        if ($role === null) {
            return;
        }
        $this->db->execute('INSERT IGNORE INTO user_roles (id, user_id, role_id) VALUES (UUID(), ?, ?)', [$userId, $role['id']]);
    }

    private function getUserAuthorizationSnapshot(string $userId): ?array
    {
        $user = $this->db->one('SELECT id, organization_id, role, is_root, status FROM users WHERE id = ? AND is_active = 1 LIMIT 1', [$userId]);
        if ($user === null) {
            return null;
        }
        $context = [
            'userId' => $user['id'],
            'organizationId' => $user['organization_id'] ?? null,
            'role' => $user['role'],
            'isRoot' => (int) ($user['is_root'] ?? 0) === 1 || ($user['role'] ?? '') === 'root',
            'status' => $user['status'] ?? 'active',
        ];
        if ($context['isRoot']) {
            return ['context' => $context, 'roles' => ['root'], 'permissions' => ['*'], 'modules' => ['*']];
        }

        $roles = $this->db->all(
            'SELECT DISTINCT r.slug
             FROM user_roles ur
             INNER JOIN roles r ON r.id = ur.role_id
             WHERE ur.user_id = ? AND (r.organization_id IS NULL OR r.organization_id = ?)',
            [$userId, $context['organizationId']]
        );

        $permissions = $this->canUser($userId, '__snapshot__');
        unset($permissions);

        $permissionRows = $this->db->all(
            "SELECT DISTINCT p.slug
             FROM user_roles ur
             INNER JOIN roles r ON r.id = ur.role_id
             INNER JOIN role_permissions rp ON rp.role_id = r.id
             INNER JOIN permissions p ON p.id = rp.permission_id
             WHERE ur.user_id = ? AND (r.organization_id IS NULL OR r.organization_id = ?)",
            [$userId, $context['organizationId']]
        );

        $moduleRows = [];
        if (is_string($context['organizationId']) && $context['organizationId'] !== '') {
            $moduleRows = $this->db->all(
                "SELECT DISTINCT m.slug
                 FROM organization_modules om
                 INNER JOIN modules m ON m.id = om.module_id
                 WHERE om.organization_id = ? AND om.status = 'active'
                   AND (om.starts_at IS NULL OR om.starts_at <= UTC_TIMESTAMP())
                   AND (om.expires_at IS NULL OR om.expires_at > UTC_TIMESTAMP())
                   AND m.is_active = 1",
                [$context['organizationId']]
            );
        }

        return [
            'context' => $context,
            'roles' => array_map(static fn (array $row): string => (string) $row['slug'], $roles),
            'permissions' => array_map(static fn (array $row): string => (string) $row['slug'], $permissionRows),
            'modules' => array_map(static fn (array $row): string => (string) $row['slug'], $moduleRows),
        ];
    }

    private function fetchConceptQuestion(string $userId, string $conceptId, string $mode): ?array
    {
        $questions = $this->db->all(
            'SELECT id, concept_id, type, question_text, difficulty, explanation, question_order
             FROM prepkarta_questions WHERE concept_id = ? ORDER BY question_order ASC',
            [$conceptId]
        );
        if ($questions === []) {
            return null;
        }
        $progress = $this->db->one(
            'SELECT * FROM prepkarta_user_concept_progress WHERE user_id = ? AND concept_id = ? LIMIT 1',
            [$userId, $conceptId]
        );
        $weakRows = $this->db->all(
            "SELECT question_id,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
                    SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count
             FROM prepkarta_user_answer_history
             WHERE user_id = ? AND concept_id = ?
             GROUP BY question_id",
            [$userId, $conceptId]
        );
        $weakSet = [];
        foreach ($weakRows as $row) {
            if ((int) ($row['wrong_count'] ?? 0) > (int) ($row['correct_count'] ?? 0)) {
                $weakSet[(string) $row['question_id']] = true;
            }
        }

        $selected = $questions[0];
        if ($mode === 'resume') {
            $index = max(0, min(count($questions) - 1, (int) ($progress['last_question_index'] ?? 0)));
            $selected = $questions[$index] ?? $questions[0];
        } elseif ($mode === 'weak') {
            foreach ($questions as $question) {
                if (isset($weakSet[$question['id']])) {
                    $selected = $question;
                    break;
                }
            }
        } else {
            $selected = $questions[array_rand($questions)];
        }

        $options = $this->db->all(
            'SELECT id, question_id, text, is_correct FROM prepkarta_options WHERE question_id = ? ORDER BY created_at ASC',
            [$selected['id']]
        );

        return [
            'mode' => $mode,
            'question' => [
                'id' => $selected['id'],
                'conceptId' => $selected['concept_id'],
                'type' => $selected['type'],
                'questionText' => $selected['question_text'],
                'difficulty' => $selected['difficulty'],
                'questionOrder' => $selected['question_order'],
                'options' => array_map(static fn (array $option): array => ['id' => $option['id'], 'text' => $option['text']], $options),
            ],
            'progress' => [
                'attempted' => (int) ($progress['attempts_count'] ?? 0),
                'total' => count($questions),
            ],
        ];
    }

    private function answerConceptQuestion(string $userId, string $questionId, array $selectedOptionIds, int $timeSpentSeconds): ?array
    {
        $question = $this->db->one(
            'SELECT id, concept_id, type, question_text, difficulty, explanation, question_order FROM prepkarta_questions WHERE id = ? LIMIT 1',
            [$questionId]
        );
        if ($question === null) {
            return null;
        }
        $options = $this->db->all('SELECT id, question_id, text, is_correct FROM prepkarta_options WHERE question_id = ?', [$questionId]);
        $correctOptionIds = array_values(array_map(static fn (array $row): string => (string) $row['id'], array_filter($options, static fn (array $row): bool => (int) ($row['is_correct'] ?? 0) === 1)));
        sort($correctOptionIds);
        $selectedOptionIds = array_values(array_unique($selectedOptionIds));
        sort($selectedOptionIds);
        $isCorrect = $correctOptionIds === $selectedOptionIds;

        $attemptCountRow = $this->db->one('SELECT COUNT(*) AS attempts FROM prepkarta_user_answer_history WHERE user_id = ? AND question_id = ?', [$userId, $questionId]);
        $attemptsForQuestion = (int) ($attemptCountRow['attempts'] ?? 0) + 1;
        $latestRow = $this->db->one(
            'SELECT repetition_level FROM prepkarta_user_answer_history WHERE user_id = ? AND question_id = ? ORDER BY attempted_at DESC LIMIT 1',
            [$userId, $questionId]
        );
        $previousLevel = (int) ($latestRow['repetition_level'] ?? 0);
        $repetitionLevel = $isCorrect ? max(0, $previousLevel - 1) : min(10, $previousLevel + 1);
        $repeatAfterAttempts = $isCorrect ? 0 : (($attemptsForQuestion % 5 === 0) ? 5 : ($attemptsForQuestion > 5 ? 1 : 3));

        $this->db->transaction(function () use ($userId, $question, $questionId, $selectedOptionIds, $isCorrect, $repetitionLevel, $repeatAfterAttempts, $timeSpentSeconds): void {
            $this->db->execute(
                'INSERT INTO prepkarta_user_answer_history
                 (id, user_id, concept_id, question_id, selected_options, is_correct, repetition_level, repeat_after_attempts, time_spent_seconds, attempted_at)
                 VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [$userId, $question['concept_id'], $questionId, json_encode($selectedOptionIds, JSON_THROW_ON_ERROR), $isCorrect ? 1 : 0, $repetitionLevel, $repeatAfterAttempts, $timeSpentSeconds]
            );

            $aggregate = $this->db->one(
                "SELECT
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers,
                    SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrong_answers,
                    COUNT(*) AS total_attempts,
                    COALESCE(SUM(time_spent_seconds), 0) AS total_practice_seconds
                 FROM prepkarta_user_answer_history
                 WHERE user_id = ? AND concept_id = ?",
                [$userId, $question['concept_id']]
            ) ?? ['correct_answers' => 0, 'wrong_answers' => 0, 'total_attempts' => 0, 'total_practice_seconds' => 0];

            $concept = $this->db->one('SELECT total_questions FROM prepkarta_concepts WHERE id = ? LIMIT 1', [$question['concept_id']]) ?? ['total_questions' => 1];
            $totalQuestions = max(1, (int) ($concept['total_questions'] ?? 1));
            $nextIndex = min($totalQuestions - 1, (int) ($question['question_order'] ?? 1));
            $mastery = $this->calculateMasteryScore((int) ($aggregate['correct_answers'] ?? 0), (int) ($aggregate['wrong_answers'] ?? 0), (int) ($aggregate['total_attempts'] ?? 0));

            $this->db->execute(
                'INSERT INTO prepkarta_user_concept_progress
                 (id, user_id, concept_id, last_question_index, mastery_score, attempts_count, correct_answers, wrong_answers, total_practice_seconds, updated_at)
                 VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                 ON DUPLICATE KEY UPDATE
                   last_question_index = VALUES(last_question_index),
                   mastery_score = VALUES(mastery_score),
                   attempts_count = VALUES(attempts_count),
                   correct_answers = VALUES(correct_answers),
                   wrong_answers = VALUES(wrong_answers),
                   total_practice_seconds = VALUES(total_practice_seconds),
                   updated_at = CURRENT_TIMESTAMP',
                [$userId, $question['concept_id'], $nextIndex, $mastery, (int) $aggregate['total_attempts'], (int) $aggregate['correct_answers'], (int) $aggregate['wrong_answers'], (int) $aggregate['total_practice_seconds']]
            );
        });

        return [
            'questionId' => $questionId,
            'conceptId' => $question['concept_id'],
            'isCorrect' => $isCorrect,
            'correctOptionIds' => $correctOptionIds,
            'explanation' => $question['explanation'],
            'repetitionLevel' => $repetitionLevel,
            'repeatAfterAttempts' => $repeatAfterAttempts,
        ];
    }

    private function calculateMasteryScore(int $correctAnswers, int $wrongAnswers, int $totalAttempts): float
    {
        if ($totalAttempts <= 0) {
            return 0.0;
        }
        return round(($correctAnswers - ($wrongAnswers * 0.5)) / $totalAttempts, 4);
    }

    private function masteryStatus(float $score, int $attempts): string
    {
        if ($attempts < 5) {
            return 'in_progress';
        }
        if ($score >= 0.7) {
            return 'mastered';
        }
        if ($score <= 0.35) {
            return 'weak';
        }
        return 'in_progress';
    }

    private function toConceptPayload(array $concept, ?array $progress): array
    {
        $masteryScore = (float) ($progress['mastery_score'] ?? 0);
        $attempts = (int) ($progress['attempts_count'] ?? 0);
        return [
            'id' => $concept['id'],
            'subjectId' => $concept['subject_id'],
            'name' => $concept['name'],
            'totalQuestions' => (int) ($concept['total_questions'] ?? 0),
            'attemptedQuestions' => $attempts,
            'masteryScore' => $masteryScore,
            'masteryStatus' => $this->masteryStatus($masteryScore, $attempts),
            'progressPercent' => (int) ($concept['total_questions'] ?? 0) > 0 ? min(100, (int) round(($attempts / (int) $concept['total_questions']) * 100)) : 0,
            'weak' => $this->masteryStatus($masteryScore, $attempts) === 'weak',
        ];
    }

    private function getPrepkartaSubchapterContext(string $subchapterId): ?array
    {
        return $this->db->one(
            "SELECT sc.name AS subchapter_name, c.name AS chapter_name, s.name AS subject_name
             FROM prepkarta_subchapters sc
             INNER JOIN prepkarta_concepts c ON c.id = sc.chapter_id
             INNER JOIN prepkarta_subjects s ON s.id = c.subject_id
             WHERE sc.id = ? LIMIT 1",
            [$subchapterId]
        );
    }

    private function normalizeIsbn(string $raw): string
    {
        return strtoupper((string) preg_replace('/[^0-9Xx]/', '', $raw));
    }

    private function isValidIsbn(string $isbn): bool
    {
        if (preg_match('/^\d{13}$/', $isbn) === 1) {
            $sum = 0;
            for ($index = 0; $index < 12; $index++) {
                $digit = (int) $isbn[$index];
                $sum += $index % 2 === 0 ? $digit : $digit * 3;
            }
            return ((10 - ($sum % 10)) % 10) === (int) $isbn[12];
        }
        if (preg_match('/^\d{9}[\dX]$/', $isbn) === 1) {
            $sum = 0;
            for ($index = 0; $index < 9; $index++) {
                $sum += ($index + 1) * (int) $isbn[$index];
            }
            $check = $isbn[9] === 'X' ? 10 : (int) $isbn[9];
            return (($sum + (10 * $check)) % 11) === 0;
        }
        return false;
    }

    /** @return array<int, string> */
    private function fetchBookChaptersByIsbn(string $isbn): array
    {
        $response = $this->httpJson('GET', 'https://openlibrary.org/isbn/' . rawurlencode($isbn) . '.json');
        if (!is_array($response)) {
            return [];
        }
        $items = array_merge(
            is_array($response['table_of_contents'] ?? null) ? $response['table_of_contents'] : [],
            is_array($response['contents'] ?? null) ? $response['contents'] : []
        );
        $chapters = [];
        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }
            $title = trim((string) ($item['title'] ?? $item['label'] ?? ''));
            if ($title !== '') {
                $chapters[$title] = true;
            }
        }
        return array_slice(array_keys($chapters), 0, 20);
    }

    /** @return array<int, string> */
    private function suggestChaptersWithAi(string $subject, string $board, string $classLevel, ?string $isbn): array
    {
        $prompt = implode("\n", [
            'You are an academic curriculum assistant.',
            "Generate up to 12 chapter names for Subject: $subject, Board: $board, Class: $classLevel.",
            $isbn ? "ISBN context (if recognized): $isbn. Match chapter names to that textbook if possible." : 'No ISBN provided.',
            'Return ONLY a JSON array of strings.',
            'No markdown. No explanations. No extra keys.',
            'Example format: ["Chapter 1", "Chapter 2"]',
        ]);
        $response = $this->hfGenerate($prompt, $this->hfMaxTokens());
        if ($response === null) {
            return [];
        }
        return array_slice($this->extractStringArray($response), 0, 12);
    }

    /** @return array<int, string> */
    private function fallbackChapterSuggestions(string $subject): array
    {
        $fallbacks = [
            'mathematics' => ['Number Systems', 'Algebra', 'Geometry', 'Mensuration', 'Statistics', 'Probability'],
            'english' => ['Grammar Fundamentals', 'Reading Comprehension', 'Writing Skills', 'Poetry', 'Prose', 'Vocabulary Building'],
            'science' => ['Matter and Materials', 'Force and Motion', 'Energy', 'Life Processes', 'Natural Resources', 'Environment'],
            'physics' => ['Units and Measurements', 'Motion', 'Laws of Motion', 'Work and Energy', 'Waves', 'Electricity'],
            'chemistry' => ['Atomic Structure', 'Chemical Bonding', 'Acids and Bases', 'Metals and Non-metals', 'Organic Basics', 'Periodic Classification'],
            'biology' => ['Cell Structure', 'Plant Physiology', 'Human Physiology', 'Genetics', 'Ecology', 'Reproduction'],
            'social science' => ['History', 'Geography', 'Civics', 'Economics', 'Map Work', 'Contemporary Issues'],
        ];
        $key = strtolower(trim($subject));
        if (isset($fallbacks[$key])) {
            return $fallbacks[$key];
        }
        return ['Introduction', 'Core Concepts', 'Practice Set 1', 'Practice Set 2', 'Revision', 'Assessment'];
    }

    /** @return array<int, string> */
    private function extractChaptersFromImage(string $subject, string $imageDataUrl): array
    {
        $prompt = implode("\n", [
            "Subject: $subject",
            'This is a textbook table of contents / index page.',
            'Extract ONLY text that is clearly visible on the page.',
            'Return ONLY one JSON array of strings.',
            'Do not return markdown. Do not return explanation.',
        ]);
        $payload = [
            'model' => Env::get('HF_VISION_MODEL', 'Qwen/Qwen2.5-VL-7B-Instruct'),
            'messages' => [[
                'role' => 'user',
                'content' => [
                    ['type' => 'text', 'text' => $prompt],
                    ['type' => 'image_url', 'image_url' => ['url' => $imageDataUrl]],
                ],
            ]],
            'temperature' => 0.1,
            'top_p' => 0.9,
            'max_tokens' => $this->hfMaxTokens(),
        ];

        $response = $this->httpJson('POST', 'https://router.huggingface.co/v1/chat/completions', $payload, [
            'Authorization: Bearer ' . (Env::get('HF_TOKEN') ?? ''),
            'Content-Type: application/json',
        ]);

        $content = is_array($response['choices'] ?? null) ? (string) ($response['choices'][0]['message']['content'] ?? '') : '';
        return $this->sanitizeExtractedEntries($this->extractStringArray($content));
    }

    /** @return array<int, string> */
    private function extractStringArray(string $input): array
    {
        if (preg_match('/```json\s*([\s\S]*?)\s*```/i', $input, $matches) === 1) {
            $input = $matches[1];
        }
        if (preg_match('/\[[\s\S]*\]/', $input, $matches) === 1) {
            $input = $matches[0];
        }
        $decoded = json_decode($input, true);
        if (!is_array($decoded)) {
            return [];
        }
        $items = [];
        foreach ($decoded as $value) {
            if (is_string($value) && trim($value) !== '') {
                $items[trim($value)] = true;
            }
        }
        return array_keys($items);
    }

    /** @return array<int, string> */
    private function sanitizeExtractedEntries(array $items): array
    {
        $result = [];
        foreach ($items as $item) {
            $clean = trim(preg_replace('/\s*-\s*$/', '', str_replace(['–', '—'], '-', preg_replace('/\s+/', ' ', $item) ?? $item)) ?? '');
            if (strlen($clean) >= 3) {
                $result[$clean] = true;
            }
        }
        return array_keys($result);
    }

    private function buildChapterSummaryPrompt(string $board, string $classLevel, string $subject, string $chapter, ?string $ask, array $history): string
    {
        $askText = trim((string) $ask);
        $askLine = $askText !== '' ? "Student request focus: $askText" : 'Student request focus: General understanding and revision readiness.';
        $historyLines = $history === []
            ? ['No previous conversation context.']
            : array_merge(['Previous conversation context (follow this and avoid repeating the same points):'], ...array_map(
                static fn (array $turn, int $index): array => ['Q' . ($index + 1) . ': ' . $turn['question'], 'A' . ($index + 1) . ': ' . substr($turn['answer'], 0, 800)],
                $history,
                array_keys($history)
            ));

        return implode("\n", array_merge([
            'You are an expert school tutor and curriculum designer.',
            'Create a high-quality chapter summary for a school student.',
            "Board: $board",
            "Class: $classLevel",
            "Subject: $subject",
            "Chapter: $chapter",
            $askLine,
        ], $historyLines, [
            '',
            'Instructions:',
            '1) Keep language simple, precise, and grade-appropriate.',
            '2) Do not assume chapter text is available; use standard curriculum understanding.',
            '3) Return clean markdown only (no HTML).',
            '### Chapter Summary',
            '### Key Terms',
            '### Important Formulas/Facts',
            '### Common Mistakes to Avoid',
            '### Quick Revision Checklist',
            '### Practice Questions',
        ]));
    }

    private function buildPrepkartaSubchapterPrompt(string $subject, string $chapter, string $subchapter, ?string $ask, array $history): string
    {
        $lines = [
            'You are a senior software engineering interviewer and academic tutor creating content for an exam and interview preparation platform.',
            "Subject: $subject",
            "Chapter: $chapter",
            "Subchapter: $subchapter",
            'Mode: ' . ($history === [] ? 'SUMMARY' : 'FOLLOW-UP'),
            $ask ? "User Request: $ask" : 'User Request: Provide a complete study guide for quick revision.',
            'Required Output Structure:',
            '1. Overview',
            '2. Key Concepts',
            '3. Architecture & Flow',
            '4. Important Facts / Formulas',
            '5. Common Mistakes',
            '6. Interview Deep-Dive Prompts',
            '7. Quick Revision Checklist',
            '8. Practice Questions',
            '9. Interview Readiness Verdict',
        ];
        foreach ($history as $index => $item) {
            $lines[] = 'Q' . ($index + 1) . ': ' . $item['question'];
            $lines[] = 'A' . ($index + 1) . ': ' . $item['answer'];
        }
        return implode("\n", $lines);
    }

    private function buildPrepkartaMcqPrompt(string $subject, string $chapter, string $subchapter, int $count): string
    {
        return trim("
You are an expert interview-prep question setter and assessment designer.
Generate exactly $count MCQs in VALID JSON only.
Subject: $subject
Chapter: $chapter
Subchapter: $subchapter
Schema:
{
  \"subject\": \"$subject\",
  \"chapter\": \"$chapter\",
  \"subchapter\": \"$subchapter\",
  \"mcqs\": [
    {
      \"id\": 1,
      \"difficulty\": \"easy | medium | hard\",
      \"question\": \"string\",
      \"options\": {\"A\": \"string\", \"B\": \"string\", \"C\": \"string\", \"D\": \"string\"},
      \"correctAnswer\": \"A | B | C | D\",
      \"explanation\": \"string\"
    }
  ]
}
");
    }

    private function hfMaxTokens(): int
    {
        return Env::int('HF_MAX_TOKENS', 2000);
    }

    private function hfGenerate(string $prompt, int $maxTokens): ?string
    {
        $token = Env::get('HF_TOKEN');
        if (!$token) {
            return null;
        }
        $model = Env::get('HF_MODEL', 'meta-llama/Llama-3.1-8B-Instruct') ?? 'meta-llama/Llama-3.1-8B-Instruct';
        $payload = [
            'model' => $model,
            'messages' => [['role' => 'user', 'content' => $prompt]],
            'temperature' => 0.1,
            'top_p' => 0.9,
            'max_tokens' => $maxTokens,
        ];
        $response = $this->httpJson('POST', 'https://router.huggingface.co/v1/chat/completions', $payload, [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
        ]);
        $content = is_array($response['choices'] ?? null) ? ($response['choices'][0]['message']['content'] ?? null) : null;
        if (is_string($content) && trim($content) !== '') {
            return trim($content);
        }
        return null;
    }

    /**
     * @param array<int, string> $headers
     * @return array<string, mixed>|null
     */
    private function httpJson(string $method, string $url, ?array $payload = null, array $headers = []): ?array
    {
        $ch = curl_init($url);
        if ($ch === false) {
            return null;
        }
        $requestHeaders = $headers;
        if ($payload !== null && !array_filter($headers, static fn (string $header): bool => str_starts_with(strtolower($header), 'content-type:'))) {
            $requestHeaders[] = 'Content-Type: application/json';
        }
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => strtoupper($method),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => $requestHeaders,
        ]);
        if ($payload !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_THROW_ON_ERROR));
        }
        $body = curl_exec($ch);
        if (!is_string($body)) {
            curl_close($ch);
            return null;
        }
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($status < 200 || $status >= 300) {
            return null;
        }
        $decoded = json_decode($body, true);
        return is_array($decoded) ? $decoded : null;
    }

    private function deriveTitleFromFilename(string $filename): string
    {
        $base = pathinfo($filename, PATHINFO_FILENAME);
        $cleaned = trim((string) preg_replace('/\s+/', ' ', str_replace(['_', '-'], ' ', $base)));
        return $cleaned !== '' ? $cleaned : 'Untitled ebook';
    }

    /**
     * @param array<int, string> $fields
     * @return array<string, mixed>|null
     */
    private function firstUploadedFile(Request $request, array $fields): ?array
    {
        foreach ($fields as $field) {
            $files = $request->uploadedFiles($field);
            if ($files !== []) {
                return $files[0];
            }
        }
        return null;
    }

    private function sanitizeChapter(string $value): string
    {
        $cleaned = trim((string) preg_replace('/\s*-\s*$/', '', str_replace(['–', '—'], '-', preg_replace('/\s{2,}/', ' ', $value) ?? $value)));
        return substr($cleaned, 0, 255);
    }

    private function iso(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        try {
            return (new DateTimeImmutable((string) $value))->format('c');
        } catch (Exception) {
            return (string) $value;
        }
    }

    /** @return array<int, array{question:string, answer:string}> */
    private function optionalHistory(mixed $value, int $max = 8): array
    {
        if (!is_array($value)) {
            return [];
        }
        $history = [];
        foreach (array_slice($value, 0, $max) as $item) {
            if (!is_array($item)) {
                continue;
            }
            $question = trim((string) ($item['question'] ?? ''));
            $answer = trim((string) ($item['answer'] ?? ''));
            if ($question !== '' && $answer !== '') {
                $history[] = ['question' => substr($question, 0, 400), 'answer' => substr($answer, 0, 4000)];
            }
        }
        return $history;
    }

    private function uuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    private function requiredEmail(array $source, string $key): string
    {
        $value = $this->requiredString($source, $key, 3, 255);
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        return strtolower($value);
    }

    private function requiredQueryString(Request $request, string $key, int $min, int $max): string
    {
        if (!is_string($request->query[$key] ?? null)) {
            throw new HttpException(400, 'Invalid query', ['error' => 'Invalid query']);
        }
        $value = trim((string) $request->query[$key]);
        if ($value === '' || strlen($value) < $min || strlen($value) > $max) {
            throw new HttpException(400, 'Invalid query', ['error' => 'Invalid query']);
        }
        return $value;
    }

    private function requiredString(array $source, string $key, int $min, int $max): string
    {
        $value = $source[$key] ?? null;
        if (!is_string($value)) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        $value = trim($value);
        if (strlen($value) < $min || strlen($value) > $max) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        return $value;
    }

    private function optionalString(array $source, string $key, int $min, int $max): ?string
    {
        $value = $source[$key] ?? null;
        if ($value === null || $value === '') {
            return null;
        }
        if (!is_string($value)) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        $value = trim($value);
        if ($value === '') {
            return null;
        }
        if (strlen($value) < $min || strlen($value) > $max) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        return $value;
    }

    private function requiredBool(array $source, string $key): bool
    {
        $value = $source[$key] ?? null;
        if (!is_bool($value)) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        return $value;
    }

    private function optionalBool(array $source, string $key): ?bool
    {
        $value = $source[$key] ?? null;
        return is_bool($value) ? $value : null;
    }

    private function requiredEnum(array $source, string $key, array $allowed): string
    {
        $value = $this->requiredString($source, $key, 1, 255);
        if (!in_array($value, $allowed, true)) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        return $value;
    }

    private function optionalEnum(array $source, string $key, array $allowed): ?string
    {
        $value = $this->optionalString($source, $key, 1, 255);
        if ($value === null) {
            return null;
        }
        if (!in_array($value, $allowed, true)) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        return $value;
    }

    /** @return array<int, string> */
    private function requiredStringArray(array $source, string $key, int $minItems, int $maxItems, int $minLen, int $maxLen): array
    {
        $value = $source[$key] ?? null;
        if (!is_array($value)) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        $result = [];
        foreach ($value as $item) {
            if (!is_string($item)) {
                throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
            }
            $trimmed = trim($item);
            if ($trimmed === '' || strlen($trimmed) < $minLen || strlen($trimmed) > $maxLen) {
                throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
            }
            $result[] = $trimmed;
        }
        if (count($result) < $minItems || count($result) > $maxItems) {
            throw new HttpException(400, 'Invalid payload', ['error' => 'Invalid payload']);
        }
        return $result;
    }

    /** @return array<int, string>|null */
    private function optionalStringArray(array $source, string $key, int $minItems, int $maxItems, int $minLen, int $maxLen): ?array
    {
        if (!array_key_exists($key, $source) || $source[$key] === null) {
            return null;
        }
        return $this->requiredStringArray($source, $key, $minItems, $maxItems, $minLen, $maxLen);
    }
}
