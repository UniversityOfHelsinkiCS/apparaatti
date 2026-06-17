# How Course Recommendation Works

The app recommends courses in two phases: the server narrows and sorts the pool by org and language; the client then filters that pool by user preferences. The server implementation is in `src/server/util/recommender.ts` and the client-side filtering is in `src/client/util/filtering.ts` and `src/client/contexts/filterContext.tsx`.

## In a nutshell

1. The client sends the four core answers (language, primary language, its specification, and organisation).
2. The server loads course codes for the matching org-language bucket from the spreadsheet.
3. The server fetches all matching course realizations from the database.
4. For Finnish and Swedish primary-language choices the server immediately drops courses not specific to the user's faculty.
5. The server sorts courses by tier and returns the full sorted list.
6. The client applies all preference filters (graduation, study place, independent, etc.) locally on every filter change.

## Local filters

| filter id | shortName (fi) | check function | true when |
|---|---|---|---|
| `replacement` | Korvaava | `checkReplacement` | course has `kks-kor` |
| `mentoring` | Valmentava | `checkMentoring` | course has `kks-pre` |
| `finmu` | Finmu | `checkFinmu` | course code is `KK-FINMU` |
| `challenge` | Mukautettu | `checkChallenge` | course has `kks-muk` |
| `graduation` | Valmistuville | `checkGraduation` | course has `kks-val` |
| `integrated` | Integroitu | `checkIntegrated` | course has `kks-int` |
| `independent` | Itsenäinen | `checkIndependent` | `courseUnitRealisationTypeUrn` contains `independent` |
| `study-place` | Opetusmuoto | `checkStudyPlace` | `normalizedStudyPlace` is in the selected set |
| `study-year` | Lukuvuosi | `checkStudyYear` | any course period has the selected `startYear` |
| `study-period` | Periodi | `checkStudyPeriod` | any course period is in the selected set |
| `mooc` | MOOC | `checkMooc` | course has `opintotarjonta:mooc` |
| `collaboration` | Yhteistyö | `checkCollaboration` | course name matches collaboration patterns |
| `multi-period` | Kurssin pituus | `checkMultiPeriod` | course spans more than 8 weeks |
| `flexible` | Joustava | `checkFlexible` | course has `kks-jou` |

Filters whose value is `'1'` keep only matching courses; `'0'` keeps only non-matching courses.

## Server sorting order

Courses are returned in this priority order:

1. Faculty-specific mandatory courses
2. Generic (`KAIKKI`) courses
3. Mentoring / numbered courses
4. Challenge / `ERI` courses

## Notes

### This is not semantic recommendation

The system does not read course descriptions and infer meaning from text. It is entirely driven by:

- course codes and the spreadsheet code lists
- custom code URNs
- organisation links via `groupIds`
- `courseUnitRealisationTypeUrn`
- a few name-based heuristics

### Some behavior is intentionally heuristic

The following are partly heuristic rather than fully canonical:

- collaboration detection
- exam detection by Finnish title text
- some fallback organisation matching via spreadsheet course codes
