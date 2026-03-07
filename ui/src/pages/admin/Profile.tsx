import React, { useCallback, useEffect, useState } from 'react';
import { CircleUserRound, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { canPermission, listUsers, updateUserRole, type ManageableUser } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function ProfilePage() {
  const { token, user, logout, rbac, modules, permissions, roles, refreshRbac } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<ManageableUser[]>([]);
  const [savingUserId, setSavingUserId] = useState('');
  const [permissionChecks, setPermissionChecks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!token) return;

    try {
      await refreshRbac();
      if (user?.isRoot) {
        const userData = await listUsers(token);
        setUsers(userData.users);

        const checks = await Promise.all([
          'users.create',
          'users.update',
          'users.delete',
          'roles.create',
          'roles.update',
          'tickets.assign',
          'billing.view',
          'billing.update',
        ].map(async (permission) => {
          const result = await canPermission(token, permission);
          return [permission, result.allowed] as const;
        }));
        setPermissionChecks(Object.fromEntries(checks));
      } else {
        setUsers([]);
        setPermissionChecks({});
      }
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile data';
      if (message.toLowerCase().includes('unauthorized')) logout();
      setError(message);
    }
  }, [token, user, logout, refreshRbac]);

  async function onRoleChange(userId: string, role: 'admin' | 'superadmin' | 'member') {
    if (!token) return;
    setSavingUserId(userId);
    try {
      await updateUserRole(token, userId, role);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update role';
      setError(message);
    } finally {
      setSavingUserId('');
    }
  }

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <CircleUserRound className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">Profile</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">{user?.email}</h1>
        <p className="text-sm text-slate-500 mt-1">Role: {user?.role ?? 'member'}</p>
        <p className="text-sm text-slate-500 mt-1">Organization: {rbac?.context.organizationId ?? 'Not assigned'}</p>
        <p className="text-sm text-slate-500 mt-1">Status: {rbac?.context.status ?? 'unknown'}</p>
        {error ? <p className="text-sm text-red-400 mt-3">{error}</p> : null}
      </Card>

      <Card title="Assigned Roles">
        <div className="flex flex-wrap gap-2">
          {roles.length === 0 ? (
            <span className="text-sm text-slate-500">No role mapping found.</span>
          ) : (
            roles.map((name) => (
              <span key={name} className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal border border-teal/40 bg-teal/10">
                {name}
              </span>
            ))
          )}
        </div>
      </Card>

      <Card title="Enabled Modules (Organization)">
        <div className="flex flex-wrap gap-2">
          {modules.length === 0 ? (
            <span className="text-sm text-slate-500">No active organization modules.</span>
          ) : (
            modules.map((name) => (
              <span key={name} className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal border border-teal/40 bg-teal/10">
                {name}
              </span>
            ))
          )}
        </div>
      </Card>

      <Card title="Effective Permissions">
        <div className="flex flex-wrap gap-2">
          {permissions.length === 0 ? (
            <span className="text-sm text-slate-500">No permissions assigned.</span>
          ) : (
            permissions.map((permission) => (
              <span key={permission} className="rounded-md px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-200 border border-white/20 bg-white/5">
                {permission}
              </span>
            ))
          )}
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-slate-400">Module purchases and upgrades are managed on the Subscription page.</p>
        <button
          type="button"
          onClick={() => navigate('/admin/subscription')}
          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal text-black hover:bg-teal/90"
        >
          Open Subscription
        </button>
      </Card>

      {user?.isRoot ? (
        <Card title="Root Platform Control">
          <div className="space-y-4">
            <div className="rounded-xl border border-teal/40 bg-teal/10 p-3">
              <p className="text-sm text-teal font-semibold inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Root is a platform-level super administrator
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Root bypasses organization, module, and permission restrictions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="rounded-lg border border-white/10 p-2 bg-white/5">Manage all organizations</div>
              <div className="rounded-lg border border-white/10 p-2 bg-white/5">Manage all users across orgs</div>
              <div className="rounded-lg border border-white/10 p-2 bg-white/5">Assign/remove any role</div>
              <div className="rounded-lg border border-white/10 p-2 bg-white/5">Override RBAC permission checks</div>
              <div className="rounded-lg border border-white/10 p-2 bg-white/5">Enable/disable modules for orgs</div>
              <div className="rounded-lg border border-white/10 p-2 bg-white/5">Manage platform billing and modules</div>
            </div>
          </div>
        </Card>
      ) : null}

      {user?.isRoot ? (
        <Card title="Root Permission Diagnostics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(permissionChecks).map(([permission, allowed]) => (
              <div key={permission} className="rounded-lg border border-white/10 p-2 bg-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-300">{permission}</span>
                <span className={allowed ? 'text-xs text-teal font-semibold' : 'text-xs text-red-400 font-semibold'}>
                  {allowed ? 'allowed' : 'denied'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {user?.isRoot ? (
        <Card title="User Role Management (Root Only)">
          {users.length === 0 ? (
            <p className="text-sm text-slate-500">No users found.</p>
          ) : (
            <div className="space-y-3">
              {users.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-heading font-semibold">
                      {item.email} {item.isRoot ? '(root)' : ''}
                    </p>
                    <p className="text-xs text-slate-400">
                      Current role: {item.role} • Status: {item.isActive ? 'active' : 'inactive'}
                    </p>
                  </div>
                  <select
                    value={item.role}
                    disabled={item.isRoot || savingUserId === item.id}
                    onChange={(e) => void onRoleChange(item.id, e.target.value as 'admin' | 'superadmin' | 'member')}
                    className="bg-white/5 border border-white/10 text-slate-200 rounded-lg px-2 py-1 text-sm disabled:opacity-50"
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                    <option value="superadmin">superadmin</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
