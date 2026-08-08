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
require_job_value "CATEGORY"

EXPANSION="${EXPANSION:-}"
PATCH="${PATCH:-}"

if [[ "$CATEGORY" == "msq" ]]; then
  require_job_value "EXPANSION"
  require_job_value "PATCH"
fi

SELECTION_MODE="${SELECTION_MODE:-chain}"

COLLECTION_FORMAT="${COLLECTION_FORMAT:-linear}"

COLLECTION_LAYOUT="${COLLECTION_LAYOUT:-}"

AUTO_GROUPS="${AUTO_GROUPS:-}"

if [[ -z "$AUTO_GROUPS" ]]; then
  if [[ "$SELECTION_MODE" == "filter" ]]; then
    AUTO_GROUPS="true"
  else
    AUTO_GROUPS="false"
  fi
fi

if [[ "$AUTO_GROUPS" != "true" && "$AUTO_GROUPS" != "false" ]]; then
  echo 'AUTO_GROUPS must be "true" or "false".' >&2
  exit 1
fi

PRIMARY_FACET_ID="${PRIMARY_FACET_ID:-}"
PRIMARY_FACET_NAME="${PRIMARY_FACET_NAME:-}"

SECONDARY_FACET_ID="${SECONDARY_FACET_ID:-}"
SECONDARY_FACET_NAME="${SECONDARY_FACET_NAME:-}"

if [[ "$CATEGORY" != "msq" ]]; then
  require_job_value "PRIMARY_FACET_ID"
  require_job_value "PRIMARY_FACET_NAME"
  require_job_value "SECONDARY_FACET_ID"
  require_job_value "SECONDARY_FACET_NAME"
fi

START_QUEST="${START_QUEST:-}"
END_QUEST="${END_QUEST:-}"

START_ROW="${START_ROW:-}"
END_ROW="${END_ROW:-}"

QUEST_ROWS="${QUEST_ROWS:-}"

EXCLUDED_QUEST_ROWS="${EXCLUDED_QUEST_ROWS:-}"

STARTING_CLASS_JOB_ID="${STARTING_CLASS_JOB_ID:-}"
STARTING_CLASS_ROUTE_ROWS="${STARTING_CLASS_ROUTE_ROWS:-}"
NONSTARTING_CLASS_ROUTE_ROWS="${NONSTARTING_CLASS_ROUTE_ROWS:-}"

if \
  [[ -z "$STARTING_CLASS_JOB_ID" ]] &&
  [[ -n "$STARTING_CLASS_ROUTE_ROWS" || -n "$NONSTARTING_CLASS_ROUTE_ROWS" ]]
then
  echo \
    'Starting-class route rows require STARTING_CLASS_JOB_ID.' \
    >&2

  exit 1
fi

if \
  [[ -n "$STARTING_CLASS_JOB_ID" ]] &&
  [[ -z "$STARTING_CLASS_ROUTE_ROWS" && -z "$NONSTARTING_CLASS_ROUTE_ROWS" ]]
then
  echo \
    'STARTING_CLASS_JOB_ID requires at least one route row list.' \
    >&2

  exit 1
fi

JOURNAL_GENRE="${JOURNAL_GENRE:-}"
JOURNAL_CATEGORY="${JOURNAL_CATEGORY:-}"
CLASS_JOB="${CLASS_JOB:-}"

JOURNAL_GENRE_VALUES=()
JOURNAL_CATEGORY_VALUES=()
CLASS_JOB_VALUES=()

ALTERNATIVE_COMPLETION_GROUP_VALUES=()

if declare -p ALTERNATIVE_COMPLETION_GROUPS >/dev/null 2>&1; then
  ALTERNATIVE_COMPLETION_GROUP_VALUES+=(
    "${ALTERNATIVE_COMPLETION_GROUPS[@]}"
  )
fi

if [[ -n "$JOURNAL_GENRE" ]]; then
  JOURNAL_GENRE_VALUES+=("$JOURNAL_GENRE")
fi

if [[ -n "$JOURNAL_CATEGORY" ]]; then
  JOURNAL_CATEGORY_VALUES+=("$JOURNAL_CATEGORY")
fi

if [[ -n "$CLASS_JOB" ]]; then
  CLASS_JOB_VALUES+=("$CLASS_JOB")
fi

if declare -p JOURNAL_GENRES >/dev/null 2>&1; then
  JOURNAL_GENRE_VALUES+=("${JOURNAL_GENRES[@]}")
fi

if declare -p JOURNAL_CATEGORIES >/dev/null 2>&1; then
  JOURNAL_CATEGORY_VALUES+=("${JOURNAL_CATEGORIES[@]}")
fi

if declare -p CLASS_JOBS >/dev/null 2>&1; then
  CLASS_JOB_VALUES+=("${CLASS_JOBS[@]}")
fi

EXPORT_FILE="${EXPORT_FILE:-scripts/xivapi/exports/${EXPORT_ID}.json}"

DATA_EXPANSION_FOLDER="${DATA_EXPANSION_FOLDER:-$EXPANSION}"

PUBLISH_FILE="${PUBLISH_FILE:-}"

if [[ -z "$PUBLISH_FILE" ]]; then
  if [[ "$CATEGORY" == "msq" ]]; then
    PUBLISH_FILE="public/data/quests/$CATEGORY/$DATA_EXPANSION_FOLDER/$PATCH/$EXPORT_ID.json"
  else
    PUBLISH_FILE="public/data/quests/$CATEGORY/$EXPORT_ID.json"
  fi
fi

COLLECTION_ID="${COLLECTION_ID:-$EXPORT_ID}"
COLLECTION_TITLE="${COLLECTION_TITLE:-$TITLE}"
COLLECTION_DESCRIPTION="${COLLECTION_DESCRIPTION:-$TITLE quests imported from XIVAPI.}"
COLLECTION_SORT_ORDER="${COLLECTION_SORT_ORDER:-}"

if [[ -z "$COLLECTION_SORT_ORDER" && -n "$PATCH" ]]; then
  COLLECTION_SORT_ORDER="${PATCH//./}"
fi

GROUP_ID="${GROUP_ID:-$COLLECTION_ID-quests}"
GROUP_TITLE="${GROUP_TITLE:-$COLLECTION_TITLE}"

VERIFICATION_STATUS="${VERIFICATION_STATUS:-in-review}"

EXPORT_ARGUMENTS=(
  --id "$EXPORT_ID"
  --title "$TITLE"
  --category "$CATEGORY"
  --output "$EXPORT_FILE"
)

if [[ -n "$EXPANSION" ]]; then
  EXPORT_ARGUMENTS+=(--expansion "$EXPANSION")
fi

if [[ -n "$PATCH" ]]; then
  EXPORT_ARGUMENTS+=(--patch "$PATCH")
fi

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

  filter)
    if \
      [[ "${#JOURNAL_GENRE_VALUES[@]}" -eq 0 ]] &&
      [[ "${#JOURNAL_CATEGORY_VALUES[@]}" -eq 0 ]] &&
      [[ "${#CLASS_JOB_VALUES[@]}" -eq 0 ]]
    then
      echo \
        'Filter jobs require JOURNAL_GENRE(S), JOURNAL_CATEGORY(IES), or CLASS_JOB(S).' \
        >&2

      exit 1
    fi

    EXPORT_ARGUMENTS+=(--filter)
    ;;

  *)
    echo \
      "Unknown SELECTION_MODE: $SELECTION_MODE" \
      >&2

    echo 'Expected "chain", "rows", or "filter".' >&2
    exit 1
    ;;
esac

for journal_genre in "${JOURNAL_GENRE_VALUES[@]}"; do
  EXPORT_ARGUMENTS+=(
    --journal-genre "$journal_genre"
  )
done

for journal_category in "${JOURNAL_CATEGORY_VALUES[@]}"; do
  EXPORT_ARGUMENTS+=(
    --journal-category "$journal_category"
  )
done

for class_job in "${CLASS_JOB_VALUES[@]}"; do
  EXPORT_ARGUMENTS+=(
    --class-job "$class_job"
  )
done

if [[ -n "$EXCLUDED_QUEST_ROWS" ]]; then
  EXPORT_ARGUMENTS+=(
    --exclude-rows "$EXCLUDED_QUEST_ROWS"
  )
fi

if [[ -n "$STARTING_CLASS_JOB_ID" ]]; then
  EXPORT_ARGUMENTS+=(
    --starting-class-job "$STARTING_CLASS_JOB_ID"
  )
fi

if [[ -n "$STARTING_CLASS_ROUTE_ROWS" ]]; then
  EXPORT_ARGUMENTS+=(
    --starting-class-rows "$STARTING_CLASS_ROUTE_ROWS"
  )
fi

if [[ -n "$NONSTARTING_CLASS_ROUTE_ROWS" ]]; then
  EXPORT_ARGUMENTS+=(
    --nonstarting-class-rows "$NONSTARTING_CLASS_ROUTE_ROWS"
  )
fi

for alternative_completion_group in \
  "${ALTERNATIVE_COMPLETION_GROUP_VALUES[@]}"
do
  EXPORT_ARGUMENTS+=(
    --alternative-completion-group "$alternative_completion_group"
  )
done

export_quests() {
  npm run xivapi:export:chain -- \
    "${EXPORT_ARGUMENTS[@]}"
}

validate_export() {
  local validation_arguments=(
    --file "$EXPORT_FILE"
    --write
  )

  if [[ "$COLLECTION_FORMAT" == "standard" ]]; then
    validation_arguments+=(--allow-disconnected)
  fi

  npm run xivapi:validate:export -- \
    "${validation_arguments[@]}"
}

show_all_issues() {
  local validation_arguments=(
    --file "$EXPORT_FILE"
    --write
    --verbose
  )

  if [[ "$COLLECTION_FORMAT" == "standard" ]]; then
    validation_arguments+=(--allow-disconnected)
  fi

  npm run xivapi:validate:export -- \
    "${validation_arguments[@]}"
}

require_complete() {
  local validation_arguments=(
    --file "$EXPORT_FILE"
    --write
    --require-complete
  )

  if [[ "$COLLECTION_FORMAT" == "standard" ]]; then
    validation_arguments+=(--allow-disconnected)
  fi

  npm run xivapi:validate:export -- \
    "${validation_arguments[@]}"

  npm run xivapi:audit:quest-collectibles -- \
    --category "$CATEGORY" \
    --require-complete
}

quest_group_array_exists() {
  declare -p "$1" >/dev/null 2>&1
}

append_quest_group_arguments() {
  local -n target_arguments="$1"

  local required_array_count=0

  local array_name

  for array_name in \
    QUEST_GROUP_IDS \
    QUEST_GROUP_TITLES \
    QUEST_GROUP_START_QUESTS \
    QUEST_GROUP_END_QUESTS
  do
    if quest_group_array_exists "$array_name"; then
      required_array_count=$((required_array_count + 1))
    fi
  done

  if [[ "$required_array_count" -eq 0 ]]; then
    target_arguments+=(
      --group-id "$GROUP_ID"
      --group-title "$GROUP_TITLE"
    )

    return
  fi

  if [[ "$required_array_count" -ne 4 ]]; then
    echo \
      'Named groups require all four QUEST_GROUP arrays.' \
      >&2

    exit 1
  fi

  local group_count="${#QUEST_GROUP_IDS[@]}"

  if [[ "$group_count" -eq 0 ]]; then
    echo 'QUEST_GROUP_IDS cannot be empty.' >&2
    exit 1
  fi

  if \
    [[ "${#QUEST_GROUP_TITLES[@]}" -ne "$group_count" ]] ||
    [[ "${#QUEST_GROUP_START_QUESTS[@]}" -ne "$group_count" ]] ||
    [[ "${#QUEST_GROUP_END_QUESTS[@]}" -ne "$group_count" ]]
  then
    echo \
      'All required QUEST_GROUP arrays must have equal lengths.' \
      >&2

    exit 1
  fi

  if \
    quest_group_array_exists QUEST_GROUP_START_ROWS &&
    [[ "${#QUEST_GROUP_START_ROWS[@]}" -ne "$group_count" ]]
  then
    echo \
      'QUEST_GROUP_START_ROWS must match the group count.' \
      >&2

    exit 1
  fi

  if \
    quest_group_array_exists QUEST_GROUP_END_ROWS &&
    [[ "${#QUEST_GROUP_END_ROWS[@]}" -ne "$group_count" ]]
  then
    echo \
      'QUEST_GROUP_END_ROWS must match the group count.' \
      >&2

    exit 1
  fi

  local index

  for ((index = 0; index < group_count; index += 1)); do
    local start_row=""
    local end_row=""

    if quest_group_array_exists QUEST_GROUP_START_ROWS; then
      start_row="${QUEST_GROUP_START_ROWS[$index]}"
    fi

    if quest_group_array_exists QUEST_GROUP_END_ROWS; then
      end_row="${QUEST_GROUP_END_ROWS[$index]}"
    fi

    target_arguments+=(
      --quest-group-id "${QUEST_GROUP_IDS[$index]}"
      --quest-group-title "${QUEST_GROUP_TITLES[$index]}"
      --quest-group-start "${QUEST_GROUP_START_QUESTS[$index]}"
      --quest-group-end "${QUEST_GROUP_END_QUESTS[$index]}"
      --quest-group-start-row "$start_row"
      --quest-group-end-row "$end_row"
    )
  done
}

publish_export() {
  require_complete

  local publish_arguments=(
    --file "$EXPORT_FILE"
    --output "$PUBLISH_FILE"
    --collection-id "$COLLECTION_ID"
    --collection-title "$COLLECTION_TITLE"
    --collection-description "$COLLECTION_DESCRIPTION"
    --verification-status "$VERIFICATION_STATUS"
    --format "$COLLECTION_FORMAT"
  )

  if [[ -n "$COLLECTION_SORT_ORDER" ]]; then
    publish_arguments+=(
      --sort-order "$COLLECTION_SORT_ORDER"
    )
  fi

  if [[ -n "$PRIMARY_FACET_ID" ]]; then
    publish_arguments+=(
      --primary-facet-id "$PRIMARY_FACET_ID"
      --primary-facet-name "$PRIMARY_FACET_NAME"
      --secondary-facet-id "$SECONDARY_FACET_ID"
      --secondary-facet-name "$SECONDARY_FACET_NAME"
    )
  fi

  if [[ -n "$COLLECTION_LAYOUT" ]]; then
    publish_arguments+=(--layout "$COLLECTION_LAYOUT")
  fi

  if [[ "$AUTO_GROUPS" == "true" ]]; then
    publish_arguments+=(--auto-groups)
  fi

  append_quest_group_arguments publish_arguments

  npm run xivapi:publish:export -- \
    "${publish_arguments[@]}" \
    --write
}

replace_export() {
  npm run xivapi:export:chain -- \
    "${EXPORT_ARGUMENTS[@]}" \
    --replace
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
      replace_export
      ;;

    *)
      echo "Regeneration cancelled."
      ;;
  esac
}

sync_quest_data() {
  echo
  echo "Synchronizing quest data for: $TITLE"
  echo

  replace_export

  echo
  echo "Export regenerated successfully."
  echo "Validating and publishing..."
  echo

  publish_export
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
  $0 sync

Actions:
  export       Create the export without overwriting an existing file.
  validate     Validate and refresh derived metadata.
  issues       Validate and print every unresolved field.
  complete     Require every display field to be completed.
  regenerate   Overwrite the export after confirmation.
  publish      Validate, publish, and update the quest manifest.
  sync         Regenerate, validate, audit, publish, and update the manifest.

Collection format:
  linear      One ordered questline; participates in automatic Current Quest.
  standard    Independent quests or multiple unrelated questlines.

Automatic grouping:
  Filter jobs enable AUTO_GROUPS by default.
  Connected questlines become separate accordions.
  Isolated quests are combined under Standalone Quests.

Non-MSQ filtering:
  Non-MSQ jobs require PRIMARY_FACET_ID, PRIMARY_FACET_NAME,
  SECONDARY_FACET_ID, and SECONDARY_FACET_NAME.

Selection mode:
  chain        Export a connected START_QUEST-to-END_QUEST chain.
  rows         Export the comma-separated rows in QUEST_ROWS.
  filter       Export every quest matching the supplied metadata filters.

Filter scopes:
  JOURNAL_GENRE or JOURNAL_GENRES
  JOURNAL_CATEGORY or JOURNAL_CATEGORIES
  CLASS_JOB or CLASS_JOBS

  Array values use OR matching. Different filter types combine with AND.

Row exclusions:
  EXCLUDED_QUEST_ROWS
  Comma-separated XIVAPI Quest row IDs omitted from this export.

Alternative completion groups:
  ALTERNATIVE_COMPLETION_GROUPS
  Each entry uses "group-id:row-id,row-id".
  Completing any quest in the group satisfies one completion requirement.

Starting-class routes:
  STARTING_CLASS_JOB_ID
  STARTING_CLASS_ROUTE_ROWS
  NONSTARTING_CLASS_ROUTE_ROWS

  The starting route is shown only when that class was selected during
  character creation. The nonstarting route is shown for every other
  starting class.

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
  
  sync)
    sync_quest_data
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