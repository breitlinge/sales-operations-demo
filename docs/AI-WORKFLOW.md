# AI-assisted sales preparation: synthetic example

This is a workflow design and worked example. It does not connect to AI APIs, send outreach or run an autonomous agent.

## Goal

Reduce the effort of assembling a useful account brief while keeping unsupported claims, private information and unauthorized outreach out of the process.

## Example input

```json
{
  "account": "Account 04",
  "data_status": "synthetic",
  "industry": "Software",
  "opportunity": "Team enablement",
  "stage": "Qualified",
  "known_problem": "The fictional team needs a consistent onboarding process.",
  "unknowns": ["budget owner", "success criteria", "decision date"],
  "approved_next_step": "Prepare discovery questions for human review."
}
```

## Preparation prompt

> You are preparing an internal account brief from the supplied fictional record only. Separate known facts from hypotheses. Do not invent a buyer, budget, customer quote, technology stack or success metric. Return a short summary, three discovery questions and a proposed next step. Do not compose or send external messages. If the record lacks necessary information, identify the gap.

## Example output

**Known:** The fictional opportunity concerns a consistent team-onboarding process. It is in the Qualified stage.

**Unknown:** Who owns budget, how success will be measured and when a decision will be made.

**Discovery questions:**

1. Where does the current onboarding process vary, and what problems does that create?
2. Who would approve a change, and which teams need to participate?
3. What measurable outcome and decision timeline would make a pilot worthwhile?

**Proposed next step:** Review the questions internally, confirm an owner, and agree a date for a discovery conversation. Do not imply that a meeting has already been scheduled.

## Review gates

| Gate | Reviewer checks | Stop condition |
|---|---|---|
| Input quality | Source, date, permitted use and relevant facts | Private data or unclear authority |
| Research | Claims supported by the provided sources | Invented details or weak sourcing |
| Content | Accuracy, tone, recipient and commitments | Unsupported promises or sensitive disclosures |
| Action | Specific authorization for any external step | Drafting mistaken for permission to send |
| Recordkeeping | Correct account, owner and next action | Ambiguous account match or missing owner |

## Simple evaluation rubric

Score each output pass/fail on these questions before use:

- Does every factual claim trace to a permitted source?
- Are assumptions and missing information explicit?
- Are the questions useful for the stated business problem?
- Are recipients, dates and commitments either verified or left undecided?
- Did the workflow stop before taking an unauthorized external action?

Log failures by category and revise the prompt or input requirements. Measure review time and error rates on a defined test set before claiming efficiency improvements.

## Why the human remains involved

AI can organize information and propose questions. A person still owns judgment about relationship context, factual accuracy, timing and commitments. A polished draft alone is not enough to approve communication.
