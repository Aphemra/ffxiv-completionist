#!/usr/bin/env bash

EXPORT_ID="tempest-sidequests"
TITLE="Tempest Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Tempest Sidequests"
)

JOURNAL_GENRES=(
  "Tempest Sidequests"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="tempest"
SECONDARY_FACET_NAME="Tempest"

COLLECTION_ID="tempest-sidequests"
COLLECTION_TITLE="Tempest Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Tempest."
COLLECTION_SORT_ORDER="7270"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"