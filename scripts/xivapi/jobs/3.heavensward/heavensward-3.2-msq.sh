#!/usr/bin/env bash

EXPORT_ID="heavensward-3.2-msq"
TITLE="The Gears of Change - 3.2 Main Scenario"

EXPANSION="heavensward"
PATCH="3.2"
CATEGORY="msq"
DATA_EXPANSION_FOLDER="3.heavensward"

SELECTION_MODE="chain"

START_QUEST="As It Once Was"
END_QUEST="Causes and Costs"

START_ROW=""
END_ROW=""

JOURNAL_CATEGORY="Dragonsong Main Scenario Quests"
CLASS_JOB=""

COLLECTION_ID="heavensward-3.2-msq"
COLLECTION_TITLE="Patch 3.2 - The Gears of Change"
COLLECTION_DESCRIPTION="Post-Heavensward main scenario quests introduced in Patch 3.2."
COLLECTION_SORT_ORDER="320"
VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"