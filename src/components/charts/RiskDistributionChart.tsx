'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RiskDistributionChartProps {
  safe: number;
  suspicious: number;
  dangerous: number;
}

export function RiskDistributionChart({ safe, suspicious, dangerous }: RiskDistributionChartProps) {
  const data = [
    { name: 'Safe', value: safe, fill: '#16A34A' },
    { name: 'Suspicious', value: suspicious, fill: '#F59E0B' },
    { name: 'Dangerous', value: dangerous, fill: '#DC2626' },
  ];

  const total = safe + suspicious + dangerous;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Risk Distribution
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
          Risk Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" barCategoryGap={12}>
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#A3A3A3' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#A3A3A3' }}
              width={80}
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
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
