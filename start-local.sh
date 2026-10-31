#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not on PATH. Install Docker Desktop first."
  exit 1
fi

JAVA_HOME_VALUE="${JAVA_HOME:-}"
if [ -z "$JAVA_HOME_VALUE" ]; then
  for candidate in \
    "$HOME/.local/java"/*/Contents/Home \
    "$HOME/Library/Java/JavaVirtualMachines"/*/Contents/Home \
    /Library/Java/JavaVirtualMachines/*/Contents/Home \
    /usr/lib/jvm/* \
    /opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home \
    "$HOME/.sdkman/candidates/java"/*; do
    if [ -d "$candidate" ] && [ -x "$candidate/bin/java" ]; then
      JAVA_HOME_VALUE="$candidate"
      break
    fi
  done
fi

if [ -z "$JAVA_HOME_VALUE" ] || [ ! -x "$JAVA_HOME_VALUE/bin/java" ]; then
  echo "Java JDK was not found. Set JAVA_HOME to your JDK installation or install JDK 25."
  exit 1
fi

export JAVA_HOME="$JAVA_HOME_VALUE"
export PATH="$JAVA_HOME/bin:$PATH"

MAVEN_BIN="${MAVEN:-}"
if [ -z "$MAVEN_BIN" ]; then
  if command -v mvn >/dev/null 2>&1; then
    MAVEN_BIN="$(command -v mvn)"
  else
    for candidate in \
      "$HOME/.local/maven"/*/bin/mvn \
      /opt/homebrew/bin/mvn \
      /usr/local/bin/mvn; do
      if [ -x "$candidate" ]; then
        MAVEN_BIN="$candidate"
        break
      fi
    done
  fi
fi

if [ -z "$MAVEN_BIN" ] || [ ! -x "$MAVEN_BIN" ]; then
  echo "Maven was not found. Install Maven and add it to PATH, or set MAVEN to the mvn executable."
  exit 1
fi

echo "Starting PostgreSQL database container..."
docker compose -f "$BACKEND_DIR/docker-compose.yml" up -d postgres

echo "Starting backend application..."
cd "$BACKEND_DIR"
exec "$MAVEN_BIN" spring-boot:run
