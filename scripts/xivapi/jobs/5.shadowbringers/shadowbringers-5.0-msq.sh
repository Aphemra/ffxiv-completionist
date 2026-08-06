#!/usr/bin/env bash

EXPORT_ID="shadowbringers-5.0-msq"
TITLE="Shadowbringers - 5.0 Main Scenario"

EXPANSION="shadowbringers"
PATCH="5.0"
CATEGORY="msq"
DATA_EXPANSION_FOLDER="5.shadowbringers"

SELECTION_MODE="chain"

START_QUEST="The Syrcus Trench"
END_QUEST="Shadowbringers"

START_ROW=""
END_ROW=""

JOURNAL_CATEGORY="Shadowbringers Main Scenario Quests"
CLASS_JOB=""

COLLECTION_ID="shadowbringers-5.0-msq"
COLLECTION_TITLE="Patch 5.0 - Shadowbringers"
COLLECTION_DESCRIPTION="Shadowbringers main scenario quests introduced in Patch 5.0."
COLLECTION_SORT_ORDER="500"
VERIFICATION_STATUS="verified"

QUEST_GROUP_IDS=(
    "shadowbringers-5.0-levels-70-71-part-1"
    "shadowbringers-5.0-levels-70-71-alphinaud"
    "shadowbringers-5.0-levels-70-71-alisaie"
    "shadowbringers-5.0-levels-70-71-part-2"
    "shadowbringers-5.0-levels-72-73"
    "shadowbringers-5.0-levels-74-75"
    "shadowbringers-5.0-levels-76-77"
    "shadowbringers-5.0-levels-78-80"
)
QUEST_GROUP_TITLES=(
    "Shadowbringers - Levels 70-71 (Part 1)"
    "Shadowbringers - Levels 70-71 (Alphinaud)"
    "Shadowbringers - Levels 70-71 (Alisaie)"
    "Shadowbringers - Levels 70-71 (Part 2)"
    "Shadowbringers - Levels 72-73"
    "Shadowbringers - Levels 74-75"
    "Shadowbringers - Levels 76-77"
    "Shadowbringers - Levels 78-80"
)
QUEST_GROUP_START_QUESTS=(
    "The Syrcus Trench"
    "In Search of Alphinaud"
    "In Search of Alisaie"
    "The Lightwardens"
    "An Unwelcome Guest"
    "A Party Soon Divided"
    "Out of the Wood"
    "The Ladder"
)
QUEST_GROUP_END_QUESTS=(
    "Travelers of Norvrandt"
    "Emergent Splendor"
    "Tears on the Sand"
    "Warrior of Darkness"
    "The Wheel Turns"
    "Bearing With It"
    "Paradise Fallen"
    "Shadowbringers"
)

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"