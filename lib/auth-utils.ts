export const DEVELOPER_IDS = process.env.DEVELOPER_IDS?.split(',') || []

export function isDeveloper(userId?: string): boolean {
    if (!userId) return false
    return DEVELOPER_IDS.includes(userId)
}