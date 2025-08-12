#!/usr/bin/env bash

set -euo pipefail

# Usage:
#   ./deploy.sh [prod|dev]
#
# Behavior:
# - Uses envs/{prod,dev}.env if present; otherwise falls back to .env
# - Builds Docker image, tags, and pushes to Artifact Registry
# - Deploys to Cloud Run using the selected env file
# - For dev target, deploys to resume-builder-dev service
# - For prod target, deploys to SERVICE_NAME from env file (or default)
# - Protects prod deploys to only run on main branch in CI unless explicitly allowed

TARGET=${1:-}
if [[ -z "${TARGET}" || ( "${TARGET}" != "prod" && "${TARGET}" != "dev" ) ]]; then
  echo "Usage: ./deploy.sh [prod|dev]"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_DIR="${ROOT_DIR}/envs"
DOTENV_PATH="${ROOT_DIR}/.env"

mkdir -p "${ENV_DIR}"

# Convert dotenv to YAML for Cloud Run consumption
PROD_ENV_FILE="${ENV_DIR}/prod.env"
DEV_ENV_FILE="${ENV_DIR}/dev.env"
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

# Select env file based on target; prefer envs/<target>.env, else fallback to .env
if [[ "$TARGET" == "dev" ]]; then
  ENV_FILE="$([[ -f "$DEV_ENV_FILE" ]] && echo "$DEV_ENV_FILE" || echo "$DOTENV_PATH")"
  ENV_FILE_YAML="$DEV_ENV_YAML"
else
  ENV_FILE="$([[ -f "$PROD_ENV_FILE" ]] && echo "$PROD_ENV_FILE" || echo "$DOTENV_PATH")"
  ENV_FILE_YAML="$PROD_ENV_YAML"
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: No env file found. Expected one of: $PROD_ENV_FILE (for prod), $DEV_ENV_FILE (for dev), or $DOTENV_PATH"
  exit 1
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