// List of user IDs that have developer access
export const DEVELOPER_IDS = [
    "1213915425369227334", 
    "117077657114449059595",
    "614895781832556585",
]

export function isDeveloper(userId?: string): boolean {
    if (!userId) return false
    return DEVELOPER_IDS.includes(userId)
}