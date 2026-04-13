#!/bin/bash
set -euo pipefail

#=============================================================================
# Oromo Christian Church Utrecht — S3 + CloudFront Deployment Script
#=============================================================================

PROJECT_NAME="oromo-church-utrecht"
STACK_NAME="${PROJECT_NAME}-stack"
REGION="eu-west-1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

#-----------------------------------------------------------------------------
# Parse arguments
#-----------------------------------------------------------------------------
ACTION="${1:-full}"  # full | infra | upload | invalidate

usage() {
  echo "Usage: $0 [full|infra|upload|invalidate]"
  echo ""
  echo "  full        - Build, deploy infra, upload, invalidate cache (default)"
  echo "  infra       - Deploy/update CloudFormation stack only"
  echo "  upload      - Build and upload to S3 only"
  echo "  invalidate  - Invalidate CloudFront cache only"
  exit 0
}

[[ "$ACTION" == "--help" || "$ACTION" == "-h" ]] && usage

#-----------------------------------------------------------------------------
# Prerequisites check
#-----------------------------------------------------------------------------
check_prereqs() {
  log "Checking prerequisites..."
  command -v aws >/dev/null 2>&1 || err "AWS CLI not found. Install: https://aws.amazon.com/cli/"
  command -v node >/dev/null 2>&1 || err "Node.js not found. Install: https://nodejs.org/"
  command -v npm >/dev/null 2>&1 || err "npm not found."

  # Verify AWS credentials
  aws sts get-caller-identity --region "$REGION" >/dev/null 2>&1 || err "AWS credentials not configured. Run: aws configure"
  ok "Prerequisites verified"
}

#-----------------------------------------------------------------------------
# Build the frontend
#-----------------------------------------------------------------------------
build_frontend() {
  log "Building frontend..."
  cd "$PROJECT_ROOT"

  if [ ! -d "node_modules" ]; then
    log "Installing dependencies..."
    npm install
  fi

  npm run build
  ok "Frontend built → dist/"
}

#-----------------------------------------------------------------------------
# Deploy CloudFormation infrastructure
#-----------------------------------------------------------------------------
deploy_infra() {
  log "Deploying CloudFormation stack: $STACK_NAME"

  STACK_EXISTS=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" 2>/dev/null && echo "yes" || echo "no")

  if [ "$STACK_EXISTS" == "yes" ]; then
    log "Updating existing stack..."
    aws cloudformation update-stack \
      --stack-name "$STACK_NAME" \
      --template-body "file://$SCRIPT_DIR/cloudformation.yaml" \
      --parameters ParameterKey=ProjectName,ParameterValue="$PROJECT_NAME" \
      --region "$REGION" \
      --tags Key=Project,Value="$PROJECT_NAME" \
      2>/dev/null || { warn "No stack updates needed"; return 0; }

    log "Waiting for stack update..."
    aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" --region "$REGION"
  else
    log "Creating new stack..."
    aws cloudformation create-stack \
      --stack-name "$STACK_NAME" \
      --template-body "file://$SCRIPT_DIR/cloudformation.yaml" \
      --parameters ParameterKey=ProjectName,ParameterValue="$PROJECT_NAME" \
      --region "$REGION" \
      --tags Key=Project,Value="$PROJECT_NAME"

    log "Waiting for stack creation (this may take 5-10 minutes)..."
    aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$REGION"
  fi

  ok "CloudFormation stack deployed"
}

#-----------------------------------------------------------------------------
# Get stack outputs
#-----------------------------------------------------------------------------
get_stack_outputs() {
  BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucketName'].OutputValue" \
    --output text)

  DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
    --output text)

  WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
    --output text)

  [ -z "$BUCKET_NAME" ] && err "Could not get bucket name from stack outputs"
  [ -z "$DISTRIBUTION_ID" ] && err "Could not get CloudFront distribution ID from stack outputs"
}

#-----------------------------------------------------------------------------
# Upload to S3
#-----------------------------------------------------------------------------
upload_to_s3() {
  log "Uploading dist/ to s3://$BUCKET_NAME ..."

  # Sync with proper content types and cache headers
  # HTML files: no cache (always fresh)
  aws s3 sync "$PROJECT_ROOT/dist" "s3://$BUCKET_NAME" \
    --region "$REGION" \
    --delete \
    --exclude "*.html" \
    --cache-control "public, max-age=31536000, immutable"

  # HTML files with no-cache
  aws s3 sync "$PROJECT_ROOT/dist" "s3://$BUCKET_NAME" \
    --region "$REGION" \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate"

  ok "Files uploaded to S3"
}

#-----------------------------------------------------------------------------
# Invalidate CloudFront cache
#-----------------------------------------------------------------------------
invalidate_cache() {
  log "Invalidating CloudFront cache..."
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

  ok "CloudFront cache invalidation started: $INVALIDATION_ID"
  log "Cache invalidation takes 1-2 minutes to complete"
}

#-----------------------------------------------------------------------------
# Print summary
#-----------------------------------------------------------------------------
print_summary() {
  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  Deployment Complete!${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo -e "  ${BLUE}Website URL:${NC}     $WEBSITE_URL"
  echo -e "  ${BLUE}S3 Bucket:${NC}       $BUCKET_NAME"
  echo -e "  ${BLUE}Distribution:${NC}    $DISTRIBUTION_ID"
  echo -e "  ${BLUE}Region:${NC}          $REGION"
  echo ""
  echo -e "  ${YELLOW}Note:${NC} CloudFront may take a few minutes to propagate."
  echo ""
}

#-----------------------------------------------------------------------------
# Main
#-----------------------------------------------------------------------------
check_prereqs

case "$ACTION" in
  full)
    build_frontend
    deploy_infra
    get_stack_outputs
    upload_to_s3
    invalidate_cache
    print_summary
    ;;
  infra)
    deploy_infra
    get_stack_outputs
    print_summary
    ;;
  upload)
    build_frontend
    get_stack_outputs
    upload_to_s3
    invalidate_cache
    print_summary
    ;;
  invalidate)
    get_stack_outputs
    invalidate_cache
    ;;
  *)
    usage
    ;;
esac
