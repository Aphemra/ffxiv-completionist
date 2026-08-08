#!/usr/bin/env bash

EXPORT_ID="maelstrom-grand-company-quests"
TITLE="Maelstrom Grand Company Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Grand Company Quests"
)

JOURNAL_GENRES=(
  "Maelstrom Quests"
)

PRIMARY_FACET_ID="grand-company-quests"
PRIMARY_FACET_NAME="Grand Company Quests"

SECONDARY_FACET_ID="maelstrom"
SECONDARY_FACET_NAME="The Maelstrom"

COLLECTION_ID="maelstrom-grand-company-quests"
COLLECTION_TITLE="Maelstrom Quests"
COLLECTION_DESCRIPTION="Feature and advancement quests associated with the Maelstrom."
COLLECTION_SORT_ORDER="16030"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"