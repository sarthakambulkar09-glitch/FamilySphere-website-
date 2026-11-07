-- ==============================================================================
-- FAMILYSPHERE SUPABASE DATABASE MIGRATION SCRIPT
-- Project URL: https://vhufjomnmyazzbayfocf.supabase.co
-- Generated for Ambulkar Dynasty & Multi-Family Platform
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE DATABASE TABLES
-- ==============================================================================

-- 2.1 FAMILIES TABLE
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT DEFAULT '👑',
  origin TEXT DEFAULT 'Maharashtra, India',
  location TEXT DEFAULT 'Pune, Maharashtra',
  history TEXT,
  main_founder TEXT,
  cover_image TEXT DEFAULT 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
  status TEXT DEFAULT 'public' CHECK (status IN ('public', 'private')),
  branches TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 FAMILY BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.family_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  head_member_id UUID,
  description TEXT,
  color TEXT DEFAULT '#4F46E5',
  generation_span TEXT DEFAULT 'Gen 1 - Gen 3',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 FAMILY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  owner_user_id TEXT, -- Supabase Auth UID or registered user link
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  generation TEXT NOT NULL, -- e.g. "Gen 1: Grandparents", "Gen 2: Children", "Gen 3: Grandchildren"
  birth TEXT, -- Birth year or full date YYYY-MM-DD
  birthplace TEXT,
  hometown TEXT,
  education TEXT,
  occupation TEXT,
  bio TEXT,
  avatar TEXT,
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_twin BOOLEAN DEFAULT FALSE,
  twin_sibling_id UUID,
  personal_photos JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add head_member_id foreign key to branches
ALTER TABLE public.family_branches 
  DROP CONSTRAINT IF EXISTS fk_head_member;
ALTER TABLE public.family_branches 
  ADD CONSTRAINT fk_head_member FOREIGN KEY (head_member_id) 
  REFERENCES public.family_members(id) ON DELETE SET NULL;

-- 2.4 FAMILY RELATIONSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.family_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  relative_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('parent', 'child', 'spouse', 'sibling', 'twin', 'step_parent', 'adopted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 PHOTO ALBUMS TABLE
CREATE TABLE IF NOT EXISTS public.photo_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  cover_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 FAMILY PHOTOS TABLE (Section 7: Memories)
CREATE TABLE IF NOT EXISTS public.family_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.photo_albums(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  branch TEXT DEFAULT 'All Branches',
  date TEXT,
  location TEXT DEFAULT 'Maharashtra, India',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  uploaded_by TEXT DEFAULT 'FamilySphere Admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 HERITAGE PHOTOS TABLE (Section 2: Heritage)
CREATE TABLE IF NOT EXISTS public.heritage_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  url TEXT NOT NULL,
  year TEXT DEFAULT '1950',
  rotation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 FAMILY EVENTS TABLE (Section 8: Events & Birthday Calendar)
CREATE TABLE IF NOT EXISTS public.family_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_photo TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'Birthdays',
    'Anniversaries',
    'Weddings',
    'Family reunions',
    'Festivals',
    'Family celebrations',
    'Other family occasions'
  )),
  date TEXT NOT NULL, -- YYYY-MM-DD
  time TEXT DEFAULT '10:00 IST',
  location TEXT NOT NULL,
  branch TEXT DEFAULT 'All Branches',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  invitations TEXT DEFAULT 'All family members and descendants are invited.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 EVENT RSVPS TABLE
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.family_events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  guests INTEGER DEFAULT 1,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'declined', 'tentative')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 FAMILY STORIES & CHRONICLES TABLE
CREATE TABLE IF NOT EXISTS public.family_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT,
  author_name TEXT NOT NULL,
  year TEXT,
  branch TEXT DEFAULT 'All Branches',
  media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 USER PROFILES & ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL, -- Corresponds to Supabase auth.users.id
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('super_admin', 'family_admin', 'member', 'public_visitor')),
  branch TEXT DEFAULT 'All Branches',
  member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  avatar TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.12 INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  branch TEXT NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT FALSE,
  used_by TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.13 ACCESS REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  branch TEXT NOT NULL,
  relationship_claim TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.14 NOTIFICATIONS LOG TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  channel TEXT CHECK (channel IN ('whatsapp', 'email', 'in_app')),
  template TEXT,
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2.15 IMMUTABLE SECURITY AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_name TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  role TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2.16 PROFILE UPDATE REQUESTS TABLE (Ownership & 3-Tier Approval Workflow)
CREATE TABLE IF NOT EXISTS public.profile_update_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  requested_by_user_id TEXT NOT NULL,
  requested_by_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  changes JSONB NOT NULL, -- { "name": { "old_value": "...", "new_value": "..." } }
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by_name TEXT,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.17 WEBSITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.website_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_members_branch ON public.family_members(branch);
CREATE INDEX IF NOT EXISTS idx_members_generation ON public.family_members(generation);
CREATE INDEX IF NOT EXISTS idx_relationships_member ON public.family_relationships(member_id);
CREATE INDEX IF NOT EXISTS idx_relationships_relative ON public.family_relationships(relative_id);
CREATE INDEX IF NOT EXISTS idx_photos_family_album ON public.family_photos(family_id, album_id);
CREATE INDEX IF NOT EXISTS idx_heritage_family ON public.heritage_photos(family_id);
CREATE INDEX IF NOT EXISTS idx_events_family_date ON public.family_events(family_id, date);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON public.activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_profile_requests_member ON public.profile_update_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_profile_requests_status ON public.profile_update_requests(status);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_update_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current user Super Admin?
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()::text AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.1 Families Policies
CREATE POLICY "Public can view public families" ON public.families
  FOR SELECT USING (status = 'public' OR auth.role() = 'authenticated');

CREATE POLICY "Super Admins can manage families" ON public.families
  FOR ALL USING (public.is_super_admin());

-- 4.2 Members Policies
CREATE POLICY "Public can view members" ON public.family_members
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can edit own profile record" ON public.family_members
  FOR UPDATE USING (
    owner_user_id = auth.uid()::text OR public.is_super_admin()
  );

CREATE POLICY "Super Admins can insert/delete members" ON public.family_members
  FOR ALL USING (public.is_super_admin());

-- 4.3 Photos Policies
CREATE POLICY "Public can view public photos" ON public.family_photos
  FOR SELECT USING (visibility = 'public' OR auth.role() = 'authenticated');

CREATE POLICY "Super Admins can manage family photos" ON public.family_photos
  FOR ALL USING (public.is_super_admin());

-- 4.4 Heritage Photos Policies
CREATE POLICY "Public can view heritage photos" ON public.heritage_photos
  FOR SELECT USING (TRUE);

CREATE POLICY "Super Admins can manage heritage photos" ON public.heritage_photos
  FOR ALL USING (public.is_super_admin());

-- 4.5 Events Policies
CREATE POLICY "Public can view public events" ON public.family_events
  FOR SELECT USING (visibility = 'public' OR auth.role() = 'authenticated');

CREATE POLICY "Super Admins can manage events" ON public.family_events
  FOR ALL USING (public.is_super_admin());

-- 4.6 RSVPs Policies
CREATE POLICY "Anyone can view and submit RSVPs" ON public.event_rsvps
  FOR ALL USING (TRUE);

-- 4.7 Website Settings Policies
CREATE POLICY "Anyone can read website settings" ON public.website_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Super Admins can modify website settings" ON public.website_settings
  FOR ALL USING (public.is_super_admin());

-- 4.8 Profile Update Requests Policies (3-Tier RBAC)
-- Members can view their own submitted change requests
CREATE POLICY "Members can view own profile requests" ON public.profile_update_requests
  FOR SELECT USING (requested_by_user_id = auth.uid()::text OR public.is_super_admin());

-- Members can submit change requests for their owned profile
CREATE POLICY "Members can submit profile requests" ON public.profile_update_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Super Admins and Family Admins can update/approve/reject requests
CREATE POLICY "Admins can manage profile update requests" ON public.profile_update_requests
  FOR UPDATE USING (
    public.is_super_admin() OR 
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()::text AND role IN ('super_admin', 'family_admin')
    )
  );

-- ==============================================================================
-- 5. STORAGE BUCKETS SETUP
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('family-photos', 'family-photos', true),
  ('profile-photos', 'profile-photos', true),
  ('event-photos', 'event-photos', true),
  ('family-documents', 'family-documents', false),
  ('family-videos', 'family-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public can view family photos in storage" ON storage.objects
  FOR SELECT USING (bucket_id IN ('family-photos', 'profile-photos', 'event-photos'));

CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- 6. AMBULKAR DYNASTY INITIAL SEED DATA
-- ==============================================================================
INSERT INTO public.families (id, slug, name, description, logo, origin, location, history, main_founder, status, branches)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'fam_ambulkar',
  'Ambulkar Family',
  'Ancestral Ambulkar lineage rooted in Maharashtra with branches across Pune, Mumbai, and Nagpur.',
  '👑',
  'Maharashtra, India',
  'Pune, Maharashtra',
  'Rooted in Maharashtra, the Ambulkar family stands on the strong foundation laid by Grandfather Maratherao Ambulkar and Grandmother Prabhavathi Ambulkar. Their wisdom, hard work, and unity established a lasting legacy spanning across three generations.',
  'Maratherao & Prabhavathi Ambulkar',
  'public',
  ARRAY['Sudhakar Ambulkar Family', 'Eknath Ambulkar Family', 'Prakash Ambulkar Family', 'Krushana Ambulkar Family']
) ON CONFLICT (id) DO NOTHING;

-- Initial Branches
INSERT INTO public.family_branches (id, family_id, name, description, color, generation_span)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sudhakar Ambulkar Family', 'Senior Branch — Parents of twins Sagar & Dr. Swapnil, and daughters Shruti & Snehal.', '#6366F1', 'Gen 2 - Gen 3'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Eknath Ambulkar Family', 'Engineering & Technology Branch — Parents of Sarthak and Sakshi.', '#10B981', 'Gen 2 - Gen 3'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Prakash Ambulkar Family', 'Commerce & Agriculture Branch — Parents of Riddhi, Siddhi, and Rohit.', '#F59E0B', 'Gen 2 - Gen 3'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Krushana Ambulkar Family', 'Medical & Education Branch — Parents of Aditya, Ananya, Rohan, and Riya.', '#EC4899', 'Gen 2 - Gen 3')
ON CONFLICT (id) DO NOTHING;

-- Initial Members Seed
INSERT INTO public.family_members (id, family_id, name, branch, generation, birth, birthplace, hometown, education, occupation, bio, avatar, is_twin, achievements)
VALUES 
  ('m0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Maratherao Ambulkar', 'Grandparents Root', 'Gen 1: Grandparents', '1920-05-12', 'Maharashtra', 'Maharashtra', 'Traditional Sanskrit & Vedic Studies', 'Patriarch & Agricultural Pioneer', 'Founding patriarch of the Ambulkar household. Known for unyielding integrity, dedication to family unity, and deep wisdom.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', false, ARRAY['Established Ancestral Homestead', 'Community Elder Council Lead']),
  ('m0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Prabhavathi Ambulkar', 'Grandparents Root', 'Gen 1: Grandparents', '1925-08-18', 'Maharashtra', 'Maharashtra', 'Traditional Home Sciences & Ayurveda', 'Matriarch & Herbalist', 'Beloved matriarch who nurtured four sons and thirteen grandchildren. Kept family traditions and cultural values vibrant across decades.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', false, ARRAY['Preserved 100+ Ayurvedic Remedies', 'Annual Feast Organizer']),
  ('m0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'Sagar Ambulkar', 'Sudhakar Ambulkar Family', 'Gen 3: Grandchildren', '2002-11-14', 'Pune, Maharashtra', 'Pune', 'BBA in Business Management', 'Business Operations Executive', 'Twin brother of Dr. Swapnil. Dynamic, energetic, and dedicated to expanding family enterprise and technology ventures.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', true, ARRAY['University Cricket Captain', 'Young Entrepreneur Award 2024']),
  ('m0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'Dr. Swapnil Ambulkar', 'Sudhakar Ambulkar Family', 'Gen 3: Grandchildren', '2002-11-14', 'Pune, Maharashtra', 'Pune', 'MBBS, MD Internal Medicine Resident', 'Physician & Medical Researcher', 'Twin brother of Sagar. Dedicated physician committed to clinical excellence, healthcare access, and family wellness.', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80', true, ARRAY['Top 5 Percentile NEET PG', 'Best Resident Paper 2024']),
  ('m0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'Sarthak Ambulkar', 'Eknath Ambulkar Family', 'Gen 3: Grandchildren', '2004-09-09', 'Pune, Maharashtra', 'Pune', 'BE Computer Engineering, PVPIT Bavdhan Pune', 'Lead Software Engineer & Cloud Architect', 'Creator of the interactive FamilySphere chronicle. Passionate about software architecture, family unity, and artificial intelligence.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', false, ARRAY['Creator of FamilySphere Platform', 'National Hackathon Finalist'])
ON CONFLICT (id) DO NOTHING;

-- Initial Section 2 Heritage Photos Seed
INSERT INTO public.heritage_photos (id, family_id, title, caption, url, year, rotation)
VALUES 
  ('h0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Generation 1 Matriarch & Patriarch', 'Founding pillars of the household lineage: Maratherao & Prabhavathi Ambulkar.', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80', '1945', -1),
  ('h0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Ancestral Estate & Roots', 'Preserving eternal family values and traditions in Maharashtra.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80', '1960', 2),
  ('h0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Pashan Lake Ancestral Homestead Gathering', 'Early harvest celebrations uniting all four branches in solidarity.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', '1975', -2)
ON CONFLICT (id) DO NOTHING;

-- Initial Photo Albums
INSERT INTO public.photo_albums (id, family_id, title, category, description, cover_photo)
VALUES 
  ('alb00000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Annual Family Reunions', 'Reunions', 'Chronicle of grand yearly reunions uniting all 4 branches.', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80'),
  ('alb00000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Weddings & Celebrations', 'Weddings', 'Sacred wedding ceremonies, sangeet nights, and marital traditions.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'),
  ('alb00000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Twin Brothers: Sagar & Swapnil', 'Spotlight', 'Celebrating Sagar and Dr. Swapnil milestones from childhood to graduation.', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- Super Admin User Profile Seed
INSERT INTO public.user_profiles (id, user_id, email, name, role, branch)
VALUES (
  'u0000000-0000-0000-0000-000000000001',
  'usr_sarthak_admin',
  'sarthakambulkar09@gmail.com',
  'Sarthak Ambulkar',
  'super_admin',
  'Eknath Ambulkar Family'
) ON CONFLICT (email) DO NOTHING;

-- Initial Website Settings
INSERT INTO public.website_settings (key, value)
VALUES (
  'main_config',
  '{
    "dynasty_name": "Ambulkar Dynasty",
    "hero_heading": "Preserving Ancestral Heritage Across Generations",
    "hero_intro": "The official interactive family chronicle of the Ambulkar Dynasty. Connecting three generations of wisdom, innovation, and unity.",
    "default_theme": "modern",
    "sections_visible": {
      "hero": true,
      "heritage": true,
      "branches": true,
      "tree": true,
      "directory": true,
      "spotlight": true,
      "memories": true,
      "events": true,
      "auth": true,
      "footer": true
    },
    "announcement": {
      "active": true,
      "text": "✨ Annual Ambulkar Reunion Scheduled for Dec 25, 2026 at the Maharashtra Estate!",
      "type": "celebration"
    }
  }'::JSONB
) ON CONFLICT (key) DO NOTHING;
