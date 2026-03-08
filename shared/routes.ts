import { z } from 'zod';
import { insertStrategySchema, insertSignalSchema, strategies, signals, portfolios, positions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  strategies: {
    list: {
      method: 'GET' as const,
      path: '/api/strategies' as const,
      responses: {
        200: z.array(z.custom<typeof strategies.$inferSelect>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/strategies/:id' as const,
      input: insertStrategySchema.partial(),
      responses: {
        200: z.custom<typeof strategies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  signals: {
    list: {
      method: 'GET' as const,
      path: '/api/signals' as const,
      input: z.object({
        symbol: z.string().optional(),
        limit: z.coerce.number().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof signals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/signals' as const,
      input: insertSignalSchema,
      responses: {
        201: z.custom<typeof signals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  portfolio: {
    get: {
      method: 'GET' as const,
      path: '/api/portfolio' as const,
      responses: {
        200: z.object({
          portfolio: z.custom<typeof portfolios.$inferSelect>(),
          positions: z.array(z.custom<typeof positions.$inferSelect>())
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type StrategyResponse = z.infer<typeof api.strategies.list.responses[200]>[0];
export type SignalResponse = z.infer<typeof api.signals.list.responses[200]>[0];
