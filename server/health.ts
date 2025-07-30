# Add to your app for health check endpoint
import type { Request, Response } from 'express';

export function healthCheck(req: Request, res: Response) {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
}