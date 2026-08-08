#!/usr/bin/env bash

EXPORT_ID="heavensward-3.0-msq"
TITLE="Heavensward - 3.0 Main Scenario"

EXPANSION="heavensward"
PATCH="3.0"
CATEGORY="msq"
DATA_EXPANSION_FOLDER="3.heavensward"

SELECTION_MODE="chain"

START_QUEST="Coming to Ishgard"
END_QUEST="Heavensward"

START_ROW=""
END_ROW=""

JOURNAL_CATEGORY="Heavensward Main Scenario Quests"
CLASS_JOB=""

COLLECTION_ID="heavensward-3.0-msq"
COLLECTION_TITLE="Patch 3.0 - Heavensward"
COLLECTION_DESCRIPTION="Heavensward main scenario quests introduced in Patch 3.0."
COLLECTION_SORT_ORDER="300"
VERIFICATION_STATUS="verified"

QUEST_GROUP_IDS=(
    "heavensward-3.0-levels-50-51-part-1"
    "heavensward-3.0-levels-50-51-artoirel"
    "heavensward-3.0-levels-50-51-emmanellain"
    "heavensward-3.0-levels-50-51-part-2"
    "heavensward-3.0-levels-52-53"
    "heavensward-3.0-levels-54-55"
    "heavensward-3.0-levels-56-57"
    "heavensward-3.0-levels-58-60"
)
QUEST_GROUP_TITLES=(
    "Heavensward - Levels 50-51 (Part 1)"
    "Heavensward - Levels 50-51 (Artoirel)"
    "Heavensward - Levels 50-51 (Emmanellain)"
    "Heavensward - Levels 50-51 (Part 2)"
    "Heavensward - Levels 52-53"
    "Heavensward - Levels 54-55"
    "Heavensward - Levels 56-57"
    "Heavensward - Levels 58-60"
)
QUEST_GROUP_START_QUESTS=(
    "Coming to Ishgard"
    "Over the Wall"
    "Onwards and Upwards"
    "Divine Intervention"
    "Where the Chocobos Roam"
    "Mountaintop Diplomacy"
    "Unrest in Ishgard"
    "A Great New Nation"
)
QUEST_GROUP_END_QUESTS=(
    "The Better Half"
    "Knights Be Not Proud"
    "A Reward Long in Coming"
    "Purple Flame, Purple Flame"
    "Beyond the Clouds"
    "The Song Begins"
    "Onward to Sharlayan"
    "Heavensward"
)

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"