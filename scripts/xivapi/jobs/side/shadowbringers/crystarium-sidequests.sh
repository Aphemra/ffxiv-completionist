#!/usr/bin/env bash

EXPORT_ID="crystarium-sidequests"
TITLE="Crystarium Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Lakeland Sidequests"
)

JOURNAL_GENRES=(
  "Crystarium Sidequests"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="crystarium"
SECONDARY_FACET_NAME="Crystarium"

COLLECTION_ID="crystarium-sidequests"
COLLECTION_TITLE="Crystarium Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Crystarium."
COLLECTION_SORT_ORDER="7240"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"