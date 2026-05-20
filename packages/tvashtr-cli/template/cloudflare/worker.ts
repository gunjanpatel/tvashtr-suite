/// <reference types="@cloudflare/workers-types" />

import { INSERT_ORDER_SQL } from '@tvashtr/checkout'
import type { OrderDb, OrderPayload } from '@tvashtr/checkout'
import { EnquiryService, BrevoEnquiryNotifier } from '@tvashtr/checkout'
import { OrderService, TelegramOrderNotifier, BrevoOrderNotifier } from '@tvashtr/checkout'
import { TurnstileProtector, HoneypotProtector, CompositeBotProtector } from '@tvashtr/checkout'
import { siteName, brandConfig } from '../store.config'

export interface Env {
  DB: D1Database
  ALLOWED_ORIGIN: string
  TURNSTILE_SECRET_KEY: string
  TELEGRAM_TOKEN: string
  TELEGRAM_CHAT_ID: string
  BREVO_API_KEY: string
  BREVO_SENDER_EMAIL: string
  BREVO_SENDER_NAME: string
}

// ── Rate limiting (in-memory per worker instance) ──────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

// ── Helpers ────────────────────────────────────────────────────────────────

const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:3001']

function corsHeaders(origin: string, env: Env): Record<string, string> {
  const allowed = [...DEV_ORIGINS, env.ALLOWED_ORIGIN].filter(Boolean)
  const allowedOrigin = allowed.includes(origin) ? origin : env.ALLOWED_ORIGIN
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

// ── Main handler ───────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('Origin') ?? ''
    const cors = corsHeaders(origin, env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const url = new URL(request.url)
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'

    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true }, 200, cors)
    }

    if (isRateLimited(ip)) {
      return json({ success: false, error: 'Too many requests. Please try again later.' }, 429, cors)
    }

    // ── Order Route ────────────────────────────────────────────────────────
    if (url.pathname === '/order' && request.method === 'POST') {
      const payload = await request.json()

      const d1Db: OrderDb = {
        async save(id, name, email, phone, address, deliveryTitle, deliveryPrice, itemsJson, total, paymentMethod, createdAt) {
          await env.DB.prepare(INSERT_ORDER_SQL)
            .bind(id, name, email, phone, address, deliveryTitle, deliveryPrice, itemsJson, total, paymentMethod, createdAt)
            .run()
        },
      }

      const protector = new TurnstileProtector(env.TURNSTILE_SECRET_KEY)
      const notifiers = [
        new TelegramOrderNotifier({ token: env.TELEGRAM_TOKEN, chatId: env.TELEGRAM_CHAT_ID }),
        new BrevoOrderNotifier(
          { apiKey: env.BREVO_API_KEY, senderEmail: env.BREVO_SENDER_EMAIL, senderName: env.BREVO_SENDER_NAME },
          brandConfig
        ),
      ]

      const service = new OrderService(d1Db, notifiers, protector)

      try {
        const result = await service.process(payload, { ip })
        return json({ success: true, orderId: result.orderId }, 201, cors)
      } catch (e: any) {
        return json({ success: false, error: e.message || 'Failed to save order.' }, e.statusCode || 500, cors)
      }
    }

    // ── Enquiry Route ──────────────────────────────────────────────────────
    if (url.pathname === '/enquiry' && request.method === 'POST') {
      const payload = await request.json()

      const protector = new CompositeBotProtector([
        new HoneypotProtector('fax'),
        new TurnstileProtector(env.TURNSTILE_SECRET_KEY),
      ])

      const notifier = new BrevoEnquiryNotifier(
        { apiKey: env.BREVO_API_KEY, senderEmail: env.BREVO_SENDER_EMAIL, senderName: env.BREVO_SENDER_NAME },
        siteName
      )

      const service = new EnquiryService(protector, notifier)

      try {
        const result = await service.process(payload, { ip })
        return json(result, 200, cors)
      } catch (e: any) {
        return json({ success: false, error: e.message || 'Failed to send enquiry.' }, e.statusCode || 500, cors)
      }
    }

    return json({ success: false, error: 'Not found.' }, 404, cors)
  },
}
