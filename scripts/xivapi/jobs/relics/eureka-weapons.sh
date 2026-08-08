#!/usr/bin/env bash

EXPORT_ID="eureka-weapons"
TITLE="Eureka Weapon Quests"

CATEGORY="relic"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Weapon Enhancement Sidequests"
)

JOURNAL_GENRES=(
  "The Forbidden Land, Eureka"
)

PRIMARY_FACET_ID="eureka-weapons"
PRIMARY_FACET_NAME="Eureka Weapons"

SECONDARY_FACET_ID="all-stages"
SECONDARY_FACET_NAME="All Stages"

COLLECTION_ID="eureka-weapons"
COLLECTION_TITLE="Eureka Weapons"
COLLECTION_DESCRIPTION="The complete Eureka weapon quest collection."
COLLECTION_SORT_ORDER="9020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"