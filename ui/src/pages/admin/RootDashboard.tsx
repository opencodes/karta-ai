import React, { useEffect, useMemo, useState } from 'react';
import { Building2, ShieldCheck, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { listOrganizations, listUsers, type OrganizationItem, type ManageableUser } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export function RootDashboardPage() {
  const { token, user, logout } = useAuth();
  const [users, setUsers] = useState<ManageableUser[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!token || !user?.isRoot) return;
      try {
        const [orgs, allUsers] = await Promise.all([
          listOrganizations(token),
          listUsers(token),
        ]);
        setOrganizations(orgs.organizations);
        setUsers(allUsers.users);
        setError('');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load root dashboard';
        if (message.toLowerCase().includes('unauthorized')) logout();
        setError(message);
      }
    }

    void load();
  }, [token, user, logout]);

  const activeOrgs = useMemo(() => organizations.filter((o) => o.isActive).length, [organizations]);
  const activeUsers = useMemo(() => users.filter((u) => u.isActive).length, [users]);

  if (!user?.isRoot) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-400">Root access required.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">Root Dashboard</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">Platform Control Center</h1>
        <p className="text-sm text-slate-500 mt-1">Global management across all organizations and users.</p>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Organizations</p>
          <p className="text-2xl font-semibold text-heading mt-2 inline-flex items-center gap-2"><Building2 className="w-5 h-5 text-teal" /> {organizations.length}</p>
          <p className="text-xs text-slate-400 mt-1">Active: {activeOrgs}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Users</p>
          <p className="text-2xl font-semibold text-heading mt-2 inline-flex items-center gap-2"><Users className="w-5 h-5 text-teal" /> {users.length}</p>
          <p className="text-xs text-slate-400 mt-1">Active: {activeUsers}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Root Privilege</p>
          <p className="text-sm font-semibold text-teal mt-2">Enabled</p>
          <p className="text-xs text-slate-400 mt-1">Bypasses org/module/permission restrictions</p>
        </Card>
      </div>
    </div>
  );
}
