#!/usr/bin/env bash

EXPORT_ID="tales-from-the-shadows"
TITLE="Tales from the Shadows"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of Light"
)

JOURNAL_GENRES=(
  "Tales from the Shadows"
)

PRIMARY_FACET_ID="chronicles-of-light"
PRIMARY_FACET_NAME="Chronicles of Light"

SECONDARY_FACET_ID="tales-from-the-shadows"
SECONDARY_FACET_NAME="Tales from the Shadows"

COLLECTION_ID="tales-from-the-shadows"
COLLECTION_TITLE="Tales from the Shadows"
COLLECTION_DESCRIPTION="A reflective side story concerning the aftermath of the Shadowbringers journey."
COLLECTION_SORT_ORDER="16070"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"