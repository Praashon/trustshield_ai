'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { FadeIn } from '@/components/animations/FadeIn';
import { CountUp } from '@/components/animations/CountUp';
import { getAdminUsers, getAdminScans } from '@/services/adminService';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    dangerousScans: 0,
    aiScans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [users, scans] = await Promise.all([
          getAdminUsers(1, 1),
          getAdminScans(1, 1) as Promise<{ total: number; items: unknown[] }>,
        ]);

        setStats({
          totalUsers: users.total || 0,
          totalScans: scans.total || 0,
          dangerousScans: 0,
          aiScans: 0,
        });
      } catch {
        // Not admin or not connected
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div>
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Admin Panel</h1>
          <p className="text-muted-foreground">Platform overview and management.</p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <FadeIn delay={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold mt-1">
                  <CountUp end={stats.totalUsers} />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-3xl font-bold mt-1">
                  <CountUp end={stats.totalScans} />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Dangerous Detected</p>
                <p className="text-3xl font-bold mt-1 text-[var(--danger)]">
                  <CountUp end={stats.dangerousScans} />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">AI Scans</p>
                <p className="text-3xl font-bold mt-1 text-[var(--amber)]">
                  <CountUp end={stats.aiScans} />
                </p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
