#!/usr/bin/env bash

set -euo pipefail

# Usage:
#   ./deploy.sh [prod|dev]
#
# Behavior:
# - Merges .env (kept intact, higher priority) with production.env into envs/{prod,dev}.env
# - Builds Docker image, tags, and pushes to Artifact Registry
# - Deploys to Cloud Run using the merged env file
# - For dev target, deploys to resume-builder-dev service
# - For prod target, deploys to SERVICE_NAME from production.env
# - Protects prod deploys to only run on main branch in CI unless explicitly allowed

TARGET=${1:-}
if [[ -z "${TARGET}" || ( "${TARGET}" != "prod" && "${TARGET}" != "dev" ) ]]; then
  echo "Usage: ./deploy.sh [prod|dev]"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_DIR="${ROOT_DIR}/envs"
DOTENV_PATH="${ROOT_DIR}/.env"
PRODENV_PATH="${ROOT_DIR}/production.env"

mkdir -p "${ENV_DIR}"

# Helper to load key=value pairs from a file into an associative array
# Keeps order simple; ignores comments and blank lines
read_env_file_into_map() {
  local file_path="$1"
  declare -n out_map_ref=$2
  if [[ -f "$file_path" ]]; then
    while IFS= read -r line || [[ -n "$line" ]]; do
      # trim
      line="${line%%$'\r'}"
      [[ -z "$line" ]] && continue
      [[ "$line" =~ ^\s*# ]] && continue
      if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
        local key="${line%%=*}"
        local val="${line#*=}"
        out_map_ref["$key"]="$val"
      fi
    done < "$file_path"
  fi
}

# Merge .env (higher priority) with production.env
# - Values from .env win over production.env
# - If .env missing, production.env values are used
merge_envs() {
  declare -A base_map=()
  declare -A extra_map=()
  declare -A final_map=()

  # Extra = production.env, Base = .env
  read_env_file_into_map "$PRODENV_PATH" extra_map
  read_env_file_into_map "$DOTENV_PATH" base_map

  # Start with extra
  for k in "${!extra_map[@]}"; do
    final_map["$k"]="${extra_map[$k]}"
  done
  # Overlay base
  for k in "${!base_map[@]}"; do
    final_map["$k"]="${base_map[$k]}"
  done

  # Write to file arg1
  local out_file="$1"
  : > "$out_file"
  # Preserve a stable ordering: keys sorted
  for k in $(printf '%s\n' "${!final_map[@]}" | LC_ALL=C sort); do
    printf '%s=%s\n' "$k" "${final_map[$k]}" >> "$out_file"
  done
}

# Ensure production.env exists (used for registry/project settings)
if [[ ! -f "$PRODENV_PATH" ]]; then
  echo "Error: production.env not found at $PRODENV_PATH"
  echo "Provide production.env or export equivalent environment variables."
  exit 1
fi

# Create or use provided env files
PROD_ENV_FILE="${ENV_DIR}/prod.env"
DEV_ENV_FILE="${ENV_DIR}/dev.env"

if [[ ! -f "$PROD_ENV_FILE" ]]; then
  merge_envs "$PROD_ENV_FILE"
fi
if [[ ! -f "$DEV_ENV_FILE" ]]; then
  merge_envs "$DEV_ENV_FILE"
fi

# Convert dotenv to YAML for Cloud Run consumption
PROD_ENV_YAML="${ENV_DIR}/prod.env.yaml"
DEV_ENV_YAML="${ENV_DIR}/dev.env.yaml"

dotenv_to_yaml() {
  local in_file="$1"
  local out_file="$2"
  : > "$out_file"
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%$'\r'}"
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^\s*# ]] && continue
    if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      local key="${line%%=*}"
      local val="${line#*=}"
      # Escape single quotes in YAML by doubling them
      val="${val//'/'''}"
      printf '%s: "%s"\n' "$key" "$val" >> "$out_file"
    fi
  done < "$in_file"
}

echo "Generated/using env files:" && ls -l "$ENV_DIR"

# Select env file based on target; then generate YAML
if [[ "$TARGET" == "dev" ]]; then
  ENV_FILE="$DEV_ENV_FILE"
  ENV_FILE_YAML="$DEV_ENV_YAML"
else
  ENV_FILE="$PROD_ENV_FILE"
  ENV_FILE_YAML="$PROD_ENV_YAML"
fi

dotenv_to_yaml "$ENV_FILE" "$ENV_FILE_YAML"

# Load deployment settings from selected env file
set -a
source "$ENV_FILE"
set +a

: "${PROJECT_ID:?PROJECT_ID is required in ${ENV_FILE}}"
: "${ARTIFACT_REGISTRY_LOCATION:?ARTIFACT_REGISTRY_LOCATION is required in ${ENV_FILE}}"
: "${ARTIFACT_REGISTRY_REPO:?ARTIFACT_REGISTRY_REPO is required in ${ENV_FILE}}"
: "${REGION:?REGION is required in ${ENV_FILE}}"
DEFAULT_SERVICE_NAME="${SERVICE_NAME:-$([[ "$TARGET" == dev ]] && echo "resume-builder-dev" || echo "resume-builder") }"

# Guard production deployments when running in CI
if [[ "$TARGET" == "prod" && -n "${GITHUB_REF:-}" ]]; then
  if [[ "$GITHUB_REF" != "refs/heads/main" && "${ALLOW_PROD:-}" != "yes" ]]; then
    echo "Refusing to deploy to production from non-main ref: $GITHUB_REF"
    echo "Set ALLOW_PROD=yes to override (not recommended)."
    exit 1
  fi
fi

SERVICE_NAME_EFFECTIVE="$DEFAULT_SERVICE_NAME"

# Compose image name and tags
IMAGE_BASE="${ARTIFACT_REGISTRY_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REGISTRY_REPO}/${SERVICE_NAME_EFFECTIVE}"
IMAGE_TAG_SHA="${GITHUB_SHA:-latest}"
IMAGE_LATEST_TAG="latest"
IMAGE_URI_SHA="${IMAGE_BASE}:${IMAGE_TAG_SHA}"
IMAGE_URI_LATEST="${IMAGE_BASE}:${IMAGE_LATEST_TAG}"

echo "\nDeployment configuration:"
echo "  Project:     ${PROJECT_ID}"
echo "  Region:      ${REGION}"
echo "  Registry:    ${ARTIFACT_REGISTRY_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REGISTRY_REPO}"
echo "  Service:     ${SERVICE_NAME_EFFECTIVE}"
echo "  Image (SHA): ${IMAGE_URI_SHA}"
echo "  Image (latest): ${IMAGE_URI_LATEST}"

# Set gcloud project
gcloud config set project "$PROJECT_ID" >/dev/null

# Enable required services (idempotent)
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com >/dev/null

# Configure Docker to push to Artifact Registry
gcloud auth configure-docker "${ARTIFACT_REGISTRY_LOCATION}-docker.pkg.dev" --quiet

# Build and push
DOCKER_BUILD_PLATFORM=${DOCKER_BUILD_PLATFORM:-linux/amd64}
echo "\nBuilding Docker image (${DOCKER_BUILD_PLATFORM})..."
docker build --platform "${DOCKER_BUILD_PLATFORM}" -t "$IMAGE_URI_SHA" -t "$IMAGE_URI_LATEST" "$ROOT_DIR"

echo "\nPushing Docker image tags..."
docker push "$IMAGE_URI_SHA"
docker push "$IMAGE_URI_LATEST"

# Deploy to Cloud Run
echo "\nDeploying to Cloud Run (${SERVICE_NAME_EFFECTIVE})..."
gcloud run deploy "$SERVICE_NAME_EFFECTIVE" \
  --image "$IMAGE_URI_SHA" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 5000 \
  --max-instances=10 \
  --cpu=1 \
  --memory=1Gi \
  --env-vars-file "$ENV_FILE_YAML"

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME_EFFECTIVE" --region="$REGION" --format='value(status.url)')

echo "\n✅ Deployment complete!"
echo "Service URL: $SERVICE_URL"
echo "Image: $IMAGE_URI_SHA" 