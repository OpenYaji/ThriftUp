
-- Enable RLS on unrestricted tables
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_replies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view bids" ON bids;
DROP POLICY IF EXISTS "Users can create bids" ON bids;
DROP POLICY IF EXISTS "Users can view their own bids" ON bids;

DROP POLICY IF EXISTS "Anyone can view event attendees" ON event_attendees;
DROP POLICY IF EXISTS "Users can register for events" ON event_attendees;
DROP POLICY IF EXISTS "Users can cancel their registration" ON event_attendees;

DROP POLICY IF EXISTS "Anyone can view post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;

DROP POLICY IF EXISTS "Anyone can view replies" ON post_replies;
DROP POLICY IF EXISTS "Users can create replies" ON post_replies;
DROP POLICY IF EXISTS "Users can update their replies" ON post_replies;
DROP POLICY IF EXISTS "Users can delete their replies" ON post_replies;

-- RLS Policies for bids
CREATE POLICY "Anyone can view bids" ON bids
  FOR SELECT USING (true);

CREATE POLICY "Users can create bids" ON bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Users can view their own bids" ON bids
  FOR SELECT USING (auth.uid() = bidder_id);

-- RLS Policies for event_attendees
CREATE POLICY "Anyone can view event attendees" ON event_attendees
  FOR SELECT USING (true);

CREATE POLICY "Users can register for events" ON event_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their registration" ON event_attendees
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_likes
CREATE POLICY "Anyone can view post likes" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_replies
CREATE POLICY "Anyone can view replies" ON post_replies
  FOR SELECT USING (true);

CREATE POLICY "Users can create replies" ON post_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their replies" ON post_replies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their replies" ON post_replies
  FOR DELETE USING (auth.uid() = user_id);
