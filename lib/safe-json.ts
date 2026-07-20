/** Safe JSON parser — handles empty bodies from 5xx responses */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeJson<T = any>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return {} as T
  try {
    return JSON.parse(text) as T
  } catch {
    return {} as T
  }
}
