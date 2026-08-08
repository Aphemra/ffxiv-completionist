#!/usr/bin/env bash

EXPORT_ID="a-relic-reborn-quests"
TITLE="A Relic Reborn Quests"

CATEGORY="relic"

SELECTION_MODE="rows"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

# Comma-separated XIVAPI Quest row IDs.
# These are the ten original job-specific relic quests.
QUEST_ROWS="66655,66656,66657,66658,66659,66660,66661,66662,66663,67115"

PRIMARY_FACET_ID="zodiac-weapons"
PRIMARY_FACET_NAME="Zodiac Weapons"

SECONDARY_FACET_ID="base-relics"
SECONDARY_FACET_NAME="A Relic Reborn"

COLLECTION_ID="a-relic-reborn-quests"
COLLECTION_TITLE="A Relic Reborn"
COLLECTION_DESCRIPTION="The original job-specific quests for obtaining the base Zodiac relic weapons."
COLLECTION_SORT_ORDER="9000"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"