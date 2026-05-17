/**
 * Low-level Telegram Bot API client.
 */

export interface TelegramConfig {
  token: string
  chatId: string
}

export async function sendTelegramMessage(
  config: TelegramConfig,
  text: string,
  parseMode: 'Markdown' | 'HTML' | 'MarkdownV2' = 'Markdown'
): Promise<void> {
  if (!config.token || config.token === 'MOCK') {
    console.info(`[Mock] Telegram message to chat ${config.chatId} skipped.`)
    return
  }
  const url = `https://api.telegram.org/bot${config.token}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.chatId,
      text,
      parse_mode: parseMode,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '(no body)')
    throw new Error(`Telegram API error ${res.status}: ${body}`)
  }
}
