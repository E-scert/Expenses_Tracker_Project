import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import { api } from '../api.js';
import { useActiveUser } from '../context/UserContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Card, SectionHeading, EmptyState, Spinner, Button } from '../components/ui.jsx';

const PERIODS = [
  { key: 'overall', label: 'All time' },
  { key: 'monthly', label: 'This month' },
  { key: 'weekly', label: 'This week' },
];

const PIE_COLORS = ['#e11d2e', '#fb923c', '#38bdf8', '#a78bfa'];

export default function Dashboard() {
  const { activeUser } = useActiveUser();
  const toast = useToast();

  const [period, setPeriod] = useState('overall');
  const [total, setTotal] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!activeUser) return;
    setLoading(true);
    try {
      const [totalRes, breakdownRes] = await Promise.all([
        api.getTotal(activeUser.user_id),
        api.getBreakdown(activeUser.user_id, period),
      ]);
      setTotal(totalRes.total);
      setBreakdown(breakdownRes.breakdown);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [activeUser?.user_id, period]); // eslint-disable-line

  if (!activeUser) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10">
        <SectionHeading eyebrow="Overview" title="Dashboard" />
        <EmptyState title="No active user" subtitle="Log in first from the login screen." />
      </div>
    );
  }

  const chartData = breakdown.map((b) => ({ name: b.category_name, total: b.total }));
  const nonZero = chartData.filter((d) => d.total > 0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <SectionHeading
        eyebrow="Overview"
        title="Dashboard"
        subtitle={`Live spending totals for ${activeUser.user_name}`}
      />

      <div className="mb-6 flex flex-wrap gap-2 animate-fadeUp">
        {PERIODS.map((p) => (
          <Button
            key={p.key}
            variant={period === p.key ? 'primary' : 'ghost'}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="animate-riseIn lg:col-span-2 flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-paper/40">
                Total spent — {PERIODS.find((p) => p.key === period)?.label.toLowerCase()}
              </p>
              <p key={total} className="animate-tick tabular mt-3 font-display text-5xl font-semibold text-white">
                ${Number(total || 0).toFixed(2)}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              {chartData.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-paper/60">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {c.name}
                  </span>
                  <span className="tabular font-mono text-paper/85">${c.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="animate-riseIn lg:col-span-3">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-paper/40">By category</p>
            {chartData.every((c) => c.total === 0) ? (
              <EmptyState title="No spending yet for this period" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                  <XAxis dataKey="name" stroke="#8a8a86" fontSize={12} tickLine={false} axisLine={{ stroke: '#2a2a2a' }} />
                  <YAxis stroke="#8a8a86" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 13 }}
                    labelStyle={{ color: '#f5f5f3' }}
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, 'total']}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {nonZero.length > 0 && (
            <Card className="animate-riseIn lg:col-span-5">
              <p className="mb-4 font-mono text-xs uppercase tracking-widest text-paper/40">Share of spend</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={nonZero} dataKey="total" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {nonZero.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#0a0a0a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 13 }}
                    formatter={(v, n) => [`$${Number(v).toFixed(2)}`, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
