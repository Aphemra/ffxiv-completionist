#!/usr/bin/env bash

EXPORT_ID="evercold-8.0-msq"
TITLE="Evercold - 8.0 Main Scenario"

EXPANSION="evercold"
PATCH="8.0"
CATEGORY="msq"
DATA_EXPANSION_FOLDER="8.evercold"

SELECTION_MODE="chain"

START_QUEST="A New World to Explore"
END_QUEST="Evercold"

START_ROW=""
END_ROW=""

JOURNAL_CATEGORY="Evercold Main Scenario Quests"
CLASS_JOB=""

COLLECTION_ID="evercold-8.0-msq"
COLLECTION_TITLE="Patch 8.0 - Evercold"
COLLECTION_DESCRIPTION="Evercold main scenario quests introduced in Patch 8.0."
COLLECTION_SORT_ORDER="800"
VERIFICATION_STATUS="verified"

QUEST_GROUP_IDS=(
    "evercold-8.0-levels-100-101"
    "evercold-8.0-levels-100-101"
    "evercold-8.0-levels-100-101"
    "evercold-8.0-levels-100-101"
    "evercold-8.0-levels-102-103"
    "evercold-8.0-levels-104-105"
    "evercold-8.0-levels-106-107"
    "evercold-8.0-levels-108-110"
)
QUEST_GROUP_TITLES=(
    "Evercold - Levels 100-101 ()"
    "Evercold - Levels 100-101 ()"
    "Evercold - Levels 100-101 ()"
    "Evercold - Levels 100-101 ()"
    "Evercold - Levels 102-103"
    "Evercold - Levels 104-105"
    "Evercold - Levels 106-107"
    "Evercold - Levels 108-110"
)
QUEST_GROUP_START_QUESTS=(
    ""
    ""
    ""
    ""
    ""
    ""
    ""
    ""
)
QUEST_GROUP_END_QUESTS=(
    ""
    ""
    ""
    ""
    ""
    ""
    ""
    "Evercold"
)

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"