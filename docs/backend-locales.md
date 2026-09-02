# Backend Locales

Backend locales are app texts stored in the database instead of the bundled locale files, so they can be edited from `/admin/backend-locales` without a deploy. Unlike i18next keys, each text can vary by the student's faculty and language picks.

Reach for them when copy differs per faculty or per language choice. Everything else belongs in `src/client/locales/{fi,sv,en}.ts` — cheaper, type-checked, no request. Endpoint list is in [endpoints.md](endpoints.md).

## Rendering a text

Everything goes through `BackendLocaleProvider` (`src/client/contexts/backendLocaleContext.tsx`), mounted once inside `FilterContextProvider` in `App.tsx`:

```tsx
const { renderLocale } = useBackendLocales()
// ...
{renderLocale('noRecommendations.additionalInfo')}
```

- `renderLocale(key)` returns the text already wrapped in `AppMarkdown`, or `null` when there is nothing to show. Do not wrap it again.
- `localeText(key)` returns a bare string for when you need one — an `aria-label`, a `title`.

The provider fetches every key resolved for the current filter context in **one** request and caches it per context indefinitely, so a new call site never adds a request. It reads the conditions from `filterContext` itself; you never pass them. Calling `useBackendLocales` outside the provider throws.

## Adding a key

1. Create the key at `/admin/backend-locales`. Dotted name matching where it renders (`emptyState.somethingElse`); allowed characters are letters, digits, `.`, `-`, `_`.
2. Write a description saying where the text appears — this is what the next admin reads.
3. Add a catch-all text first (all four conditions "any"), then narrower ones.
4. Call `renderLocale('your.key')` at the render site.

Only step 4 is code; steps 1–3 need no deploy. A key created but never rendered is harmless. A key rendered but never created logs an error on every affected page, so create it before merging the call site.

## Conditions and resolution

Each text row carries four nullable *condition* columns. `NULL` means *any*; a row matches when every non-null condition equals the student's context.

| Condition | Comes from | Values |
|---|---|---|
| `organisationCode` | faculty picker (`study-field-select`) | `H50`, `H55`, … |
| `lang` | "Minkä kielen kursseja etsit?" (`lang`) | `fi`, `sv`, `en` |
| `primaryLanguage` | koulusivistyskieli (`primary-language`) | `fi`, `sv` |
| `primaryLanguageSpecification` | suoritustapa (`primary-language-specification`) | `writtenAndSpoken`, `written`, `spoken` |

When several rows match, **the most specific wins**, on a fixed precedence: organisation beats `lang`, which beats `primaryLanguage`, which beats `primaryLanguageSpecification`. A row naming an organisation therefore beats one that leaves it open however many lower conditions the other sets. Ties are impossible — two rows matching the same context with the same set of named conditions would need identical values, which a unique index forbids.

| org | lang | text |
|---|---|---|
| `NULL` | `NULL` | "Generic advice" |
| `H50` | `NULL` | "Theology advice" |
| `H50` | `sv` | "Theology, Swedish" |

H50 + Swedish → "Theology, Swedish". H50 + Finnish → "Theology advice". H55 → "Generic advice".

`resolveBackendLocales` in `src/server/util/backendLocales.ts` holds this logic as a pure function; `src/tests/backendLocales/` covers it.

Two constraints worth knowing when you touch this:

- The provider only sends `primaryLanguageSpecification` when that question was actually asked (`lang !== 'en' && lang === primaryLanguage`, the gate from `filterContext.tsx`). Otherwise a stale answer could match a row the student could never have keyed. `specificationCanBeMatched` in `src/common/validators.ts` is the shared predicate; the schema's `.refine` and the editor's disabled dropdown both use it, so a row that can never match is rejected at both ends.
- An unanswered filter arrives as `''`, which matches only wildcards.

## Errors

Both of these are errors. Each logs to the console and to Sentry — deduped per key and context — then returns `null` so the render site degrades to no text rather than a blank screen:

| State | Meaning | Fix |
|---|---|---|
| Key absent from the response | The code asks for a key nobody created | Create it in the admin UI |
| Key present, value `null` | No row fits this student's context | Add a catch-all row |

The response is shaped to keep these apart: it carries an entry for *every* registered key, `null` when nothing matched, so absence from the map means the key does not exist. The no-match message names the exact unmatched conditions.

```jsonc
{
  "locales": {
    "noRecommendations.additionalInfo": { "fi": "…", "sv": "…", "en": "…" },
    "someOther.key": null
  }
}
```

This is why **every key wants a catch-all row**. The admin key list flags any key without one.

## Writing through the API

The admin routes take JSON validated by `BackendLocaleKeySchema` / `BackendLocaleValueSchema` in `src/common/validators.ts`. Condition fields accept a value or `null`; they default to `null` when omitted.

```jsonc
// POST /api/admin/backend-locales
{ "key": "emptyState.somethingElse", "description": "Shown when …" }

// POST /api/admin/backend-locales/emptyState.somethingElse/values
{
  "organisationCode": "H50",
  "lang": "sv",
  "primaryLanguage": null,
  "primaryLanguageSpecification": null,
  "text": { "fi": "…", "sv": "…", "en": "…" }
}
```

Responses on failure: `400` with `{ message, errors }` from Zod, `404` for an unknown key or text id, `409` for a duplicate key name or a duplicate condition combination. Import is an upsert by key and by condition combination — it never deletes rows the file omits.

