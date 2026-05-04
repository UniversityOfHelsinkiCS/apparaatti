# Terminology

This file explains the project-specific shorthand used in the codebase and recommendation logic.

## Recommendation Terms

### answerData

The raw answers submitted from the filter UI. This is the user input before it is converted into coordinates.

### strictFields

A list of filter ids that should behave as hard requirements. If a course fails one of these during scoring, it is removed instead of merely receiving fewer points.

### userCoordinates

The normalized coordinate representation of the user's answers. This is the target profile courses are compared against.

### courseCoordinates

The coordinate representation of one course. These values are computed from course codes, custom code URNs, organisation mappings, and a few heuristics.

### CourseRecommendation

The runtime object used by the ranking algorithm. It contains:

- the merged course data
- the course coordinates
- the final score in `points` after ranking

### pointBasedRecommendations

The final ordered list returned by the backend. This is the list shown in the UI.

## Filter Terms

### filter

In the frontend and admin UI, a filter is one user-facing question or control that influences recommendation behavior.

### displayType

How a filter is rendered in the UI, for example:

- `singlechoice`
- `multichoice`
- `dropdownselect`
- `info-only`

### neutral

A sentinel value meaning “user did not answer this”. It usually prevents the answer from affecting filtering or scoring too strongly.

## Database Shorthand

### Cu

Short for course unit.

In practice this model stores unit-level data such as course codes. In the recommendation flow, the app first looks up course units by course code.

### Cur

Short for course realization.

This is the actual teaching instance / realization that can be recommended. A course realization has dates, names, custom code URNs, realization type URNs, and related metadata.

### CurCu

The join table between `Cur` and `Cu`.

It maps course realizations to course units. The recommender uses it to:

1. find course units by code
2. find the related realization ids
3. load those realizations as recommendation candidates



## Recommendation-Specific Data Terms

### customCodeUrns

A structured set of custom URNs attached to a course realization. These are one of the main ways the system detects special course properties such as graduation, replacement, integrated studies, flexible study mode, or organisation specificity.

### courseCodes

The code list attached to a course unit. These codes are heavily used for:

- organisation/language candidate selection
- mentoring detection
- challenge detection
- generic-vs-specific bonus ranking

### courseUnitRealisationTypeUrn

The realization type URN string on a course realization. The recommender uses this mostly for study place detection, for example remote, online, blended, or contact teaching.

### groupIds

Organisation ids linked to a course realization. These are resolved to organisation records and used for organisation-based recommendation logic.

### organisation recommendation data

The spreadsheet-backed mapping loaded from `data/data.xlsx`. It tells the recommender which course codes belong to which organisation-language buckets.

