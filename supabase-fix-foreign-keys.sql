
-- Drop the existing foreign key constraint
ALTER TABLE listings 
DROP CONSTRAINT IF EXISTS listings_user_id_fkey;

-- Add the corrected foreign key constraint pointing to auth.users
ALTER TABLE listings
ADD CONSTRAINT listings_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Do the same for events
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_organizer_id_fkey;

ALTER TABLE events
ADD CONSTRAINT events_organizer_id_fkey 
FOREIGN KEY (organizer_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Do the same for community_posts
ALTER TABLE community_posts 
DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;

ALTER TABLE community_posts
ADD CONSTRAINT community_posts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Also fix the users table to reference auth.users properly
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

ALTER TABLE users
ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Make sure id is the primary key
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE users ADD PRIMARY KEY (id);
