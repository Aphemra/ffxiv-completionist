#!/usr/bin/env bash

EXPORT_ID="twin-adder-grand-company-quests"
TITLE="Order of the Twin Adder Grand Company Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Grand Company Quests"
)

JOURNAL_GENRES=(
  "Order of the Twin Adder Quests"
)

PRIMARY_FACET_ID="grand-company-quests"
PRIMARY_FACET_NAME="Grand Company Quests"

SECONDARY_FACET_ID="twin-adder"
SECONDARY_FACET_NAME="Order of the Twin Adder"

COLLECTION_ID="twin-adder-grand-company-quests"
COLLECTION_TITLE="Order of the Twin Adder Quests"
COLLECTION_DESCRIPTION="Feature and advancement quests associated with the Order of the Twin Adder."
COLLECTION_SORT_ORDER="16040"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"