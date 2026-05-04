# How Course Recommendation Works

This app recommends courses by turning the user's answers into a set of coordinates, turning each available course into the same coordinate space, and then scoring how well each course matches the user. The implementation is in `src/server/util/recommender.ts` and `src/server/util/pointRecommendCourses.ts`.


## in a nutshell

1. figure out what kind of language course the user should see
2. fetch courses whose codes belong to that organisation-language bucket
3. annotate each course with coordinates such as organisation match, language match, graduation, mooc, replacement, and study place
4. give points for each matching preference
5. immediately drop courses that fail strict requirements
6. use small bonus tiers to prefer faculty-specific and generic mandatory courses over more generic or challenge-oriented alternatives




## High-Level Flow

1. The client sends `answerData` and a list of `strictFields`.
2. The server normalizes missing answers to `neutral`.
3. The server builds `userCoordinates` from the answers.
4. The server determines which course codes are relevant for the user's organisation and language choices.
5. The server fetches matching course units and their realizations from the database.
6. Each course realization is converted into a `CourseRecommendation` with computed coordinates.
7. Courses are scored with the point-based ranking algorithm.
8. Courses that fail a strict rule are removed.
9. The remaining courses are sorted by descending points and returned to the frontend.

## Input Model

The recommender expects two main inputs:

- `answerData`: the user's answers from the filter UI
- `strictFields`: filter ids that should act as hard requirements instead of soft preferences

The answer data includes values such as:

- study year and study period
- target language to study
- primary school language and its specification
- study field / organisation
- yes-no preferences like graduation, mentoring, replacement, challenge, flexible, mooc, collaboration
- study place selections

## Step 1: Normalize Answers

`readAnswer()` treats missing values as `neutral`.

That means all of these are interpreted as unanswered:

- `undefined`
- `null`
- `''`
- `[]`

This matters because unanswered values usually do not penalize a course. In practice, `neutral` means “do not use this answer to exclude or reward courses too strongly”.

## Step 2: Build User Coordinates

`calculateUserCoordinates()` converts answers into a `UserCoordinates` object. The fields are intentionally simple. Most are encoded as:

- `1` for a positive / matching preference
- `0` for a negative / opposite preference
- `null` when unanswered and the field should be ignored during scoring

### Coordinate rules

- `date`
  - Derived from the first relevant selected study period.
  - Used to represent timing, but the point scorer does not reward or punish `date` directly.
- `org`
  - Always set to `1` for the user.
  - A course must also get `1` here to survive scoring.
- `spesificOrg`
  - Always set to `1` for the user.
  - Used to reward courses explicitly marked for the user's organisation.
- `lang`
  - Always set to `1` for the user.
  - Courses get `1` only if they match the language-specific course code set selected for that user.
- `graduation`, `mentoring`, `finmu`, `integrated`, `replacement`, `challenge`, `independent`, `flexible`, `mooc`
  - Derived from yes-no-neutral answers.
- `collaboration`
  - Uses a slightly different mapping: unanswered currently behaves like `0`, not `null`.
- `studyPlace`
  - Always treated as answered.
  - Exam handling is built into course-side matching logic.
- `studyYear`
  - Stored as the selected year or `neutral`.
- `studyPeriod`
  - Stored as an array of selected periods or `['neutral']`.
- `multiPeriod`
  - `1`, `0`, or `null` depending on the user's choice.

## Step 3: Pick the Relevant Course Code Set

The app does not score every course in the database. It first narrows the pool using organisation and language-specific course codes.

### Organisation recommendation data

`readOrganisationRecommendationData()` loads recommendation metadata from `data/data.xlsx`.

That spreadsheet maps:

- organisation code
- language bucket
- course codes belonging to that organisation-language combination

### `getCourseCodes()` returns three code sets

- `all`
  - Every code found in the spreadsheet.
- `userOrganisation`
  - Codes belonging to the user's organisation.
- `languageSpesific`
  - Codes belonging to the user's organisation and the language bucket selected from the user's answers.

Only the `languageSpesific` set is used for fetching the initial course candidates.

### Language bucket selection

`languageToStudy(lang, primaryLanguage)` decides whether the user is studying a primary or secondary language:

- same language as primary school language -> `fi-primary`, `sv-primary`, `en-primary`
- different language -> `fi-secondary`, `sv-secondary`, `en-secondary`

For Finnish and Swedish primary-language studies, the app also uses `primary-language-specification` to split written, spoken, or combined variants.

## Step 4: Fetch Candidate Courses From the Database

The course pool is built in three steps:

1. Find course units (`Cu`) whose `courseCode` is in the selected `languageSpesific` code set.
2. Find join-table rows (`CurCu`) that connect those course units to course realizations.
3. Load the course realizations (`Cur`) and merge them with related course-unit data into `CourseData` records.

The merged `CourseData` is the structure used for recommendation scoring.

## Step 5: Compute Course Coordinates

Each candidate course is converted to a `CourseRecommendation` with a `coordinates` object. This is done in `calculateCourseCoordinates()`.

### Organisation matching

`org` becomes `1` when any of these are true:

- the course is explicitly specific to the user's organisation via a custom code URN
- one of the course `groupIds` resolves to the same organisation code as the user
- the course code is found in the spreadsheet-backed organisation code list for that organisation

Otherwise `org` becomes `0`.

This field is always strict in the scorer, so organisation mismatch removes the course.

### Specific-organisation matching

`spesificOrg` becomes `1` when the course carries the custom organisation URN mapped from the user's organisation code, for example `kkt-hum`, `kkt-mat`, or `kkt-laa`.

This is used both for ranking and, in some language situations, as an automatic strict field.

### Language matching

`lang` becomes `1` when the course has at least one course code in the computed `languageSpesific` code set.

### Feature flags detected from custom code URNs or codes

The recommender sets coordinates for several course properties:

- `graduation`
  - true when course has `kks-val` or `kkt-val`
- `integrated`
  - true when course has `kks-int`
- `replacement`
  - true when course has `kks-kor`
- `flexible`
  - true when course has `kks-jou`
- `mooc`
  - true when course has `opintotarjonta:mooc`
- `mentoring`
  - true when course code is in the hardcoded mentoring course code list
- `finmu`
  - true when course code is `KK-FINMU`
- `challenge`
  - true when the course matches the hardcoded challenge rules for the active language bucket
- `independent`
  - true when course has `kks-alm` or its Finnish name contains `itsenainen`
- `collaboration`
  - true when the course name or its organisations match collaboration heuristics
- `multiPeriod`
  - true when the course spans multiple periods

### Study place matching

Study place is handled by `courseStudyPlaceCoordinate()`.

The logic is more nuanced than a plain equality check:

- Exam courses are only valid if the user explicitly selected `exam`.
- If the user made no study-place selection, all non-exam courses are allowed.
- If the user selected `independent`, independent courses always match.
- Otherwise the system resolves frontend aliases such as `online`, `contact`, and `blended` into canonical realization type URNs and checks whether the course realization type contains any of them.

### Collaboration detection

`courseIsCollaboration()` currently uses heuristics, not a single canonical field.

It marks a course as collaboration when either of these is true:

- the course name contains known collaboration-provider patterns
- one of the course organisations contains a known collaboration organisation name

## Step 6: Apply the Point-Based Scorer

The final ranking is produced by `pointRecommendedCourses()`.

### Base scoring

For each field in `userCoordinates`:

- if the user value is `null`, the field is skipped
- otherwise the course and user values are compared
- a match gives points
- a mismatch may either do nothing or immediately reject the course if that field is strict

### Default points

Most matching fields award:

- `pointForCorrectFilter = 10`

One special case exists:

- `replacement` uses `extraRewardPoints = 5`

Despite the name, this is lower than the default 10-point reward. The code comment says replacement gets special handling because of exceptions, but the actual value currently used is 5.

### Strict failure

If a field is configured with `filterOnFail: true` and the course does not match, scoring stops immediately and the course gets:

- `strictFailurePoint = -1`

All courses with negative points are removed before sorting.

### Fields that can be strict

Depending on `strictFields`, the following can become hard requirements:

- collaboration
- spesificOrg
- mooc
- mentoring
- challenge
- replacement
- graduation
- flexible
- integrated
- study-place
- study-year
- study-period
- multi-period

`org` is always strict.

### Automatic strictness for specific organisation

`getRecommendations()` automatically adds `spesificOrg` to `strictFields` when:

- the studied language equals the primary language, and
- that language is Finnish or Swedish

This makes native-language recommendations stricter for faculty-specific courses.

### Special comparison logic

Some fields do not use simple equality:

- `date`
  - Always returns true in the scorer, so it does not affect points.
- `studyYear`
  - Matches when any course period has the same `startYear` as the user's selected year.
- `studyPeriod`
  - Matches when the course start date maps to one of the selected study periods.
  - If the user answered `neutral`, the field does not filter the course even if strict.

## Step 7: Apply Bonus Ranking Tiers

After the base score is calculated, the app adds small tie-break style bonus points.

The code uses `bonusPoint = 1`, then applies these multipliers:

- faculty-specific mandatory course: `+5`
- generic `KAIKKI` course: `+4`
- numbered mentoring-style course: `+3`
- challenge / `ERI` course: `+0`

The ranking intent is:

- specific > KAIKKI > numbered > ERI

The conditions are:

- `isEriOrChallenge`
  - true when `challenge === 1` or a course code contains `ERI`
- `isGeneric`
  - true when a course code contains `KAIKKI`
- `isMandatory`
  - true when `mentoring === 0`

If the course is a challenge course, it gets no ranking bonus.

## Step 8: Filter and Sort

Finally:

1. courses with negative points are removed
2. remaining courses are sorted by descending `points`
3. the server returns `pointBasedRecommendations` and the computed `userCoordinates`

## Notes

### This is not semantic recommendation

The system does not read course descriptions and infer meaning from text. It is almost entirely driven by:

- course codes
- custom code URNs
- organization mappings
- a few name-based heuristics


### Some behavior is intentionally heuristic

The following are partly heuristic rather than fully canonical:

- collaboration detection
- independent-course detection by Finnish title text
- exam detection by Finnish title text
- some fallback organisation matching via spreadsheet course codes

