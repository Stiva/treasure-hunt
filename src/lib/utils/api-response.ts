import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function notFoundResponse(
  message = "Resource not found"
): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

export function unauthorizedResponse(
  message = "Unauthorized"
): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(
  message = "Forbidden"
): NextResponse<ApiResponse> {
  return errorResponse(message, 403);
}

export function serverErrorResponse(
  message = "Internal server error"
): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}
