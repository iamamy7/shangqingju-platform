export const API_KEY_HEADER = "x-api-key" as const;

export function readApiKey(headers: Record<string, string | string[] | undefined>): string | null {
  const value = headers[API_KEY_HEADER];
  if (Array.isArray(value)) return value[0]?.trim() || null;
  return value?.trim() || null;
}

