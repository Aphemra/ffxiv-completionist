#!/usr/bin/env bash

EXPORT_ID="fisher-quests"
TITLE="Fisher Quests"

CATEGORY="gathering"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Fisher Quests"
)

PRIMARY_FACET_ID="gathering"
PRIMARY_FACET_NAME="Gathering"

SECONDARY_FACET_ID="fisher"
SECONDARY_FACET_NAME="Fisher"

COLLECTION_ID="fisher-quests"
COLLECTION_TITLE="Fisher Quests"
COLLECTION_DESCRIPTION="The complete Fisher gathering questline."
COLLECTION_SORT_ORDER="5010"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"