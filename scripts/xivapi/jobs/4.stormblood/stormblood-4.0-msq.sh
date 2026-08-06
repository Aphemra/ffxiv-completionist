#!/usr/bin/env bash

EXPORT_ID="stormblood-4.0-msq"
TITLE="Stormblood - 4.0 Main Scenario"

EXPANSION="stormblood"
PATCH="4.0"
CATEGORY="msq"
DATA_EXPANSION_FOLDER="4.stormblood"

SELECTION_MODE="chain"

START_QUEST="Beyond the Great Wall"
END_QUEST="Stormblood"

START_ROW=""
END_ROW=""

JOURNAL_CATEGORY="Stormblood Main Scenario Quests"
CLASS_JOB=""

COLLECTION_ID="stormblood-4.0-msq"
COLLECTION_TITLE="Patch 4.0 - Stormblood"
COLLECTION_DESCRIPTION="Stormblood main scenario quests introduced in Patch 4.0."
COLLECTION_SORT_ORDER="400"
VERIFICATION_STATUS="verified"

QUEST_GROUP_IDS=(
    "stormblood-4.0-levels-60-61-part-1"
    "stormblood-4.0-levels-60-61-mnaago"
    "stormblood-4.0-levels-60-61-meffrid"
    "stormblood-4.0-levels-60-61-part-2"
    "stormblood-4.0-levels-62-63"
    "stormblood-4.0-levels-64-65"
    "stormblood-4.0-levels-66-67"
    "stormblood-4.0-levels-68-70"
)
QUEST_GROUP_TITLES=(
    "Stormblood - Levels 60-61 (Part 1)"
    "Stormblood - Levels 60-61 (M'naago)"
    "Stormblood - Levels 60-61 (Meffrid)"
    "Stormblood - Levels 60-61 (Part 2)"
    "Stormblood - Levels 62-63"
    "Stormblood - Levels 64-65"
    "Stormblood - Levels 66-67"
    "Stormblood - Levels 68-70"
)
QUEST_GROUP_START_QUESTS=(
    "Beyond the Great Wall"
    "A Friend of a Friend in Need"
    "A Familiar Face Forgotten"
    "Where Men Go as One"
    "Once More, to the Ruby Sea"
    "Life after Doma"
    "The Labors of Magnai"
    "The First of Many"
)
QUEST_GROUP_END_QUESTS=(
    "A Bargain Struck"
    "Let Fill Your Hearts with Pride"
    "Homeward Bound"
    "Making the Catfish Sing"
    "A Silence in Three Parts"
    "The Children of Azim"
    "The Silence of the Gods"
    "Stormblood"
)

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"