// lib/administrator.ts

export const isAdministrator = (userId?: string | null) => {
    return userId === process.env.NEXT_PUBLIC_ADMINISTRATOR_ID;
}