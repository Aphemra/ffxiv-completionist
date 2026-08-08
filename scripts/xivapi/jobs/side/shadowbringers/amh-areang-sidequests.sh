#!/usr/bin/env bash

EXPORT_ID="amh-araeng-sidequests"
TITLE="Amh Araeng Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Amh Araeng Sidequests"
)

JOURNAL_GENRES=(
  "Amh Araeng Sidequests"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="amh-araeng"
SECONDARY_FACET_NAME="Amh Araeng"

COLLECTION_ID="amh-araeng-sidequests"
COLLECTION_TITLE="Amh Araeng Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Amh Araeng."
COLLECTION_SORT_ORDER="7220"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"