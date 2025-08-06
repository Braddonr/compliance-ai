#!/bin/bash

echo "🧪 Testing Compliance Companion API..."
echo "================================"

BASE_URL="http://localhost:3000"

# Test 1: Login and get token
echo "1. Testing Authentication..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo-fintech.com","password":"password123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ Login successful"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "🔑 Token obtained: ${TOKEN:0:50}..."
else
    echo "❌ Login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 2: Get frameworks
echo -e "\n2. Testing Get Frameworks..."
FRAMEWORKS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/compliance/frameworks")

if echo "$FRAMEWORKS_RESPONSE" | grep -q "PCI-DSS"; then
    echo "✅ Frameworks endpoint working"
    echo "📋 Found frameworks: $(echo "$FRAMEWORKS_RESPONSE" | grep -o '"displayName":"[^"]*"' | wc -l) items"
else
    echo "❌ Frameworks endpoint failed"
    echo "Response: $FRAMEWORKS_RESPONSE"
fi

# Test 3: Get compliance progress
echo -e "\n3. Testing Get Compliance Progress..."
PROGRESS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/compliance/progress")

if echo "$PROGRESS_RESPONSE" | grep -q "progressPercentage"; then
    echo "✅ Progress endpoint working"
    echo "📊 Progress data retrieved successfully"
else
    echo "❌ Progress endpoint failed"
    echo "Response: $PROGRESS_RESPONSE"
fi

# Test 4: Get documents
echo -e "\n4. Testing Get Documents..."
DOCUMENTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/documents")

if echo "$DOCUMENTS_RESPONSE" | grep -q "title"; then
    echo "✅ Documents endpoint working"
    echo "📄 Found documents: $(echo "$DOCUMENTS_RESPONSE" | grep -o '"title":"[^"]*"' | wc -l) items"
else
    echo "❌ Documents endpoint failed"
    echo "Response: $DOCUMENTS_RESPONSE"
fi

echo -e "\n🎉 API testing completed!"
echo "📚 Visit http://localhost:3000/api/docs for interactive documentation"