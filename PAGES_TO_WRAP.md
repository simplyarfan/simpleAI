# Pages That Need ClientOnly Wrapper

Based on build errors, these pages use useRouter and need wrapping:

1. /404.js ✅
2. /admin/analytics.js ✅
3. /admin/index.js ✅
4. /admin/system.js ✅
5. /admin/tickets.js ✅
6. /admin/users.js ✅
7. /auth/login.js ✅ DONE
8. /auth/register.js ✅
9. /cv-intelligence/batch/[id].js ✅
10. /index.js ✅
11. /interview-coordinator.js ✅
12. /interview-coordinator/schedule.js ✅
13. /profile.js ✅ DONE
14. /superadmin.js ✅
15. /support/create-ticket.js ✅
16. /support/my-tickets.js ✅
17. /support/ticket/[id].js ✅

All these need to be wrapped with ClientOnly component.
