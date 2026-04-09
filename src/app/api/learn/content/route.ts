import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');

    const supabase = await createClient();

    let query = supabase
      .from('learning_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      query = query.eq('difficulty', difficulty);
    }

    if (type && ['example', 'simulation', 'tip'].includes(type)) {
      query = query.eq('content_type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Learn Content] Error:', error);
      return errorResponse('INTERNAL_ERROR', undefined, 500);
    }

    return successResponse(data);
  } catch (err) {
    console.error('[Learn Content] Error:', err);
    return errorResponse('INTERNAL_ERROR', undefined, 500);
  }
}
