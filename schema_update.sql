-- Add linked_suspects column to clues table
ALTER TABLE clues 
ADD COLUMN IF NOT EXISTS linked_suspects text[] DEFAULT '{}';

-- Add linked_suspects and linked_clues columns to theories table
ALTER TABLE theories 
ADD COLUMN IF NOT EXISTS linked_suspects text[] DEFAULT '{}';

ALTER TABLE theories 
ADD COLUMN IF NOT EXISTS linked_clues text[] DEFAULT '{}';

-- Force schema cache reload (Supabase sometimes caches schema)
NOTIFY pgrst, 'reload config';
