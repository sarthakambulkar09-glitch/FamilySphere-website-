-- ==============================================================================
-- AMBULKAR FAMILY TREE & FAMILYSPHERE - PERMANENT SUPABASE CLOUD STORAGE SCHEMA
-- Project URL: https://vhufjomnmyazzbayfocf.supabase.co
-- Tables:
--   1. family_members
--   2. family_branches
--   3. family_relationships
--   4. family_photos
--   5. family_memories
--   6. notifications
--   7. pending_approvals
--   8. user_profiles
-- Plus storage buckets:
--   - family-profiles
--   - family-gallery
--   - family-documents
--   - family-memories
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. FAMILIES TABLE
-- ==============================================================================
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

-- ==============================================================================
-- 3. TABLE 2: FAMILY BRANCHES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.family_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  head_member_id UUID,
  description TEXT,
  color TEXT DEFAULT '#6366F1',
  generation_span TEXT DEFAULT 'Gen 1 - Gen 3',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABLE 1: FAMILY MEMBERS (ALL 19 PRESERVED MEMBERS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  owner_user_id TEXT,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  generation TEXT NOT NULL,
  birth TEXT,
  death TEXT,
  birthplace TEXT DEFAULT 'Maharashtra, India',
  hometown TEXT DEFAULT 'Maharashtra, India',
  education TEXT,
  occupation TEXT,
  bio TEXT,
  avatar TEXT,
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_twin BOOLEAN DEFAULT FALSE,
  twin_sibling_id UUID,
  parents TEXT[] DEFAULT ARRAY[]::TEXT[],
  siblings TEXT[] DEFAULT ARRAY[]::TEXT[],
  spouse TEXT,
  children TEXT[] DEFAULT ARRAY[]::TEXT[],
  personal_photos JSONB DEFAULT '[]'::JSONB,
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key link for branch head
ALTER TABLE public.family_branches 
  DROP CONSTRAINT IF EXISTS fk_head_member;
ALTER TABLE public.family_branches 
  ADD CONSTRAINT fk_head_member FOREIGN KEY (head_member_id) 
  REFERENCES public.family_members(id) ON DELETE SET NULL;

-- ==============================================================================
-- 5. TABLE 3: FAMILY RELATIONSHIPS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.family_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  relative_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('parent', 'child', 'spouse', 'sibling', 'twin', 'relative')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (member_id, relative_id, relation_type)
);

-- ==============================================================================
-- 6. PHOTO ALBUMS
-- ==============================================================================
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

-- ==============================================================================
-- 7. TABLE 4: FAMILY PHOTOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.family_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.photo_albums(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  storage_path TEXT,
  bucket_name TEXT DEFAULT 'family-gallery',
  member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  branch TEXT DEFAULT 'All Branches',
  date TEXT,
  location TEXT DEFAULT 'Maharashtra, India',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  uploaded_by TEXT DEFAULT 'Ambulkar Super Admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. TABLE 5: FAMILY MEMORIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.family_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  year TEXT DEFAULT '1960',
  branch TEXT DEFAULT 'All Branches',
  media_url TEXT NOT NULL,
  storage_path TEXT,
  bucket_name TEXT DEFAULT 'family-memories',
  rotation INTEGER DEFAULT 0,
  contributor_name TEXT DEFAULT 'Ambulkar Family Archives',
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. TABLE 6: NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  channel TEXT DEFAULT 'in_app' CHECK (channel IN ('whatsapp', 'email', 'in_app')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'read', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. TABLE 7: PENDING APPROVALS (Profile update requests & member corrections)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pending_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  requested_by_user_id TEXT NOT NULL,
  requested_by_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  changes JSONB NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by_name TEXT,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backward compatibility alias view
CREATE OR REPLACE VIEW public.profile_update_requests AS
  SELECT * FROM public.pending_approvals;

-- ==============================================================================
-- 11. TABLE 8: USER PROFILES & ACCESS LEVELS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('super_admin', 'family_admin', 'member')),
  branch TEXT DEFAULT 'All Branches',
  member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  avatar TEXT,
  mobile TEXT,
  email_verified BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. WEBSITE SETTINGS & LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.website_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- ==============================================================================
-- 13. INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_members_name ON public.family_members(name);
CREATE INDEX IF NOT EXISTS idx_members_branch ON public.family_members(branch);
CREATE INDEX IF NOT EXISTS idx_members_family ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_relationships_pair ON public.family_relationships(member_id, relative_id);
CREATE INDEX IF NOT EXISTS idx_photos_branch ON public.family_photos(branch);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_status ON public.pending_approvals(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to identify Super Admins
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()::text AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public & Authenticated Read Access
CREATE POLICY "Anyone can view family details" ON public.families FOR SELECT USING (true);
CREATE POLICY "Anyone can view branches" ON public.family_branches FOR SELECT USING (true);
CREATE POLICY "Anyone can view family members" ON public.family_members FOR SELECT USING (true);
CREATE POLICY "Anyone can view relationships" ON public.family_relationships FOR SELECT USING (true);
CREATE POLICY "Anyone can view photo albums" ON public.photo_albums FOR SELECT USING (true);
CREATE POLICY "Anyone can view photos" ON public.family_photos FOR SELECT USING (visibility = 'public' OR auth.role() = 'authenticated');
CREATE POLICY "Anyone can view memories" ON public.family_memories FOR SELECT USING (true);
CREATE POLICY "Anyone can view website settings" ON public.website_settings FOR SELECT USING (true);

-- Member Profile Editing (own profile only)
CREATE POLICY "Members can update their own profile" ON public.family_members
  FOR UPDATE USING (
    owner_user_id = auth.uid()::text OR is_super_admin()
  );

-- Super Admin Full Access
CREATE POLICY "Super Admins can manage members" ON public.family_members
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super Admins can manage branches" ON public.family_branches
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super Admins can manage relationships" ON public.family_relationships
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super Admins can manage photos" ON public.family_photos
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super Admins can manage memories" ON public.family_memories
  FOR ALL USING (is_super_admin());

CREATE POLICY "Super Admins can manage pending approvals" ON public.pending_approvals
  FOR ALL USING (is_super_admin());

-- Members can submit pending approvals
CREATE POLICY "Members can insert pending approvals" ON public.pending_approvals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User Profiles Access
CREATE POLICY "Users can view all user profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can edit own profile" ON public.user_profiles
  FOR UPDATE USING (user_id = auth.uid()::text OR is_super_admin());

-- ==============================================================================
-- 15. STORAGE BUCKETS SETUP (4 REQUIRED BUCKETS)
-- ==============================================================================
-- 1. family-profiles
-- 2. family-gallery
-- 3. family-documents
-- 4. family-memories
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('family-profiles', 'family-profiles', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('family-gallery', 'family-gallery', true, 26214400, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('family-documents', 'family-documents', false, 26214400, ARRAY['application/pdf', 'image/png', 'image/jpeg']),
  ('family-memories', 'family-memories', true, 26214400, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- Storage Policies
CREATE POLICY "Public can view family profiles" ON storage.objects
  FOR SELECT USING (bucket_id IN ('family-profiles', 'family-gallery', 'family-memories'));

CREATE POLICY "Authenticated users can upload to buckets" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id IN ('family-profiles', 'family-gallery', 'family-documents', 'family-memories')
  );

CREATE POLICY "Super Admin and owners can update/delete storage" ON storage.objects
  FOR ALL USING (
    is_super_admin() OR 
    (bucket_id = 'family-profiles' AND (storage.foldername(name))[1] = auth.uid()::text)
  );

-- ==============================================================================
-- 16. AMBULKAR FAMILY SEED DATA (ALL 19 MEMBERS + 4 BRANCHES + TWINS)
-- ==============================================================================

-- 1. Ambulkar Family
INSERT INTO public.families (id, slug, name, description, logo, origin, location, history, main_founder, status, branches)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'fam_ambulkar',
  'Ambulkar Family',
  'Ancestral Ambulkar lineage rooted in Maharashtra across Pune, Mumbai, and Nagpur.',
  '👑',
  'Maharashtra, India',
  'Pune, Maharashtra',
  'Rooted in Maharashtra, the Ambulkar family stands on the strong foundation laid by Grandfather Maratherao Ambulkar and Grandmother Prabhavathi Ambulkar.',
  'Maratherao & Prabhavathi Ambulkar',
  'public',
  ARRAY['Sudhakar Ambulkar Family', 'Eknath Ambulkar Family', 'Prakash Ambulkar Family', 'Krushana Ambulkar Family']
) ON CONFLICT (id) DO NOTHING;

-- 2. Four Household Branches
INSERT INTO public.family_branches (id, family_id, name, description, color, generation_span)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sudhakar Ambulkar Family', 'Parents of twins Sagar & Dr. Swapnil Ambulkar.', '#6366F1', 'Gen 2 - Gen 3'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Eknath Ambulkar Family', 'Parents of Komal and Sarthak Ambulkar (PVPIT CSE).', '#10B981', 'Gen 2 - Gen 3'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Prakash Ambulkar Family', 'Parents of Dhaneshwari, Sunil, and Mayuri Ambulkar.', '#F59E0B', 'Gen 2 - Gen 3'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Krushana Ambulkar Family', 'Parents of Tushar and Pranali Ambulkar.', '#EC4899', 'Gen 2 - Gen 3')
ON CONFLICT (id) DO NOTHING;

-- 3. Grandparents (Gen 1)
INSERT INTO public.family_members (id, family_id, owner_user_id, name, branch, generation, birth, birthplace, hometown, education, occupation, bio, avatar, achievements, is_twin)
VALUES 
  ('m0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_1', 'Maratherao Ambulkar', 'Grandparents Root', 'Gen 1 (Grandparents)', '1945', 'Maharashtra, India', 'Maharashtra, India', 'Traditional Education', 'Agriculturist & Elder', 'Patriarch of the Ambulkar family, guiding generations with wisdom and integrity.', 'https://placehold.co/150x150/9878FF/FFFFFF?text=MA', ARRAY['Established Ambulkar family foundation'], false),
  ('m0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_2', 'Prabhavathi Ambulkar', 'Grandparents Root', 'Gen 1 (Grandparents)', '1948', 'Maharashtra, India', 'Maharashtra, India', 'Traditional Education', 'Homemaker & Matriarch', 'Matriarch of the Ambulkar family, known for her warmth and leadership.', 'https://placehold.co/150x150/FF9DDA/FFFFFF?text=PA', ARRAY['Kept family united across generations'], false)
ON CONFLICT (id) DO NOTHING;

-- 4. Children and Spouses (Gen 2)
INSERT INTO public.family_members (id, family_id, owner_user_id, name, branch, generation, birth, birthplace, hometown, education, occupation, bio, avatar, is_twin)
VALUES
  ('m0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_3', 'Prakash Ambulkar', 'Prakash Ambulkar Family', 'Gen 2 (Children)', '1970', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Business & Professional', 'Eldest son of Maratherao and Prabhavathi.', 'https://placehold.co/150x150/43DFFF/172033?text=PrA', false),
  ('m0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_4', 'Jyoti Ambulkar', 'Prakash Ambulkar Family', 'Gen 2 (Children)', '1973', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Homemaker & Professional', 'Spouse of Prakash Ambulkar.', 'https://placehold.co/150x150/FF9B32/FFFFFF?text=JA', false),
  ('m0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_5', 'Krushana Ambulkar', 'Krushana Ambulkar Family', 'Gen 2 (Children)', '1972', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Professional & Business', 'Second son of Maratherao and Prabhavathi.', 'https://placehold.co/150x150/78BFFF/FFFFFF?text=KA', false),
  ('m0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_6', 'Bhavana Ambulkar', 'Krushana Ambulkar Family', 'Gen 2 (Children)', '1975', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Homemaker & Professional', 'Spouse of Krushana Ambulkar.', 'https://placehold.co/150x150/FFD66B/172033?text=BA', false),
  ('m0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_7', 'Eknath Ambulkar', 'Eknath Ambulkar Family', 'Gen 2 (Children)', '1975', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Professional & Technical', 'Third son of Maratherao and Prabhavathi.', 'https://placehold.co/150x150/145BFF/FFFFFF?text=EA', false),
  ('m0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_8', 'Savita Ambulkar', 'Eknath Ambulkar Family', 'Gen 2 (Children)', '1978', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Homemaker & Professional', 'Spouse of Eknath Ambulkar.', 'https://placehold.co/150x150/9878FF/FFFFFF?text=SaA', false),
  ('m0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_9', 'Sudhakar Ambulkar', 'Sudhakar Ambulkar Family', 'Gen 2 (Children)', '1978', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Professional & Business', 'Youngest son of Maratherao and Prabhavathi.', 'https://placehold.co/150x150/43DFFF/172033?text=SuA', false),
  ('m0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_10', 'Madhuri Ambulkar', 'Sudhakar Ambulkar Family', 'Gen 2 (Children)', '1981', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Homemaker & Professional', 'Spouse of Sudhakar Ambulkar.', 'https://placehold.co/150x150/FF9DDA/FFFFFF?text=MA2', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Grandchildren (Gen 3) - Including Twins Sagar and Dr. Swapnil
INSERT INTO public.family_members (id, family_id, owner_user_id, name, branch, generation, birth, birthplace, hometown, education, occupation, bio, avatar, achievements, is_twin)
VALUES
  ('m0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_11', 'Dhaneshwari Ambulkar', 'Prakash Ambulkar Family', 'Gen 3 (Grandchildren)', '1995', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Professional', 'Daughter of Prakash and Jyoti Ambulkar.', 'https://placehold.co/150x150/FF9B32/FFFFFF?text=DA', ARRAY['Professional Excellence Award'], false),
  ('m0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_12', 'Sunil Ambulkar', 'Prakash Ambulkar Family', 'Gen 3 (Grandchildren)', '1998', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Professional', 'Son of Prakash and Jyoti Ambulkar.', 'https://placehold.co/150x150/78BFFF/FFFFFF?text=SuN', ARRAY['Business Project Lead'], false),
  ('m0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_13', 'Mayuri Ambulkar', 'Prakash Ambulkar Family', 'Gen 3 (Grandchildren)', '2001', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Professional', 'Daughter of Prakash and Jyoti Ambulkar.', 'https://placehold.co/150x150/FFD66B/172033?text=MyA', ARRAY['Academic Honor'], false),
  ('m0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_14', 'Tushar Ambulkar', 'Krushana Ambulkar Family', 'Gen 3 (Grandchildren)', '1997', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Professional', 'Son of Krushana and Bhavana Ambulkar.', 'https://placehold.co/150x150/145BFF/FFFFFF?text=TA', ARRAY['Technical Leadership'], false),
  ('m0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_15', 'Pranali Ambulkar', 'Krushana Ambulkar Family', 'Gen 3 (Grandchildren)', '2000', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Professional', 'Daughter of Krushana and Bhavana Ambulkar.', 'https://placehold.co/150x150/9878FF/FFFFFF?text=PrA2', ARRAY['University Distinction'], false),
  ('m0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_16', 'Komal Ambulkar', 'Eknath Ambulkar Family', 'Gen 3 (Grandchildren)', '2003', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Professional', 'Daughter of Eknath and Savita Ambulkar.', 'https://placehold.co/150x150/43DFFF/172033?text=KA2', ARRAY['Creative Design Award'], false),
  ('m0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_17', 'Sarthak Ambulkar', 'Eknath Ambulkar Family', 'Gen 3 (Grandchildren)', '2006', 'Maharashtra, India', 'PVPIT Bavdhan, Pune', 'PVPIT Bavdhan, B.Tech CSE (2025-2029)', 'Software Developer & Engineering Student', 'Creator of the FamilySphere platform. Passionate about full-stack engineering, cloud systems, and family legacy.', 'https://placehold.co/150x150/FF9DDA/FFFFFF?text=SA', ARRAY['Built FamilySphere Master Platform', 'Smart India Hackathon Participant'], false),
  ('m0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_18', 'Sagar Ambulkar', 'Sudhakar Ambulkar Family', 'Gen 3 (Grandchildren)', '2002', 'Maharashtra, India', 'Maharashtra, India', 'Graduate', 'Professional', 'Son of Sudhakar and Madhuri Ambulkar. Twin brother of Dr. Swapnil Ambulkar.', 'https://placehold.co/150x150/FF9B32/FFFFFF?text=SgA', ARRAY['Twin Brother to Dr. Swapnil', 'Business Excellence'], true),
  ('m0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'usr_amb_19', 'Dr. Swapnil Ambulkar', 'Sudhakar Ambulkar Family', 'Gen 3 (Grandchildren)', '2002', 'Maharashtra, India', 'Maharashtra, India', 'MBBS, Medical Science', 'Medical Doctor', 'Son of Sudhakar and Madhuri Ambulkar. Twin brother of Sagar Ambulkar. Medical practitioner.', 'https://placehold.co/150x150/78BFFF/FFFFFF?text=DrSA', ARRAY['Twin Brother to Sagar', 'Completed Medical Doctorate / MBBS'], true)
ON CONFLICT (id) DO NOTHING;

-- Link twin brothers Sagar and Dr. Swapnil
UPDATE public.family_members 
SET twin_sibling_id = 'm0000000-0000-0000-0000-000000000019'::uuid
WHERE id = 'm0000000-0000-0000-0000-000000000018'::uuid;

UPDATE public.family_members 
SET twin_sibling_id = 'm0000000-0000-0000-0000-000000000018'::uuid
WHERE id = 'm0000000-0000-0000-0000-000000000019'::uuid;

-- Super Admin User Profile
INSERT INTO public.user_profiles (id, user_id, email, name, role, branch, mobile, email_verified)
VALUES (
  'u0000000-0000-0000-0000-000000000001',
  'usr_sarthak_admin',
  'sarthakambulkar09@gmail.com',
  'Sarthak Ambulkar',
  'super_admin',
  'Eknath Ambulkar Family',
  '+91 98230 11009',
  true
) ON CONFLICT (email) DO NOTHING;

-- Initial Website Settings
INSERT INTO public.website_settings (key, value)
VALUES (
  'main_config',
  '{
    "dynasty_name": "Ambulkar Family Tree",
    "cloud_provider": "Supabase PostgreSQL",
    "supabase_url": "https://vhufjomnmyazzbayfocf.supabase.co",
    "storage_buckets": ["family-profiles", "family-gallery", "family-documents", "family-memories"],
    "realtime_enabled": true
  }'::JSONB
) ON CONFLICT (key) DO NOTHING;
