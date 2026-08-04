#!/usr/bin/env bash

set -euo pipefail

# Resolve the repository root regardless of where this script is launched.
PROJECT_ROOT="$(
  cd "$(dirname "${BASH_SOURCE[0]}")/../../.." &&
  pwd
)"

cd "$PROJECT_ROOT"

# ============================================================================
# Editable quest-chain configuration
# ============================================================================

EXPORT_ID="arr-2.0-msq"
TITLE="A Realm Reborn 2.0 Main Scenario"

START_QUEST="Close to Home"
END_QUEST="The Ultimate Weapon"

EXPANSION="arr"
PATCH="2.0"
CATEGORY="msq"

EXPORT_FILE="scripts/xivapi/exports/${EXPORT_ID}.json"

# ============================================================================
# Commands
# ============================================================================

export_chain() {
  npm run xivapi:export:chain -- \
    --id "$EXPORT_ID" \
    --title "$TITLE" \
    --start "$START_QUEST" \
    --end "$END_QUEST" \
    --expansion "$EXPANSION" \
    --patch "$PATCH" \
    --category "$CATEGORY"
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
        --id "$EXPORT_ID" \
        --title "$TITLE" \
        --start "$START_QUEST" \
        --end "$END_QUEST" \
        --expansion "$EXPANSION" \
        --patch "$PATCH" \
        --category "$CATEGORY" \
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

Actions:
  export       Create the export without overwriting an existing file.
  validate     Validate and refresh derived metadata.
  issues       Validate and print every unresolved field.
  complete     Require every display field to be completed.
  regenerate   Overwrite the export after confirmation.

Default:
  validate
EOF
}

ACTION="${1:-validate}"

case "$ACTION" in
  export)
    export_chain
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