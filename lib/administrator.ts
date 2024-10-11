// lib/administrator.ts

export const isAdministrator = (userId?: string | null) => {
    return userId === process.env.NEXT_PUBLIC_ADMINISTRATOR_ID;
}

export const canUpload = (userId?: string | null) => {
    // Allow both administrators and regular authenticated users
    return !!userId;
}