#!/usr/bin/env bash

EXPORT_ID="endwalker-6.0-msq"
TITLE="Endwalker - 6.0 Main Scenario"

EXPANSION="endwalker"
PATCH="6.0"
CATEGORY="msq"
DATA_EXPANSION_FOLDER="6.endwalker"

SELECTION_MODE="chain"

START_QUEST="The Next Ship to Sail"
END_QUEST="Endwalker"

START_ROW=""
END_ROW=""

JOURNAL_CATEGORY="Endwalker Main Scenario Quests"
CLASS_JOB=""

COLLECTION_ID="endwalker-6.0-msq"
COLLECTION_TITLE="Patch 6.0 - Endwalker"
COLLECTION_DESCRIPTION="Endwalker main scenario quests introduced in Patch 6.0."
COLLECTION_SORT_ORDER="600"
VERIFICATION_STATUS="verified"

QUEST_GROUP_IDS=(
    "endwalker-6.0-levels-80-81-part-1"
    "endwalker-6.0-levels-80-81-old-sharlayan"
    "endwalker-6.0-levels-80-81-thavnair"
    "endwalker-6.0-levels-80-81-part-2"
    "endwalker-6.0-levels-82-83"
    "endwalker-6.0-levels-84-85"
    "endwalker-6.0-levels-86-87"
    "endwalker-6.0-levels-88-90"
)
QUEST_GROUP_TITLES=(
    "Endwalker - Levels 80-81 (Part 1)"
    "Endwalker - Levels 80-81 (Old Sharlayan)"
    "Endwalker - Levels 80-81 (Thavnair)"
    "Endwalker - Levels 80-81 (Part 2)"
    "Endwalker - Levels 82-83"
    "Endwalker - Levels 84-85"
    "Endwalker - Levels 86-87"
    "Endwalker - Levels 88-90"
)
QUEST_GROUP_START_QUESTS=(
    "The Next Ship to Sail"
    "Hitting the Books"
    "For Thavnair Bound"
    "In the Dark of the Tower"
    "Sound the Bell, School's In"
    "In Shadow's Wake"
    "Return to the Crystarium"
    "As the Heavens Burn"
)
QUEST_GROUP_END_QUESTS=(
    "Old Sharlayan, New to You"
    "Estate Visitor"
    "The Satrap of Radz-at-Han"
    "The Color of Joy"
    "The Martyr"
    "At World's End"
    "Thou Must Live, Die, and Know"
    "Endwalker"
)

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"