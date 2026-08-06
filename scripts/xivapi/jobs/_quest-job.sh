#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(
  cd "$(dirname "${BASH_SOURCE[0]}")/../../.." &&
  pwd
)"

cd "$PROJECT_ROOT"

require_job_value() {
  local variable_name="$1"

  if [[ -z "${!variable_name:-}" ]]; then
    echo "Missing required job value: $variable_name" >&2
    exit 1
  fi
}

require_job_value "EXPORT_ID"
require_job_value "TITLE"
require_job_value "EXPANSION"
require_job_value "PATCH"
require_job_value "CATEGORY"

SELECTION_MODE="${SELECTION_MODE:-chain}"

START_QUEST="${START_QUEST:-}"
END_QUEST="${END_QUEST:-}"

START_ROW="${START_ROW:-}"
END_ROW="${END_ROW:-}"

QUEST_ROWS="${QUEST_ROWS:-}"

JOURNAL_CATEGORY="${JOURNAL_CATEGORY:-}"
CLASS_JOB="${CLASS_JOB:-}"

EXPORT_FILE="${EXPORT_FILE:-scripts/xivapi/exports/${EXPORT_ID}.json}"

DATA_EXPANSION_FOLDER="${DATA_EXPANSION_FOLDER:-$EXPANSION}"

PUBLISH_FILE="${PUBLISH_FILE:-public/data/quests/$CATEGORY/$DATA_EXPANSION_FOLDER/$PATCH/$EXPORT_ID.json}"

COLLECTION_ID="${COLLECTION_ID:-$EXPORT_ID}"
COLLECTION_TITLE="${COLLECTION_TITLE:-$TITLE}"
COLLECTION_DESCRIPTION="${COLLECTION_DESCRIPTION:-$TITLE quests imported from XIVAPI.}"
COLLECTION_SORT_ORDER="${COLLECTION_SORT_ORDER:-${PATCH//./}}"

GROUP_ID="${GROUP_ID:-$COLLECTION_ID-quests}"
GROUP_TITLE="${GROUP_TITLE:-$COLLECTION_TITLE}"

VERIFICATION_STATUS="${VERIFICATION_STATUS:-in-review}"

EXPORT_ARGUMENTS=(
  --id "$EXPORT_ID"
  --title "$TITLE"
  --expansion "$EXPANSION"
  --patch "$PATCH"
  --category "$CATEGORY"
  --output "$EXPORT_FILE"
)

case "$SELECTION_MODE" in
  chain)
    if [[ -z "$START_QUEST" || -z "$END_QUEST" ]]; then
      echo \
        'Chain jobs require START_QUEST and END_QUEST.' \
        >&2

      exit 1
    fi

    EXPORT_ARGUMENTS+=(
      --start "$START_QUEST"
      --end "$END_QUEST"
    )

    if [[ -n "$START_ROW" ]]; then
      EXPORT_ARGUMENTS+=(--start-row "$START_ROW")
    fi

    if [[ -n "$END_ROW" ]]; then
      EXPORT_ARGUMENTS+=(--end-row "$END_ROW")
    fi
    ;;

  rows)
    if [[ -z "$QUEST_ROWS" ]]; then
      echo 'Row jobs require QUEST_ROWS.' >&2
      exit 1
    fi

    EXPORT_ARGUMENTS+=(--rows "$QUEST_ROWS")
    ;;

  *)
    echo \
      "Unknown SELECTION_MODE: $SELECTION_MODE" \
      >&2

    echo 'Expected "chain" or "rows".' >&2
    exit 1
    ;;
esac

if [[ -n "$JOURNAL_CATEGORY" ]]; then
  EXPORT_ARGUMENTS+=(
    --journal-category "$JOURNAL_CATEGORY"
  )
fi

if [[ -n "$CLASS_JOB" ]]; then
  EXPORT_ARGUMENTS+=(
    --class-job "$CLASS_JOB"
  )
fi

export_quests() {
  npm run xivapi:export:chain -- \
    "${EXPORT_ARGUMENTS[@]}"
}

validate_export() {
  npm run xivapi:validate:export -- \
    --file "$EXPORT_FILE" \
    --write
}

show_all_issues() {
  npm run xivapi:validate:export -- \
    --file "$EXPORT_FILE" \
    --write \
    --verbose
}

require_complete() {
  npm run xivapi:validate:export -- \
    --file "$EXPORT_FILE" \
    --write \
    --require-complete

  npm run xivapi:audit:quest-collectibles -- \
    --category "$CATEGORY" \
    --require-complete
}

publish_export() {
  require_complete

  npm run xivapi:publish:export -- \
    --file "$EXPORT_FILE" \
    --output "$PUBLISH_FILE" \
    --collection-id "$COLLECTION_ID" \
    --collection-title "$COLLECTION_TITLE" \
    --collection-description "$COLLECTION_DESCRIPTION" \
    --sort-order "$COLLECTION_SORT_ORDER" \
    --group-id "$GROUP_ID" \
    --group-title "$GROUP_TITLE" \
    --verification-status "$VERIFICATION_STATUS" \
    --write
}

regenerate_export() {
  echo
  echo "WARNING: This will overwrite:"
  echo "$EXPORT_FILE"
  echo
  echo "Any manual edits in that file will be lost."
  echo

  read -r -p "Regenerate the export? [y/N] " response

  case "$response" in
    y|Y|yes|YES)
      npm run xivapi:export:chain -- \
        "${EXPORT_ARGUMENTS[@]}" \
        --replace
      ;;

    *)
      echo "Regeneration cancelled."
      ;;
  esac
}

print_usage() {
  cat <<EOF
Usage:
  $0 export
  $0 validate
  $0 issues
  $0 complete
  $0 regenerate
  $0 publish

Actions:
  export       Create the export without overwriting an existing file.
  validate     Validate and refresh derived metadata.
  issues       Validate and print every unresolved field.
  complete     Require every display field to be completed.
  regenerate   Overwrite the export after confirmation.
  publish      Validate, publish, and update the quest manifest.

Selection mode:
  chain        Export a connected START_QUEST-to-END_QUEST chain.
  rows         Export the comma-separated rows in QUEST_ROWS.

Default action:
  validate
EOF
}

ACTION="${1:-validate}"

case "$ACTION" in
  export)
    export_quests
    ;;

  validate)
    validate_export
    ;;

  issues)
    show_all_issues
    ;;

  complete)
    require_complete
    ;;

  publish)
    publish_export
    ;;

  regenerate)
    regenerate_export
    ;;

  help|--help|-h)
    print_usage
    ;;

  *)
    echo "Unknown action: $ACTION" >&2
    echo >&2

    print_usage >&2
    exit 1
    ;;
esac