-- Initialize default settings for the compliance AI application

-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description VARCHAR(255),
    type VARCHAR(50) DEFAULT 'string',
    category VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default AI settings
INSERT INTO settings (key, value, description, type, category) VALUES
('company_context', '', 'Company context information for AI-generated content', 'string', 'ai'),
('ai_model', 'gpt-4', 'AI model to use for content generation', 'string', 'ai'),
('ai_temperature', '0.3', 'AI temperature setting for content generation', 'number', 'ai'),
('ai_max_tokens', '4000', 'Maximum tokens for AI content generation', 'number', 'ai'),
('document_retention_days', '2555', 'Number of days to retain documents (7 years)', 'number', 'documents')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);