'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartSkeleton, CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { FadeIn } from '@/components/animations/FadeIn';
import { CountUp } from '@/components/animations/CountUp';
import { useAuth } from '@/hooks/useAuth';
import { getHistory } from '@/services/scanService';
import dynamic from 'next/dynamic';

const ScanVolumeChart = dynamic(
  () => import('@/components/charts/ScanVolumeChart').then((m) => m.ScanVolumeChart),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const RiskDistributionChart = dynamic(
  () => import('@/components/charts/RiskDistributionChart').then((m) => m.RiskDistributionChart),
  { loading: () => <ChartSkeleton />, ssr: false }
);

interface DashboardData {
  totalScans: number;
  dangerousCount: number;
  suspiciousCount: number;
  safeCount: number;
  recentScans: Array<{
    id: string;
    input: string;
    risk_level: string;
    created_at: string;
    input_type: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboard() {
      try {
        const result = await getHistory({ page: 1, limit: 50 }, controller.signal) as {
          items: Array<{ id: string; input: string; risk_level: string; created_at: string; input_type: string }>;
          total: number;
        };

        const items = result.items || [];
        setData({
          totalScans: result.total,
          dangerousCount: items.filter((s) => s.risk_level === 'dangerous').length,
          suspiciousCount: items.filter((s) => s.risk_level === 'suspicious').length,
          safeCount: items.filter((s) => s.risk_level === 'safe').length,
          recentScans: items.slice(0, 10),
        });
      } catch {
        setData({
          totalScans: 0,
          dangerousCount: 0,
          suspiciousCount: 0,
          safeCount: 0,
          recentScans: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
    return () => controller.abort();
  }, []);

  const safePercent =
    data && data.totalScans > 0
      ? Math.round((data.safeCount / data.totalScans) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.display_name || 'User'}. Here is your scan overview.
          </p>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <FadeIn delay={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-3xl font-bold mt-1">
                  <CountUp end={data?.totalScans || 0} />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Dangerous</p>
                <p className="text-3xl font-bold mt-1 text-[var(--danger)]">
                  <CountUp end={data?.dangerousCount || 0} />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Safe Rate</p>
                <p className="text-3xl font-bold mt-1 text-[var(--safe)]">
                  <CountUp end={safePercent} suffix="%" />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Quota Remaining</p>
                <p className="text-3xl font-bold mt-1">
                  <CountUp
                    end={Math.max(0, (user?.scan_quota || 10) - (user?.scans_today || 0))}
                  />
                  <span className="text-sm text-muted-foreground font-normal">
                    /{user?.scan_quota || 10}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <FadeIn delay={0.2}>
          <ScanVolumeChart scans={data?.recentScans || []} />
        </FadeIn>
        <FadeIn delay={0.3}>
          <RiskDistributionChart
            safe={data?.safeCount || 0}
            suspicious={data?.suspiciousCount || 0}
            dangerous={data?.dangerousCount || 0}
          />
        </FadeIn>
      </div>

      {/* Recent Scans */}
      <FadeIn delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            {!data || data.recentScans.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No scans yet. Start by scanning a URL or message.
              </p>
            ) : (
              <div className="space-y-3">
                {data.recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-mono truncate">{scan.input}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(scan.created_at).toLocaleDateString()} &middot; {scan.input_type}
                      </p>
                    </div>
                    <Badge
                      className={
                        scan.risk_level === 'dangerous'
                          ? 'bg-[var(--danger)] text-white hover:bg-[var(--danger)]/80'
                          : scan.risk_level === 'suspicious'
                          ? 'bg-[var(--warning)] text-[var(--warning-foreground)] hover:bg-[var(--warning)]/80'
                          : 'bg-[var(--safe)] text-white hover:bg-[var(--safe)]/80'
                      }
                    >
                      {scan.risk_level}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
