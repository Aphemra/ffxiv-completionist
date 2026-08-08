#!/usr/bin/env bash

EXPORT_ID="immortal-flames-grand-company-quests"
TITLE="Immortal Flames Grand Company Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Grand Company Quests"
)

JOURNAL_GENRES=(
  "Immortal Flames Quests"
)

PRIMARY_FACET_ID="grand-company-quests"
PRIMARY_FACET_NAME="Grand Company Quests"

SECONDARY_FACET_ID="immortal-flames"
SECONDARY_FACET_NAME="The Immortal Flames"

COLLECTION_ID="immortal-flames-grand-company-quests"
COLLECTION_TITLE="Immortal Flames Quests"
COLLECTION_DESCRIPTION="Feature and advancement quests associated with the Immortal Flames."
COLLECTION_SORT_ORDER="16050"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"