#!/usr/bin/env bash
# cila Stop-gate hook: block declaring "done" while there are ungated UI changes.
# Cheap + scoped: no-op unless the project's .cila/state.json flags gate_required.
# Reads the Stop-hook JSON on stdin.
input=$(cat)

# Avoid loops: if a prior Stop hook already forced continuation, allow the stop.
printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true' && exit 0

# Only act inside an active cila build that hasn't passed the gates.
if [ -f .cila/state.json ] && grep -q '"gate_required"[[:space:]]*:[[:space:]]*true' .cila/state.json; then
  cat <<'JSON'
{"decision":"block","reason":"cila: there are UI changes that haven't passed the production gates. Run the design-reviewer / `npm run gate` and fix any hard failures. When they pass, set \"gate_required\": false in .cila/state.json. If the user asked to stop, or the gates genuinely can't pass right now, set it to false (note why) and then stop."}
JSON
fi
exit 0
