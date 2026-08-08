#!/usr/bin/env bash

EXPORT_ID="doman-reconstruction-quests"
TITLE="Doman Reconstruction Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Doman Reconstruction Quests"
)

PRIMARY_FACET_ID="doman-reconstruction"
PRIMARY_FACET_NAME="Doman Reconstruction"

SECONDARY_FACET_ID="doman-reconstruction-story"
SECONDARY_FACET_NAME="Reconstruction Story"

COLLECTION_ID="doman-reconstruction-quests"
COLLECTION_TITLE="Doman Reconstruction Quests"
COLLECTION_DESCRIPTION="Quests following the reconstruction of the Doman Enclave."
COLLECTION_SORT_ORDER="13030"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"