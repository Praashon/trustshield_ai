'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScanVolumeChartProps {
  scans: Array<{ created_at: string }>;
}

export function ScanVolumeChart({ scans }: ScanVolumeChartProps) {
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};

    scans.forEach((scan) => {
      const date = new Date(scan.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .slice(-14);
  }, [scans]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Scan Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            No scan data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Scan Volume
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#A3A3A3' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#A3A3A3' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#141414',
                border: '1px solid #292524',
                borderRadius: '6px',
                color: '#F5F5F0',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#scanGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
