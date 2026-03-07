import React, { useCallback, useEffect, useState } from 'react';
import { Shield, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import {
  createOrgAdminUser,
  listOrgAdminUsers,
  updateOrgAdminUserRole,
  updateOrgAdminUserStatus,
  type OrgAdminUser,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function OrgAdminUsersPage() {
  const { token, user, logout } = useAuth();

  const [orgUsers, setOrgUsers] = useState<OrgAdminUser[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'superadmin' | 'member'>('member');
  const [newUserStatus, setNewUserStatus] = useState<'active' | 'invited' | 'disabled'>('active');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const allowed = user?.isRoot || user?.role === 'admin' || user?.role === 'superadmin';

  const loadUsers = useCallback(async () => {
    if (!token) return;
    try {
      const usersData = await listOrgAdminUsers(token);
      setOrgUsers(usersData.users);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load organization users';
      if (message.toLowerCase().includes('unauthorized')) {
        logout();
      }
      setError(message);
    }
  }, [token, logout]);

  useEffect(() => {
    if (allowed) {
      void loadUsers();
    }
  }, [allowed, loadUsers]);

  async function onCreateUser() {
    if (!token) return;
    setBusy('create-user');
    try {
      await createOrgAdminUser(token, {
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
        status: newUserStatus,
      });
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('member');
      setNewUserStatus('active');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setBusy('');
    }
  }

  async function onUserRoleChange(userId: string, role: 'admin' | 'superadmin' | 'member') {
    if (!token) return;
    setBusy(`user-role:${userId}`);
    try {
      await updateOrgAdminUserRole(token, userId, role);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setBusy('');
    }
  }

  async function onUserStatusChange(userId: string, status: 'active' | 'invited' | 'disabled') {
    if (!token) return;
    setBusy(`user-status:${userId}`);
    try {
      await updateOrgAdminUserStatus(token, userId, status);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    } finally {
      setBusy('');
    }
  }

  if (!allowed) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-400">Organization admin access required.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">Organization Users</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">Invite and manage members</h1>
        <p className="text-sm text-slate-400 mt-1">Add org users, update roles, or deactivate accounts.</p>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </Card>

      <Card title="Invite User">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
          <input value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="temporary password" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200" />
          <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'superadmin' | 'member')} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200">
            <option value="member">member</option>
            <option value="admin">admin</option>
            <option value="superadmin">superadmin</option>
          </select>
          <select value={newUserStatus} onChange={(e) => setNewUserStatus(e.target.value as 'active' | 'invited' | 'disabled')} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200">
            <option value="active">active</option>
            <option value="invited">invited</option>
            <option value="disabled">disabled</option>
          </select>
        </div>
        <button type="button" onClick={() => void onCreateUser()} disabled={busy === 'create-user'} className="mb-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal text-black hover:bg-teal/90 disabled:opacity-50">
          {busy === 'create-user' ? 'Creating...' : 'Add User'}
        </button>
      </Card>

      <Card title="Organization Users">
        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {orgUsers.map((orgUser) => (
            <div key={orgUser.id} className="rounded-lg border border-white/10 bg-white/5 p-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-100">{orgUser.email}</p>
                <p className="text-[11px] text-slate-400">created: {new Date(orgUser.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={orgUser.role} disabled={orgUser.is_root === 1 || busy === `user-role:${orgUser.id}`} onChange={(e) => void onUserRoleChange(orgUser.id, e.target.value as 'admin' | 'superadmin' | 'member')} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-slate-200">
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                </select>
                <select value={orgUser.status} disabled={orgUser.is_root === 1 || busy === `user-status:${orgUser.id}`} onChange={(e) => void onUserStatusChange(orgUser.id, e.target.value as 'active' | 'invited' | 'disabled')} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-slate-200">
                  <option value="active">active</option>
                  <option value="invited">invited</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>
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
