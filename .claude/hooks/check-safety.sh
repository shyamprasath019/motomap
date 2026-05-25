#!/bin/bash
# Auto-runs after every file write/edit
# Catches common safety violations immediately

FILE="${CLAUDE_TOOL_OUTPUT_FILE:-}"

if [[ "$FILE" == *.py ]]; then
  # Check for risk_level returned without verified check
  if grep -n "risk_level" "$FILE" 2>/dev/null | grep -v "# SAFETY" | grep -v "verified" | grep -q "return\|response"; then
    echo "⚠️  SAFETY WARNING: risk_level returned in $FILE — ensure verified=True check exists"
  fi

  # Check for hardcoded secrets
  if grep -qiE "(password|api_key|secret_key)\s*=\s*['\"][^'\"]{4,}" "$FILE" 2>/dev/null; then
    echo "🔴 SECURITY: Possible hardcoded secret in $FILE — use os.getenv() instead"
  fi
fi

exit 0
