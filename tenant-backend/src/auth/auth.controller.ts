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

      // Extract auth path
      let authPath = req.originalUrl;
      if (authPath.startsWith('/api/auth')) {
        authPath = authPath.replace('/api/auth', '') || '/';
      }
      if (!authPath.startsWith('/')) {
        authPath = `/${authPath}`;
      }

      // Create absolute URL
      const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
      const absoluteAuthUrl = new URL(authPath, baseUrl).toString();

      // Handle body
      let body: string | undefined;
      if (req.method !== 'GET' && req.body) {
        body = JSON.stringify(req.body);
        console.log('📦 Request body prepared');
      }

      console.log(`🔄 Calling Better Auth: ${req.method} ${absoluteAuthUrl}`);

      // Create request object
      const requestLike = {
        method: req.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
        headers,
        body,
        url: absoluteAuthUrl,
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
      let handler = await this.authService.auth.handler(requestLike);

      // Fallback with /api/auth prefix if 404
      if (handler?.status === 404) {
        console.log('🔄 404 received, trying with /api/auth prefix');
        const prefixedUrl = new URL(`/api/auth${authPath}`, baseUrl).toString();

        const fallbackRequest = {
          ...requestLike,
          url: prefixedUrl,
        };

        handler = await this.authService.auth.handler(fallbackRequest);
      }

      console.log(`✅ Auth response: ${handler.status}`);

      // Handle response body
      let responseBody = handler.body;
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
          responseBody = JSON.parse(responseBody) as unknown;
        } catch {
          // If not JSON, keep as string
        }
      }

      console.log('📄 Response body processed');

      // Send response
      res.status(handler.status);

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

      console.log(`📨 Response sent: ${handler.status}`);
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
