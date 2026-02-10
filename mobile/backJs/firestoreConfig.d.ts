export type AuthConfig = {
  tokenExpirationSeconds: number
  loginAttemptLimit: number
}

export function getConfigInt(key: string, defaultValue?: number | null): Promise<number | null>

export function getAuthConfig(): Promise<AuthConfig>
