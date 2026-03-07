import React, { useCallback, useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { createOrganization, listOrganizations, updateOrganizationStatus, type OrganizationItem } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function RootOrganizationsPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState('starter');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!token || !user?.isRoot) return;
    try {
      const data = await listOrganizations(token);
      setOrganizations(data.organizations);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load organizations';
      if (message.toLowerCase().includes('unauthorized')) logout();
      setError(message);
    }
  }, [token, user, logout]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onCreate() {
    if (!token || !name.trim()) return;
    setBusy('create');
    try {
      await createOrganization(token, { name: name.trim(), slug: slug.trim() || undefined, plan: plan.trim() || undefined });
      setName('');
      setSlug('');
      setPlan('starter');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setBusy('');
    }
  }

  async function onToggle(org: OrganizationItem) {
    if (!token) return;
    setBusy(org.id);
    try {
      await updateOrganizationStatus(token, org.id, !org.isActive);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization status');
    } finally {
      setBusy('');
    }
  }

  if (!user?.isRoot) {
    return <Card className="p-6"><p className="text-sm text-red-400">Root access required.</p></Card>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">Organizations</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">Tenant Management</h1>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </Card>

      <Card title="Create Organization">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Organization name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (optional)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
          <input value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="plan" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
          <button type="button" onClick={() => void onCreate()} disabled={busy === 'create'} className="px-3 py-2 rounded-lg text-xs font-semibold btn-primary-ui disabled:opacity-50">
            {busy === 'create' ? 'Creating...' : 'Create'}
          </button>
        </div>
      </Card>

      <Card title="All Organizations">
        <div className="space-y-3">
          {organizations.map((org) => (
            <div key={org.id} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-heading">{org.name}</p>
                <p className="text-xs text-slate-400">slug: {org.slug} • plan: {org.plan} • users: {org.userCount}</p>
                <p className="text-xs text-slate-400">owner: {org.ownerEmail ?? 'unassigned'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/root/organizations/${org.id}`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary-ui"
                >
                  View
                </button>
                <button type="button" onClick={() => void onToggle(org)} disabled={busy === org.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold btn-secondary-ui disabled:opacity-50">
                  {org.isActive ? 'Suspend' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
