/*
  # Create pastes table

  1. New Tables
    - `pastes`
      - `id` (text, primary key) - unique identifier for the paste
      - `content` (text) - the paste content
      - `max_views` (integer, nullable) - maximum number of views allowed
      - `view_count` (integer) - current view count, default 0
      - `expires_at` (timestamptz, nullable) - expiration timestamp
      - `created_at` (timestamptz) - creation timestamp
  
  2. Security
    - Enable RLS on `pastes` table
    - Add policy for public read access (anyone can view pastes by ID)
    - Add policy for public insert access (anyone can create pastes)
    
  3. Indexes
    - Add index on expires_at for efficient expiry queries
*/

CREATE TABLE IF NOT EXISTS pastes (
  id text PRIMARY KEY,
  content text NOT NULL,
  max_views integer,
  view_count integer DEFAULT 0 NOT NULL,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pastes"
  ON pastes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create pastes"
  ON pastes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at);
