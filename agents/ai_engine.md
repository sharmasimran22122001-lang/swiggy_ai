This becomes the specification for your AI system.

It should define:

User behavior classification.
Context signals.
Retrieval strategy.
Prompt templates.
Ranking logic.
Homepage block selection.
JSON output schema.
Failure handling.
Confidence thresholds.
Explainability.

For example:

Inputs:
User history.
Time of day.
Day of week.
Budget.
Cuisine preferences.
Retrieved restaurants.
Outputs:
Ordered list of homepage blocks.
Hero recommendation.
Supporting recommendations.
Explanations.

Rules:

Never hallucinate restaurants.
Never recommend unavailable dishes.
If retrieval returns fewer than three results, degrade gracefully.
If user history is empty, switch to exploration mode.