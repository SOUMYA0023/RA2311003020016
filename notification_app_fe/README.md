# notification_app_fe

Next.js frontend for the campus notifications system.

## Setup

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev
```

Runs on http://localhost:3000.

## Pages

- `/notifications` — all notifications with type filter and pagination
- `/notifications/priority` — top-N notifications sorted by priority (Placement > Result > Event)

## Notes

- Backend must be running on the port specified in `.env.local`
- Viewed state is persisted in localStorage
