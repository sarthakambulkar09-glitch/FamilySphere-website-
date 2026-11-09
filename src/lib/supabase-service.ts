import { getSupabaseClient, getSupabaseConfig } from './supabase';

export interface FamilyMemberRecord {
  id: string;
  family_id?: string;
  owner_user_id?: string;
  name: string;
  branch: string;
  generation: string;
  birth?: string;
  death?: string | null;
  birthplace?: string;
  hometown?: string;
  education?: string;
  occupation?: string;
  bio?: string;
  avatar?: string;
  achievements?: string[];
  is_twin?: boolean;
  isTwin?: boolean;
  twinWith?: string;
  twin_sibling_id?: string;
  parents?: string[];
  siblings?: string[];
  spouse?: string | null;
  children?: string[];
  personal_photos?: string[];
  privacy?: 'public' | 'private';
  created_at?: string;
  updated_at?: string;
}

export interface FamilyPhotoRecord {
  id: string;
  family_id?: string;
  album_id?: string;
  title: string;
  description?: string;
  url: string;
  storage_path?: string;
  bucket_name?: string;
  member_id?: string;
  branch?: string;
  date?: string;
  location?: string;
  visibility?: 'public' | 'private';
  uploaded_by?: string;
  created_at?: string;
}

export interface FamilyMemoryRecord {
  id: string;
  family_id?: string;
  title: string;
  description: string;
  year?: string;
  branch?: string;
  media_url: string;
  storage_path?: string;
  bucket_name?: string;
  rotation?: number;
  contributor_name?: string;
  status?: 'approved' | 'pending' | 'archived';
  created_at?: string;
}

export interface PendingApprovalRecord {
  id: string;
  family_id?: string;
  member_id: string;
  requested_by_user_id: string;
  requested_by_name: string;
  branch: string;
  changes: Record<string, { old_value: any; new_value: any }>;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  submitted_at?: string;
}

// -----------------------------------------------------------------------------
// CRUD: 1. getFamilyMembers()
// -----------------------------------------------------------------------------
export async function getFamilyMembers(): Promise<FamilyMemberRecord[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('family_members')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((m: any) => ({
          ...m,
          isTwin: Boolean(m.is_twin || m.isTwin),
          twinWith: m.twin_sibling_id || m.twinWith,
        }));
      }
    } catch (err) {
      console.warn('[Supabase Service] Fallback to server API for members:', err);
    }
  }

  // Fallback to Express backend
  const res = await fetch('/api/members');
  if (!res.ok) throw new Error('Failed to fetch family members');
  return res.json();
}

// -----------------------------------------------------------------------------
// CRUD: 2. addFamilyMember()
// -----------------------------------------------------------------------------
export async function addFamilyMember(member: Partial<FamilyMemberRecord>): Promise<FamilyMemberRecord> {
  const client = getSupabaseClient();
  let supabaseResult: FamilyMemberRecord | null = null;

  if (client) {
    try {
      const payload: any = {
        name: member.name,
        branch: member.branch || 'Eknath Ambulkar Family',
        generation: member.generation || 'Gen 3 (Grandchildren)',
        birth: member.birth || '',
        death: member.death || null,
        birthplace: member.birthplace || 'Maharashtra, India',
        hometown: member.hometown || 'Maharashtra, India',
        education: member.education || 'Graduate',
        occupation: member.occupation || 'Professional',
        bio: member.bio || '',
        avatar: member.avatar || 'https://placehold.co/150x150/9878FF/FFFFFF?text=FM',
        achievements: member.achievements || [],
        is_twin: Boolean(member.is_twin || member.isTwin),
        parents: member.parents || [],
        siblings: member.siblings || [],
        spouse: member.spouse || null,
        children: member.children || [],
        privacy: member.privacy || 'public',
      };

      const { data, error } = await client
        .from('family_members')
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        supabaseResult = {
          ...data,
          isTwin: Boolean(data.is_twin),
        };
      }
    } catch (err) {
      console.warn('[Supabase Service] Supabase insert failed, syncing via server:', err);
    }
  }

  // Always sync with Express server for instant local response and fallback
  const res = await fetch('/api/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });

  if (!res.ok) {
    if (supabaseResult) return supabaseResult;
    throw new Error('Failed to create family member on server');
  }

  const serverResult = await res.json();
  return supabaseResult || serverResult;
}

// -----------------------------------------------------------------------------
// CRUD: 3. updateFamilyMember()
// -----------------------------------------------------------------------------
export async function updateFamilyMember(
  id: string,
  updates: Partial<FamilyMemberRecord>
): Promise<FamilyMemberRecord> {
  const client = getSupabaseClient();
  let supabaseUpdated = false;

  if (client) {
    try {
      const payload: any = { ...updates };
      if (payload.isTwin !== undefined) {
        payload.is_twin = payload.isTwin;
        delete payload.isTwin;
      }
      if (payload.twinWith !== undefined) {
        payload.twin_sibling_id = payload.twinWith;
      }

      const { error } = await client
        .from('family_members')
        .update(payload)
        .eq('id', id);

      if (!error) supabaseUpdated = true;
    } catch (err) {
      console.warn('[Supabase Service] Supabase update warning:', err);
    }
  }

  // Sync to backend
  const res = await fetch(`/api/members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    if (!supabaseUpdated) throw new Error('Failed to update family member');
  }

  return res.json();
}

// -----------------------------------------------------------------------------
// CRUD: 4. deleteFamilyMember() (Super Admin only)
// -----------------------------------------------------------------------------
export async function deleteFamilyMember(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('family_members').delete().eq('id', id);
    } catch (err) {
      console.warn('[Supabase Service] Supabase delete warning:', err);
    }
  }

  const res = await fetch(`/api/members/${id}`, {
    method: 'DELETE',
  });

  return res.ok;
}

// -----------------------------------------------------------------------------
// 5. SUPABASE STORAGE BUCKET UPLOAD
// Buckets:
//   - 'family-profiles'
//   - 'family-gallery'
//   - 'family-documents'
//   - 'family-memories'
// -----------------------------------------------------------------------------
export async function uploadToSupabaseBucket(
  bucket: 'family-profiles' | 'family-gallery' | 'family-documents' | 'family-memories',
  file: File | Blob,
  fileName: string,
  onProgress?: (percent: number) => void
): Promise<{ url: string; path: string }> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = `uploads/${cleanFileName}`;

  if (client && config.isConfigured) {
    if (onProgress) onProgress(25);
    try {
      const { data, error } = await client.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (onProgress) onProgress(75);

      if (error) {
        console.warn(`[Supabase Storage] Upload to bucket '${bucket}' error:`, error.message);
      } else if (data) {
        const { data: publicUrlData } = client.storage
          .from(bucket)
          .getPublicUrl(data.path);

        if (onProgress) onProgress(100);
        return {
          url: publicUrlData.publicUrl,
          path: data.path,
        };
      }
    } catch (storageErr) {
      console.warn('[Supabase Storage] Direct upload failed, falling back:', storageErr);
    }
  }

  // Fallback: Convert to Base64 or Object URL for local/offline preview
  if (onProgress) onProgress(50);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (onProgress) onProgress(100);
      resolve({
        url: (reader.result as string) || URL.createObjectURL(file),
        path: filePath,
      });
    };
    reader.readAsDataURL(file);
  });
}

// -----------------------------------------------------------------------------
// 6. uploadFamilyPhoto()
// -----------------------------------------------------------------------------
export async function uploadFamilyPhoto(
  photoData: Partial<FamilyPhotoRecord>,
  file?: File | Blob
): Promise<FamilyPhotoRecord> {
  let photoUrl = photoData.url || '';
  let storagePath = photoData.storage_path || '';

  if (file) {
    const uploaded = await uploadToSupabaseBucket(
      'family-gallery',
      file,
      (file as File).name || 'family_photo.jpg'
    );
    photoUrl = uploaded.url;
    storagePath = uploaded.path;
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('family_photos')
        .insert({
          title: photoData.title || 'Family Photograph',
          description: photoData.description || '',
          url: photoUrl,
          storage_path: storagePath,
          bucket_name: 'family-gallery',
          branch: photoData.branch || 'All Branches',
          date: photoData.date || new Date().toISOString().split('T')[0],
          location: photoData.location || 'Maharashtra, India',
          visibility: photoData.visibility || 'public',
          uploaded_by: photoData.uploaded_by || 'Family Member',
        })
        .select()
        .single();

      if (!error && data) return data;
    } catch (err) {
      console.warn('[Supabase Service] Photo insert warning:', err);
    }
  }

  // Fallback sync with Express server
  const res = await fetch('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...photoData,
      url: photoUrl,
      storage_path: storagePath,
    }),
  });

  if (!res.ok) throw new Error('Failed to save family photograph');
  return res.json();
}

// -----------------------------------------------------------------------------
// 7. getFamilyPhotos()
// -----------------------------------------------------------------------------
export async function getFamilyPhotos(branch?: string): Promise<FamilyPhotoRecord[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      let query = client.from('family_photos').select('*').order('created_at', { ascending: false });
      if (branch && branch !== 'All Branches') {
        query = query.eq('branch', branch);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('[Supabase Service] Fallback to server API for photos:', err);
    }
  }

  const res = await fetch('/api/photos');
  if (!res.ok) throw new Error('Failed to fetch photos');
  const all = await res.json();
  if (branch && branch !== 'All Branches') {
    return all.filter((p: any) => p.branch === branch);
  }
  return all;
}

// -----------------------------------------------------------------------------
// 8. subscribeToFamilyChanges() (Realtime Synchronization)
// -----------------------------------------------------------------------------
export function subscribeToFamilyChanges(callbacks: {
  onMemberChange?: (payload: any) => void;
  onPhotoChange?: (payload: any) => void;
  onMemoryChange?: (payload: any) => void;
  onApprovalChange?: (payload: any) => void;
}): () => void {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  const channel = client
    .channel('ambulkar-family-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'family_members' },
      (payload) => callbacks.onMemberChange?.(payload)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'family_photos' },
      (payload) => callbacks.onPhotoChange?.(payload)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'family_memories' },
      (payload) => callbacks.onMemoryChange?.(payload)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pending_approvals' },
      (payload) => callbacks.onApprovalChange?.(payload)
    )
    .subscribe((status) => {
      console.log(`[Supabase Realtime] Channel status: ${status}`);
    });

  return () => {
    client.removeChannel(channel);
  };
}

// -----------------------------------------------------------------------------
// 9. BACKUP & EXPORT HELPERS
// -----------------------------------------------------------------------------
export async function exportFamilyDatabaseJson(): Promise<string> {
  const [members, photos] = await Promise.all([
    getFamilyMembers().catch(() => []),
    getFamilyPhotos().catch(() => []),
  ]);

  const backupPayload = {
    exported_at: new Date().toISOString(),
    project: 'Ambulkar Dynasty - FamilySphere',
    supabase_url: 'https://vhufjomnmyazzbayfocf.supabase.co',
    storage_buckets: ['family-profiles', 'family-gallery', 'family-documents', 'family-memories'],
    records_count: {
      members: members.length,
      photos: photos.length,
    },
    data: {
      members,
      photos,
    },
  };

  return JSON.stringify(backupPayload, null, 2);
}
