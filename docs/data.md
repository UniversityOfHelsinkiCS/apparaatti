# Recommendation Data Model

This file documents the codes, URNs, and heuristics the recommender uses to detect course properties.

## Overview

The recommendation engine depends on three main data sources:

1. `courseCodes` on course units
2. `customCodeUrns` on course realizations
3. `courseUnitRealisationTypeUrn` on course realizations

It also uses:

- organisation links via `groupIds`
- the spreadsheet `data/data.xlsx`
- a few name-based heuristics

## Custom Code URNs

These URNs are inspected from `customCodeUrns`.

### General feature URNs

- `kks-val`
  - Graduation-related course.
- `kkt-val`
  - Also treated as graduation-related.
- `kks-int`
  - Integrated studies.
- `kks-kor`
  - Replacement course.
  - Also used as part of Finnish challenge-course detection.
- `kks-jou`
  - Flexible study mode.
- `opintotarjonta:mooc`
  - MOOC course.

### Organisation-specific URNs

These URNs are used to detect whether a course is specific to the user's organisation. The app maps organisation codes to these URNs in `organisationCodeToUrn`.

- `H40` -> `kkt-hum`
- `H50` -> `kkt-mat`
- `H20` -> `kkt-oik`
- `H10` -> `kkt-teo`
- `H74` -> `kkt-ssk`
- `H70` -> `kkt-val`
- `H90` -> `kkt-ela`
- `H60` -> `kkt-kas`
- `H57` -> `kkt-bio`
- `H80` -> `kkt-mm`
- `4141` -> `kkt-sps`
- `H305` -> `kkt-ham`
- `H30` -> `kkt-laa`
- `H3456` -> `kkt-log`
- `414` -> `kkt-psy`
- `H55` -> `kkt-far`

## Realisation Type URNs

Study place detection does not use `customCodeUrns`. It checks whether `courseUnitRealisationTypeUrn` contains one of the expected study-place identifiers.

### Canonical study-place ids

- `teaching-participation-remote`
- `teaching-participation-online`
- `teaching-participation-blended`
- `teaching-participation-contact`

### Frontend aliases resolved to canonical ids

- `online`
  - `teaching-participation-remote`
  - `teaching-participation-online`
  - `teaching-participation-distance`
- `contact`
  - `teaching-participation-contact`
- `blended`
  - `teaching-participation-blended`

### Special study-place cases

- `exam`
  - Not a realization type URN.
  - Exams are detected heuristically from the Finnish course name containing `tentti`.
- `independent`
  - Detected when `courseUnitRealisationTypeUrn` contains `independent` (e.g. `independent-work-essay`, `independent-work-project`).

## Hardcoded Course Code Sets

These are explicit course-code lists used directly in code.

### Mentoring course codes

These codes set the `mentoring` coordinate to `1`:

- `KK-ENG301`
- `KK-ENG302`
- `KK-ENG303`
- `KK-RUO204`
- `KK-RUO205`
- `KK-RUO206`
- `KK-FIN01`
- `KK-FIN02`
- `KK-FIN08`

### FinMu mentoring course codes

These set the `finmu` coordinate to `1`:

- `KK-FINMU`

### Challenge course-code rules

Challenge detection depends on the user's effective language bucket.

#### `en-secondary`

- course codes: `KK-ENERI`
- custom URNs: none

#### `sv-secondary`

- course codes: `KK-RUERI`
- custom URNs: none

#### `fi-secondary`

- course codes: none
- custom URNs: `kks-kor`

#### `fi-primary`

- course codes: `KK-AIAKVUERI`
- custom URNs: `kks-kor`


## Spreadsheet-Backed Course Codes

Most organisation-language course codes are not hardcoded in TypeScript. They come from `data/data.xlsx`, which is loaded by `readOrganisationRecommendationData()`.

The spreadsheet is used to answer questions like:

- which course codes belong to a specific organisation?
- which course codes belong to Finnish primary-language writing studies?
- which course codes belong to Swedish secondary-language studies?

### Language selection rules used against spreadsheet labels

For the same language as the user's primary school language:

- Finnish primary, spoken -> labels containing `Aidinkieli, suomi: puheviestinta`
- Finnish primary, written -> labels containing `Aidinkieli, suomi: kirjoitusviestinta`
- Finnish primary, written and spoken -> labels containing `Aidinkieli, suomi`
- Swedish primary, spoken -> labels containing `Aidinkieli, ruotsi: puheviestinta`
- Swedish primary, written -> labels containing `Aidinkieli, ruotsi: kirjoitusviestinta`
- Swedish primary, written and spoken -> labels containing `Aidinkieli, ruotsi`
- English primary -> labels containing `Englanti`

For a language different from the user's primary school language:

- Finnish secondary -> labels containing `Toinen kotimainen, suomi`
- Swedish secondary -> labels containing `Toinen kotimainen, ruotsi`
- English secondary -> labels containing `Englanti`

## Course-Code Patterns Used For Ranking

The scorer also uses broad course-code patterns, not only exact lists.

### `KAIKKI`

If any course code contains `KAIKKI`, the course is treated as generic and receives the generic bonus tier.

### `ERI`

If any course code contains `ERI`, the course is treated as challenge-style in the bonus ranking logic and does not receive the normal bonus-tier uplift.

## Name-Based Heuristics

Some properties are inferred from names rather than structured metadata.

### Exam detection

The app treats a course as an exam when the Finnish name contains:

- `tentti`

### Collaboration detection

The app treats a course as collaboration when:

- the course name contains `tyovaen akatemia` or `laajasalon opisto`, or
- one of the linked organisations contains `Vaasa`

