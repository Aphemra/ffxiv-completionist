#!/usr/bin/env bash

EXPORT_ID="tales-of-newfound-adventure"
TITLE="Tales of Newfound Adventure"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of Light"
)

JOURNAL_GENRES=(
  "Tales of Newfound Adventure"
)

PRIMARY_FACET_ID="chronicles-of-light"
PRIMARY_FACET_NAME="Chronicles of Light"

SECONDARY_FACET_ID="tales-of-newfound-adventure"
SECONDARY_FACET_NAME="Tales of Newfound Adventure"

COLLECTION_ID="tales-of-newfound-adventure"
COLLECTION_TITLE="Tales of Newfound Adventure"
COLLECTION_DESCRIPTION="Side stories revisiting events and characters from the newfound adventure."
COLLECTION_SORT_ORDER="16080"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"