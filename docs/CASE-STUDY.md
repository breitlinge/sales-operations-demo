# From pipeline visibility to next-step discipline

## Context

This is a synthetic portfolio exercise, not a report on an actual company. It explores a familiar management problem: pipeline information exists, but the next action is not always obvious.

## Intended users and decisions

- **Sales owner:** What do I need to follow up on today?
- **Sales manager:** Which open opportunities are missing an actionable plan?
- **Partnerships leader:** Which opportunities came through partners, and what happens next?

## Design choices

1. **Start with decisions.** Put open value, weighted value, overdue actions and closed-won value at the top. Label each metric so it cannot silently change meaning.
2. **Connect summary and detail.** The same filters drive metrics, stage chart, priorities and pipeline rows. A manager can investigate the records behind a number.
3. **Make follow-up explicit.** Keep next-step text and due date together. An opportunity with missing information is visibly incomplete.
4. **Separate dimensions.** Expected close date filters opportunities. Activity date filters events. Those are different business questions.
5. **Make assumptions visible.** Stage weights are documented as examples. Weighted pipeline is not presented as a model-validated forecast.
6. **Keep a safe demonstration boundary.** Fictional data and in-memory state make the prototype explorable without connecting to a live sales stack.

## Acceptance criteria

- A filter produces consistent totals and rows.
- Closed opportunities do not inflate open pipeline or overdue-action counts.
- A user can cancel an edit without changing state.
- A saved edit changes the relevant view and creates a demo activity entry.
- Empty searches explain what happened and disable meaningless exports.
- Reset restores the known baseline.
- Edited text is rendered as text rather than executable HTML.

## AI's contribution

AI generated the initial implementation, synthetic data, documentation and test cases. Human review is needed to confirm that the workflow, claims and presentation reflect the portfolio owner's intended work. Using generated code does not establish independent engineering proficiency.

## What success would look like in a real pilot

These are proposed measures, not achieved results:

- Reduced share of open opportunities without a named next step and due date
- Reduced time to prepare a weekly pipeline review
- Lower rate of overdue follow-ups
- Better agreement between source-system records and management reporting

A real pilot would first establish a baseline, define who owns each field, choose a measurement window and validate data quality. Adoption, reporting accuracy and business outcomes should be assessed separately.

## Production work not included

Authentication and role-based access, secure server-side integration, data retention, durable storage, audit history, deployment monitoring, accessible chart review, cross-browser testing and a formal security review. These require additional design and implementation.
