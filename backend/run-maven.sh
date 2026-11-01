#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

find_java_home() {
  if [ -n "${JAVA_HOME:-}" ] && [ -x "${JAVA_HOME}/bin/java" ]; then
    printf '%s\n' "$JAVA_HOME"
    return 0
  fi

  local candidates=(
    "$HOME/.local/java"/*/Contents/Home
    "$HOME/Library/Java/JavaVirtualMachines"/*/Contents/Home
    /Library/Java/JavaVirtualMachines/*/Contents/Home
    /usr/lib/jvm/*
    /opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home
    "$HOME/.sdkman/candidates/java"/*
  )

  for candidate in "${candidates[@]}"; do
    if [ -d "$candidate" ] && [ -x "$candidate/bin/java" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

find_maven_bin() {
  if command -v mvn >/dev/null 2>&1; then
    command -v mvn
    return 0
  fi

  local candidates=(
    "$HOME/.local/maven"/*/bin/mvn
    /opt/homebrew/bin/mvn
    /usr/local/bin/mvn
  )

  for candidate in "${candidates[@]}"; do
    if [ -x "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

JAVA_HOME_VALUE="$(find_java_home || true)"
if [ -z "$JAVA_HOME_VALUE" ] || [ ! -x "$JAVA_HOME_VALUE/bin/java" ]; then
  echo "Java JDK was not found on this machine. Install JDK 21+ and try again."
  exit 1
fi

MAVEN_BIN="$(find_maven_bin || true)"
if [ -z "$MAVEN_BIN" ] || [ ! -x "$MAVEN_BIN" ]; then
  echo "Maven was not found on this machine. Install Maven and try again."
  exit 1
fi

export JAVA_HOME="$JAVA_HOME_VALUE"
export PATH="$JAVA_HOME/bin:$(dirname "$MAVEN_BIN"):$PATH"

cd "$BACKEND_DIR"

if [ "$#" -eq 0 ]; then
  exec "$MAVEN_BIN" spring-boot:run
fi

exec "$MAVEN_BIN" "$@"
