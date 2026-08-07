#!/usr/bin/env bash

EXPORT_ID="viper-job-quests"
TITLE="Viper Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Viper Quests"
)

PRIMARY_FACET_ID="melee-dps"
PRIMARY_FACET_NAME="Melee DPS"

SECONDARY_FACET_ID="viper"
SECONDARY_FACET_NAME="Viper"

COLLECTION_ID="viper-job-quests"
COLLECTION_TITLE="Viper Quests"
COLLECTION_DESCRIPTION="The complete Viper job questline."

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"