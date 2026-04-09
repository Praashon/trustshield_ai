'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { FadeIn } from '@/components/animations/FadeIn';
import { getAdminUsers, updateUserQuota } from '@/services/adminService';
import type { User } from '@/types/database';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingQuota, setEditingQuota] = useState<{ id: string; value: string } | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const result = await getAdminUsers(page, 50);
        setUsers((result.items || []) as User[]);
        setTotalPages(result.totalPages || 1);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [page]);

  const handleQuotaUpdate = async (userId: string, quota: number) => {
    try {
      await updateUserQuota(userId, { scan_quota: quota });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, scan_quota: quota } : u))
      );
      setEditingQuota(null);
      toast.success('Quota updated successfully');
    } catch {
      toast.error('Failed to update quota');
    }
  };

  return (
    <div>
      <FadeIn>
        <h2 className="text-2xl font-bold tracking-tight mb-6">User Management</h2>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <TableSkeleton rows={10} />
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No users found.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/30"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium">
                          {user.display_name || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {user.email} &middot; Joined{' '}
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            user.role === 'admin'
                              ? 'border-[var(--amber)] text-[var(--amber)]'
                              : ''
                          }
                        >
                          {user.role}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {editingQuota?.id === user.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={editingQuota.value}
                                onChange={(e) =>
                                  setEditingQuota({ id: user.id, value: e.target.value })
                                }
                                className="w-16 h-8 text-xs"
                                min={0}
                                max={1000}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs"
                                onClick={() =>
                                  handleQuotaUpdate(
                                    user.id,
                                    parseInt(editingQuota.value, 10)
                                  )
                                }
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs text-muted-foreground"
                              onClick={() =>
                                setEditingQuota({
                                  id: user.id,
                                  value: user.scan_quota.toString(),
                                })
                              }
                            >
                              Quota: {user.scan_quota}
                            </Button>
                          )}
                        </div>
                      </div>
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
