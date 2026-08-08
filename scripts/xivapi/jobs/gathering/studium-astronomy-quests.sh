#!/usr/bin/env bash

EXPORT_ID="studium-astronomy-quests"
TITLE="Faculty of Astronomy Quests"

CATEGORY="gathering"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Studium Quests"
)

JOURNAL_GENRES=(
  "Faculty of Astronomy Quests"
)

PRIMARY_FACET_ID="gathering"
PRIMARY_FACET_NAME="Gathering"

SECONDARY_FACET_ID="faculty-of-astronomy"
SECONDARY_FACET_NAME="Faculty of Astronomy"

COLLECTION_ID="studium-astronomy-quests"
COLLECTION_TITLE="Faculty of Astronomy Quests"
COLLECTION_DESCRIPTION="The Studium Faculty of Astronomy questline."
COLLECTION_SORT_ORDER="4440"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"