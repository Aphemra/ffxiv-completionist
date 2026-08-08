#!/usr/bin/env bash

EXPORT_ID="yanxia-sidequests"
TITLE="Yanxia Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Othardian Sidequests"
)

JOURNAL_GENRES=(
  "Yanxia Sidequests"
)

PRIMARY_FACET_ID="stormblood"
PRIMARY_FACET_NAME="Stormblood"

SECONDARY_FACET_ID="yanxia"
SECONDARY_FACET_NAME="Yanxia"

COLLECTION_ID="yanxia-sidequests"
COLLECTION_TITLE="Yanxia Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Yanxia."
COLLECTION_SORT_ORDER="7190"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"