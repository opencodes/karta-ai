import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CalendarClock, CreditCard, LockKeyhole, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import {
  buyModule,
  getMyAccess,
  getMySubscriptions,
  listPaidModules,
  type UserSubscription,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type CatalogModule = {
  module_name: string;
  display_name?: string;
  description?: string;
  plan_name: string;
  price_monthly?: number | string;
  price_yearly?: number | string;
  currency?: string;
};

function money(value: string | number | null | undefined, currency = 'USD') {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return `${value ?? ''}`;
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num);
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return 'Never';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleString();
}

export function BillingPage() {
  const { token, logout, hasPermission, refreshRbac, user } = useAuth();
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [access, setAccess] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const [moduleData, accessData, subsData] = await Promise.all([
        listPaidModules(token),
        getMyAccess(token),
        getMySubscriptions(token),
      ]);

      setModules(moduleData.modules as CatalogModule[]);
      setAccess(accessData.modules);
      setSubscriptions(subsData.subscriptions);
      await refreshRbac();
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load subscription data';
      if (message.toLowerCase().includes('unauthorized')) logout();
      setError(message);
    }
  }, [token, logout, refreshRbac]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((item) => item.status === 'active'),
    [subscriptions],
  );

  const currentAccess = useMemo(() => {
    if (user?.isRoot) return ['*'];
    return access;
  }, [access, user]);

  async function onBuyModule(moduleName: string) {
    if (!token) return;
    if (!hasPermission('billing.update')) {
      setError('Missing permission: billing.update');
      return;
    }
    setBusyKey(`buy-module:${moduleName}`);
    try {
      await buyModule(token, moduleName);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to buy module');
    } finally {
      setBusyKey('');
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 text-teal" />
          <p className="text-xs font-bold text-teal uppercase tracking-widest">Subscription</p>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-semibold text-heading">Subscriptions and Module Access</h1>
        <p className="text-sm text-slate-500 mt-1">TodoKarta is free by default. EduKarta and PrepKarta require paid plans.</p>
        {error ? <p className="text-sm text-red-400 mt-3">{error}</p> : null}
      </Card>

      <Card title="Current Access">
        <div className="flex flex-wrap gap-2">
          {currentAccess.length === 0 ? (
            <span className="text-sm text-slate-400">No module access assigned.</span>
          ) : (
            [...new Set(currentAccess)].map((moduleName) => (
              <span key={moduleName} className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal border border-teal/40 bg-teal/10">
                {moduleName}
              </span>
            ))
          )}
        </div>
      </Card>

      <Card title="My Subscriptions">
        {activeSubscriptions.length === 0 ? (
          <p className="text-sm text-slate-500">No active subscriptions.</p>
        ) : (
          <ul className="space-y-3">
            {activeSubscriptions.map((sub) => (
              <li key={sub.subscriptionId} className="rounded-xl border border-white/10 p-3 bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-heading">{sub.plan.displayName ?? sub.plan.name}</p>
                  <span className="text-[11px] uppercase tracking-wide text-teal">{sub.plan.type}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Modules: {sub.plan.modules.join(', ')}</p>
                <p className="text-xs text-slate-400 mt-1 inline-flex items-center gap-1">
                  <CalendarClock className="w-3.5 h-3.5" />
                  Renews/Ends: {formatDate(sub.renewDate)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Buy Module (Paid)">
        <ul className="space-y-3">
          {modules.map((item) => {
            const owned = access.includes(item.module_name);
            return (
              <li key={item.module_name} className="rounded-xl border border-white/10 p-3 bg-white/5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-heading">{item.display_name ?? item.module_name}</p>
                  <span className="text-xs text-slate-300">{money(item.price_monthly, item.currency)}/mo</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.description ?? 'Paid module access.'}</p>
                <button
                  type="button"
                  onClick={() => void onBuyModule(item.module_name)}
                  disabled={owned || busyKey === `buy-module:${item.module_name}` || !hasPermission('billing.update')}
                  className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary-ui disabled:opacity-50"
                >
                  {owned ? 'Already Active' : busyKey === `buy-module:${item.module_name}` ? 'Processing...' : 'Buy Module'}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="p-5">
        <div className="flex items-start gap-3 text-slate-300">
          <LockKeyhole className="w-4 h-4 text-teal mt-0.5" />
          <p className="text-sm">
            Use <span className="text-teal font-semibold">TodoKarta</span> for free task workflows. Paid modules are unlocked per module.
          </p>
          <ArrowUpRight className="w-4 h-4 text-teal mt-0.5" />
          <Sparkles className="w-4 h-4 text-teal mt-0.5" />
        </div>
      </Card>
    </div>
  );
}
