import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/auth/AuthManager';
import { extractToken } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 400 }
      );
    }

    // Logout (deactivate session)
    const success = await authManager.logout(token);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to logout' },
        { status: 400 }
      );
    }

    // Clear refresh token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the refresh token cookie
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('[Auth API] Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
