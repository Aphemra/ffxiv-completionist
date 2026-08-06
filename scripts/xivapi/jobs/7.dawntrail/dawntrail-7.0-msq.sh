#!/usr/bin/env bash

EXPORT_ID="dawntrail-7.0-msq"
TITLE="Dawntrail - 7.0 Main Scenario"

EXPANSION="dawntrail"
PATCH="7.0"
CATEGORY="msq"
DATA_EXPANSION_FOLDER="7.dawntrail"

SELECTION_MODE="chain"

START_QUEST="A New World to Explore"
END_QUEST="Dawntrail"

START_ROW=""
END_ROW=""

JOURNAL_CATEGORY="Dawntrail Main Scenario Quests"
CLASS_JOB=""

COLLECTION_ID="dawntrail-7.0-msq"
COLLECTION_TITLE="Patch 7.0 - Dawntrail"
COLLECTION_DESCRIPTION="Dawntrail main scenario quests introduced in Patch 7.0."
COLLECTION_SORT_ORDER="700"
VERIFICATION_STATUS="verified"

QUEST_GROUP_IDS=(
    "dawntrail-7.0-levels-90-91-part-1"
    "dawntrail-7.0-levels-90-91-kozamauka"
    "dawntrail-7.0-levels-90-91-urqopacha"
    "dawntrail-7.0-levels-90-91-part-2"
    "dawntrail-7.0-levels-92-93"
    "dawntrail-7.0-levels-94-95"
    "dawntrail-7.0-levels-96-97"
    "dawntrail-7.0-levels-98-99"
    "dawntrail-7.0-level-100"
)
QUEST_GROUP_TITLES=(
    "Dawntrail - Levels 90-91 (Part 1)"
    "Dawntrail - Levels 90-91 (Kozama'uka)"
    "Dawntrail - Levels 90-91 (Urqopacha)"
    "Dawntrail - Levels 90-91 (Part 2)"
    "Dawntrail - Levels 92-93"
    "Dawntrail - Levels 94-95"
    "Dawntrail - Levels 96-97"
    "Dawntrail - Levels 98-99"
    "Dawntrail - Level 100"
)
QUEST_GROUP_START_QUESTS=(
    "A New World to Explore"
    "To Kozama'uka"
    "To Urqopacha"
    "The Success of Others"
    "A Leaking Workpot"
    "The Leap to Yak T'el"
    "One with Nature"
    "Her People, Her Family"
    "The Sanctuary of the Strong"
)
QUEST_GROUP_END_QUESTS=(
    "The Rite of Succession"
    "Knowing the Hanuhanu"
    "Knowing the Pelupelu"
    "For All Turali"
    "The Promise of Peace"
    "On Track"
    "The Queen's Tour"
    "A Knight of Alexandria"
    "Dawntrail"
)

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"