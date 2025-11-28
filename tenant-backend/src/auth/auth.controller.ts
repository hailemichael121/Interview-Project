import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

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
      // Convert headers to plain object
      const headers: Record<string, string> = {};
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
          headers[key] = Array.isArray(value) ? value.join(', ') : value;
        }
      });

      // Better Auth expects routes like /sign-in/email (without /api/auth prefix)
      // The controller is already at /api/auth, so we need to remove that prefix
      let authPath = req.originalUrl;
      if (authPath.startsWith('/api/auth')) {
        authPath = authPath.replace('/api/auth', '') || '/';
      }
      if (!authPath.startsWith('/')) {
        authPath = '/' + authPath;
      }

      // Handle body - Better Auth handles raw body
      // If body is Buffer, convert to string, otherwise use as-is
      let body: any = undefined;
      if (req.method !== 'GET' && req.body) {
        if (Buffer.isBuffer(req.body)) {
          try {
            body = JSON.parse(req.body.toString());
          } catch {
            body = req.body.toString();
          }
        } else if (typeof req.body === 'string') {
          try {
            body = JSON.parse(req.body);
          } catch {
            body = req.body;
          }
        } else {
          body = req.body;
        }
      }

      const handler = await this.authService.auth.handler({
        method: req.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
        body: body,
        headers: headers,
        query: new URLSearchParams(req.query as Record<string, string>),
        url: authPath,
      });

      res.status(handler.status);

      // Set headers
      if (handler.headers) {
        for (const [key, value] of Object.entries(handler.headers)) {
          res.setHeader(key, value as string);
        }
      }

      // Send response
      if (typeof handler.body === 'string') {
        res.send(handler.body);
      } else {
        res.json(handler.body);
      }
    } catch (error) {
      console.error('Auth handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
