#!/usr/bin/env bash

EXPORT_ID="yok-huy-society-quests"
TITLE="Yok Huy Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Yok Huy Quests"
)

PRIMARY_FACET_ID="yok-huy"
PRIMARY_FACET_NAME="Yok Huy"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="yok-huy-society-quests"
COLLECTION_TITLE="Yok Huy Society Quests"
COLLECTION_DESCRIPTION="The complete Yok Huy society quest collection."
COLLECTION_SORT_ORDER="6190"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"