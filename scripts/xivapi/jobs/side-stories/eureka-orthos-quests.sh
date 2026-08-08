#!/usr/bin/env bash

EXPORT_ID="eureka-orthos-quests"
TITLE="Eureka Orthos Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Eureka Orthos"
)

PRIMARY_FACET_ID="deep-dungeons"
PRIMARY_FACET_NAME="Deep Dungeons"

SECONDARY_FACET_ID="eureka-orthos"
SECONDARY_FACET_NAME="Eureka Orthos"

COLLECTION_ID="eureka-orthos-quests"
COLLECTION_TITLE="Eureka Orthos"
COLLECTION_DESCRIPTION="Quests associated with the Eureka Orthos deep dungeon."
COLLECTION_SORT_ORDER="13040"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"