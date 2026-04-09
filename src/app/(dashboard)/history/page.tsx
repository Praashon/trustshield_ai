'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { FadeIn } from '@/components/animations/FadeIn';
import { getHistory } from '@/services/scanService';

interface ScanItem {
  id: string;
  input: string;
  input_type: string;
  risk_level: string;
  created_at: string;
  is_saved: boolean;
}

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [riskFilter, setRiskFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();

    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (riskFilter !== 'all') params.risk_level = riskFilter;
      if (search) params.search = search;

      const result = await getHistory(params, controller.signal) as {
        items: ScanItem[];
        totalPages: number;
      };

      setScans(result.items || []);
      setTotalPages(result.totalPages || 1);
    } catch {
      setScans([]);
    } finally {
      setLoading(false);
    }
  }, [page, riskFilter, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Scan History</h1>
          <p className="text-muted-foreground">
            Review and filter all your past scans.
          </p>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input
            id="history-search"
            placeholder="Search scans..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="sm:max-w-xs"
          />
          <Select
            value={riskFilter}
            onValueChange={(val) => {
              if (val) {
                setRiskFilter(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk levels</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
              <SelectItem value="dangerous">Dangerous</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FadeIn>

      {/* Table */}
      <FadeIn delay={0.2}>
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <TableSkeleton rows={8} />
            ) : scans.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                No scans found. Try adjusting your filters or start scanning.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {scans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-mono truncate">{scan.input}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(scan.created_at).toLocaleString()} &middot;{' '}
                          <span className="uppercase">{scan.input_type}</span>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
