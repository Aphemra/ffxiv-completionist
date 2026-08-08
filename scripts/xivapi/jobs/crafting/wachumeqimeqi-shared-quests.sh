#!/usr/bin/env bash

EXPORT_ID="wachumeqimeqi-shared-quests"
TITLE="Wachumeqimeqi Shared Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Wachumeqimeqi Quests"
)

JOURNAL_GENRES=(
  "Wachumeqimeqi Quests"
)

PRIMARY_FACET_ID="shared"
PRIMARY_FACET_NAME="Shared Crafting & Gathering"

SECONDARY_FACET_ID="studium-quests"
SECONDARY_FACET_NAME="Wachumeqimeqi"

COLLECTION_ID="wachumeqimeqi-shared-quests"
COLLECTION_TITLE="Wachumeqimeqi Shared Quests"
COLLECTION_DESCRIPTION="The shared opening and finale quests for Wachumeqimeqi."
COLLECTION_SORT_ORDER="4550"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"