-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PLAYERS
CREATE TABLE players (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    verifier_rank TEXT DEFAULT 'Rookie', -- Rookie, Verified, Expert, Oracle
    total_xp BIGINT DEFAULT 0,
    games_played INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GAME ROOMS
CREATE TABLE game_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES players(id) ON DELETE SET NULL,
    room_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'LOBBY', -- LOBBY, SUBMISSION, VERIFICATION, DISPUTE, LEADERBOARD, ENDED
    category TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Medium',
    phase_end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROOM PLAYERS
CREATE TABLE room_players (
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    is_ready BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (room_id, player_id)
);

-- CLAIMS
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    confidence_score INT, -- User input 50-100
    source_url TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, VERIFIED, FALSE, UNCERTAIN, DISPUTED
    ai_verdict JSONB, -- {verdict, confidence, reasoning, sources}
    points_awarded INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISPUTES
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    disputer_id UUID REFERENCES players(id) ON DELETE CASCADE,
    reasoning TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN', -- OPEN, RESOLVED_SUCCESS, RESOLVED_FAILURE
    stake_amount INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Players
CREATE POLICY "Public profiles are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON players FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON players FOR UPDATE USING (auth.uid() = id);

-- Game Rooms
CREATE POLICY "Rooms viewable by auth users" ON game_rooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Hosts can insert rooms" ON game_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update their rooms" ON game_rooms FOR UPDATE USING (auth.uid() = host_id);

-- Room Players
CREATE POLICY "Room players viewable by everyone" ON room_players FOR SELECT USING (true);
CREATE POLICY "Players can join rooms" ON room_players FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Players can update their own status" ON room_players FOR UPDATE USING (auth.uid() = player_id);

-- Claims
CREATE POLICY "Claims viewable by everyone" ON claims FOR SELECT USING (true);
CREATE POLICY "Players can insert claims" ON claims FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Disputes
CREATE POLICY "Disputes viewable by everyone" ON disputes FOR SELECT USING (true);
CREATE POLICY "Players can insert disputes" ON disputes FOR INSERT WITH CHECK (auth.uid() = disputer_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms, room_players, claims, disputes;
