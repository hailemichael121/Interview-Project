import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

interface BetterAuthHeaders {
  get: (name: string) => string | undefined;
  has: (name: string) => boolean;
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('*')
  async handleAuthGet(@Req() req: Request, @Res() res: Response) {
    return this.handleAuthRequest(req, res);
  }

  @Post('*')
  async handleAuthPost(@Req() req: Request, @Res() res: Response) {
    return this.handleAuthRequest(req, res);
  }

  private async handleAuthRequest(req: Request, res: Response) {
    try {
      console.log(`🔐 Auth request: ${req.method} ${req.originalUrl}`);

      // Create headers map
      const headersMap = new Map<string, string>();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
          const headerValue = Array.isArray(value)
            ? value.join(', ')
            : String(value);
          headersMap.set(key.toLowerCase(), headerValue);
        }
      });

      // Add Origin header if missing
      if (!headersMap.has('origin')) {
        const origin = String(
          req.headers.origin ||
            req.headers.referer ||
            process.env.FRONTEND_URL ||
            'http://localhost:3001',
        );
        headersMap.set('origin', origin);
        console.log(`📍 Added Origin header: ${origin}`);
      }

      // Create headers object with proper typing
      const headers: BetterAuthHeaders = {
        get: (name: string) => headersMap.get(name.toLowerCase()),
        has: (name: string) => headersMap.has(name.toLowerCase()),
      };

      // Extract auth path - Better Auth expects paths like /sign-up/email, /sign-in/email
      let authPath = req.originalUrl;
      if (authPath.startsWith('/api/auth')) {
        authPath = authPath.replace('/api/auth', '') || '/';
      }
      if (!authPath.startsWith('/')) {
        authPath = `/${authPath}`;
      }

      // Better Auth handler expects relative paths, not absolute URLs
      // Paths should be like: /sign-up/email, /sign-in/email, /session

      // Handle body
      let body: string | undefined;
      if (req.method !== 'GET' && req.body) {
        body = JSON.stringify(req.body);
        console.log('📦 Request body prepared');
      }

      console.log(`🔄 Calling Better Auth: ${req.method} ${authPath}`);

      // Create request object - Better Auth expects relative paths
      // Better Auth handler may construct absolute URLs internally, so provide
      // an absolute URL to avoid "Invalid URL" errors (see session.helper.ts)
      const absoluteUrl = new URL(
        authPath,
        process.env.BETTER_AUTH_URL || process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3000',
      ).toString();

      const requestLike = {
        method: req.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
        headers,
        body,
        url: absoluteUrl,
        query: new URLSearchParams(req.query as Record<string, string>),
        json: async () => {
          if (!body) return null;
          try {
            return JSON.parse(body) as unknown;
          } catch {
            console.error('❌ JSON parse error');
            return null;
          }
        },
        text: async () => body || '',
      };

      // Call Better Auth handler
      const handler = await this.authService.auth.handler(requestLike);

      const status = handler.status || 500;
      console.log(`✅ Auth response: ${status}`);

      // Handle response body
      let responseBody: any = handler.body;
      
      // Handle ReadableStream
      if (
        responseBody &&
        typeof responseBody === 'object' &&
        'getReader' in responseBody
      ) {
        console.log('📄 Response is ReadableStream, converting to text...');
        const reader = (responseBody as ReadableStream).getReader();
        const chunks: Uint8Array[] = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }

        const combined = Buffer.concat(chunks);
        responseBody = combined.toString('utf-8');

        try {
          responseBody = JSON.parse(responseBody);
        } catch {
          // If not JSON, keep as string
        }
      }

      // Parse string responses that might be JSON
      if (typeof responseBody === 'string') {
        try {
          responseBody = JSON.parse(responseBody);
        } catch {
          // Keep as string if not JSON
        }
      }

      // Format error responses properly for Better Auth client compatibility
      if (status >= 400) {
        let errorMessage = 'Authentication failed';
        let errorCode = 'SERVER_ERROR';
        
        // Extract error message from various possible formats
        if (responseBody?.error?.message) {
          errorMessage = responseBody.error.message;
        } else if (responseBody?.error && typeof responseBody.error === 'string') {
          errorMessage = responseBody.error;
        } else if (responseBody?.message) {
          errorMessage = responseBody.message;
        } else if (typeof responseBody === 'string') {
          errorMessage = responseBody;
        }
        
        // Map status codes to error codes
        if (status === 401) {
          errorCode = 'UNAUTHORIZED';
          if (errorMessage.includes('Credential account not found') || errorMessage.includes('account not found')) {
            errorMessage = 'Invalid email or password';
          }
        } else if (status === 404) {
          errorCode = 'NOT_FOUND';
          errorMessage = 'Authentication endpoint not found';
        } else if (status === 400) {
          errorCode = 'BAD_REQUEST';
        } else if (status === 500) {
          errorCode = 'SERVER_ERROR';
          // Hide internal error details in production
          if (process.env.NODE_ENV === 'production') {
            errorMessage = 'An error occurred during authentication';
          }
        }
        
        responseBody = {
          error: {
            message: errorMessage,
            code: errorCode,
          },
        };
        console.log(`❌ Error [${errorCode}]: ${errorMessage}`);
      } else if (status >= 200 && status < 300) {
        // Ensure success responses maintain Better Auth format
        // Better Auth returns { user, session } on success
        if (responseBody && typeof responseBody === 'object') {
          if (!responseBody.error) {
            console.log('✅ Success response - User authenticated');
            // Ensure the response has the expected structure
            if (responseBody.user || responseBody.session) {
              // Response is already in correct format
            }
          }
        }
      }

      console.log('📄 Response body processed');

      // Send response
      res.status(status);

      if (handler.headers) {
        Object.entries(handler.headers).forEach(([key, value]) => {
          res.setHeader(key, String(value));
        });
      }

      if (typeof responseBody === 'string') {
        res.send(responseBody);
      } else {
        res.json(responseBody);
      }

      console.log(`📨 Response sent: ${status}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Auth handler error:', errorMessage);
      res.status(500).json({
        error: 'Authentication service unavailable',
        message:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      });
    }
  }
}
