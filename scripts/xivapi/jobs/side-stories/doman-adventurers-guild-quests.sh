#!/usr/bin/env bash

EXPORT_ID="doman-adventurers-guild-quests"
TITLE="Doman Adventurers' Guild Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Doman Adventurers' Guild Quests"
)

PRIMARY_FACET_ID="doman-adventures"
PRIMARY_FACET_NAME="Doman Adventures"

SECONDARY_FACET_ID="doman-adventurers-guild"
SECONDARY_FACET_NAME="Doman Adventurers' Guild"

COLLECTION_ID="doman-adventurers-guild-quests"
COLLECTION_TITLE="Doman Adventurers' Guild Quests"
COLLECTION_DESCRIPTION="Quests concerning the young members of the Doman Adventurers' Guild."
COLLECTION_SORT_ORDER="13020"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"