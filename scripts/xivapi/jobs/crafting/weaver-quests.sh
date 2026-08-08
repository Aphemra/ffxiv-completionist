#!/usr/bin/env bash

EXPORT_ID="weaver-quests"
TITLE="Weaver Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Weaver Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="weaver"
SECONDARY_FACET_NAME="Weaver"

COLLECTION_ID="weaver-quests"
COLLECTION_TITLE="Weaver Quests"
COLLECTION_DESCRIPTION="The complete Weaver crafting questline."
COLLECTION_SORT_ORDER="4070"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"