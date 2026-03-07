import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import {
  createUserByRoot,
  listOrganizations,
  listUsers,
  updateOrganizationOwner,
  type ManageableUser,
  type OrganizationItem,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function RootOrganizationViewPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const [organization, setOrganization] = useState<OrganizationItem | null>(null);
  const [users, setUsers] = useState<ManageableUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'superadmin' | 'member'>('admin');
  const [newStatus, setNewStatus] = useState<'active' | 'invited' | 'disabled'>('active');
  const [ownerUserId, setOwnerUserId] = useState<string>('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!token || !user?.isRoot || !orgId) return;
      try {
        const [orgData, userData] = await Promise.all([
          listOrganizations(token),
          listUsers(token),
        ]);

        const selectedOrg = orgData.organizations.find((item) => item.id === orgId) ?? null;
        setOrganization(selectedOrg);
        const orgUsers = userData.users.filter((item) => item.organizationId === orgId);
        setUsers(orgUsers);
        setOwnerUserId(selectedOrg?.ownerUserId ?? '');
        setError('');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load organization view';
        if (message.toLowerCase().includes('unauthorized')) logout();
        setError(message);
      }
    }

    void load();
  }, [token, user, orgId, logout]);

  const activeUsers = useMemo(() => users.filter((item) => item.isActive).length, [users]);

  async function onAssignOwner() {
    if (!token || !orgId) return;
    setBusy('assign-owner');
    try {
      await updateOrganizationOwner(token, orgId, ownerUserId || null);
      const [orgData, userData] = await Promise.all([
        listOrganizations(token),
        listUsers(token),
      ]);
      const selectedOrg = orgData.organizations.find((item) => item.id === orgId) ?? null;
      setOrganization(selectedOrg);
      setUsers(userData.users.filter((item) => item.organizationId === orgId));
      setOwnerUserId(selectedOrg?.ownerUserId ?? '');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update owner');
    } finally {
      setBusy('');
    }
  }

  async function onCreateUser() {
    if (!token || !orgId) return;
    if (!newEmail.trim() || !newPassword) {
      setError('Email and password are required');
      return;
    }

    setBusy('create-user');
    try {
      await createUserByRoot(token, {
        email: newEmail.trim(),
        password: newPassword,
        organizationId: orgId,
        role: newRole,
        status: newStatus,
      });

      const userData = await listUsers(token);
      setUsers(userData.users.filter((item) => item.organizationId === orgId));
      setNewEmail('');
      setNewPassword('');
      setNewRole('admin');
      setNewStatus('active');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setBusy('');
    }
  }

  if (!user?.isRoot) {
    return <Card className="p-6"><p className="text-sm text-red-400">Root access required.</p></Card>;
  }

  if (!organization) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-400">{error || 'Organization not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/root/organizations')}
          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-slate-200 hover:bg-white/20"
        >
          Back to Organizations
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">Organization View</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">{organization.name}</h1>
        <p className="text-sm text-slate-400 mt-1">slug: {organization.slug} • plan: {organization.plan}</p>
        <p className="text-sm text-slate-400 mt-1">status: {organization.isActive ? 'active' : 'suspended'} • owner: {organization.ownerEmail ?? 'unassigned'}</p>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Users in Organization</p>
          <p className="text-2xl font-semibold text-heading mt-2 inline-flex items-center gap-2">
            <Users className="w-5 h-5 text-teal" />
            {users.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Active: {activeUsers}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Assign Organization Owner</p>
          <div className="mt-3 flex items-center gap-2">
            <select
              value={ownerUserId}
              onChange={(e) => setOwnerUserId(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Unassigned</option>
              {users.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.email} ({item.role})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void onAssignOwner()}
              disabled={busy === 'assign-owner'}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-teal text-black hover:bg-teal/90 disabled:opacity-50"
            >
              {busy === 'assign-owner' ? 'Saving...' : 'Assign'}
            </button>
          </div>
        </Card>
      </div>

      <Card title="Organization Users">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="admin/user email"
            className="bg-white/5 border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="temporary password"
            className="bg-white/5 border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as 'admin' | 'superadmin' | 'member')}
            className="bg-white/5 border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="admin">admin</option>
            <option value="superadmin">superadmin</option>
            <option value="member">member</option>
          </select>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as 'active' | 'invited' | 'disabled')}
            className="bg-white/5 border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="active">active</option>
            <option value="invited">invited</option>
            <option value="disabled">disabled</option>
          </select>
          <button
            type="button"
            onClick={() => void onCreateUser()}
            disabled={busy === 'create-user'}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-teal text-black hover:bg-teal/90 disabled:opacity-50"
          >
            {busy === 'create-user' ? 'Creating...' : 'Add User'}
          </button>
        </div>

        {users.length === 0 ? (
          <p className="text-sm text-slate-500">No users in this organization.</p>
        ) : (
          <div className="space-y-3">
            {users.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-sm text-heading font-semibold">{item.email}</p>
                <p className="text-xs text-slate-400">role: {item.role} • status: {item.status}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
