#!/usr/bin/env bash

EXPORT_ID="wachumeqimeqi-apothecary-quests"
TITLE="Shunye's Apothecary Quests"

CATEGORY="gathering"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Wachumeqimeqi Quests"
)

JOURNAL_GENRES=(
  "Shunye's Apothecary Quests"
)

PRIMARY_FACET_ID="gathering"
PRIMARY_FACET_NAME="Gathering"

SECONDARY_FACET_ID="shunyes-apothecary"
SECONDARY_FACET_NAME="Shunye's Apothecary"

COLLECTION_ID="wachumeqimeqi-apothecary-quests"
COLLECTION_TITLE="Shunye's Apothecary Quests"
COLLECTION_DESCRIPTION="The Shunye's Apothecary questline."
COLLECTION_SORT_ORDER="4530"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"