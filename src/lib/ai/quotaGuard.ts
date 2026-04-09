import { createClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/utils/errors';

function startOfNextDay(): string {
  const now = new Date();
  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + 1);
  next.setUTCHours(0, 0, 0, 0);
  return next.toISOString();
}

export async function checkAndIncrementQuota(userId: string): Promise<void> {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('scan_quota, scans_today, quota_reset_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new AppError('INTERNAL_ERROR', 'Failed to fetch user quota.');
  }

  const now = new Date();
  const resetAt = new Date(user.quota_reset_at);

  if (now >= resetAt) {
    await supabase
      .from('users')
      .update({
        scans_today: 1,
        quota_reset_at: startOfNextDay(),
      })
      .eq('id', userId);
    return;
  }

  if (user.scans_today >= user.scan_quota) {
    throw new AppError('RATE_LIMIT_EXCEEDED', 'Daily scan limit reached.');
  }

  await supabase
    .from('users')
    .update({ scans_today: user.scans_today + 1 })
    .eq('id', userId);
}
