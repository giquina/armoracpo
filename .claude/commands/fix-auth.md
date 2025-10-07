Replace mock authentication with real Supabase Auth in the ArmoraCPO CPO app.

Tasks to perform:
1. Read src/contexts/AuthContext.tsx (currently using mockAuthService)
2. Read src/services/authService.ts (real Supabase auth implementation)
3. Update AuthContext.tsx to use real authService instead of mock
4. Remove or disable mock services:
   - mockAuth.service.ts
   - mockAssignment.service.ts
   - mockMessage.service.ts
5. Test authentication flows:
   - Sign up new CPO
   - Sign in existing CPO
   - Sign out
   - Session persistence
   - Profile updates
6. Verify Supabase Auth configuration
7. Check email verification settings
8. Test OAuth (Google) if implemented

Goal: Enable real user authentication with Supabase Auth.