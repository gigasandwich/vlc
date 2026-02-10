export function fetchUserProfileByFirebaseUid(uid: string): Promise<any | null>
export function fetchUserProfileByEmail(email: string): Promise<any | null>
export function assertUserRole(profile: any | null): void
export function assertUserNotDisabled(profile: any | null): void

export function incrementAttemptByEmail(email: string): Promise<{ attempt: number | null; profile: any | null }>
export function resetAttemptByFirebaseUid(uid: string): Promise<void>
export function disableUserByEmail(email: string): Promise<void>
