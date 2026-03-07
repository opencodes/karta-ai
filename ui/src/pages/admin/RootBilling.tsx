import React, { useEffect, useState } from 'react';
import { PackagePlus, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import {
  createBillingModule,
  listBillingModules,
  listOrgModulePurchaseRequests,
  resolveOrgModulePurchaseRequest,
  type BillingModuleItem,
  type OrgModulePurchaseRequest,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function RootBillingPage() {
  const { token, user } = useAuth();
  const [modules, setModules] = useState<BillingModuleItem[]>([]);
  const [requests, setRequests] = useState<OrgModulePurchaseRequest[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const [moduleForm, setModuleForm] = useState({
    name: '',
    slug: '',
    displayName: '',
    description: '',
    routePrefix: '',
    version: '1.0.0',
    isCore: false,
    isActive: true,
  });

  if (!user?.isRoot) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-400">Root access required.</p>
      </Card>
    );
  }

  useEffect(() => {
    async function loadModules() {
      if (!token) return;
      try {
        const [modulesData, requestsData] = await Promise.all([
          listBillingModules(token),
          listOrgModulePurchaseRequests(token),
        ]);
        setModules(modulesData.modules);
        setRequests(requestsData.requests);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load modules');
      }
    }

    void loadModules();
  }, [token]);

  async function onResolveRequest(subscriptionId: string, action: 'approved' | 'rejected') {
    if (!token) return;
    setBusy(`request:${subscriptionId}:${action}`);
    try {
      await resolveOrgModulePurchaseRequest(token, subscriptionId, action);
      const requestsData = await listOrgModulePurchaseRequests(token);
      setRequests(requestsData.requests);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve organization request');
    } finally {
      setBusy('');
    }
  }

  async function onCreateModule() {
    if (!token) return;
    if (!moduleForm.name.trim() || !moduleForm.slug.trim()) {
      setError('Module name and slug are required');
      return;
    }
    setBusy('create-module');
    try {
      await createBillingModule(token, {
        name: moduleForm.name.trim(),
        slug: moduleForm.slug.trim(),
        displayName: moduleForm.displayName.trim() || null,
        description: moduleForm.description.trim() || null,
        routePrefix: moduleForm.routePrefix.trim() || null,
        version: moduleForm.version.trim() || null,
        isCore: moduleForm.isCore,
        isActive: moduleForm.isActive,
      });
      setModuleForm({
        name: '',
        slug: '',
        displayName: '',
        description: '',
        routePrefix: '',
        version: '1.0.0',
        isCore: false,
        isActive: true,
      });
      const data = await listBillingModules(token);
      setModules(data.modules);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">Root Billing</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">Modules</h1>
        <p className="text-sm text-slate-500 mt-1">Create new modules for the platform.</p>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </Card>

      <Card title="Existing Modules">
        {modules.length === 0 ? (
          <p className="text-sm text-slate-500">No modules found.</p>
        ) : (
          <div className="space-y-2">
            {modules.map((mod) => (
              <div key={mod.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-heading">{mod.display_name ?? mod.name}</p>
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">{mod.slug}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{mod.description ?? 'No description'}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  route: {mod.route_prefix ?? 'n/a'} • version: {mod.version ?? 'n/a'} • core: {mod.is_core ? 'yes' : 'no'} • active: {mod.is_active ? 'yes' : 'no'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Organization Module Requests">
        {requests.filter((item) => item.status === 'pending_approval').length === 0 ? (
          <p className="text-sm text-slate-500">No pending requests.</p>
        ) : (
          <div className="space-y-2">
            {requests
              .filter((item) => item.status === 'pending_approval')
              .map((item) => (
                <div key={item.subscriptionId} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-sm font-semibold text-heading">
                    {item.organizationName} ({item.organizationSlug})
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    plan: {item.planDisplayName ?? item.planName} • modules: {item.modules.join(', ') || 'n/a'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void onResolveRequest(item.subscriptionId, 'approved')}
                      disabled={busy === `request:${item.subscriptionId}:approved`}
                      className="px-2 py-1 rounded text-xs font-semibold bg-teal text-black hover:bg-teal/90 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => void onResolveRequest(item.subscriptionId, 'rejected')}
                      disabled={busy === `request:${item.subscriptionId}:rejected`}
                      className="px-2 py-1 rounded text-xs font-semibold bg-white/10 text-slate-200 hover:bg-white/20 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card title="Create Module">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={moduleForm.name} onChange={(e) => setModuleForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="module name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
            <input value={moduleForm.slug} onChange={(e) => setModuleForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="module slug" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
            <input value={moduleForm.displayName} onChange={(e) => setModuleForm((prev) => ({ ...prev, displayName: e.target.value }))} placeholder="display name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
            <input value={moduleForm.version} onChange={(e) => setModuleForm((prev) => ({ ...prev, version: e.target.value }))} placeholder="version" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
            <input value={moduleForm.routePrefix} onChange={(e) => setModuleForm((prev) => ({ ...prev, routePrefix: e.target.value }))} placeholder="route prefix (e.g. /api/crm)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 md:col-span-2" />
            <textarea value={moduleForm.description} onChange={(e) => setModuleForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="description" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 md:col-span-2" rows={3} />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={moduleForm.isCore} onChange={(e) => setModuleForm((prev) => ({ ...prev, isCore: e.target.checked }))} />
              Core module
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={moduleForm.isActive} onChange={(e) => setModuleForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
              Active
            </label>
          </div>
          <button type="button" onClick={() => void onCreateModule()} disabled={busy === 'create-module'} className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal text-black hover:bg-teal/90 disabled:opacity-50 inline-flex items-center gap-1">
            <PackagePlus className="w-3.5 h-3.5" />
            {busy === 'create-module' ? 'Creating...' : 'Create Module'}
          </button>
        </Card>
      </div>
    </div>
  );
}
