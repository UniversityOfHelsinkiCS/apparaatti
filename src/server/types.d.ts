// Makes this file a module so that `declare global` below actually merges into Express.User.
// Without it, TypeScript treats this as a global script and the augmentation is a no-op.
export {}

declare global {
  namespace Express {
    // Matches what oidc.ts verifyLogin actually stores in the session via passport.
    // isAdmin/isSuperuser are NOT here — they're computed on-demand in GET /api/user.
    // Use isAdmin(req.user) / isSuperuser(req.user) from validations.ts instead.
    interface User {
      id: string
      username: string
      hyGroupCn: string[] | null
      language: string | null
      studentNumber?: string | null
    }
  }
}
