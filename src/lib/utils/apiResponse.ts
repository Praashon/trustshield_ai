import { NextResponse } from 'next/server';
import type { ErrorCode } from './errors';
import { ERROR_MESSAGES } from './errors';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
    },
    { status }
  );
}

export function errorResponse(code: ErrorCode, message?: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        code,
        message: message || ERROR_MESSAGES[code],
      },
    },
    { status }
  );
}
