#!/usr/bin/env bash

EXPORT_ID="wachumeqimeqi-epistles-quests"
TITLE="Epistles by Pameka Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Wachumeqimeqi Quests"
)

JOURNAL_GENRES=(
  "Epistles by Pameka Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="epistles-by-pameka"
SECONDARY_FACET_NAME="Epistles by Pameka"

COLLECTION_ID="wachumeqimeqi-epistles-quests"
COLLECTION_TITLE="Epistles by Pameka Quests"
COLLECTION_DESCRIPTION="The Epistles by Pameka questline."
COLLECTION_SORT_ORDER="4510"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"