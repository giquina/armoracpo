#!/bin/bash

# ============================================
# ArmoraCPO Production Deployment Verification Script
# ============================================
# This script verifies that all critical components of the production deployment are working correctly.
#
# Usage:
#   ./scripts/verify-deployment.sh [DEPLOYMENT_URL]
#
# Example:
#   ./scripts/verify-deployment.sh https://armoracpo.vercel.app
#
# If no URL is provided, it will attempt to detect it from Vercel CLI

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Symbols
CHECK="${GREEN}✓${NC}"
CROSS="${RED}✗${NC}"
WARN="${YELLOW}⚠${NC}"
INFO="${BLUE}ℹ${NC}"

# ============================================
# Configuration
# ============================================
DEPLOYMENT_URL="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Required environment variables
REQUIRED_ENV_VARS=(
    "REACT_APP_SUPABASE_URL"
    "REACT_APP_SUPABASE_ANON_KEY"
    "REACT_APP_SENTRY_DSN"
    "REACT_APP_FIREBASE_API_KEY"
    "REACT_APP_FIREBASE_PROJECT_ID"
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID"
    "REACT_APP_FIREBASE_APP_ID"
    "REACT_APP_FIREBASE_VAPID_KEY"
)

# Optional but recommended environment variables
OPTIONAL_ENV_VARS=(
    "REACT_APP_SENTRY_ENVIRONMENT"
    "REACT_APP_VERSION"
)

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNED=0

# ============================================
# Helper Functions
# ============================================

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BLUE}--- $1 ---${NC}"
    echo ""
}

print_success() {
    echo -e "${CHECK} $1"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${CROSS} $1"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${WARN} $1"
    ((TESTS_WARNED++))
}

print_info() {
    echo -e "${INFO} $1"
}

# ============================================
# Get Deployment URL
# ============================================

get_deployment_url() {
    if [ -z "$DEPLOYMENT_URL" ]; then
        print_info "No deployment URL provided. Attempting to detect from Vercel..."

        if command -v vercel &> /dev/null; then
            # Try to get the production URL from Vercel
            VERCEL_URL=$(vercel inspect --scope=$(cat .vercel/project.json 2>/dev/null | grep -o '"name":"[^"]*"' | cut -d'"' -f4) 2>/dev/null | grep -o 'https://[^"]*' | head -1)

            if [ -n "$VERCEL_URL" ]; then
                DEPLOYMENT_URL="$VERCEL_URL"
                print_success "Detected deployment URL: $DEPLOYMENT_URL"
            else
                print_error "Could not detect deployment URL. Please provide it as an argument."
                echo "Usage: $0 <DEPLOYMENT_URL>"
                exit 1
            fi
        else
            print_error "Vercel CLI not found and no URL provided."
            echo "Install Vercel CLI: npm i -g vercel"
            echo "Or provide URL: $0 <DEPLOYMENT_URL>"
            exit 1
        fi
    else
        print_success "Using provided deployment URL: $DEPLOYMENT_URL"
    fi
}

# ============================================
# Check Environment Variables (Local)
# ============================================

check_local_env() {
    print_section "Checking Local Environment Variables"

    # Load .env.production if it exists
    if [ -f "$PROJECT_ROOT/.env.production" ]; then
        print_info "Found .env.production file"
        source "$PROJECT_ROOT/.env.production"
    else
        print_warning ".env.production file not found (this is OK for Vercel deployments)"
    fi

    # Check required variables
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            print_warning "$var is not set locally"
        else
            # Mask sensitive values
            masked_value="${!var:0:10}..."
            print_success "$var is set ($masked_value)"
        fi
    done

    # Check optional variables
    for var in "${OPTIONAL_ENV_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            print_info "$var is not set (optional)"
        else
            print_success "$var is set: ${!var}"
        fi
    done
}

# ============================================
# Check Vercel Environment Variables
# ============================================

check_vercel_env() {
    print_section "Checking Vercel Environment Variables"

    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not installed. Skipping Vercel environment check."
        print_info "Install with: npm i -g vercel"
        return
    fi

    print_info "Fetching environment variables from Vercel..."

    # Pull environment variables (this requires authentication)
    if vercel env pull .env.vercel.check 2>/dev/null; then
        print_success "Successfully fetched Vercel environment variables"

        # Check each required variable in the pulled file
        for var in "${REQUIRED_ENV_VARS[@]}"; do
            if grep -q "^$var=" .env.vercel.check; then
                print_success "$var is set in Vercel"
            else
                print_error "$var is NOT set in Vercel (CRITICAL)"
            fi
        done

        # Clean up
        rm .env.vercel.check
    else
        print_warning "Could not fetch Vercel environment variables"
        print_info "Make sure you're logged in: vercel login"
    fi
}

# ============================================
# Test Deployment URL
# ============================================

test_deployment_url() {
    print_section "Testing Deployment URL"

    print_info "Testing: $DEPLOYMENT_URL"

    # Test if URL is accessible
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Deployment is accessible (HTTP $HTTP_CODE)"
    else
        print_error "Deployment returned HTTP $HTTP_CODE (expected 200)"
        return 1
    fi

    # Download and check HTML content
    CONTENT=$(curl -s "$DEPLOYMENT_URL")

    # Check for React app
    if echo "$CONTENT" | grep -q "root"; then
        print_success "React root element found"
    else
        print_error "React root element not found in HTML"
    fi

    # Check for critical resources
    if echo "$CONTENT" | grep -q "static/js"; then
        print_success "JavaScript bundles found"
    else
        print_warning "JavaScript bundles not found (might be inline)"
    fi
}

# ============================================
# Test Sentry Integration
# ============================================

test_sentry() {
    print_section "Testing Sentry Error Tracking"

    if [ -z "$REACT_APP_SENTRY_DSN" ]; then
        print_warning "REACT_APP_SENTRY_DSN not set. Skipping Sentry test."
        return
    fi

    print_success "Sentry DSN is configured"

    # Extract Sentry project details from DSN
    SENTRY_HOST=$(echo "$REACT_APP_SENTRY_DSN" | grep -o 'https://[^@]*@[^/]*' | cut -d'@' -f2)

    if [ -n "$SENTRY_HOST" ]; then
        print_info "Sentry host: $SENTRY_HOST"

        # Test if Sentry endpoint is accessible
        if curl -s -o /dev/null -w "%{http_code}" "https://$SENTRY_HOST" | grep -q "200"; then
            print_success "Sentry endpoint is accessible"
        else
            print_warning "Could not verify Sentry endpoint accessibility"
        fi
    fi

    print_info "To verify Sentry integration:"
    print_info "1. Visit your deployment and trigger an error"
    print_info "2. Check https://sentry.io for the error event"
}

# ============================================
# Test Firebase Push Notifications
# ============================================

test_firebase() {
    print_section "Testing Firebase Configuration"

    if [ -z "$REACT_APP_FIREBASE_VAPID_KEY" ]; then
        print_error "REACT_APP_FIREBASE_VAPID_KEY not set (CRITICAL for push notifications)"
        return 1
    fi

    print_success "Firebase VAPID key is configured"

    if [ -z "$REACT_APP_FIREBASE_PROJECT_ID" ]; then
        print_error "REACT_APP_FIREBASE_PROJECT_ID not set"
        return 1
    fi

    print_success "Firebase project ID: $REACT_APP_FIREBASE_PROJECT_ID"

    # Check if Firebase project is accessible
    FIREBASE_URL="https://console.firebase.google.com/project/$REACT_APP_FIREBASE_PROJECT_ID"
    print_info "Firebase console: $FIREBASE_URL"

    print_info "To verify Firebase push notifications:"
    print_info "1. Visit your deployment and grant notification permission"
    print_info "2. Check browser console for FCM token registration"
    print_info "3. Send a test notification from Firebase Console"
}

# ============================================
# Test Supabase Connection
# ============================================

test_supabase() {
    print_section "Testing Supabase Connection"

    if [ -z "$REACT_APP_SUPABASE_URL" ]; then
        print_error "REACT_APP_SUPABASE_URL not set (CRITICAL)"
        return 1
    fi

    print_success "Supabase URL: $REACT_APP_SUPABASE_URL"

    # Test if Supabase endpoint is accessible
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$REACT_APP_SUPABASE_URL/rest/v1/")

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
        print_success "Supabase endpoint is accessible"
    else
        print_error "Supabase endpoint returned HTTP $HTTP_CODE"
    fi

    if [ -n "$REACT_APP_SUPABASE_ANON_KEY" ]; then
        print_success "Supabase anon key is configured"
    else
        print_error "REACT_APP_SUPABASE_ANON_KEY not set (CRITICAL)"
    fi
}

# ============================================
# Run Smoke Tests
# ============================================

run_smoke_tests() {
    print_section "Running Smoke Tests"

    # Test key pages
    PAGES=(
        "/"
        "/welcome"
        "/login"
    )

    for page in "${PAGES[@]}"; do
        URL="$DEPLOYMENT_URL$page"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

        if [ "$HTTP_CODE" = "200" ]; then
            print_success "Page accessible: $page (HTTP $HTTP_CODE)"
        else
            print_error "Page error: $page (HTTP $HTTP_CODE)"
        fi
    done

    # Check service worker registration
    SW_URL="$DEPLOYMENT_URL/service-worker.js"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SW_URL")

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Service worker found at /service-worker.js"
    else
        print_warning "Service worker not found (HTTP $HTTP_CODE)"
        print_info "Service worker is optional for deployment"
    fi

    # Check manifest
    MANIFEST_URL="$DEPLOYMENT_URL/manifest.json"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MANIFEST_URL")

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "PWA manifest found"
    else
        print_warning "PWA manifest not found (HTTP $HTTP_CODE)"
    fi
}

# ============================================
# Check Build Output
# ============================================

check_build() {
    print_section "Checking Build Output"

    if [ -d "$PROJECT_ROOT/build" ]; then
        print_success "Build directory exists"

        BUILD_SIZE=$(du -sh "$PROJECT_ROOT/build" | cut -f1)
        print_info "Build size: $BUILD_SIZE"

        # Check for critical files
        if [ -f "$PROJECT_ROOT/build/index.html" ]; then
            print_success "index.html found"
        else
            print_error "index.html not found in build"
        fi

        if [ -d "$PROJECT_ROOT/build/static" ]; then
            print_success "Static assets directory found"
        else
            print_error "Static assets directory not found"
        fi
    else
        print_warning "Build directory not found (run 'npm run build' first)"
        print_info "This check is optional if deploying via Vercel"
    fi
}

# ============================================
# Generate Report
# ============================================

generate_report() {
    print_header "Deployment Verification Summary"

    TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED + TESTS_WARNED))

    echo -e "${GREEN}Passed:  $TESTS_PASSED${NC}"
    echo -e "${RED}Failed:  $TESTS_FAILED${NC}"
    echo -e "${YELLOW}Warnings: $TESTS_WARNED${NC}"
    echo -e "Total:   $TOTAL_TESTS"
    echo ""

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ All critical checks passed!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Review any warnings above"
        echo "2. Test the deployment manually: $DEPLOYMENT_URL"
        echo "3. Check Sentry for any errors: https://sentry.io"
        echo "4. Verify push notifications work"
        echo "5. Run full QA test suite: docs/QA_TESTING_CHECKLIST.md"
        echo ""
        exit 0
    else
        echo -e "${RED}✗ Some critical checks failed!${NC}"
        echo ""
        echo "Please review the errors above and:"
        echo "1. Set missing environment variables in Vercel"
        echo "2. Verify Supabase and Firebase configurations"
        echo "3. Check deployment logs in Vercel dashboard"
        echo "4. Refer to DEPLOYMENT_CHECKLIST.md for troubleshooting"
        echo ""
        exit 1
    fi
}

# ============================================
# Main Execution
# ============================================

main() {
    print_header "ArmoraCPO Production Deployment Verification"

    print_info "Starting verification at $(date)"
    print_info "Project root: $PROJECT_ROOT"

    # Get deployment URL
    get_deployment_url

    # Run all checks
    check_local_env
    check_vercel_env
    check_build
    test_deployment_url
    test_supabase
    test_sentry
    test_firebase
    run_smoke_tests

    # Generate final report
    generate_report
}

# Run main function
main
