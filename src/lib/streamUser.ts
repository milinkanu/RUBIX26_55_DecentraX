export function streamUserIdFromEmail(email: string) {
    // Sanitize email to be a valid Stream User ID
    // Allowed: letters, numbers, hyphens, underscores
    return email.toLowerCase().replace(/[^a-z0-9]/g, "_");
}
