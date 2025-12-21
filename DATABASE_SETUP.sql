-- ============================================================
-- Profile Access Request System - Database Setup
-- Copy and paste these commands into Supabase SQL Editor
-- ============================================================

-- Table 1: Profile Access Requests
-- Stores when User A requests access to view User B's profile
CREATE TABLE IF NOT EXISTS profile_access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senderId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiverId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(senderId, receiverId)
);

-- Create index for faster queries on receiver
CREATE INDEX IF NOT EXISTS idx_profile_requests_receiver 
ON profile_access_requests(receiverId, status);

-- Create index for sender queries
CREATE INDEX IF NOT EXISTS idx_profile_requests_sender 
ON profile_access_requests(senderId, status);



-- Table 2: Profile Access Grants
-- Stores active one-time access grants
CREATE TABLE IF NOT EXISTS profile_access_grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grantedBy UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grantedTo UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  expiresAt TIMESTAMP NOT NULL,
  isUsed BOOLEAN DEFAULT false,
  usedAt TIMESTAMP,
  UNIQUE(grantedBy, grantedTo)
);

-- Create index for faster lookups by accessor
CREATE INDEX IF NOT EXISTS idx_profile_grants_accessor 
ON profile_access_grants(grantedTo, grantedBy);

-- Create index for expires check
CREATE INDEX IF NOT EXISTS idx_profile_grants_expiry 
ON profile_access_grants(expiresAt);


-- Optional: Add RLS (Row Level Security) policies if using Supabase Auth
-- Uncomment these if your app uses RLS

ALTER TABLE profile_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_access_grants ENABLE ROW LEVEL SECURITY;

-- Users can only see requests they sent or received
CREATE POLICY "Users can view their requests"
ON profile_access_requests FOR SELECT
USING (auth.uid() = senderId OR auth.uid() = receiverId);

-- Users can only create requests as themselves
CREATE POLICY "Users can create own requests"
ON profile_access_requests FOR INSERT
WITH CHECK (auth.uid() = senderId);

-- Only receiver can update their requests
CREATE POLICY "Receiver can update requests"
ON profile_access_requests FOR UPDATE
USING (auth.uid() = receiverId);

-- Users can only see grants for themselves
CREATE POLICY "Users can view their grants"
ON profile_access_grants FOR SELECT
USING (auth.uid() = grantedTo OR auth.uid() = grantedBy);



-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profile_access_requests', 'profile_access_grants');

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND (tablename = 'profile_access_requests' OR tablename = 'profile_access_grants');

-- ============================================================
-- Cleanup queries (if you need to reset)
-- ============================================================

-- DROP TABLE IF EXISTS profile_access_grants CASCADE;
-- DROP TABLE IF EXISTS profile_access_requests CASCADE;

-- ============================================================
