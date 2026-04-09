'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { FadeIn } from '@/components/animations/FadeIn';
import { getAdminScans } from '@/services/adminService';

interface ScanItem {
  id: string;
  input: string;
  input_type: string;
  risk_level: string;
  user_id: string;
  created_at: string;
}

export default function AdminScansPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const result = await getAdminScans(page, 50) as {
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
    }
    fetch();
  }, [page]);

  return (
    <div>
      <FadeIn>
        <h2 className="text-2xl font-bold tracking-tight mb-6">All Scans</h2>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <TableSkeleton rows={10} />
            ) : scans.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No scans found.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {scans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/30"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-mono truncate">{scan.input}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(scan.created_at).toLocaleString()} &middot;{' '}
                          <span className="uppercase">{scan.input_type}</span> &middot;{' '}
                          User: {scan.user_id.slice(0, 8)}...
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
