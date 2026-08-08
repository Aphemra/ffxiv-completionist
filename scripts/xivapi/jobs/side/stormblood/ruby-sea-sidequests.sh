#!/usr/bin/env bash

EXPORT_ID="ruby-sea-sidequests"
TITLE="Ruby Sea Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Othardian Sidequests"
)

JOURNAL_GENRES=(
  "Ruby Sea Sidequests"
)

PRIMARY_FACET_ID="stormblood"
PRIMARY_FACET_NAME="Stormblood"

SECONDARY_FACET_ID="ruby-sea"
SECONDARY_FACET_NAME="Ruby Sea"

COLLECTION_ID="ruby-sea-sidequests"
COLLECTION_TITLE="Ruby Sea Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout the Ruby Sea."
COLLECTION_SORT_ORDER="7180"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"