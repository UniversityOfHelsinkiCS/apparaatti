# API Endpoints

All routes are prefixed with `/api`. Routes marked **admin** require the `isAdmin` role; **superuser** requires `isSuperuser`.

## Public / Auth

| Method | Path | Purpose |
|---|---|---|
| GET | `/login` | Redirect to OIDC provider |
| GET | `/login/callback` | OIDC callback; redirects to `/` on success |
| GET | `/logout` | Destroy session and redirect to `/` |
| GET | `/fail` | Returns login failure message |
| GET | `/ping` | Health check |

## User

| Method | Path | Purpose |
|---|---|---|
| GET | `/user` | Current user info with admin/superuser flags |
| GET | `/user/settings` | User settings (creates defaults if missing) |
| POST | `/user/settings` | Update user settings |
| GET | `/user/studydata` | User's organisations from Sisu |

## Courses & Filters

| Method | Path | Purpose |
|---|---|---|
| POST | `/form/coursedata` | Fetch sorted course recommendations for given answers |
| GET | `/filter-config` | Ordered enabled filter configs for the client UI |
| GET | `/organisations` | All organisations in the database |
| GET | `/organisations/supported` | Organisations that have supported course codes |
| GET | `/organisations/integrated` | Organisation codes that have integrated-studies courses |
| GET | `/backend-locales` | Admin-editable texts resolved for the given org and language picks (see [backend-locales.md](backend-locales.md)) |
| GET | `/version` | App version info (git SHA, package version, release) |

## Feedback

| Method | Path | Purpose |
|---|---|---|
| POST | `/feedback` | Submit user feedback with star rating and metadata |

## Updater

| Method | Path | Purpose |
|---|---|---|
| POST | `/updater/run` | Trigger a manual updater run (only available when `UPDATER_CRON_ENABLED`) |

## Admin

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/user-feedback` | List user feedback entries filtered by date range |
| GET | `/admin/courses` | Search course realizations with pagination |
| POST | `/admin/course/review` | Create or update an admin review entry for a course |
| GET | `/admin/filter-config` | All filter configs |
| PUT | `/admin/filter-config/:id` | Update a filter config |
| PATCH | `/admin/filter-config/reorder` | Update display order of filter configs |
| POST | `/admin/filter-config/:id/restore` | Restore a filter config to its seed defaults |
| GET | `/admin/filter-config/export` | Download all filter configs as JSON |
| POST | `/admin/filter-config/import` | Import filter configs from JSON |
| GET | `/admin/stats` | Unique user visit counts grouped by hour/day/month/year |
| GET | `/admin/backend-locales` | All backend locale keys with their texts |
| POST | `/admin/backend-locales` | Create a backend locale key |
| PUT | `/admin/backend-locales/:key` | Update a key's description |
| POST | `/admin/backend-locales/:key/values` | Add a text to a key |
| PUT | `/admin/backend-locales/values/:id` | Update a text |
| DELETE | `/admin/backend-locales/values/:id` | Delete a text |

## Superuser

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/users` | Search users by name (min 5 chars) |
| POST | `/admin/filter-config` | Create a new filter config |
| POST | `/admin/updater/run` | Trigger updater via the updater service |
| GET | `/admin/updater/runs` | List updater run history |
| DELETE | `/admin/backend-locales/:key` | Delete a backend locale key and all its texts |
| GET | `/admin/backend-locales/export` | Download all backend locale keys and texts as JSON |
| POST | `/admin/backend-locales/import` | Upsert backend locale keys and texts from JSON |

## Debug (development only)

| Method | Path | Purpose |
|---|---|---|
| GET | `/debug/reset/settings` | Reset current user's settings to defaults |
| GET | `/debug/cur` | Search course realizations by name or code URN |
| GET | `/debug/cur/debug` | All realizations grouped by org URN with unique type URNs |
| GET | `/debug/cu` | Search course units by name or course code |
| GET | `/debug/strict` | Course realizations grouped by `kkt-` URNs |
| GET | `/debug/curcu` | All course realization–unit join rows |
