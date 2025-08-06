# 🧪 AI Integration Testing Guide

## Testing the Complete OpenAI Integration

### **Prerequisites**
1. **OpenAI API Key**: Add `OPENAI_API_KEY=your_key_here` to `backend/.env`
2. **Database**: Ensure PostgreSQL is running and connected
3. **Backend**: Start the NestJS backend (`npm run start:dev`)
4. **Frontend**: Start the React frontend (`npm run dev`)

### **Test Flow 1: Company Context Setup**

1. **Navigate to Settings Page**
   - Go to `/settings` in the frontend
   - Click on the "AI Models" tab

2. **Configure Company Context**
   ```
   Example Company Context:
   "We are a mid-size fintech company with 200 employees, specializing in payment processing for e-commerce platforms. We operate in the US and EU markets, handle sensitive financial data including credit card information, and serve over 10,000 merchants. Our infrastructure is cloud-based using AWS, and we process approximately $50M in transactions monthly."
   ```

3. **Save Settings**
   - Click "Save AI Settings"
   - Verify success toast appears
   - Check browser network tab to confirm API call

### **Test Flow 2: AI Document Generation**

1. **Navigate to Documents**
   - Go to `/documents`
   - Click "New Document"

2. **Fill Document Details**
   - Title: "PCI-DSS Compliance Policy"
   - Description: "Comprehensive policy for credit card data protection"
   - Framework: Select "PCI-DSS"
   - Requirements: Add custom requirements or use defaults

3. **Generate AI Content**
   - Click the "Generate with AI" button
   - Watch for progress indicators
   - Verify the generated content is:
     - Much longer than before (3000+ words)
     - Includes company-specific context
     - Properly formatted HTML
     - Relevant to PCI-DSS framework

### **Test Flow 3: Settings Persistence**

1. **Refresh the Settings Page**
   - Navigate away and back to `/settings`
   - Verify company context is still there
   - Check that AI model settings are preserved

2. **Test Different AI Models**
   - Change AI model to "gpt-3.5-turbo"
   - Adjust temperature to 0.7
   - Save settings
   - Generate a new document
   - Compare output quality/style

### **Expected Results**

#### **✅ Company Context Integration**
- AI-generated documents should reference your specific company context
- Content should be tailored to your industry and size
- Compliance requirements should be relevant to your business model

#### **✅ Enhanced Document Quality**
- Documents should be 3000-4000 words (much longer than before)
- Professional formatting with proper HTML structure
- Detailed implementation sections for each requirement
- Specific examples and best practices
- Company-specific recommendations

#### **✅ Settings Persistence**
- Company context saved to database
- AI model preferences remembered
- Settings survive page refreshes and app restarts

### **Backend API Testing**

#### **Test Settings Endpoints**
```bash
# Get all settings
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/settings

# Get AI settings specifically
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/settings/ai

# Update company context
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"context": "Your company description here"}' \
  http://localhost:3000/settings/ai/company-context
```

#### **Test AI Document Generation**
```bash
# Generate document with company context
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "framework": "PCI-DSS",
    "requirements": ["Network Security", "Data Protection"],
    "title": "Test Document",
    "description": "Test description",
    "companyContext": "Test company context"
  }' \
  http://localhost:3000/ai/generate-document
```

### **Troubleshooting**

#### **OpenAI API Issues**
- Check API key is valid and has credits
- Verify network connectivity
- Check rate limits (GPT-4 has lower limits)
- Look for error messages in backend logs

#### **Database Issues**
- Run the migration script: `001-initialize-settings.sql`
- Check database connection in backend logs
- Verify settings table exists and has data

#### **Frontend Issues**
- Check browser console for errors
- Verify API calls in Network tab
- Check React Query cache in DevTools

### **Performance Notes**

- **GPT-4 Generation**: Takes 10-30 seconds for long documents
- **Fallback System**: If OpenAI fails, enhanced mock content is used
- **Caching**: Settings are cached for 2 minutes to reduce API calls
- **Progress Tracking**: UI shows progress during generation

### **Success Criteria**

✅ **Company context is saved and retrieved from database**
✅ **AI-generated documents are significantly longer and more detailed**
✅ **Content is tailored to company context**
✅ **Settings persist across sessions**
✅ **Fallback system works when OpenAI is unavailable**
✅ **UI provides good feedback during generation process**

---

## 🎉 **What This Demonstrates**

This implementation showcases:
- **Real AI Integration**: Actual OpenAI GPT-4 API usage
- **Dynamic Configuration**: User-configurable AI settings
- **Context-Aware Generation**: Company-specific content
- **Production-Ready Patterns**: Error handling, fallbacks, caching
- **Full-Stack Integration**: Frontend settings → Backend storage → AI generation

**This is a production-ready AI integration that goes far beyond simple mock data!** 🚀