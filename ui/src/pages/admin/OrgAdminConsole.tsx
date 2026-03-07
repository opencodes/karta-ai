import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, KeyRound, Shield } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import {
  createOrgAdminApiKey,
  createOrgAdminRole,
  buyOrgModule,
  getOrgBillingCatalogModules,
  getOrgBillingSubscriptions,
  getOrgAdminOverview,
  getOrgAdminReports,
  getOrgAdminRolePermissions,
  getOrgAdminSettings,
  listOrgAdminApiKeys,
  listOrgModuleAccessRequests,
  listOrgAdminMemberModules,
  listOrgAdminModules,
  listOrgAdminPermissions,
  listOrgAdminRoles,
  listOrgAdminUsers,
  revokeOrgAdminApiKey,
  resolveOrgModuleAccessRequest,
  updateOrgAdminMemberModuleAccess,
  updateOrgAdminModule,
  updateOrgAdminRolePermissions,
  updateOrgAdminSettings,
  type OrgAdminRole,
  type OrgAdminUser,
  type OrgApiKey,
  type OrgModule,
  type OrgMemberModuleAccess,
  type OrgPermission,
  type ModuleAccessRequestItem,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function OrgAdminConsolePage() {
  const { token, user, logout } = useAuth();

  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [orgUsers, setOrgUsers] = useState<OrgAdminUser[]>([]);
  const [roles, setRoles] = useState<OrgAdminRole[]>([]);
  const [permissions, setPermissions] = useState<OrgPermission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [modules, setModules] = useState<OrgModule[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberModules, setMemberModules] = useState<OrgMemberModuleAccess[]>([]);
  const [requests, setRequests] = useState<ModuleAccessRequestItem[]>([]);
  const [apiKeys, setApiKeys] = useState<OrgApiKey[]>([]);
  const [reports, setReports] = useState<Record<string, unknown> | null>(null);
  const [orgBillingSubscriptions, setOrgBillingSubscriptions] = useState<Array<Record<string, unknown>>>([]);
  const [orgCatalogModules, setOrgCatalogModules] = useState<Array<Record<string, unknown>>>([]);
  const [settings, setSettings] = useState<{ name: string; plan: string }>({ name: '', plan: '' });

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleSlug, setNewRoleSlug] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [lastCreatedApiKey, setLastCreatedApiKey] = useState('');

  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const canManageRoles = user?.isRoot || user?.role === 'superadmin';
  const canUpdateOrgModules = user?.isRoot;

  const loadAll = useCallback(async () => {
    if (!token) return;
    try {
      const [
        overviewData,
        usersData,
        rolesData,
        permissionsData,
        modulesData,
        settingsData,
        reportsData,
        apiKeysData,
        requestData,
        orgSubscriptionsData,
        orgCatalogModulesData,
      ] = await Promise.all([
        getOrgAdminOverview(token),
        listOrgAdminUsers(token),
        listOrgAdminRoles(token),
        listOrgAdminPermissions(token),
        listOrgAdminModules(token),
        getOrgAdminSettings(token),
        getOrgAdminReports(token),
        listOrgAdminApiKeys(token),
        listOrgModuleAccessRequests(token),
        getOrgBillingSubscriptions(token),
        getOrgBillingCatalogModules(token),
      ]);

      setOverview(overviewData.organization ?? null);
      setOrgUsers(usersData.users);
      setRoles(rolesData.roles);
      setPermissions(permissionsData.permissions);
      setModules(modulesData.modules);
      setReports(reportsData as unknown as Record<string, unknown>);
      setApiKeys(apiKeysData.apiKeys);
      setRequests(requestData.requests);
      setOrgBillingSubscriptions(orgSubscriptionsData.subscriptions);
      setOrgCatalogModules(orgCatalogModulesData.modules);

      const org = settingsData.organization as Record<string, unknown> | null;
      setSettings({
        name: String(org?.name ?? ''),
        plan: String(org?.plan ?? ''),
      });

      if (!selectedRoleId && rolesData.roles.length > 0) {
        setSelectedRoleId(rolesData.roles[0].id);
      }

      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load org admin data';
      if (message.toLowerCase().includes('unauthorized')) {
        logout();
      }
      setError(message);
    }
  }, [token, logout, selectedRoleId]);

  useEffect(() => {
    if (user?.isRoot || user?.role === 'admin' || user?.role === 'superadmin') {
      void loadAll();
    }
  }, [loadAll, user]);

  useEffect(() => {
    async function loadMemberModules() {
      if (!token || !selectedMemberId) {
        setMemberModules([]);
        return;
      }
      try {
        const data = await listOrgAdminMemberModules(token, selectedMemberId);
        setMemberModules(data.modules);
      } catch {
        setMemberModules([]);
      }
    }

    void loadMemberModules();
  }, [token, selectedMemberId]);

  useEffect(() => {
    async function loadRolePermissions() {
      if (!token || !selectedRoleId || !canManageRoles) return;
      try {
        const data = await getOrgAdminRolePermissions(token, selectedRoleId);
        setSelectedPermissionIds(data.permissions.map((item) => item.id));
      } catch {
        setSelectedPermissionIds([]);
      }
    }

    void loadRolePermissions();
  }, [token, selectedRoleId, canManageRoles]);

  const allowed = user?.isRoot || user?.role === 'admin' || user?.role === 'superadmin';

  async function onSaveSettings() {
    if (!token) return;
    setBusy('save-settings');
    try {
      await updateOrgAdminSettings(token, settings);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setBusy('');
    }
  }

  async function onCreateRole() {
    if (!token) return;
    setBusy('create-role');
    try {
      await createOrgAdminRole(token, {
        name: newRoleName,
        slug: newRoleSlug,
        description: newRoleDescription || undefined,
      });
      setNewRoleName('');
      setNewRoleSlug('');
      setNewRoleDescription('');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setBusy('');
    }
  }

  async function onSaveRolePermissions() {
    if (!token || !selectedRoleId) return;
    setBusy('save-role-permissions');
    try {
      await updateOrgAdminRolePermissions(token, selectedRoleId, selectedPermissionIds);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role permissions');
    } finally {
      setBusy('');
    }
  }

  async function onCreateApiKey() {
    if (!token) return;
    setBusy('create-api-key');
    try {
      const result = await createOrgAdminApiKey(token, newApiKeyName);
      setLastCreatedApiKey(result.apiKey);
      setNewApiKeyName('');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setBusy('');
    }
  }

  async function onRevokeApiKey(id: string) {
    if (!token) return;
    setBusy(`revoke-api-key:${id}`);
    try {
      await revokeOrgAdminApiKey(token, id);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
    } finally {
      setBusy('');
    }
  }

  async function onModuleStatusChange(moduleId: string, status: 'active' | 'expired' | 'suspended') {
    if (!token) return;
    setBusy(`module:${moduleId}`);
    try {
      await updateOrgAdminModule(token, moduleId, { status, startsAt: null, expiresAt: null });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module');
    } finally {
      setBusy('');
    }
  }

  async function onToggleMemberModule(moduleId: string, currentGranted: boolean) {
    if (!token || !selectedMemberId) return;
    setBusy(`member-module:${moduleId}`);
    try {
      await updateOrgAdminMemberModuleAccess(token, selectedMemberId, {
        moduleId,
        grant: !currentGranted,
        expiresAt: null,
      });
      const data = await listOrgAdminMemberModules(token, selectedMemberId);
      setMemberModules(data.modules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member module access');
    } finally {
      setBusy('');
    }
  }

  async function onResolveRequest(id: string, action: 'approved' | 'rejected') {
    if (!token) return;
    setBusy(`request:${id}:${action}`);
    try {
      await resolveOrgModuleAccessRequest(token, id, { action });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve request');
    } finally {
      setBusy('');
    }
  }

  async function onBuyOrgModule(moduleName: string) {
    if (!token) return;
    setBusy(`buy-org-module:${moduleName}`);
    try {
      await buyOrgModule(token, moduleName);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to buy module for organization');
    } finally {
      setBusy('');
    }
  }

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const visibleOrgModules = useMemo(
    () => (canUpdateOrgModules ? modules : modules.filter((module) => module.status !== null)),
    [canUpdateOrgModules, modules],
  );

  const moduleSubscriptionStatus = useMemo(() => {
    const statuses = new Map<string, string>();
    orgBillingSubscriptions.forEach((item) => {
      const status = String(item.status ?? '').toLowerCase();
      const plan = item.plan as Record<string, unknown> | undefined;
      const modules = (plan?.modules ?? []) as unknown;
      if (Array.isArray(modules)) {
        modules.forEach((name) => {
          if (typeof name === 'string' && name.trim()) {
            statuses.set(name.trim().toLowerCase(), status);
          }
        });
      }
    });
    return statuses;
  }, [orgBillingSubscriptions]);

  if (!allowed) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-400">Organization admin access required.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 scroll-mt-24" id="org-console">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">Organization Admin Console</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">{String(overview?.name ?? 'Organization')}</h1>
        <p className="text-sm text-slate-400 mt-1">slug: {String(overview?.slug ?? '')} • plan: {String(overview?.plan ?? '')}</p>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Organization Settings" className="scroll-mt-24" id="org-settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={settings.name} onChange={(e) => setSettings((prev) => ({ ...prev, name: e.target.value }))} placeholder="Organization name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
            <input value={settings.plan} onChange={(e) => setSettings((prev) => ({ ...prev, plan: e.target.value }))} placeholder="Plan" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
          </div>
          <button type="button" onClick={() => void onSaveSettings()} disabled={busy === 'save-settings'} className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary-ui disabled:opacity-50">
            {busy === 'save-settings' ? 'Saving...' : 'Save Settings'}
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {canManageRoles ? (
          <Card title="Roles and Permissions" className="scroll-mt-24" id="org-roles">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
              <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="role name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
              <input value={newRoleSlug} onChange={(e) => setNewRoleSlug(e.target.value)} placeholder="role slug" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
              <input value={newRoleDescription} onChange={(e) => setNewRoleDescription(e.target.value)} placeholder="description" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
            </div>
            <button type="button" onClick={() => void onCreateRole()} disabled={busy === 'create-role'} className="mb-3 px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary-ui disabled:opacity-50">
              {busy === 'create-role' ? 'Creating...' : 'Create Custom Role'}
            </button>

            <div className="mb-2">
              <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200">
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name} ({role.slug})</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Selected role: {selectedRole?.name ?? 'n/a'} {selectedRole?.is_system_role === 1 ? '(system role)' : ''}</p>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1">
              {permissions.map((permission) => (
                <label key={permission.id} className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedPermissionIds.includes(permission.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissionIds((prev) => [...prev, permission.id]);
                      } else {
                        setSelectedPermissionIds((prev) => prev.filter((id) => id !== permission.id));
                      }
                    }}
                  />
                  <span>{permission.slug}</span>
                </label>
              ))}
            </div>

            <button type="button" onClick={() => void onSaveRolePermissions()} disabled={busy === 'save-role-permissions'} className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold btn-secondary-ui disabled:opacity-50">
              {busy === 'save-role-permissions' ? 'Saving...' : 'Save Role Permissions'}
            </button>
          </Card>
        ) : null}

        {canUpdateOrgModules ? (
          <Card title="Modules (Enable / Configure)" className="scroll-mt-24" id="org-modules">
            {visibleOrgModules.length === 0 ? (
              <p className="text-sm text-slate-500">No subscribed modules yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {visibleOrgModules.map((module) => (
                  <div key={module.id} className="rounded-lg border border-white/10 bg-white/5 p-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-100">{module.display_name ?? module.name}</p>
                      <p className="text-[11px] text-slate-400">slug: {module.slug} • current: {module.status ?? 'not-configured'}</p>
                    </div>
                    <select
                      value={module.status ?? 'active'}
                      disabled={busy === `module:${module.id}`}
                      onChange={(e) => void onModuleStatusChange(module.id, e.target.value as 'active' | 'expired' | 'suspended')}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-slate-200"
                    >
                      <option value="active">active</option>
                      <option value="expired">expired</option>
                      <option value="suspended">suspended</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}
      </div>

      <Card title="Grant Module Access to Members" className="scroll-mt-24" id="org-member-access">
        <div className="flex items-center gap-2 mb-3">
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200"
          >
            <option value="">Select member</option>
            {orgUsers
              .filter((item) => item.role === 'member')
              .map((item) => (
                <option key={item.id} value={item.id}>{item.email}</option>
              ))}
          </select>
        </div>

        {selectedMemberId ? (
          <div className="space-y-2">
            {memberModules.map((module) => {
              const granted = module.access_granted === 1;
              return (
                <div key={module.id} className="rounded-lg border border-white/10 bg-white/5 p-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-100">{module.display_name ?? module.name}</p>
                    <p className="text-[11px] text-slate-400">org module: {module.organization_module_status ?? 'n/a'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onToggleMemberModule(module.id, granted)}
                    disabled={busy === `member-module:${module.id}`}
                    className="px-3 py-1 rounded text-xs font-semibold btn-secondary-ui disabled:opacity-50"
                  >
                    {granted ? 'Revoke' : 'Grant'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Select a member to manage module access.</p>
        )}
      </Card>

      <Card title="Member Access Requests (Approval Queue)" className="scroll-mt-24" id="org-requests">
        {requests.length === 0 ? (
          <p className="text-sm text-slate-500">No requests yet.</p>
        ) : (
          <div className="space-y-2">
            {requests.map((request) => (
              <div key={request.id} className="rounded-lg border border-white/10 bg-white/5 p-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-100">
                    {request.user_email ?? 'member'} requested {request.module_display_name ?? request.module_name ?? 'module'}
                  </p>
                  <p className="text-[11px] text-slate-400">status: {request.status} • reason: {request.reason ?? 'n/a'}</p>
                </div>
                {request.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void onResolveRequest(request.id, 'approved')}
                      disabled={busy === `request:${request.id}:approved`}
                      className="px-2 py-1 rounded text-xs font-semibold btn-primary-ui disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => void onResolveRequest(request.id, 'rejected')}
                      disabled={busy === `request:${request.id}:rejected`}
                      className="px-2 py-1 rounded text-xs font-semibold btn-secondary-ui disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 uppercase">{request.status}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Reports and Activity" className="scroll-mt-24" id="org-reports">
          <pre className="text-xs text-slate-300 bg-black/20 p-3 rounded-lg border border-white/10 overflow-x-auto">
            {JSON.stringify(reports, null, 2)}
          </pre>
        </Card>

        <Card title="Billing Summary" className="scroll-mt-24" id="org-billing">
          {orgBillingSubscriptions.length === 0 ? (
            <p className="text-sm text-slate-500">No active subscriptions for this organization.</p>
          ) : (
            <div className="space-y-2">
              {orgBillingSubscriptions.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <p className="text-xs text-slate-100">{String((item.plan as Record<string, unknown>)?.displayName ?? (item.plan as Record<string, unknown>)?.name ?? 'plan')}</p>
                  <p className="text-[11px] text-slate-400">status: {String(item.status ?? '')}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Buy Module For Organization" className="scroll-mt-24" id="org-buy-module">
        <div className="space-y-2">
          {orgCatalogModules.map((item, idx) => {
            const moduleName = String(item.module_name ?? '');
            const subscriptionStatus = moduleSubscriptionStatus.get(moduleName.toLowerCase()) ?? '';
            const isPendingApproval = subscriptionStatus === 'pending_approval';
            const isSubscribed = ['active', 'approved'].includes(subscriptionStatus);
            return (
              <div key={`${moduleName}-${idx}`} className="rounded-lg border border-white/10 bg-white/5 p-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-100">{String(item.display_name ?? moduleName)}</p>
                  <p className="text-[11px] text-slate-400">{String(item.price_monthly ?? 0)} {String(item.currency ?? '')}/mo</p>
                </div>
                <button
                  type="button"
                  onClick={() => void onBuyOrgModule(moduleName)}
                  disabled={isSubscribed || isPendingApproval || busy === `buy-org-module:${moduleName}`}
                  className="px-2 py-1 rounded text-xs font-semibold btn-primary-ui disabled:opacity-50"
                >
                  {isPendingApproval ? 'Pending approval' : isSubscribed ? 'Subscribed' : 'Buy'}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="API Keys and Integrations" className="scroll-mt-24" id="org-api-keys">
        <div className="flex items-center gap-2 mb-3">
          <input value={newApiKeyName} onChange={(e) => setNewApiKeyName(e.target.value)} placeholder="API key name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
          <button type="button" onClick={() => void onCreateApiKey()} disabled={busy === 'create-api-key'} className="px-3 py-2 rounded-lg text-xs font-semibold btn-primary-ui disabled:opacity-50 inline-flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5" />
            {busy === 'create-api-key' ? 'Creating...' : 'Create Key'}
          </button>
        </div>

        {lastCreatedApiKey ? (
          <div className="mb-3 rounded-lg border border-teal/40 bg-teal/10 p-3">
            <p className="text-xs text-teal font-semibold">Copy this key now (shown once):</p>
            <p className="text-xs text-slate-100 break-all mt-1">{lastCreatedApiKey}</p>
          </div>
        ) : null}

        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div key={key.id} className="rounded-lg border border-white/10 bg-white/5 p-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-100">{key.name}</p>
                <p className="text-[11px] text-slate-400">prefix: {key.key_prefix} • status: {key.is_active === 1 ? 'active' : 'revoked'}</p>
              </div>
              <button type="button" onClick={() => void onRevokeApiKey(key.id)} disabled={key.is_active !== 1 || busy === `revoke-api-key:${key.id}`} className="px-2 py-1 rounded text-xs btn-secondary-ui disabled:opacity-50">
                Revoke
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-slate-400 inline-flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-teal" />
          Org admin scope is restricted to users, roles, modules, settings, billing and integrations of the current organization.
        </p>
      </Card>
    </div>
  );
}
