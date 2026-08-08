#!/usr/bin/env bash

EXPORT_ID="limsa-lominsa-la-noscea-sidequests"
TITLE="Limsa Lominsa and La Noscea Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Lominsan Sidequests"
)

JOURNAL_GENRES=(
  "La Noscean Sidequests"
)

PRIMARY_FACET_ID="a-realm-reborn"
PRIMARY_FACET_NAME="A Realm Reborn"

SECONDARY_FACET_ID="limsa-lominsa-and-la-noscea"
SECONDARY_FACET_NAME="Limsa Lominsa and La Noscea"

COLLECTION_ID="limsa-lominsa-la-noscea-sidequests"
COLLECTION_TITLE="Limsa Lominsa and La Noscea Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout La Noscea and Limsa Lominsa."
COLLECTION_SORT_ORDER="7010"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"