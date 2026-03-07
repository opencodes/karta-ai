import React, { useCallback, useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import {
  listUsers,
  updateUserRole,
  updateUserStatus,
  type ManageableUser,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function RootUsersPage() {
  const { token, user, logout } = useAuth();
  const [users, setUsers] = useState<ManageableUser[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!token || !user?.isRoot) return;
    try {
      const userData = await listUsers(token);
      setUsers(userData.users);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      if (message.toLowerCase().includes('unauthorized')) logout();
      setError(message);
    }
  }, [token, user, logout]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onRoleChange(userId: string, role: 'admin' | 'superadmin' | 'member') {
    if (!token) return;
    setBusy(`role:${userId}`);
    try {
      await updateUserRole(token, userId, role);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setBusy('');
    }
  }

  async function onStatusChange(userId: string, status: 'active' | 'invited' | 'disabled') {
    if (!token) return;
    setBusy(`status:${userId}`);
    try {
      await updateUserStatus(token, userId, status);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
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
          <Users className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">Users</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">Cross-Organization User Management</h1>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </Card>

      <Card title="All Users">
        <div className="space-y-3">
          {users.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-heading font-semibold">{item.email} {item.isRoot ? '(root)' : ''}</p>
                <p className="text-xs text-slate-400">org: {item.organizationName ?? item.organizationId ?? 'n/a'} • status: {item.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={item.role}
                  disabled={item.isRoot || busy === `role:${item.id}`}
                  onChange={(e) => void onRoleChange(item.id, e.target.value as 'admin' | 'superadmin' | 'member')}
                  className="form-select-ui-sm disabled:opacity-70"
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                </select>
                <select
                  value={item.status}
                  disabled={item.isRoot || busy === `status:${item.id}`}
                  onChange={(e) => void onStatusChange(item.id, e.target.value as 'active' | 'invited' | 'disabled')}
                  className="form-select-ui-sm disabled:opacity-70"
                >
                  <option value="active">active</option>
                  <option value="invited">invited</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
