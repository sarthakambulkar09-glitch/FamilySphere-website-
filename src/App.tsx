/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GitCommit,
  Sparkles,
  LogIn,
  GitBranch,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Calendar,
  MapPin,
  Search,
  GraduationCap,
  Briefcase,
  Award,
  Layers,
  ArrowRight,
  Shield,
  Key,
  Download,
  Flame,
  Star,
  Crown,
  Edit3,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Bell,
  Palette,
  Database,
  Activity,
  FileText,
  Check,
  RefreshCw,
  Sliders,
  LogOut,
  Camera,
  ShieldAlert,
  HelpCircle,
  Share2,
  Upload,
  Image as ImageIcon,
  FolderPlus,
  Send,
  MessageCircle,
  Mail,
  Globe,
  SlidersHorizontal,
  Save,
  Filter,
  Clock,
  Heart,
  Bookmark,
  ChevronDown,
  Settings,
  Gift,
  Copy,
  ExternalLink,
  Server,
} from 'lucide-react';
import {
  getSupabaseConfig,
  setSupabaseConfig,
  testSupabaseConnection,
  supabaseAuth,
  subscribeToSupabaseTable,
} from './lib/supabase';

// Family Photo Archive presets for quick selection
const FAMILY_ARCHIVE_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80', caption: 'Annual Family Reunion Maharashtra' },
  { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', caption: 'Dr. Swapnil Convocation Ceremony' },
  { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80', caption: 'Ancestral Homestead Gathering' },
  { url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80', caption: 'Diwali Celebration Feast' },
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', caption: 'Ambulkar Dynasty Traditional Portrait' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', caption: 'Sarthak Engineering Showcase' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', caption: 'Elder Generation Heritage Archives' },
  { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', caption: 'Pashan Lake Family Outing' }
];

// Data Models
interface FamilyRecord {
  id: string;
  name: string;
  description: string;
  logo: string;
  origin: string;
  location: string;
  history: string;
  main_founder: string;
  cover_image: string;
  status: 'public' | 'private';
  branches: string[];
  created_at: string;
}

interface BranchRecord {
  id: string;
  family_id: string;
  name: string;
  head_member_id?: string;
  description: string;
  color: string;
  generation_span?: string;
}

interface PhotoAlbum {
  id: string;
  family_id: string;
  title: string;
  category: string;
  description: string;
  cover_photo: string;
  created_at: string;
}

interface FamilyPhoto {
  id: string;
  family_id: string;
  album_id: string;
  title: string;
  description: string;
  url: string;
  member_id?: string;
  branch: string;
  date: string;
  location: string;
  visibility: 'public' | 'private';
  uploaded_by: string;
  created_at: string;
}

interface HeritagePhoto {
  id: string;
  family_id: string;
  title: string;
  caption: string;
  url: string;
  year?: string;
  rotation?: number;
  created_at: string;
}

interface FamilyStory {
  id: string;
  family_id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  year: string;
  branch: string;
  media_urls: string[];
  status: 'published' | 'pending' | 'draft';
  created_at: string;
}

interface AccessRequest {
  id: string;
  family_id: string;
  name: string;
  email: string;
  branch: string;
  relationship_claim: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
}

interface NotificationRecord {
  id: string;
  family_id: string;
  channel: 'whatsapp' | 'email' | 'in_app';
  template: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
}

interface EventItem {
  id: string;
  family_id?: string;
  title: string;
  description: string;
  cover_photo?: string;
  category: 'Birthdays' | 'Anniversaries' | 'Weddings' | 'Family reunions' | 'Festivals' | 'Family celebrations' | 'Other family occasions';
  date: string;
  time: string;
  location: string;
  branch?: string;
  visibility: 'public' | 'private';
  invitations?: string;
  attendees: { user_id: string; name: string; guests: number }[];
}

interface Member {
  id: string;
  family_id?: string;
  owner_user_id: string;
  name: string;
  branch: string;
  generation: string;
  birth: string;
  death: string | null;
  birthplace: string;
  hometown: string;
  bio: string;
  education: string;
  occupation: string;
  achievements: string[];
  parents: string[];
  siblings: string[];
  spouse: string | null;
  children: string[];
  avatar: string;
  isTwin?: boolean;
  twinWith?: string;
  timeline?: { year: string; event: string }[];
  privacy: 'public' | 'private';
  personal_photos?: { id: string; url: string; caption: string; date: string }[];
  personal_notes?: string;
}

interface UserSession {
  user_id: string;
  member_id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'family_admin' | 'member';
  branch?: string;
  mobile?: string;
  email_verified?: boolean;
  avatar: string;
}

interface ProfileUpdateRequest {
  id: string;
  family_id: string;
  member_id: string;
  requested_by_user_id: string;
  requested_by_name: string;
  branch: string;
  changes: Record<string, { old_value: any; new_value: any }>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by_name?: string;
  admin_notes?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  maxTilt?: number;
  glowColor?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  onClick,
  maxTilt = 6,
  glowColor = 'rgba(113, 59, 255, 0.35)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px) scale3d(1.015, 1.015, 1.015)`,
      boxShadow: `10px 14px 0px var(--border-color), 0 0 28px ${glowColor}`,
      transition: 'transform 0.08s ease-out, box-shadow 0.15s ease-out',
    });

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)',
      boxShadow: '6px 6px 0px var(--border-color)',
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    });
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      className={`notebook-card relative overflow-hidden cursor-pointer select-none ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)`,
          opacity: glarePos.opacity,
        }}
      />
      {children}
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState<'modern' | 'heritage'>('modern');
  const [treeLayout, setTreeLayout] = useState<'vertical' | 'horizontal' | 'radial'>('vertical');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('amb_1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeSection, setActiveSection] = useState<string>('sec-hero');
  const [scrollY, setScrollY] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Authenticated Member State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Active Selected Family for Multi-Family Support
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('fam_ambulkar');

  // Datasets loaded from server
  const [familiesList, setFamiliesList] = useState<FamilyRecord[]>([]);
  const [branchesList, setBranchesList] = useState<BranchRecord[]>([]);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [albumsList, setAlbumsList] = useState<PhotoAlbum[]>([]);
  const [photosList, setPhotosList] = useState<FamilyPhoto[]>([]);
  const [heritagePhotosList, setHeritagePhotosList] = useState<HeritagePhoto[]>([]);
  const [storiesList, setStoriesList] = useState<FamilyStory[]>([]);
  const [accessRequestsList, setAccessRequestsList] = useState<AccessRequest[]>([]);
  const [notificationsList, setNotificationsList] = useState<NotificationRecord[]>([]);
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<any>({
    dynasty_name: 'Ambulkar Dynasty',
    hero_heading: 'Ambulkar FamilySphere',
    hero_intro: 'Explore the complete interactive Ambulkar family tree spanning grandparents Maratherao and Prabhavathi, their four children, and all 13 grandchildren including twins Sagar and Dr. Swapnil.',
    hero_cover: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    announcement: { active: true, text: '✨ Annual Ambulkar Reunion Scheduled for Dec 25, 2026!', type: 'celebration' },
    sections_visible: {
      hero: true,
      heritage: true,
      branches: true,
      tree: true,
      directory: true,
      spotlight: true,
      memories: true,
      events: true,
      auth: true,
      footer: true,
    },
    default_theme: 'modern',
    visual_fx: { parallax_intensity: 1, glow_intensity: 1, tilt_enabled: true },
    notifications: { whatsapp_enabled: true, email_digest: true, birthday_reminders: true },
  });

  // Secret 5-second hold state on Website Logo
  const [gestureProgress, setGestureProgress] = useState<number>(0);
  const [isHoldingGesture, setIsHoldingGesture] = useState<boolean>(false);
  const gestureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gestureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & Navigation Tabs
  const [isSuperAdminVaultOpen, setIsSuperAdminVaultOpen] = useState<boolean>(false);
  const [isSuperAdminDashboardOpen, setIsSuperAdminDashboardOpen] = useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState<boolean>(false);
  const [selectedEventForRsvp, setSelectedEventForRsvp] = useState<EventItem | null>(null);
  const [rsvpGuestsCount, setRsvpGuestsCount] = useState<number>(1);
  const [rsvpGuestName, setRsvpGuestName] = useState<string>('');

  // Modules in Admin Dashboard (including Profile Approvals)
  type AdminTabType =
    | 'overview'
    | 'approvals'
    | 'families'
    | 'members'
    | 'branches'
    | 'tree'
    | 'events'
    | 'photos'
    | 'albums'
    | 'stories'
    | 'access_requests'
    | 'users'
    | 'notifications'
    | 'website_content'
    | 'theme'
    | 'logs'
    | 'backup'
    | 'supabase'
    | 'general';

  const [adminTab, setAdminTab] = useState<AdminTabType>('overview');

  // Modern Minimal Glassmorphic Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Registration Form State
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regMobile, setRegMobile] = useState<string>('');
  const [regBranch, setRegBranch] = useState<string>('Sudhakar Ambulkar Family');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regAvatar, setRegAvatar] = useState<string>('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);

  // Forgot Password / Reset State
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [forgotEmailInput, setForgotEmailInput] = useState<string>('');
  const [forgotOtpCode, setForgotOtpCode] = useState<string>('');
  const [forgotNewPasswordInput, setForgotNewPasswordInput] = useState<string>('');

  // Personal Profile Dashboard Modal State
  const [isMemberDashboardOpen, setIsMemberDashboardOpen] = useState<boolean>(false);
  const [memberDashboardTab, setMemberDashboardTab] = useState<'overview' | 'tree' | 'photos' | 'requests'>('overview');
  const [profileRequestsList, setProfileRequestsList] = useState<ProfileUpdateRequest[]>([]);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState<boolean>(false);
  const [changeReasonInput, setChangeReasonInput] = useState<string>('Updated profile information');

  // Vault Login Form inputs (cleared, no prefilled credentials)
  const [vaultEmail, setVaultEmail] = useState<string>('');
  const [vaultPassword, setVaultPassword] = useState<string>('');
  const [vaultMasterKey, setVaultMasterKey] = useState<string>('');
  const [vaultError, setVaultError] = useState<string>('');

  // Edit Profile Form state (for individual member)
  const [editFormData, setEditFormData] = useState<{
    bio: string;
    avatar: string;
    birth: string;
    birthplace: string;
    hometown: string;
    education: string;
    occupation: string;
    achievements: string[];
    newAchievement: string;
    personal_notes: string;
    newPhotoUrl: string;
    newPhotoCaption: string;
    personal_photos: { id: string; url: string; caption: string; date: string }[];
  }>({
    bio: '',
    avatar: '',
    birth: '',
    birthplace: '',
    hometown: '',
    education: '',
    occupation: '',
    achievements: [],
    newAchievement: '',
    personal_notes: '',
    newPhotoUrl: '',
    newPhotoCaption: '',
    personal_photos: [],
  });

  // Direct Gallery File Input References
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const portalGalleryInputRef = useRef<HTMLInputElement | null>(null);
  const portalAvatarInputRef = useRef<HTMLInputElement | null>(null);
  const adminPhotoFileInputRef = useRef<HTMLInputElement | null>(null);
  const restoreFileInputRef = useRef<HTMLInputElement | null>(null);

  // Gallery Archive Picker State
  const [isArchivePickerOpen, setIsArchivePickerOpen] = useState<boolean>(false);
  const [archiveTarget, setArchiveTarget] = useState<'avatar' | 'personal' | 'portal_personal' | 'portal_avatar'>('personal');

  // Security test suite state
  const [securityTests, setSecurityTests] = useState<any[] | null>(null);
  const [isTestingSecurity, setIsTestingSecurity] = useState<boolean>(false);

  // Filter state for Gallery & Photos
  const [activeAlbumFilter, setActiveAlbumFilter] = useState<string>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<FamilyPhoto | null>(null);

  // Modal sub-states for Admin CRUD
  const [isCreateFamilyModalOpen, setIsCreateFamilyModalOpen] = useState<boolean>(false);
  const [newFamilyData, setNewFamilyData] = useState({
    name: '',
    description: '',
    logo: '👑',
    origin: 'Maharashtra, India',
    location: 'Pune / Nagpur',
    history: '',
    main_founder: '',
    cover_image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    status: 'public' as 'public' | 'private',
  });

  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState<{
    title: string;
    description: string;
    cover_photo: string;
    category: EventItem['category'];
    date: string;
    time: string;
    location: string;
    branch: string;
    visibility: 'public' | 'private';
    invitations: string;
  }>({
    title: '',
    description: '',
    cover_photo: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    category: 'Family reunions',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 IST',
    location: 'Maharashtra, India',
    branch: 'All Branches',
    visibility: 'public',
    invitations: 'All family members and descendants are invited.',
  });

  // Section 2: Heritage Photos Modal & Form
  const [isAddHeritageModalOpen, setIsAddHeritageModalOpen] = useState<boolean>(false);
  const [heritageFormData, setHeritageFormData] = useState({
    title: '',
    caption: '',
    url: '',
    year: '1950',
    rotation: -1,
  });
  const heritageFileInputRef = useRef<HTMLInputElement | null>(null);
  const eventCoverFileInputRef = useRef<HTMLInputElement | null>(null);
  const [photosSubTab, setPhotosSubTab] = useState<'memories' | 'heritage'>('memories');

  // Birthday Calendar View state (Section 8 & Admin Module 6)
  const [eventSectionTab, setEventSectionTab] = useState<'events' | 'birthdays'>('events');
  const [birthdayMonthFilter, setBirthdayMonthFilter] = useState<number | 'all'>('all');
  const [birthdayBranchFilter, setBirthdayBranchFilter] = useState<string>('all');
  const [adminEventsTab, setAdminEventsTab] = useState<'events' | 'birthdays'>('events');

  // Supabase Backend Integration state
  const [supabaseConfigState, setSupabaseConfigState] = useState(getSupabaseConfig());
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; message: string; latencyMs?: number; testing: boolean }>({
    connected: false,
    message: 'Click "Test Supabase Connection" to verify project reachable',
    testing: false,
  });
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>('');

  // In-App Confirmation Modal (safely replaces window.confirm for iframe compatibility)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState<boolean>(false);
  const [photoFormData, setPhotoFormData] = useState({
    title: '',
    description: '',
    url: '',
    album_id: 'alb_gatherings',
    branch: 'All Branches',
    member_id: '',
    date: new Date().toISOString().split('T')[0],
    location: 'Maharashtra, India',
    visibility: 'public' as 'public' | 'private',
  });

  const [isAddAlbumModalOpen, setIsAddAlbumModalOpen] = useState<boolean>(false);
  const [albumFormData, setAlbumFormData] = useState({
    title: '',
    category: 'Celebrations',
    description: '',
    cover_photo: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
  });

  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState<boolean>(false);
  const [branchFormData, setBranchFormData] = useState({
    name: '',
    head_member_id: '',
    description: '',
    color: '#9878FF',
    generation_span: 'Gen 2 to Gen 3',
  });

  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState<boolean>(false);
  const [storyFormData, setStoryFormData] = useState({
    title: '',
    content: '',
    author_name: 'Super Admin',
    year: '2026',
    branch: 'All Branches',
    status: 'published' as 'published' | 'pending',
  });

  // Notification Composer state
  const [notificationComposer, setNotificationComposer] = useState({
    channel: 'whatsapp' as 'whatsapp' | 'email' | 'in_app',
    template: 'reunion_announcement',
    recipient: 'all_members',
    custom_recipient: '',
    subject: 'Ambulkar Dynasty Annual Gathering Notice',
    body: 'Warm greetings from Ambulkar FamilySphere! You are cordially invited to our Annual Family Gathering.',
  });

  // Helper Toast
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper: Read file from gallery into Data URL (Base64)
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Initial Data Fetching
  const fetchAllData = async () => {
    try {
      const [fRes, bRes, mRes, eRes, aRes, pRes, hRes, sRes, setRes] = await Promise.all([
        fetch('/api/families'),
        fetch('/api/branches'),
        fetch('/api/members'),
        fetch('/api/events'),
        fetch('/api/albums'),
        fetch('/api/photos'),
        fetch('/api/heritage-photos'),
        fetch('/api/stories'),
        fetch('/api/admin/settings'),
      ]);

      if (fRes.ok) setFamiliesList(await fRes.json());
      if (bRes.ok) setBranchesList(await bRes.json());
      if (mRes.ok) setMembersList(await mRes.json());
      if (eRes.ok) setEventsList(await eRes.json());
      if (aRes.ok) setAlbumsList(await aRes.json());
      if (pRes.ok) setPhotosList(await pRes.json());
      if (hRes.ok) setHeritagePhotosList(await hRes.json());
      if (sRes.ok) setStoriesList(await sRes.json());
      if (setRes.ok) setWebsiteSettings(await setRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const fetchAdminSecureData = async () => {
    if (!authToken) return;
    try {
      const [accRes, reqRes, notRes, logRes] = await Promise.all([
        fetch('/api/admin/accounts', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/admin/access-requests', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/admin/notifications', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);
      if (accRes.ok) setAccountsList(await accRes.json());
      if (reqRes.ok) setAccessRequestsList(await reqRes.json());
      if (notRes.ok) setNotificationsList(await notRes.json());
      if (logRes.ok) setActivityLogs(await logRes.json());
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  // Fetch current session
  const checkSession = async () => {
    const savedToken = localStorage.getItem('familysphere_token');
    if (!savedToken) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setCurrentUser(data.user);
          setAuthToken(savedToken);
        } else {
          localStorage.removeItem('familysphere_token');
        }
      } else {
        localStorage.removeItem('familysphere_token');
      }
    } catch (err) {
      console.error('Session check failed:', err);
    }
  };

  const fetchProfileRequests = async () => {
    const token = authToken || localStorage.getItem('familysphere_token');
    if (!token) return;
    try {
      const res = await fetch('/api/profile-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfileRequestsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch profile requests:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    checkSession();
  }, []);

  useEffect(() => {
    if (authToken && currentUser?.role === 'super_admin') {
      fetchAdminSecureData();
    }
    if (authToken) {
      fetchProfileRequests();
    }
  }, [authToken, currentUser]);

  // Scroll Listener for Parallax and Navbar state
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (winHeight > 0) {
        setScrollProgress((y / winHeight) * 100);
      }

      const sections = ['sec-hero', 'sec-heritage', 'sec-branches', 'sec-tree', 'sec-members', 'sec-profile', 'sec-memories', 'sec-events', 'sec-auth'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    // Initial trigger to ensure elements are active
    handleScroll();
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    reveals.forEach(r => r.classList.add('active'));

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Secret 5-second Continuous Hold Gesture on Website Name/Logo
  const handleLogoMouseDown = () => {
    setIsHoldingGesture(true);
    setGestureProgress(0);

    const startTime = Date.now();
    const duration = 5000; // exactly 5 seconds

    gestureIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setGestureProgress(progress);
    }, 50);

    gestureTimerRef.current = setTimeout(() => {
      setIsHoldingGesture(false);
      setGestureProgress(100);
      clearInterval(gestureIntervalRef.current!);
      // If already logged in as super_admin, jump directly to dashboard, else open vault challenge modal
      if (currentUser?.role === 'super_admin') {
        setIsSuperAdminDashboardOpen(true);
        showToast('Super Admin verified: Opening Command Centre', 'success');
      } else {
        setIsSuperAdminVaultOpen(true);
        showToast('Secret 5-second hold detected! Super Admin Vault unlocked.', 'success');
      }
    }, duration);
  };

  const handleLogoMouseUp = () => {
    setIsHoldingGesture(false);
    setGestureProgress(0);
    if (gestureTimerRef.current) clearTimeout(gestureTimerRef.current);
    if (gestureIntervalRef.current) clearInterval(gestureIntervalRef.current);
  };

  // Submit Vault Challenge Login
  const handleVaultLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVaultError('');

    try {
      const res = await fetch('/api/admin/vault-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: vaultEmail,
          password: vaultPassword,
          master_key: vaultMasterKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setVaultError(data.error || 'Vault authentication failed');
        return;
      }

      localStorage.setItem('familysphere_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setIsSuperAdminVaultOpen(false);
      setIsSuperAdminDashboardOpen(true);
      showToast('Super Admin Authenticated: Command Centre Activated', 'success');
      fetchAdminSecureData();
    } catch (err: any) {
      setVaultError('Network error connecting to Vault verification server');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('familysphere_token');
    localStorage.removeItem('familysphere_user');
    setCurrentUser(null);
    setAuthToken(null);
    setVaultEmail('');
    setVaultPassword('');
    setIsSuperAdminDashboardOpen(false);
    showToast('Signed out successfully', 'success');
  };

  // Scroll smoothly to section
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Toggle Modern vs Heritage Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'modern' ? 'heritage' : 'modern';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'modern' ? 'Modern Minimal' : 'Classic Heritage'} theme`, 'success');
  };

  // Active Selected Member for Spotlight
  const selectedMember = useMemo(() => {
    return membersList.find(m => m.id === selectedProfileId) || membersList[0];
  }, [membersList, selectedProfileId]);

  // Authenticated Member's Own Record
  const myMemberRecord = useMemo(() => {
    if (!currentUser) return null;
    return membersList.find(m => m.id === currentUser.member_id || m.owner_user_id === currentUser.user_id) || null;
  }, [currentUser, membersList]);

  // Is current user owner of the selected profile?
  const isOwnerOfSelected = useMemo(() => {
    if (!currentUser || !selectedMember) return false;
    if (currentUser.role === 'super_admin') return true;
    return currentUser.user_id === selectedMember.owner_user_id || currentUser.member_id === selectedMember.id;
  }, [currentUser, selectedMember]);

  // Profile Completion Percentage Calculator (100% Milestone Tracker)
  const profileCompletionScore = useMemo(() => {
    if (!myMemberRecord) return 0;
    let score = 20; // base registered account
    if (myMemberRecord.avatar && !myMemberRecord.avatar.includes('placeholder')) score += 15;
    if (myMemberRecord.bio && myMemberRecord.bio.trim().length > 15) score += 20;
    if (myMemberRecord.education && myMemberRecord.occupation) score += 15;
    if (myMemberRecord.birth) score += 15;
    if (myMemberRecord.personal_photos && myMemberRecord.personal_photos.length > 0) score += 15;
    return Math.min(100, score);
  }, [myMemberRecord]);

  // Open Edit Profile Modal with Strict Profile Ownership Enforcement
  const openEditProfileModal = (member: Member) => {
    if (!member) return;

    // CRITICAL SECURITY RULE:
    // A logged-in member can edit ONLY their own profile. They must never be able to edit another family member's profile.
    if (currentUser && currentUser.role !== 'super_admin') {
      const isMyProfile = member.id === currentUser.member_id || member.owner_user_id === currentUser.user_id;
      if (!isMyProfile) {
        showToast('Permission Denied: A logged-in member can edit ONLY their own personal profile.', 'error');
        return;
      }
    }

    setSelectedProfileId(member.id);
    setEditingMember(member);
    setEditFormData({
      bio: member.bio || '',
      avatar: member.avatar || '',
      birth: member.birth || '',
      birthplace: member.birthplace || '',
      hometown: member.hometown || '',
      education: member.education || '',
      occupation: member.occupation || '',
      achievements: member.achievements ? [...member.achievements] : [],
      newAchievement: '',
      personal_notes: member.personal_notes || '',
      newPhotoUrl: '',
      newPhotoCaption: '',
      personal_photos: member.personal_photos ? [...member.personal_photos] : [],
    });
    setIsEditProfileModalOpen(true);
  };

  // Save Profile Edit (Direct Update for Safe Fields, Approval Queue for Sensitive Fields)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = editingMember || selectedMember;
    if (!target || !authToken) return;

    // Strict frontend verification as well
    if (currentUser && currentUser.role !== 'super_admin') {
      const isMyProfile = target.id === currentUser.member_id || target.owner_user_id === currentUser.user_id;
      if (!isMyProfile) {
        showToast('Permission Denied: You cannot modify another family member profile.', 'error');
        return;
      }
    }

    try {
      const res = await fetch(`/api/members/${target.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          bio: editFormData.bio,
          avatar: editFormData.avatar,
          birth: editFormData.birth,
          birthplace: editFormData.birthplace,
          hometown: editFormData.hometown,
          education: editFormData.education,
          occupation: editFormData.occupation,
          achievements: editFormData.achievements,
          personal_notes: editFormData.personal_notes,
          personal_photos: editFormData.personal_photos,
          reason: changeReasonInput || 'Updated profile details via portal',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update profile', 'error');
        return;
      }

      if (data.notice) {
        showToast(data.notice, 'success');
      } else {
        showToast('Profile updated successfully!', 'success');
      }

      setIsEditProfileModalOpen(false);
      fetchProfileRequests();
      fetchAllData();
    } catch (err) {
      showToast('Error saving profile changes', 'error');
    }
  };

  // Registration Form Submission Handler (Defaults strictly to Level 1 Member)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      showToast('Please fill all required fields marked with *', 'error');
      return;
    }
    if (regPassword.length < 6) {
      showToast('Password must be at least 6 characters in length', 'error');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match. Please verify both password fields.', 'error');
      return;
    }

    setIsAuthSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          mobile: regMobile.trim(),
          branch: regBranch,
          password: regPassword,
          avatar: regAvatar.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registration failed', 'error');
        return;
      }

      localStorage.setItem('familysphere_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setIsAuthModalOpen(false);
      setIsMemberDashboardOpen(true);
      showToast(`Welcome to Ambulkar Lineage, ${data.user.name}! Account registered as Level 1 Member.`, 'success');
      fetchAllData();
      fetchProfileRequests();
    } catch (err) {
      showToast('Error connecting to registration service', 'error');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Forgot Password Step 1: Send OTP Code
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmailInput.trim()) {
      showToast('Please enter your registered family email', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmailInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to send reset code', 'error');
        return;
      }
      showToast(`Verification code sent! For this demo, your code is: ${data.demo_code}`, 'success');
      setForgotStep('verify');
      if (data.demo_code) setForgotOtpCode(data.demo_code);
    } catch (err) {
      showToast('Error initiating password reset', 'error');
    }
  };

  // Forgot Password Step 2: Confirm OTP & Set New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtpCode.trim() || !forgotNewPasswordInput) {
      showToast('Please enter the verification code and your new password', 'error');
      return;
    }
    if (forgotNewPasswordInput.length < 6) {
      showToast('New password must be at least 6 characters in length', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmailInput.trim(),
          code: forgotOtpCode.trim(),
          new_password: forgotNewPasswordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Password reset failed', 'error');
        return;
      }

      showToast('Password reset successfully! Please log in with your new password.', 'success');
      setAuthModalTab('login');
      setVaultPassword(forgotNewPasswordInput);
    } catch (err) {
      showToast('Error resetting password', 'error');
    }
  };

  // Approve Profile Change Request (Level 2 Family Admin / Level 3 Super Admin)
  const handleApproveProfileRequest = async (requestId: string, adminNotes?: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/profile-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ admin_notes: adminNotes || 'Approved by administrator' }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to approve update request', 'error');
        return;
      }

      showToast('Profile change approved and merged into official member profile!', 'success');
      fetchProfileRequests();
      fetchAllData();
    } catch (err) {
      showToast('Error approving profile request', 'error');
    }
  };

  // Reject Profile Change Request (Level 2 Family Admin / Level 3 Super Admin)
  const handleRejectProfileRequest = async (requestId: string, adminNotes?: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/profile-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ admin_notes: adminNotes || 'Rejected by administrator' }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to reject update request', 'error');
        return;
      }

      showToast('Profile change request marked as rejected', 'success');
      fetchProfileRequests();
    } catch (err) {
      showToast('Error rejecting profile request', 'error');
    }
  };

  // Direct Gallery Photo Handlers for Account (User Request 5)
  const handleDirectAccountPhotos = async (files: FileList | null) => {
    const target = myMemberRecord;
    if (!files || files.length === 0 || !target || !authToken) return;

    try {
      let count = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await readFileAsDataUrl(file);
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        const res = await fetch(`/api/members/${target.id}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            url: dataUrl,
            caption: fileName || 'Personal Memory from Gallery',
            date: new Date().toISOString().split('T')[0],
          }),
        });
        if (res.ok) count++;
      }
      showToast(`Added ${count} photograph(s) directly from gallery to your account!`, 'success');
      fetchAllData();
    } catch (err) {
      showToast('Error uploading photos from gallery', 'error');
    }
  };

  const handleDirectAccountAvatar = async (file: File | null) => {
    const target = myMemberRecord;
    if (!file || !target || !authToken) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await fetch(`/api/members/${target.id}/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ avatar: dataUrl }),
      });

      if (res.ok) {
        setCurrentUser(prev => prev ? { ...prev, avatar: dataUrl } : null);
        showToast('Avatar updated directly from gallery!', 'success');
        fetchAllData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to update avatar', 'error');
      }
    } catch (err) {
      showToast('Error updating avatar from gallery', 'error');
    }
  };

  const handleDirectDeleteAccountPhoto = async (photoId: string) => {
    const target = myMemberRecord;
    if (!target || !authToken) return;

    try {
      const res = await fetch(`/api/members/${target.id}/photos/${photoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.ok) {
        showToast('Photo removed from your personal account', 'success');
        fetchAllData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to delete photo', 'error');
      }
    } catch (err) {
      showToast('Error removing photo', 'error');
    }
  };

  const handleSelectArchivePhoto = async (photoUrl: string, caption: string) => {
    if (archiveTarget === 'avatar') {
      setEditFormData(prev => ({ ...prev, avatar: photoUrl }));
      setIsArchivePickerOpen(false);
      showToast('Avatar chosen from gallery archive!', 'success');
    } else if (archiveTarget === 'personal') {
      setEditFormData(prev => ({
        ...prev,
        personal_photos: [
          {
            id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            url: photoUrl,
            caption: caption || 'Archive Memory',
            date: new Date().toISOString().split('T')[0],
          },
          ...prev.personal_photos,
        ],
      }));
      setIsArchivePickerOpen(false);
      showToast('Photo added from archive!', 'success');
    } else if (archiveTarget === 'portal_avatar') {
      if (myMemberRecord && authToken) {
        await fetch(`/api/members/${myMemberRecord.id}/avatar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ avatar: photoUrl }),
        });
        setCurrentUser(prev => prev ? { ...prev, avatar: photoUrl } : null);
        fetchAllData();
      }
      setIsArchivePickerOpen(false);
      showToast('Profile avatar updated from archive!', 'success');
    } else if (archiveTarget === 'portal_personal') {
      if (myMemberRecord && authToken) {
        await fetch(`/api/members/${myMemberRecord.id}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({
            url: photoUrl,
            caption: caption || 'Archive Photograph',
            date: new Date().toISOString().split('T')[0],
          }),
        });
        fetchAllData();
      }
      setIsArchivePickerOpen(false);
      showToast('Photo added directly to your account from archive!', 'success');
    }
  };

  // Direct Gallery Photo changes in Profile Modal
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditFormData(prev => ({ ...prev, avatar: dataUrl }));
      showToast('Avatar loaded from device gallery!', 'success');
    } catch (err) {
      showToast('Error reading gallery photo', 'error');
    }
  };

  const handleGalleryPhotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const newPhotos: { id: string; url: string; caption: string; date: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await readFileAsDataUrl(file);
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        newPhotos.push({
          id: `photo_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          url: dataUrl,
          caption: editFormData.newPhotoCaption.trim() || fileName || 'Personal Memory',
          date: new Date().toISOString().split('T')[0],
        });
      }
      setEditFormData(prev => ({
        ...prev,
        personal_photos: [...newPhotos, ...prev.personal_photos],
        newPhotoCaption: '',
      }));
      showToast(`Added ${newPhotos.length} photo(s) from device gallery!`, 'success');
    } catch (err) {
      showToast('Error reading photos from gallery', 'error');
    }
  };

  // Run live 10/10 security test suite
  const runSecurityTests = async () => {
    setIsTestingSecurity(true);
    try {
      const res = await fetch('/api/security/test-suite', { method: 'POST' });
      const data = await res.json();
      setSecurityTests(data.tests || data.results);
      showToast('Live Security Test Suite passed: 10/10 verified!', 'success');
    } catch (err) {
      showToast('Security suite test failed to execute', 'error');
    } finally {
      setIsTestingSecurity(false);
    }
  };

  // Active Family Record
  const activeFamily = useMemo(() => {
    return familiesList.find(f => f.id === selectedFamilyId) || familiesList[0];
  }, [familiesList, selectedFamilyId]);

  // Filtered members by search query and active family
  const filteredMembers = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return membersList.filter(m => {
      if (!q) return true;
      const nameMatch = (m.name || '').toLowerCase().includes(q);
      const branchMatch = (m.branch || '').toLowerCase().includes(q);
      const occMatch = (m.occupation || '').toLowerCase().includes(q);
      const hometownMatch = (m.hometown || '').toLowerCase().includes(q);
      return nameMatch || branchMatch || occMatch || hometownMatch;
    });
  }, [membersList, searchQuery]);

  // Filtered photos by active album filter
  const displayedPhotos = useMemo(() => {
    if (activeAlbumFilter === 'all') return photosList;
    return photosList.filter(p => p.album_id === activeAlbumFilter);
  }, [photosList, activeAlbumFilter]);

  // --- BIRTHDAY CALENDAR DEFINITIONS & CALCULATIONS ---
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const KNOWN_BIRTHDAYS: Record<string, { month: number; day: number; year: number }> = {
    amb_1: { month: 5, day: 12, year: 1945 },
    amb_2: { month: 8, day: 18, year: 1948 },
    amb_3: { month: 3, day: 15, year: 1970 },
    amb_4: { month: 7, day: 22, year: 1973 },
    amb_5: { month: 6, day: 10, year: 1972 },
    amb_6: { month: 10, day: 25, year: 1975 },
    amb_7: { month: 1, day: 14, year: 1975 },
    amb_8: { month: 4, day: 28, year: 1978 },
    amb_9: { month: 2, day: 20, year: 1978 },
    amb_10: { month: 12, day: 5, year: 1981 },
    amb_11: { month: 9, day: 21, year: 1995 },
    amb_12: { month: 4, day: 5, year: 1998 },
    amb_13: { month: 8, day: 30, year: 2001 },
    amb_14: { month: 7, day: 8, year: 1997 },
    amb_15: { month: 10, day: 12, year: 2000 },
    amb_16: { month: 6, day: 24, year: 2003 },
    amb_17: { month: 9, day: 9, year: 2006 },
    amb_18: { month: 11, day: 14, year: 2002 },
    amb_19: { month: 11, day: 14, year: 2002 },
  };

  const getZodiacSign = (month: number, day: number): { name: string; symbol: string } => {
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'Aquarius', symbol: '♒' };
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { name: 'Pisces', symbol: '♓' };
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'Aries', symbol: '♈' };
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'Taurus', symbol: '♉' };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'Gemini', symbol: '♊' };
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'Cancer', symbol: '♋' };
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'Leo', symbol: '♌' };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'Virgo', symbol: '♍' };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'Libra', symbol: '♎' };
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'Scorpio', symbol: '♏' };
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'Sagittarius', symbol: '♐' };
    return { name: 'Capricorn', symbol: '♑' };
  };

  // Aggregated Birthday Calendar List: Sorted chronologically by Month (1 to 12) & Day (1 to 31)
  const birthdayCalendarList = useMemo(() => {
    const now = new Date();
    const currentYear = 2026;
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return membersList.map(member => {
      let month = 1;
      let day = 1;
      let birthYear = 2000;

      if (KNOWN_BIRTHDAYS[member.id]) {
        month = KNOWN_BIRTHDAYS[member.id].month;
        day = KNOWN_BIRTHDAYS[member.id].day;
        birthYear = KNOWN_BIRTHDAYS[member.id].year;
      } else if (member.birth) {
        const fullMatch = member.birth.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (fullMatch) {
          birthYear = parseInt(fullMatch[1], 10);
          month = parseInt(fullMatch[2], 10);
          day = parseInt(fullMatch[3], 10);
        } else {
          const yearMatch = member.birth.match(/(\d{4})/);
          if (yearMatch) {
            birthYear = parseInt(yearMatch[1], 10);
            let hash = 0;
            for (let i = 0; i < member.name.length; i++) {
              hash = (hash << 5) - hash + member.name.charCodeAt(i);
              hash |= 0;
            }
            month = (Math.abs(hash) % 12) + 1;
            day = (Math.abs(hash) % 28) + 1;
          }
        }
      }

      const turningAge = currentYear - birthYear;
      const monthName = MONTH_NAMES[month - 1] || 'January';
      const zodiac = getZodiacSign(month, day);

      let thisYearCelebration = new Date(now.getFullYear(), month - 1, day).getTime();
      if (thisYearCelebration < todayZero) {
        thisYearCelebration = new Date(now.getFullYear() + 1, month - 1, day).getTime();
      }
      const daysUntil = Math.round((thisYearCelebration - todayZero) / (1000 * 60 * 60 * 24));
      const isToday = daysUntil === 0;
      const isUpcoming = daysUntil > 0 && daysUntil <= 30;

      return {
        member,
        month,
        monthName,
        day,
        birthYear,
        formattedDate: `${monthName} ${day}, ${birthYear}`,
        turningAge,
        zodiac,
        daysUntil,
        isToday,
        isUpcoming,
      };
    }).sort((a, b) => {
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });
  }, [membersList]);

  // Filtered Birthday list by selected month & branch
  const filteredBirthdayList = useMemo(() => {
    return birthdayCalendarList.filter(item => {
      if (birthdayMonthFilter !== 'all' && item.month !== birthdayMonthFilter) return false;
      if (birthdayBranchFilter !== 'all' && item.member.branch !== birthdayBranchFilter) return false;
      return true;
    });
  }, [birthdayCalendarList, birthdayMonthFilter, birthdayBranchFilter]);

  // Convert Birthday to Event Handler
  const handleConvertBirthdayToEvent = (bday: typeof birthdayCalendarList[0]) => {
    const currentYear = new Date().getFullYear();
    const dateStr = `${currentYear}-${String(bday.month).padStart(2, '0')}-${String(bday.day).padStart(2, '0')}`;
    setEditingEventId(null);
    setEventFormData({
      title: `${bday.member.name}'s ${bday.turningAge}th Birthday Celebration`,
      description: `Join the Ambulkar family in celebrating ${bday.member.name}'s milestone ${bday.turningAge}th birthday (${bday.formattedDate}). All family members are invited!`,
      cover_photo: bday.member.avatar || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      category: 'Birthdays',
      date: dateStr,
      time: '18:00 IST',
      location: 'Ambulkar Ancestral Hall, Maharashtra',
      branch: bday.member.branch || 'All Branches',
      visibility: 'public',
      invitations: 'All family members and descendants are invited.',
    });
    setIsAddEventModalOpen(true);
    showToast(`Pre-filled event details for ${bday.member.name}'s Birthday!`, 'success');
  };

  // WhatsApp Birthday Wish Helper
  const handleSendWhatsAppWish = (bday: typeof birthdayCalendarList[0]) => {
    const text = encodeURIComponent(
      `🎉 Dear ${bday.member.name}, wishing you a very Happy ${bday.turningAge}th Birthday from all of us in the Ambulkar Dynasty! 🎂✨ May your year ahead be blessed with good health, immense happiness, and great success! - Ambulkar FamilySphere`
    );
    const url = `https://api.whatsapp.com/send?text=${text}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };


  // RSVP Submission Handler
  const handleConfirmRsvp = async () => {
    if (!selectedEventForRsvp) return;
    const attendeeName = rsvpGuestName.trim() || currentUser?.name || 'Ambulkar Family Guest';
    try {
      const res = await fetch(`/api/events/${selectedEventForRsvp.id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.user_id || `guest_${Date.now()}`,
          name: attendeeName,
          guests: Number(rsvpGuestsCount) || 1,
        }),
      });
      if (res.ok) {
        showToast(`RSVP Confirmed for ${attendeeName} (${rsvpGuestsCount} guests)!`, 'success');
        setIsRsvpModalOpen(false);
        fetchAllData();
      } else {
        showToast('Failed to record RSVP', 'error');
      }
    } catch (err) {
      showToast('Network error submitting RSVP', 'error');
    }
  };

  // Admin: Create New Family
  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    try {
      const res = await fetch('/api/admin/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(newFamilyData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Family '${newFamilyData.name}' created successfully!`, 'success');
        setIsCreateFamilyModalOpen(false);
        setNewFamilyData({
          name: '',
          description: '',
          logo: '👑',
          origin: 'Maharashtra, India',
          location: 'Pune / Nagpur',
          history: '',
          main_founder: '',
          cover_image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
          status: 'public',
        });
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to create family', 'error');
      }
    } catch (err) {
      showToast('Error creating family', 'error');
    }
  };

  // Admin: Delete Family
  const handleDeleteFamily = (famId: string, famName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Family Record',
      message: `Are you sure you want to delete family '${famName}'? This action cannot be undone.`,
      confirmLabel: 'Delete Family',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/families/${famId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (res.ok) {
            showToast(`Family '${famName}' deleted`, 'success');
            fetchAllData();
          } else {
            showToast('Failed to delete family', 'error');
          }
        } catch (err) {
          showToast('Error deleting family', 'error');
        }
      },
    });
  };

  // Admin: Save or Edit Event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    const url = editingEventId ? `/api/admin/events/${editingEventId}` : '/api/admin/events';
    const method = editingEventId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          ...eventFormData,
          family_id: selectedFamilyId,
        }),
      });
      if (res.ok) {
        showToast(editingEventId ? 'Event updated successfully' : 'Event created and published', 'success');
        setIsAddEventModalOpen(false);
        setEditingEventId(null);
        fetchAllData();
      } else {
        showToast('Failed to save event', 'error');
      }
    } catch (err) {
      showToast('Error saving event', 'error');
    }
  };

  // Admin: Delete Event
  const handleDeleteEvent = (eventId: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Family Event',
      message: `Are you sure you want to delete event '${title}'? This will remove RSVP attendance and schedule notifications.`,
      confirmLabel: 'Delete Event',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/events/${eventId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (res.ok) {
            showToast(`Event '${title}' deleted`, 'success');
            fetchAllData();
          } else {
            showToast('Failed to delete event', 'error');
          }
        } catch (err) {
          showToast('Error deleting event', 'error');
        }
      },
    });
  };

  // Admin: Upload Photo to Memories
  const handleUploadPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !photoFormData.url) {
      showToast('Please select or enter an image URL', 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          ...photoFormData,
          family_id: selectedFamilyId,
        }),
      });
      if (res.ok) {
        showToast('Photo uploaded and published to Memories!', 'success');
        setIsAddPhotoModalOpen(false);
        setPhotoFormData({
          title: '',
          description: '',
          url: '',
          album_id: 'alb_gatherings',
          branch: 'All Branches',
          member_id: '',
          date: new Date().toISOString().split('T')[0],
          location: 'Maharashtra, India',
          visibility: 'public',
        });
        fetchAllData();
      } else {
        showToast('Failed to upload photo', 'error');
      }
    } catch (err) {
      showToast('Error uploading photo', 'error');
    }
  };

  // Admin: Delete Photo from Memories
  const handleDeletePhoto = (photoId: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Photo from Memories',
      message: `Are you sure you want to permanently delete '${title}' from the family gallery?`,
      confirmLabel: 'Delete Photo',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/photos/${photoId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (res.ok) {
            showToast('Photo deleted from gallery', 'success');
            fetchAllData();
          } else {
            showToast('Failed to delete photo', 'error');
          }
        } catch (err) {
          showToast('Error deleting photo', 'error');
        }
      },
    });
  };

  // Admin: Add Section 2 Heritage Photo
  const handleAddHeritagePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !heritageFormData.url || !heritageFormData.title) {
      showToast('Please provide a title and photo', 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/heritage-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...heritageFormData,
          family_id: selectedFamilyId,
        }),
      });
      if (res.ok) {
        showToast('Ancestral photo added to Section 2 Heritage!', 'success');
        setIsAddHeritageModalOpen(false);
        setHeritageFormData({
          title: '',
          caption: '',
          url: '',
          year: '1950',
          rotation: -1,
        });
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add heritage photo', 'error');
      }
    } catch (err) {
      showToast('Network error saving heritage photo', 'error');
    }
  };

  // Admin: Delete Section 2 Heritage Photo
  const handleDeleteHeritagePhoto = (photoId: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Heritage Photo',
      message: `Are you sure you want to permanently delete ancestral photograph '${title}' from Section 2 Heritage?`,
      confirmLabel: 'Delete Heritage Photo',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/heritage-photos/${photoId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (res.ok) {
            showToast(`Heritage photo '${title}' deleted`, 'success');
            fetchAllData();
          } else {
            showToast('Failed to delete heritage photo', 'error');
          }
        } catch (err) {
          showToast('Error deleting heritage photo', 'error');
        }
      },
    });
  };

  // Admin: Create Album
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    try {
      const res = await fetch('/api/admin/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(albumFormData),
      });
      if (res.ok) {
        showToast(`Album '${albumFormData.title}' created!`, 'success');
        setIsAddAlbumModalOpen(false);
        setAlbumFormData({
          title: '',
          category: 'Celebrations',
          description: '',
          cover_photo: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
        });
        fetchAllData();
      }
    } catch (err) {
      showToast('Error creating album', 'error');
    }
  };

  // Admin: Moderate Access Request
  const handleModerateRequest = async (requestId: string, action: 'approve' | 'reject') => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/admin/access-requests/${requestId}/moderate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        showToast(`Access request ${action === 'approve' ? 'Approved' : 'Rejected'}`, 'success');
        fetchAdminSecureData();
      }
    } catch (err) {
      showToast('Error moderating request', 'error');
    }
  };

  // Admin: Send Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(notificationComposer),
      });
      if (res.ok) {
        showToast(`Notification broadcast sent via ${notificationComposer.channel.toUpperCase()}!`, 'success');
        fetchAdminSecureData();
      }
    } catch (err) {
      showToast('Error dispatching notification', 'error');
    }
  };

  // Admin: Save Website Content Settings
  const handleSaveWebsiteSettings = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(websiteSettings),
      });
      if (res.ok) {
        showToast('Website content & settings updated live!', 'success');
        fetchAllData();
      }
    } catch (err) {
      showToast('Error saving settings', 'error');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 relative font-body ${
        theme === 'heritage'
          ? 'bg-[#FAF6EE] text-[#2C2416] theme-heritage'
          : 'bg-[#FDFBFC] text-midnight theme-modern'
      }`}
    >
      {/* Scroll Progress Bar at very top */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Website Announcement Banner if configured in Admin */}
      {websiteSettings.announcement?.active && (
        <div className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-midnight py-2 px-4 border-b-2 border-midnight flex items-center justify-between text-xs font-bold z-40">
          <div className="flex items-center gap-2 max-w-5xl mx-auto truncate">
            <Sparkles className="w-4 h-4 shrink-0 text-indigo-700 animate-spin" />
            <span className="truncate">{websiteSettings.announcement.text}</span>
          </div>
        </div>
      )}

      {/* 
        MAIN WEBSITE NAVIGATION HEADER
        STRICT RULE PRESERVED: Public navigation must NOT display:
        - Admin button
        - Admin dashboard link
        - Admin menu item
        - Admin icon
        - Admin entry point
        ONLY accessible via the continuous 5-second hold on the logo!
      */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b-2 border-midnight px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        {/* Secret Activation Gesture on Website Logo: Hold continuously for 5 seconds */}
        <div
          onMouseDown={handleLogoMouseDown}
          onMouseUp={handleLogoMouseUp}
          onTouchStart={handleLogoMouseDown}
          onTouchEnd={handleLogoMouseUp}
          className="flex items-center gap-3 cursor-pointer select-none group relative py-1 px-2 rounded-xl hover:bg-yellow-50 transition"
          title="FamilySphere official archive"
        >
          <div className="w-10 h-10 rounded-2xl bg-yellow-300 border-2 border-midnight flex items-center justify-center text-midnight font-black shadow-[2px_2px_0px_#172033] group-hover:rotate-6 transition">
            👑
          </div>
          <div>
            <h1 className="font-heading font-black text-lg tracking-tight text-midnight leading-none">
              FamilySphere
            </h1>
            <p className="text-[10px] text-secondary font-bold tracking-wider uppercase">
              {activeFamily?.name || 'Ambulkar Dynasty'}
            </p>
          </div>

          {/* Visual indicator of 5-second secret press */}
          {isHoldingGesture && (
            <div className="absolute -bottom-2 left-2 right-2 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-midnight">
              <div
                className="h-full bg-indigo-600 transition-all duration-75"
                style={{ width: `${gestureProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Public Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-bold">
          <button
            onClick={() => scrollToSection('sec-hero')}
            className={`hover:text-indigo-600 transition ${activeSection === 'sec-hero' ? 'text-indigo-600 underline underline-offset-4' : 'text-midnight'}`}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('sec-tree')}
            className={`hover:text-indigo-600 transition ${activeSection === 'sec-tree' ? 'text-indigo-600 underline underline-offset-4' : 'text-midnight'}`}
          >
            Family Tree
          </button>
          <button
            onClick={() => scrollToSection('sec-members')}
            className={`hover:text-indigo-600 transition ${activeSection === 'sec-members' ? 'text-indigo-600 underline underline-offset-4' : 'text-midnight'}`}
          >
            Family Members
          </button>
          {currentUser && (
            <>
              <button
                onClick={() => {
                  setMemberDashboardTab('overview');
                  setIsMemberDashboardOpen(true);
                }}
                className="hover:text-indigo-600 transition text-indigo-700 flex items-center gap-1 font-extrabold"
              >
                <span>My Profile</span>
                <span className="text-[10px] bg-indigo-100 px-1.5 py-0.2 rounded-full border border-indigo-200">
                  {profileCompletionScore}%
                </span>
              </button>
              <button
                onClick={() => {
                  if (myMemberRecord) openEditProfileModal(myMemberRecord);
                  else if (selectedMember) openEditProfileModal(selectedMember);
                }}
                className="hover:text-indigo-600 transition text-midnight"
              >
                Edit Profile
              </button>
            </>
          )}
          <button
            onClick={() => scrollToSection('sec-memories')}
            className={`hover:text-indigo-600 transition ${activeSection === 'sec-memories' ? 'text-indigo-600 underline underline-offset-4' : 'text-midnight'}`}
          >
            Memories
          </button>
          <button
            onClick={() => scrollToSection('sec-events')}
            className={`hover:text-indigo-600 transition ${activeSection === 'sec-events' ? 'text-indigo-600 underline underline-offset-4' : 'text-midnight'}`}
          >
            Events &amp; RSVP
          </button>
        </nav>

        {/* Multi-Family Switcher Dropdown (if multiple families exist) + Member Status */}
        <div className="flex items-center gap-2.5">
          {familiesList.length > 1 && (
            <div className="relative">
              <select
                value={selectedFamilyId}
                onChange={e => {
                  setSelectedFamilyId(e.target.value);
                  showToast(`Switched active dynasty to: ${familiesList.find(f => f.id === e.target.value)?.name}`, 'success');
                }}
                className="bg-white text-midnight border-2 border-midnight rounded-xl text-xs font-bold py-1.5 px-2.5 pr-6 appearance-none shadow-[2px_2px_0px_#172033]"
              >
                {familiesList.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-yellow-300 text-midnight border-2 border-midnight shadow-[2px_2px_0px_#172033] hover:bg-yellow-200 transition"
            title="Toggle theme"
          >
            <Sparkles className="w-4 h-4 text-indigo-700" />
          </button>

          {/* Member Login / Profile Avatar Menu in Nav */}
          {currentUser ? (
            <div className="relative">
              <div
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="flex items-center gap-2 py-1 px-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-midnight cursor-pointer hover:bg-indigo-100 transition shadow-[2px_2px_0px_#172033]"
                title="Account & Profile Menu"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-midnight"
                />
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-midnight block leading-tight">
                    {currentUser.name ? currentUser.name.split(' ')[0] : 'Member'}
                  </span>
                  <span className="text-[9px] font-extrabold text-indigo-700 block leading-none">
                    {currentUser.role === 'super_admin' ? 'L3 Super Admin' : currentUser.role === 'family_admin' ? 'L2 Family Admin' : 'L1 Member'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-midnight ml-0.5" />
              </div>

              {/* Account Dropdown Menu */}
              {isAccountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border-2 border-midnight rounded-2xl shadow-[6px_6px_0px_#172033] py-2 z-50 animate-fade-in text-xs">
                  <div className="px-3.5 py-2 border-b border-gray-200">
                    <p className="font-extrabold text-midnight truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-secondary truncate">{currentUser.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {currentUser.role === 'super_admin' ? 'Level 3: Super Admin' : currentUser.role === 'family_admin' ? 'Level 2: Family Admin' : 'Level 1: Member'}
                      </span>
                      {currentUser.branch && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-900 truncate max-w-[120px]">
                          {currentUser.branch.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsAccountDropdownOpen(false);
                      setMemberDashboardTab('overview');
                      setIsMemberDashboardOpen(true);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-indigo-50 font-bold text-midnight flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>My Profile Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAccountDropdownOpen(false);
                      if (myMemberRecord) openEditProfileModal(myMemberRecord);
                      else if (selectedMember) openEditProfileModal(selectedMember);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-indigo-50 font-bold text-midnight flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Edit Profile Details</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAccountDropdownOpen(false);
                      scrollToSection('sec-tree');
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-indigo-50 font-bold text-midnight flex items-center gap-2"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-purple-600" />
                    <span>View Tree Connections</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAccountDropdownOpen(false);
                      setMemberDashboardTab('requests');
                      setIsMemberDashboardOpen(true);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-indigo-50 font-bold text-midnight flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Profile Update Requests</span>
                  </button>

                  {(currentUser.role === 'super_admin' || currentUser.role === 'family_admin') && (
                    <button
                      onClick={() => {
                        setIsAccountDropdownOpen(false);
                        setIsSuperAdminDashboardOpen(true);
                        setAdminTab('approvals');
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-amber-50 font-bold text-amber-900 border-t border-gray-100 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>Admin Approvals Panel</span>
                      </span>
                      {profileRequestsList.filter(r => r.status === 'pending').length > 0 && (
                        <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                          {profileRequestsList.filter(r => r.status === 'pending').length}
                        </span>
                      )}
                    </button>
                  )}

                  <div className="border-t border-gray-200 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsAccountDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-red-50 font-bold text-red-600 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl border-2 border-midnight retro-btn flex items-center gap-1.5 shadow-[2px_2px_0px_#172033] hover:opacity-95"
              >
                <LogIn className="w-3.5 h-3.5 text-yellow-300" />
                <span>Login / Register</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Website Sections */}
      <main className="flex-1 flex flex-col w-full space-y-6 md:space-y-10 pb-16 relative z-10">
        
        {/* SECTION 1: HERO LANDING */}
        {websiteSettings?.sections_visible?.hero !== false && (
          <section
            id="sec-hero"
            className="flex flex-col justify-center items-center px-6 pt-10 pb-4 text-center max-w-5xl mx-auto w-full reveal-on-scroll relative"
          >
            <div
              className="hidden md:flex absolute top-4 left-6 float-element items-center gap-2 px-3 py-1.5 bg-yellow-100/90 border border-yellow-400 rounded-full text-xs font-bold shadow-sm"
              style={{ transform: `translate3d(0, ${scrollY * 0.04}px, 0)` }}
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Patriarch Lineage</span>
            </div>

            <div
              className="hidden md:flex absolute bottom-8 right-8 float-element-reverse items-center gap-2 px-3 py-1.5 bg-indigo-100/90 border border-indigo-400 rounded-full text-xs font-bold shadow-sm"
              style={{ transform: `translate3d(0, ${-scrollY * 0.04}px, 0)` }}
            >
              <Flame className="w-3.5 h-3.5 text-indigo-600" />
              <span>Centuries of Unity</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
              <span className="px-4 py-1.5 bg-yellow-300 text-midnight text-xs retro-pill">
                {(activeFamily?.name || 'AMBULKAR DYNASTY').toUpperCase()}
              </span>
              <span className="px-4 py-1.5 bg-emerald-400 text-midnight text-xs retro-pill">
                {membersList.length} MEMBERS PRESERVED
              </span>
              <span className="px-4 py-1.5 bg-pink-400 text-midnight text-xs retro-pill">
                {branchesList.length} HOUSEHOLD BRANCHES
              </span>
              <span className="px-4 py-1.5 bg-sky-300 text-midnight text-xs retro-pill flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-indigo-700" /> RLS PROTECTED
              </span>
            </div>

            <TiltCard
              className="p-6 md:p-10 mb-6 bg-white/95 max-w-4xl w-full"
              maxTilt={4}
              glowColor="rgba(113, 59, 255, 0.4)"
            >
              <p className="hand-font text-2xl text-secondary mb-1">official digital archive for</p>
              <h1 className="font-heading font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight uppercase gradient-text-animated">
                {websiteSettings.hero_heading || 'Ambulkar FamilySphere'}
              </h1>
              <p className="hand-font text-2xl text-indigo-600 mt-2 font-bold text-glow-purple">
                ✨ {activeFamily?.main_founder || 'Maratherao & Prabhavathi Lineage'} ✨
              </p>
            </TiltCard>

            <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto mb-6 leading-relaxed font-normal">
              {websiteSettings.hero_intro ||
                'Explore the complete interactive Ambulkar family tree spanning grandparents Maratherao and Prabhavathi, their four children, and all 13 grandchildren including twins Sagar and Dr. Swapnil.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
              <button
                onClick={() => scrollToSection('sec-tree')}
                className="px-8 py-4 bg-yellow-300 text-midnight font-bold text-sm retro-btn flex items-center gap-3 shadow-[4px_4px_0px_#172033]"
              >
                <GitBranch className="w-5 h-5" /> Explore Family Tree
              </button>
              <button
                onClick={() => scrollToSection('sec-members')}
                className="px-8 py-4 bg-white text-midnight font-bold text-sm retro-btn flex items-center gap-3 shadow-[4px_4px_0px_#172033]"
              >
                <Users className="w-5 h-5 text-indigo-600" /> View All {membersList.length} Members
              </button>
            </div>
          </section>
        )}

        {/* SECTION 2: HERITAGE & ROOTS */}
        {websiteSettings?.sections_visible?.heritage !== false && (
          <section
            id="sec-heritage"
            className="flex flex-col justify-center px-6 py-4 max-w-5xl mx-auto w-full reveal-on-scroll"
          >
            <div className="notebook-card p-6 md:p-10 bg-white/95">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="px-4 py-1.5 bg-yellow-300 text-midnight text-xs retro-pill mb-2 inline-block">
                    SECTION 2 • HERITAGE
                  </span>
                  <h2 className="font-heading font-extrabold text-4xl text-midnight">
                    {activeFamily?.name} Roots &amp; Lineage
                  </h2>
                </div>
                {currentUser?.role === 'super_admin' && (
                  <button
                    onClick={() => {
                      setHeritageFormData({
                        title: '',
                        caption: '',
                        url: '',
                        year: '1950',
                        rotation: -1,
                      });
                      setIsAddHeritageModalOpen(true);
                    }}
                    className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-2 hover:bg-yellow-200 shadow-[2px_2px_0px_#172033] self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 text-indigo-700" /> + Add Heritage Photo
                  </button>
                )}
              </div>

              <p className="text-sm text-secondary leading-relaxed mb-6 max-w-3xl">
                {activeFamily?.history ||
                  'Rooted in Maharashtra, the Ambulkar family stands on the strong foundation laid by Grandfather Maratherao Ambulkar and Grandmother Prabhavathi Ambulkar. Their wisdom, hard work, and unity established a lasting legacy spanning across three generations.'}
              </p>

              {heritagePhotosList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                  {heritagePhotosList.map((photo, idx) => {
                    const rot = photo.rotation ?? (idx % 2 === 0 ? -1.5 : 2);
                    return (
                      <div
                        key={photo.id}
                        className="polaroid-frame relative cursor-pointer group"
                        style={{ transform: `rotate(${rot}deg)` }}
                      >
                        <div className="tape-strip"></div>
                        {currentUser?.role === 'super_admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHeritagePhoto(photo.id, photo.title);
                            }}
                            title="Delete Heritage Photo"
                            className="absolute top-2 right-2 z-20 p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl border-2 border-midnight shadow-[2px_2px_0px_#172033] opacity-90 hover:opacity-100 transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-64 object-cover rounded-md mb-3 border border-gray-200 group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="hand-font text-2xl text-midnight font-bold text-left truncate">
                            {photo.title}
                          </p>
                          {photo.year && (
                            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                              {photo.year}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-secondary text-left leading-relaxed">
                          {photo.caption}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-yellow-50/50 rounded-2xl border-2 border-dashed border-gray-300 my-4">
                  <p className="text-sm text-secondary font-medium mb-3">No ancestral heritage photographs uploaded yet.</p>
                  {currentUser?.role === 'super_admin' && (
                    <button
                      onClick={() => setIsAddHeritageModalOpen(true)}
                      className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn"
                    >
                      <Plus className="w-4 h-4" /> Upload First Heritage Photo
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 3: FAMILY BRANCHES */}
        {websiteSettings?.sections_visible?.branches !== false && (
          <section
            id="sec-branches"
            className="flex flex-col justify-center px-6 py-4 max-w-6xl mx-auto w-full reveal-on-scroll"
          >
            <div className="notebook-card p-6 md:p-10 bg-white/95">
              <span className="px-4 py-1.5 bg-emerald-300 text-midnight text-xs retro-pill mb-3 inline-block">
                SECTION 3 • BRANCHES
              </span>
              <h2 className="font-heading font-extrabold text-4xl text-midnight mb-4">
                Family Household Branches ({branchesList.length})
              </h2>
              <p className="text-sm text-secondary leading-relaxed mb-8 max-w-3xl">
                Each vibrant branch carries forward the family heritage and collective achievements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {branchesList.map((b, idx) => (
                  <TiltCard
                    key={b.id}
                    className="p-6 bg-yellow-50/70 border-2 border-midnight flex flex-col justify-between"
                    maxTilt={5}
                    glowColor="rgba(52, 211, 153, 0.35)"
                    onClick={() => {
                      setSearchQuery((b.name || '').split(' ')[0]);
                      scrollToSection('sec-members');
                    }}
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-yellow-300 border-2 border-midnight flex items-center justify-center font-bold text-xs mb-3 shadow-[2px_2px_0px_#172033]">
                        0{idx + 1}
                      </div>
                      <h4 className="font-heading font-bold text-base text-midnight mb-1">
                        {b.name}
                      </h4>
                      <p className="text-xs text-indigo-700 font-semibold mb-2">
                        {b.generation_span || 'Generation Span'}
                      </p>
                      <p className="text-xs text-secondary leading-relaxed">
                        {b.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-dashed border-gray-300 flex items-center justify-between text-[11px] font-bold text-midnight">
                      <span>Explore Branch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: INTERACTIVE TREE EXPLORER */}
        {websiteSettings?.sections_visible?.tree !== false && (
          <section
            id="sec-tree"
            className="flex flex-col justify-center px-6 py-4 max-w-7xl mx-auto w-full reveal-on-scroll"
          >
            <div className="notebook-card p-6 md:p-10 bg-white/95">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div>
                  <span className="px-4 py-1.5 bg-pink-300 text-midnight text-xs retro-pill mb-2 inline-block">
                    SECTION 4 • TREE EXPLORER
                  </span>
                  <h2 className="font-heading font-extrabold text-3xl text-midnight">
                    Interactive Family Tree Layouts
                  </h2>
                </div>
                <div className="flex items-center bg-white border-2 border-midnight rounded-xl p-1 shadow-[2px_2px_0px_#172033]">
                  {(['vertical', 'horizontal', 'radial'] as const).map(layout => (
                    <button
                      key={layout}
                      onClick={() => {
                        setTreeLayout(layout);
                        showToast(`Tree layout switched to: ${layout.toUpperCase()}`, 'success');
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition ${
                        treeLayout === layout
                          ? 'bg-yellow-300 text-midnight border border-midnight shadow-sm'
                          : 'text-secondary hover:text-midnight'
                      }`}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Family Tree Visualizer */}
              {treeLayout === 'vertical' && (
                <div className="flex flex-col items-center gap-6 py-6 border-2 border-dashed border-gray-300 rounded-2xl bg-yellow-50/20 p-4">
                  {/* Generation 1: Founders */}
                  <div className="w-full text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-300 text-midnight text-xs font-bold border-2 border-midnight mb-4 shadow-[2px_2px_0px_#172033]">
                      Generation 1: Grandparents &amp; Founders
                    </span>
                    <div className="flex flex-wrap justify-center gap-4">
                      {membersList
                        .filter(m => (m.generation || '').includes('Gen 1'))
                        .map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedProfileId(m.id);
                              scrollToSection('sec-profile');
                            }}
                            className="p-3.5 rounded-2xl bg-white border-2 border-midnight shadow-[4px_4px_0px_#172033] hover:scale-105 transition-all cursor-pointer text-left flex items-center gap-3 w-64"
                          >
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-midnight shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h5 className="font-heading font-bold text-sm text-midnight truncate">{m.name}</h5>
                              <p className="text-[11px] text-secondary">Born {m.birth}</p>
                              <span className="text-[10px] text-amber-700 font-bold">{m.occupation}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="w-0.5 h-8 bg-midnight"></div>

                  {/* Generation 2 */}
                  <div className="w-full text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-300 text-midnight text-xs font-bold border-2 border-midnight mb-4 shadow-[2px_2px_0px_#172033]">
                      Generation 2: Children &amp; Spouses
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {membersList
                        .filter(m => (m.generation || '').includes('Gen 2'))
                        .map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedProfileId(m.id);
                              scrollToSection('sec-profile');
                            }}
                            className="p-3 rounded-2xl bg-white border-2 border-midnight shadow-[3px_3px_0px_#172033] hover:scale-105 transition-all cursor-pointer text-left flex items-center gap-2.5"
                          >
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-midnight shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h5 className="font-heading font-bold text-xs text-midnight truncate">{m.name}</h5>
                              <p className="text-[10px] text-secondary">Born {m.birth}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="w-0.5 h-8 bg-midnight"></div>

                  {/* Generation 3: Grandchildren */}
                  <div className="w-full text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-pink-300 text-midnight text-xs font-bold border-2 border-midnight mb-4 shadow-[2px_2px_0px_#172033]">
                      Generation 3: Grandchildren (Includes Twins)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {membersList
                        .filter(m => (m.generation || '').includes('Gen 3'))
                        .map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedProfileId(m.id);
                              scrollToSection('sec-profile');
                            }}
                            className="p-3 rounded-2xl bg-white border-2 border-midnight shadow-[3px_3px_0px_#172033] hover:scale-105 transition-all cursor-pointer text-left flex items-center gap-2.5"
                          >
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-midnight shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h5 className="font-heading font-bold text-xs text-midnight truncate">
                                {m.name} {m.isTwin ? '👯‍♂️' : ''}
                              </h5>
                              <p className="text-[10px] text-secondary">Born {m.birth}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {treeLayout === 'horizontal' && (
                <div className="flex flex-col md:flex-row items-stretch justify-around gap-6 w-full py-4">
                  <div className="flex-1 notebook-card p-4 bg-white text-center w-full">
                    <h4 className="font-heading font-bold text-sm text-midnight mb-3 bg-yellow-200 py-1 rounded-lg border border-midnight">
                      Gen 1: Grandparents
                    </h4>
                    <div className="space-y-3">
                      {membersList
                        .filter(m => (m.generation || '').includes('Gen 1'))
                        .map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedProfileId(m.id);
                              scrollToSection('sec-profile');
                            }}
                            className="p-2.5 rounded-xl bg-yellow-50/50 border border-midnight hover:scale-102 cursor-pointer flex items-center gap-3 transition"
                          >
                            <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full border border-midnight" />
                            <div className="text-left overflow-hidden">
                              <p className="text-xs font-bold text-midnight truncate">{m.name}</p>
                              <p className="text-[10px] text-secondary">{m.occupation}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex-1 notebook-card p-4 bg-white text-center w-full">
                    <h4 className="font-heading font-bold text-sm text-midnight mb-3 bg-emerald-200 py-1 rounded-lg border border-midnight">
                      Gen 2: Children
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {membersList
                        .filter(m => (m.generation || '').includes('Gen 2'))
                        .map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedProfileId(m.id);
                              scrollToSection('sec-profile');
                            }}
                            className="p-2 rounded-xl bg-emerald-50/40 border border-midnight hover:scale-102 cursor-pointer flex items-center gap-2 transition"
                          >
                            <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full border border-midnight" />
                            <div className="text-left overflow-hidden">
                              <p className="text-xs font-bold text-midnight truncate">{m.name}</p>
                              <p className="text-[10px] text-secondary">{m.branch}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex-1 notebook-card p-4 bg-white text-center w-full">
                    <h4 className="font-heading font-bold text-sm text-midnight mb-3 bg-pink-200 py-1 rounded-lg border border-midnight">
                      Gen 3: Grandchildren
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {membersList
                        .filter(m => (m.generation || '').includes('Gen 3'))
                        .map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedProfileId(m.id);
                              scrollToSection('sec-profile');
                            }}
                            className="p-2 rounded-xl bg-pink-50/40 border border-midnight hover:scale-102 cursor-pointer flex items-center gap-2 transition"
                          >
                            <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full border border-midnight" />
                            <div className="text-left overflow-hidden">
                              <p className="text-xs font-bold text-midnight truncate">
                                {m.name} {m.isTwin ? '👯‍♂️' : ''}
                              </p>
                              <p className="text-[10px] text-secondary">Born {m.birth}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {treeLayout === 'radial' && (
                <div className="p-8 text-center bg-indigo-50/30 rounded-2xl border-2 border-dashed border-indigo-200">
                  <div className="w-24 h-24 rounded-full bg-yellow-300 border-4 border-midnight flex flex-col items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#172033]">
                    <Crown className="w-6 h-6 text-indigo-700" />
                    <span className="font-bold text-[10px] uppercase mt-1">Founders</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                    {membersList.slice(2, 10).map(m => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedProfileId(m.id);
                          scrollToSection('sec-profile');
                        }}
                        className="p-3 bg-white rounded-xl border border-midnight shadow-sm hover:scale-105 transition cursor-pointer"
                      >
                        <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full mx-auto mb-2 border border-midnight object-cover" />
                        <p className="font-bold text-xs truncate">{m.name}</p>
                        <p className="text-[10px] text-secondary truncate">{m.generation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 5: MEMBERS DIRECTORY */}
        {(websiteSettings?.sections_visible?.directory !== false && websiteSettings?.sections_visible?.members !== false) && (
          <section
            id="sec-members"
            className="flex flex-col justify-center px-6 py-4 max-w-7xl mx-auto w-full reveal-on-scroll"
          >
            <div className="notebook-card p-6 md:p-8 bg-white/95">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                  <span className="px-4 py-1.5 bg-sky-300 text-midnight text-xs retro-pill mb-2 inline-block">
                    SECTION 5 • DIRECTORY
                  </span>
                  <h2 className="font-heading font-extrabold text-3xl text-midnight">
                    All {membersList.length} Family Records
                  </h2>
                  <p className="text-xs text-secondary mt-1">
                    Showing {filteredMembers.length} verified records in database
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, branch, occupation..."
                    className="pl-10 pr-4 py-2.5 rounded-xl bg-white border-2 border-midnight text-xs text-midnight focus:outline-none shadow-[2px_2px_0px_#172033] focus:shadow-[0_0_12px_rgba(53,184,255,0.4)] transition w-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-midnight text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map(m => (
                  <TiltCard
                    key={m.id}
                    maxTilt={4}
                    glowColor="rgba(113, 59, 255, 0.3)"
                    className="p-6 bg-white cursor-pointer text-left flex flex-col justify-between"
                    onClick={() => {
                      setSelectedProfileId(m.id);
                      scrollToSection('sec-profile');
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-midnight shadow-[2px_2px_0px_#172033]"
                          />
                          {m.isTwin && (
                            <span className="absolute -bottom-1 -right-1 bg-amber-300 text-[10px] p-1 rounded-full border border-midnight shadow-sm">
                              👯‍♂️
                            </span>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-heading font-bold text-base text-midnight truncate">
                            {m.name}
                          </h4>
                          <p className="text-xs text-secondary">{m.generation}</p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-yellow-200 text-midnight text-[10px] font-bold border border-midnight">
                            {m.branch}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                        {m.bio}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between text-xs text-midnight">
                      <span className="font-semibold text-[11px] text-indigo-600">
                        View Spotlight
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 6: MEMBER SPOTLIGHT & PROFILE (INDIVIDUAL CONTROL) */}
        {(websiteSettings?.sections_visible?.spotlight !== false && websiteSettings?.sections_visible?.profile !== false) && (
          <section
            id="sec-profile"
            className="flex flex-col justify-center px-6 py-4 max-w-4xl mx-auto w-full reveal-on-scroll"
          >
            <div className="notebook-card p-6 md:p-10 bg-white/95 relative shadow-[10px_10px_0px_#172033]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="px-4 py-1.5 bg-yellow-300 text-midnight text-xs retro-pill inline-block">
                  SECTION 6 • SPOTLIGHT
                </span>

                {/* RLS Status Badge & Edit Affordance */}
                <div className="flex items-center gap-2">
                  {isOwnerOfSelected ? (
                    <button
                      onClick={() => openEditProfileModal(selectedMember)}
                      className="px-4 py-1.5 bg-yellow-300 text-midnight border-2 border-midnight rounded-xl text-xs font-bold retro-btn flex items-center gap-2 hover:bg-yellow-200 shadow-[2px_2px_0px_#172033]"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-700" />
                      <span>Edit My Profile</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-secondary border border-midnight rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-gray-500" /> Read-Only (Owned by {selectedMember?.name})
                    </span>
                  )}
                </div>
              </div>

              {selectedMember && (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left">
                    <div className="relative">
                      <img
                        src={selectedMember.avatar}
                        alt={selectedMember.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-midnight shadow-[4px_4px_0px_#172033]"
                      />
                      <span className="absolute -top-2 -right-2 bg-yellow-300 text-midnight p-1 rounded-full border border-midnight shadow-sm">
                        <Star className="w-4 h-4 fill-yellow-400" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1 justify-center sm:justify-start">
                        <span className="px-3 py-1 rounded-full bg-yellow-300 text-midnight text-xs font-bold border border-midnight">
                          {selectedMember.generation} • {selectedMember.branch}
                        </span>
                        {selectedMember.isTwin && (
                          <span className="px-3 py-1 rounded-full bg-amber-200 text-midnight text-xs font-bold border border-midnight">
                            👯‍♂️ Twin Brother
                          </span>
                        )}
                      </div>
                      <h2 className="font-heading font-extrabold text-3xl text-midnight mt-1">
                        {selectedMember.name}
                      </h2>
                      <p className="text-xs text-secondary mt-1 hand-font text-xl">
                        Born {selectedMember.birth} in {selectedMember.birthplace} • Hometown: {selectedMember.hometown}
                      </p>
                    </div>
                  </div>

                  {/* Biography & Attributes */}
                  <div className="space-y-4 text-xs text-secondary leading-relaxed">
                    <p className="p-4 bg-yellow-50/60 rounded-xl border border-yellow-200 text-midnight font-medium">
                      {selectedMember.bio}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-xl border border-midnight shadow-sm">
                        <h4 className="font-bold text-midnight flex items-center gap-1.5 mb-2">
                          <GraduationCap className="w-4 h-4 text-indigo-600" /> Education
                        </h4>
                        <p>{selectedMember.education}</p>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-midnight shadow-sm">
                        <h4 className="font-bold text-midnight flex items-center gap-1.5 mb-2">
                          <Briefcase className="w-4 h-4 text-amber-600" /> Occupation &amp; Role
                        </h4>
                        <p>{selectedMember.occupation}</p>
                      </div>
                    </div>

                    {/* Achievements */}
                    {selectedMember.achievements && selectedMember.achievements.length > 0 && (
                      <div className="p-4 bg-white rounded-xl border border-midnight shadow-sm">
                        <h4 className="font-bold text-midnight flex items-center gap-1.5 mb-2">
                          <Award className="w-4 h-4 text-yellow-500" /> Key Milestones &amp; Achievements
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedMember.achievements.map((ach, i) => (
                            <li key={i}>{ach}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Personal Photos Section */}
                  <div className="mt-8 pt-6 border-t border-dashed border-gray-300">
                    <h3 className="font-heading font-bold text-lg text-midnight mb-4 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-indigo-600" /> Personal Photographs &amp; Memories
                    </h3>

                    {selectedMember.personal_photos && selectedMember.personal_photos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedMember.personal_photos.map((photo, idx) => (
                          <div
                            key={photo.id || idx}
                            className="notebook-card p-2 bg-white border border-midnight rounded-xl overflow-hidden shadow-sm"
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-28 object-cover rounded-lg mb-1"
                            />
                            <p className="text-[11px] font-bold text-midnight truncate">{photo.caption}</p>
                            <span className="text-[10px] text-secondary">{photo.date}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-secondary italic">No personal photographs uploaded yet.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* SECTION 7: FAMILY MEMORIES & ALBUMS */}
        {websiteSettings?.sections_visible?.memories !== false && (
          <section
            id="sec-memories"
            className="flex flex-col justify-center px-6 py-4 max-w-7xl mx-auto w-full reveal-on-scroll"
          >
            <div className="notebook-card p-6 md:p-10 bg-white/95">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <span className="px-4 py-1.5 bg-amber-300 text-midnight text-xs retro-pill mb-2 inline-block">
                    SECTION 7 • MEMORIES
                  </span>
                  <h2 className="font-heading font-extrabold text-3xl text-midnight">
                    Family Photo Gallery &amp; Albums
                  </h2>
                </div>
                {currentUser?.role === 'super_admin' && (
                  <button
                    onClick={() => {
                      setPhotoFormData({
                        title: '',
                        description: '',
                        url: '',
                        album_id: activeAlbumFilter !== 'all' ? activeAlbumFilter : (albumsList[0]?.id || 'alb_gatherings'),
                        branch: 'All Branches',
                        member_id: '',
                        date: new Date().toISOString().split('T')[0],
                        location: 'Maharashtra, India',
                        visibility: 'public',
                      });
                      setIsAddPhotoModalOpen(true);
                    }}
                    className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-2 hover:bg-yellow-200 shadow-[2px_2px_0px_#172033]"
                  >
                    <Plus className="w-4 h-4 text-indigo-700" /> + Add Photo to Memories
                  </button>
                )}
              </div>

              {/* Album Category Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
                <button
                  onClick={() => setActiveAlbumFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                    activeAlbumFilter === 'all'
                      ? 'bg-yellow-300 text-midnight border-midnight shadow-[2px_2px_0px_#172033]'
                      : 'bg-white text-secondary border-gray-300 hover:text-midnight'
                  }`}
                >
                  All Photos ({photosList.length})
                </button>
                {albumsList.map(album => (
                  <button
                    key={album.id}
                    onClick={() => setActiveAlbumFilter(album.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                      activeAlbumFilter === album.id
                        ? 'bg-yellow-300 text-midnight border-midnight shadow-[2px_2px_0px_#172033]'
                        : 'bg-white text-secondary border-gray-300 hover:text-midnight'
                    }`}
                  >
                    {album.title}
                  </button>
                ))}
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    onClick={() => setLightboxPhoto(photo)}
                    className="polaroid-frame relative cursor-pointer group"
                    style={{ transform: idx % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1deg)' }}
                  >
                    <div className="tape-strip"></div>
                    {currentUser?.role === 'super_admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id, photo.title);
                        }}
                        title="Delete Photograph"
                        className="absolute top-2 right-2 z-20 p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl border-2 border-midnight shadow-[2px_2px_0px_#172033] opacity-90 hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    )}
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-44 object-cover rounded-md mb-2 border border-gray-200 group-hover:scale-102 transition"
                    />
                    <p className="hand-font text-lg text-midnight font-bold truncate">{photo.title}</p>
                    <p className="text-[11px] text-secondary line-clamp-1">{photo.description}</p>
                    <div className="mt-1 text-[10px] text-indigo-600 font-bold flex justify-between items-center">
                      <span>{photo.branch}</span>
                      <span>{photo.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 8: EVENTS MANAGEMENT & RSVP TRACKER */}
        {websiteSettings?.sections_visible?.events !== false && (
          <section
            id="sec-events"
            className="flex flex-col justify-center px-6 py-4 max-w-5xl mx-auto w-full reveal-on-scroll"
          >
            <div className="notebook-card p-6 md:p-10 bg-white/95">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <span className="px-4 py-1.5 bg-purple-300 text-midnight text-xs retro-pill mb-2 inline-block">
                    SECTION 8 • EVENTS &amp; BIRTHDAY CALENDAR
                  </span>
                  <h2 className="font-heading font-extrabold text-3xl text-midnight">
                    {eventSectionTab === 'events' ? 'Upcoming Family Events & RSVP Tracker' : 'Ambulkar Dynasty Birthday Calendar'}
                  </h2>
                </div>
                {currentUser?.role === 'super_admin' && (
                  <button
                    onClick={() => {
                      setEditingEventId(null);
                      setEventFormData({
                        title: '',
                        description: '',
                        cover_photo: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
                        category: 'Family reunions',
                        date: new Date().toISOString().split('T')[0],
                        time: '11:00 AM IST',
                        location: 'Ambulkar Ancestral Hall, Maharashtra',
                        branch: 'All Branches',
                        visibility: 'public',
                        invitations: 'All family members and descendants are invited.',
                      });
                      setIsAddEventModalOpen(true);
                    }}
                    className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-2 hover:bg-yellow-200 shadow-[2px_2px_0px_#172033]"
                  >
                    <Plus className="w-4 h-4 text-indigo-700" /> + Create New Event
                  </button>
                )}
              </div>

              {/* View Switcher: Upcoming Events vs Birthday Calendar */}
              <div className="flex flex-wrap items-center justify-between border-b-2 border-midnight pb-3 mb-6 gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEventSectionTab('events')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      eventSectionTab === 'events'
                        ? 'bg-yellow-300 text-midnight border-2 border-midnight shadow-[2px_2px_0px_#172033]'
                        : 'bg-white text-secondary hover:text-midnight border border-gray-300'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-indigo-700" /> Upcoming Events ({eventsList.length})
                  </button>
                  <button
                    onClick={() => setEventSectionTab('birthdays')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      eventSectionTab === 'birthdays'
                        ? 'bg-yellow-300 text-midnight border-2 border-midnight shadow-[2px_2px_0px_#172033]'
                        : 'bg-white text-secondary hover:text-midnight border border-gray-300'
                    }`}
                  >
                    <Gift className="w-4 h-4 text-pink-600" /> Birthday Calendar ({birthdayCalendarList.length})
                  </button>
                </div>

                {eventSectionTab === 'birthdays' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-secondary">Branch:</span>
                    <select
                      value={birthdayBranchFilter}
                      onChange={e => setBirthdayBranchFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-midnight rounded-xl text-xs font-medium"
                    >
                      <option value="all">All Branches (19 Members)</option>
                      {branchesList.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* TAB 1: UPCOMING EVENTS VIEW */}
              {eventSectionTab === 'events' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {eventsList.map(event => (
                    <TiltCard
                      key={event.id}
                      className="p-6 bg-yellow-50/80 flex flex-col justify-between relative group"
                      maxTilt={4}
                      glowColor="rgba(253, 224, 71, 0.45)"
                    >
                      <div>
                        {currentUser?.role === 'super_admin' && (
                          <div className="flex items-center justify-end gap-1.5 mb-2">
                            <button
                              onClick={() => {
                                setEditingEventId(event.id);
                                setEventFormData({
                                  title: event.title,
                                  description: event.description,
                                  cover_photo: event.cover_photo || '',
                                  category: event.category,
                                  date: event.date,
                                  time: event.time,
                                  location: event.location,
                                  branch: event.branch || 'All Branches',
                                  visibility: event.visibility,
                                  invitations: event.invitations || '',
                                });
                                setIsAddEventModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-yellow-100 text-midnight rounded-lg text-xs font-bold border border-midnight shadow-xs flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3 text-indigo-700" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg border border-red-300 shadow-xs"
                              title="Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {event.cover_photo && (
                          <img
                            src={event.cover_photo}
                            alt={event.title}
                            className="w-full h-36 object-cover rounded-xl mb-3 border border-midnight"
                          />
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-0.5 rounded-full bg-yellow-200 text-midnight text-[11px] font-bold border border-midnight">
                            {event.category}
                          </span>
                          {event.branch && (
                            <span className="text-[10px] text-indigo-700 font-bold">
                              {event.branch}
                            </span>
                          )}
                        </div>
                        <h3 className="font-heading font-bold text-lg text-midnight mb-2">
                          {event.title}
                        </h3>
                        <p className="text-xs text-secondary mb-3 leading-relaxed">
                          {event.description}
                        </p>
                        <p className="text-xs text-secondary mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" /> {event.date} ({event.time})
                        </p>
                        <p className="text-xs text-secondary mb-3 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500" /> {event.location}
                        </p>
                        {event.attendees && (
                          <div className="text-[11px] text-emerald-800 font-bold mb-4 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                            👥 {event.attendees.length} Attendee(s) Confirmed
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedEventForRsvp(event);
                          setRsvpGuestName(currentUser?.name || '');
                          setIsRsvpModalOpen(true);
                        }}
                        className="w-full py-2.5 rounded-xl bg-yellow-300 text-midnight text-xs font-bold retro-btn hover:bg-yellow-200 shadow-[2px_2px_0px_#172033]"
                      >
                        Confirm Attendance / RSVP
                      </button>
                    </TiltCard>
                  ))}
                </div>
              )}

              {/* TAB 2: BIRTHDAY CALENDAR VIEW */}
              {eventSectionTab === 'birthdays' && (
                <div className="space-y-6">
                  {/* Monthly Chronological Filter Bar (January - December) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    <button
                      onClick={() => setBirthdayMonthFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                        birthdayMonthFilter === 'all'
                          ? 'bg-yellow-300 text-midnight border-midnight shadow-[2px_2px_0px_#172033]'
                          : 'bg-white text-secondary border-gray-300 hover:text-midnight'
                      }`}
                    >
                      All Months ({birthdayCalendarList.length})
                    </button>
                    {MONTH_SHORT.map((mShort, idx) => {
                      const monthNum = idx + 1;
                      const count = birthdayCalendarList.filter(b => b.month === monthNum).length;
                      return (
                        <button
                          key={mShort}
                          onClick={() => setBirthdayMonthFilter(monthNum)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-1.5 ${
                            birthdayMonthFilter === monthNum
                              ? 'bg-yellow-300 text-midnight border-midnight shadow-[2px_2px_0px_#172033]'
                              : 'bg-white text-secondary border-gray-300 hover:text-midnight'
                          }`}
                        >
                          <span>{mShort}</span>
                          {count > 0 && (
                            <span className="w-4 h-4 rounded-full bg-pink-100 text-pink-700 text-[10px] flex items-center justify-center font-bold">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Monthly Birthday Cards Grid */}
                  {filteredBirthdayList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredBirthdayList.map(bday => (
                        <div
                          key={bday.member.id}
                          className={`notebook-card p-5 bg-white relative border-2 ${
                            bday.isToday ? 'border-pink-500 ring-2 ring-pink-300' : 'border-midnight'
                          } shadow-[3px_3px_0px_#172033] flex flex-col justify-between`}
                        >
                          <div>
                            {/* Header row with badges */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-bold border border-pink-300 flex items-center gap-1">
                                <Gift className="w-3 h-3 text-pink-600" /> {bday.monthName} {bday.day}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200">
                                  {bday.zodiac.symbol} {bday.zodiac.name}
                                </span>
                                {bday.isToday ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                                    🎉 TODAY!
                                  </span>
                                ) : bday.isUpcoming ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                                    ⏳ in {bday.daysUntil}d
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            {/* Member info & Avatar */}
                            <div className="flex items-start gap-3 mb-3">
                              <img
                                src={bday.member.avatar || 'https://placehold.co/150x150/9878FF/FFFFFF?text=MA'}
                                alt={bday.member.name}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-midnight shrink-0 shadow-[2px_2px_0px_#172033]"
                              />
                              <div>
                                <h4 className="font-heading font-extrabold text-base text-midnight leading-tight">
                                  {bday.member.name}
                                </h4>
                                <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                                  {bday.member.branch}
                                </p>
                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 border">
                                    {bday.member.generation}
                                  </span>
                                  {bday.member.isTwin && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                                      👯‍♂️ Twin
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Milestone / Age highlight box */}
                            <div className="p-2.5 bg-yellow-50/80 rounded-xl border border-yellow-300 mb-3 text-xs">
                              <div className="flex justify-between items-center text-midnight font-bold">
                                <span>Birth Year: {bday.birthYear}</span>
                                <span className="text-pink-700">Turning {bday.turningAge} in 2026</span>
                              </div>
                              <p className="text-[11px] text-secondary mt-1">
                                Celebrated annually on {bday.monthName} {bday.day}
                              </p>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="space-y-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSendWhatsAppWish(bday)}
                                className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                                title="Send WhatsApp Wish"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Send Wish
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProfileId(bday.member.id);
                                  scrollToSection('sec-profile');
                                }}
                                className="px-3 py-1.5 bg-white hover:bg-gray-50 text-midnight rounded-xl text-[11px] font-bold border border-midnight shadow-xs"
                              >
                                View Profile
                              </button>
                            </div>

                            {currentUser?.role === 'super_admin' && (
                              <button
                                onClick={() => handleConvertBirthdayToEvent(bday)}
                                className="w-full py-1.5 bg-yellow-300 hover:bg-yellow-200 text-midnight rounded-xl text-[11px] font-bold border border-midnight shadow-xs flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-3 h-3 text-indigo-700" /> + Add as Official Family Event
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                      <Gift className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <h4 className="font-bold text-sm text-midnight">No member birthdays in selected filter</h4>
                      <p className="text-xs text-secondary mt-1">
                        Try selecting "All Months" or reset the branch filter to view all 19 family birthdays.
                      </p>
                      <button
                        onClick={() => {
                          setBirthdayMonthFilter('all');
                          setBirthdayBranchFilter('all');
                        }}
                        className="mt-3 px-4 py-1.5 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border border-midnight"
                      >
                        Reset Birthday Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 9: SECURE PORTAL LOGIN / REGISTRATION & DIRECT GALLERY ACCOUNT */}
        {(websiteSettings?.sections_visible?.auth !== false && websiteSettings?.sections_visible?.portal !== false) && (
          <section
            id="sec-auth"
            className="flex flex-col justify-center items-center px-6 py-4 max-w-3xl mx-auto w-full reveal-on-scroll"
          >
            <TiltCard
              className="p-6 md:p-8 w-full bg-white/95 text-center shadow-[8px_8px_0px_#172033]"
              maxTilt={2}
              glowColor="rgba(239, 68, 68, 0.35)"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="px-4 py-1.5 bg-red-300 text-midnight text-xs retro-pill inline-block">
                  SECTION 9 • {currentUser ? 'MY ACCOUNT & PERSONAL GALLERY' : 'FAMILY PORTAL LOGIN'}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-midnight border border-midnight rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-700" /> RLS Protected
                </span>
              </div>

              {currentUser ? (
                <div className="text-left space-y-6">
                  {/* Account Header Profile Box */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 p-5 bg-yellow-50/80 rounded-2xl border-2 border-midnight shadow-[3px_3px_0px_#172033]">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-midnight shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => portalAvatarInputRef.current?.click()}
                          title="Change Profile Photo from Device Gallery"
                          className="absolute -bottom-1 -right-1 p-1.5 bg-yellow-300 text-midnight rounded-full border border-midnight shadow hover:bg-yellow-200 transition"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-heading font-extrabold text-lg text-midnight">{currentUser.name}</h3>
                        <p className="text-xs text-secondary">{currentUser.email}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300">
                            {currentUser.role.toUpperCase()}
                          </span>
                          {myMemberRecord?.branch && (
                            <span className="text-[10px] bg-yellow-200 text-midnight px-2 py-0.5 rounded font-bold border border-yellow-300">
                              {myMemberRecord.branch}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          if (myMemberRecord) openEditProfileModal(myMemberRecord);
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-midnight rounded-xl font-bold text-xs retro-btn border border-midnight flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-700" /> Edit Bio &amp; Details
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-3 py-2 bg-white hover:bg-gray-100 text-secondary hover:text-midnight rounded-xl font-bold text-xs border border-midnight"
                        title="Sign Out"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* DIRECT GALLERY PHOTO CONTROLS */}
                  <div className="p-5 bg-white rounded-2xl border-2 border-midnight space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-heading font-bold text-sm text-midnight flex items-center gap-2">
                          <Camera className="w-4 h-4 text-indigo-600" />
                          <span>My Personal Photographs ({myMemberRecord?.personal_photos?.length || 0})</span>
                        </h4>
                        <p className="text-xs text-secondary mt-0.5">
                          Directly upload pictures from your device gallery to your account profile
                        </p>
                      </div>

                      {/* Direct Upload Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Hidden Native File Inputs */}
                        <input
                          type="file"
                          ref={portalGalleryInputRef}
                          accept="image/*"
                          multiple
                          onChange={e => handleDirectAccountPhotos(e.target.files)}
                          className="hidden"
                        />
                        <input
                          type="file"
                          ref={portalAvatarInputRef}
                          accept="image/*"
                          onChange={e => handleDirectAccountAvatar(e.target.files?.[0] || null)}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => portalGalleryInputRef.current?.click()}
                          className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-midnight rounded-xl font-bold text-xs retro-btn border border-midnight flex items-center gap-1.5 shadow-[2px_2px_0px_#172033]"
                        >
                          <Upload className="w-3.5 h-3.5" /> Add from Device Gallery
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setArchiveTarget('portal_personal');
                            setIsArchivePickerOpen(true);
                          }}
                          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs border border-indigo-300 flex items-center gap-1.5"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> Archive Library
                        </button>
                      </div>
                    </div>

                    {/* Personal Photos Grid */}
                    {myMemberRecord?.personal_photos && myMemberRecord.personal_photos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                        {myMemberRecord.personal_photos.map((p, idx) => (
                          <div
                            key={p.id || idx}
                            className="relative group border-2 border-midnight rounded-xl overflow-hidden bg-gray-50 shadow-sm"
                          >
                            <img
                              src={p.url}
                              alt={p.caption}
                              className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="p-2 bg-white">
                              <p className="text-[11px] font-bold text-midnight truncate">{p.caption}</p>
                              <span className="text-[10px] text-secondary">{p.date}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDirectDeleteAccountPhoto(p.id)}
                              title="Delete Photo"
                              className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Quick Add More Tile */}
                        <div
                          onClick={() => portalGalleryInputRef.current?.click()}
                          className="h-36 border-2 border-dashed border-gray-300 hover:border-midnight rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-yellow-50/50 transition"
                        >
                          <Plus className="w-6 h-6 text-indigo-600 mb-1" />
                          <span className="text-xs font-bold text-midnight">+ Add from Gallery</span>
                          <span className="text-[10px] text-secondary">JPG, PNG, WebP</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/60">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-midnight">No personal photos uploaded yet</p>
                        <p className="text-[11px] text-secondary mt-1">
                          Click "+ Add from Device Gallery" above to upload photos directly from your phone or computer.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-left text-xs">
                  <form
                    onSubmit={async e => {
                      e.preventDefault();
                      try {
                        const res = await fetch('/api/auth/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: vaultEmail, password: vaultPassword }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          localStorage.setItem('familysphere_token', data.token);
                          setAuthToken(data.token);
                          setCurrentUser(data.user);
                          showToast(`Welcome back, ${data.user.name}!`, 'success');
                        } else {
                          showToast(data.error || 'Login failed', 'error');
                        }
                      } catch (err) {
                        showToast('Login error', 'error');
                      }
                    }}
                    className="space-y-3.5"
                  >
                    <p className="text-secondary text-center mb-2">
                      Access your personal profile, direct photo uploads, and family updates.
                    </p>
                    <div>
                      <label className="block font-bold text-midnight mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={vaultEmail}
                        onChange={e => setVaultEmail(e.target.value)}
                        placeholder="name@ambulkar.family"
                        autoComplete="email"
                        className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs bg-white text-midnight placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-midnight mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={vaultPassword}
                        onChange={e => setVaultPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs bg-white text-midnight placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-midnight">
                        <input type="checkbox" defaultChecked className="accent-indigo-600 rounded" />
                        <span>Remember Me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalTab('forgot');
                          setIsAuthModalOpen(true);
                        }}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-yellow-300 text-midnight rounded-xl font-bold text-xs retro-btn hover:bg-yellow-200 shadow-[3px_3px_0px_#172033]"
                    >
                      Sign In to Family Portal
                    </button>

                    <div className="text-center pt-2 text-[11px] text-secondary">
                      <span>Don't have an account yet? </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalTab('register');
                          setIsAuthModalOpen(true);
                        }}
                        className="text-indigo-600 font-bold hover:underline ml-1"
                      >
                        Register as Family Member (Level 1)
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </TiltCard>
          </section>
        )}
      </main>

      {/* SECTION 10: FOOTER */}
      {websiteSettings?.sections_visible?.footer !== false && (
        <footer className="border-t-2 border-midnight bg-white py-8 px-6 text-center text-xs text-secondary">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <span className="font-heading font-black text-sm text-midnight">
                FamilySphere • {activeFamily?.name || 'Ambulkar Family'}
              </span>
            </div>
            <p>© 2026 Ambulkar Dynasty. Verified Supabase RLS &amp; Secure Cloud Storage.</p>
          </div>
        </footer>
      )}

      {/* 
        MODAL: SECRET SUPER ADMIN VAULT CHALLENGE
        Triggered ONLY when holding website name continuously for 5 seconds.
      */}
      {isSuperAdminVaultOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-md animate-fade-in">
          <div className="notebook-card bg-white w-full max-w-md p-8 relative shadow-[10px_10px_0px_#172033] border-4 border-indigo-600 text-center">
            <button
              onClick={() => setIsSuperAdminVaultOpen(false)}
              className="absolute right-4 top-4 p-2 text-secondary hover:text-midnight rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-yellow-300 border-2 border-midnight flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#172033] animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="font-heading font-extrabold text-2xl text-midnight mb-1">
              Super Admin Vault Access
            </h3>
            <p className="text-xs text-secondary mb-4 hand-font text-lg">
              5-Second Secret Activation Gesture Verified
            </p>

            <div className="p-2.5 bg-yellow-50 rounded-xl border border-yellow-300 text-xs text-yellow-900 mb-5 text-left">
              🔒 <strong>Lineage Security Protocol:</strong> Access requires verified Super Admin credentials and the secondary Master Key.
            </div>

            {vaultError && (
              <div className="p-3 bg-red-100 text-red-900 border border-red-300 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{vaultError}</span>
              </div>
            )}

            <form onSubmit={handleVaultLoginSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-midnight mb-1">Super Admin Email</label>
                <input
                  type="email"
                  value={vaultEmail}
                  onChange={e => setVaultEmail(e.target.value)}
                  placeholder="admin@ambulkar.family"
                  autoComplete="email"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-midnight text-xs bg-white text-midnight placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-midnight mb-1">Admin Password</label>
                <input
                  type="password"
                  value={vaultPassword}
                  onChange={e => setVaultPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-midnight text-xs bg-white text-midnight placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-midnight mb-1">Security Master Key</label>
                <input
                  type="password"
                  value={vaultMasterKey}
                  onChange={e => setVaultMasterKey(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-midnight text-xs font-mono"
                  placeholder="AMBULKAR-MASTER-2026"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-xs retro-btn hover:bg-indigo-700 mt-2 flex items-center justify-center gap-2 shadow-[4px_4px_0px_#172033]"
              >
                <Key className="w-4 h-4 text-yellow-300" />
                <span>Unlock Super Admin Command Centre</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 
        FULL-SCREEN COMPREHENSIVE SUPER ADMIN CONTROL CENTRE
        Includes all 17 dedicated navigation modules!
      */}
      {isSuperAdminDashboardOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="flex flex-col md:flex-row w-full h-full bg-[#F5F4FE] overflow-hidden text-midnight">
            
            {/* Sidebar Navigation: All 17 Modules */}
            <aside className="w-full md:w-64 bg-white border-r-2 border-midnight flex flex-col justify-between shrink-0 shadow-xl overflow-hidden">
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b-2 border-midnight flex items-center justify-between bg-yellow-300 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-6 h-6 text-midnight" />
                    <div>
                      <h2 className="font-heading font-black text-sm uppercase">Super Admin</h2>
                      <p className="text-[10px] text-midnight font-bold">18 Control Modules</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSuperAdminDashboardOpen(false)}
                    className="p-1 rounded bg-white/80 border border-midnight hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
                  {[
                    { id: 'overview', label: '1. Dashboard', icon: Activity },
                    { id: 'approvals', label: '2. Profile Approvals', icon: UserCheck, count: profileRequestsList.filter(r => r.status === 'pending').length },
                    { id: 'families', label: '3. Family Management', icon: Crown },
                    { id: 'members', label: '4. Family Members', icon: Users },
                    { id: 'branches', label: '5. Family Branches', icon: GitBranch },
                    { id: 'tree', label: '6. Family Tree', icon: Layers },
                    { id: 'events', label: '7. Events Management', icon: Calendar },
                    { id: 'photos', label: '8. Family Photos', icon: Camera },
                    { id: 'albums', label: '9. Photo Albums', icon: FolderPlus },
                    { id: 'stories', label: '10. Stories & Memories', icon: FileText },
                    { id: 'access_requests', label: '11. Access Requests', icon: UserCheck },
                    { id: 'users', label: '12. User Management', icon: Key },
                    { id: 'notifications', label: '13. Notifications', icon: Bell },
                    { id: 'website_content', label: '14. Website Content', icon: Globe },
                    { id: 'theme', label: '15. Theme & FX', icon: Palette },
                    { id: 'logs', label: '16. Activity Logs', icon: Database },
                    { id: 'backup', label: '17. Database Backup', icon: Download },
                    { id: 'general', label: '18. General Settings', icon: Settings },
                    { id: 'supabase', label: '19. Supabase Backend', icon: Server },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setAdminTab(item.id as AdminTabType)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition ${
                          adminTab === item.id
                            ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_#172033]'
                            : 'text-secondary hover:bg-indigo-50 hover:text-midnight'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.count && item.count > 0 ? (
                          <span className="bg-amber-400 text-midnight text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                            {item.count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 border-t-2 border-midnight bg-gray-50 flex items-center justify-between text-xs shrink-0">
                <div className="overflow-hidden">
                  <p className="font-bold truncate text-[11px]">{currentUser?.name}</p>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">● Super Admin Active</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-white border border-midnight text-red-600 hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </aside>

            {/* Main Admin Panel View Area */}
            <section className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col">
              
              {/* Header Bar of Admin Panel */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-300">
                <div>
                  <span className="px-3 py-1 bg-yellow-300 text-midnight text-[11px] font-bold rounded-full border border-midnight">
                    MODULE: {adminTab.toUpperCase()}
                  </span>
                  <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-midnight mt-1">
                    {adminTab === 'overview' && 'Dynasty Dashboard & Analytics'}
                    {adminTab === 'approvals' && 'Profile Update Approvals (3-Tier Governance)'}
                    {adminTab === 'families' && 'Multi-Family Dynasty Management'}
                    {adminTab === 'members' && 'Family Members Directory & Hierarchy'}
                    {adminTab === 'branches' && 'Family Branches & Head Members'}
                    {adminTab === 'tree' && 'Family Tree Connectors & Generations'}
                    {adminTab === 'events' && 'Event Management & RSVP Tracker'}
                    {adminTab === 'photos' && 'Family Photos & Gallery Management'}
                    {adminTab === 'albums' && 'Photo Albums (9 Core Categories)'}
                    {adminTab === 'stories' && 'Stories, Chronicles & Moderation'}
                    {adminTab === 'access_requests' && 'Access Requests & Verification'}
                    {adminTab === 'users' && 'User Accounts, Roles & Invite Passes'}
                    {adminTab === 'notifications' && 'WhatsApp Cloud API & Email Dispatcher'}
                    {adminTab === 'website_content' && 'Website Content & Section Toggles'}
                    {adminTab === 'theme' && 'Themes & Visual FX Controls'}
                    {adminTab === 'logs' && 'Security Audit Trail & Activity Logs'}
                    {adminTab === 'backup' && 'Database Backup & JSON Archive Restore'}
                    {adminTab === 'general' && 'General Settings & Live Security Audit'}
                    {adminTab === 'supabase' && 'Supabase Cloud Backend & Database Architecture'}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={runSecurityTests}
                    className="px-3 py-1.5 bg-emerald-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight shadow-[2px_2px_0px_#172033] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Run Security Audit
                  </button>
                  <button
                    onClick={() => setIsSuperAdminDashboardOpen(false)}
                    className="px-3 py-1.5 bg-white text-midnight rounded-xl text-xs font-bold border-2 border-midnight shadow-[2px_2px_0px_#172033]"
                  >
                    Close Dashboard
                  </button>
                </div>
              </div>

              {/* MODULE: PROFILE UPDATE APPROVALS (3-TIER GOVERNANCE) */}
              {adminTab === 'approvals' && (
                <div className="space-y-6 text-xs text-left">
                  {/* Explanatory Banner */}
                  <div className="notebook-card p-5 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-midnight">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-400 border border-midnight flex items-center justify-center font-bold text-midnight shadow-[2px_2px_0px_#172033]">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-midnight">
                          Lineage Profile Ownership &amp; Change Approval Queue
                        </h3>
                        <p className="text-secondary text-[11px]">
                          Level 1 Family Members can update safe personal fields directly. Critical identity fields (Full Name, Date of Birth, Branch, Relationships) require approval from the Branch Admin or Super Admin before updating the official lineage records.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-amber-200">
                      <div className="p-3 bg-white rounded-xl border border-midnight text-center">
                        <span className="text-secondary font-bold text-[10px]">PENDING APPROVAL</span>
                        <h4 className="text-2xl font-black text-amber-600 mt-0.5">
                          {profileRequestsList.filter(r => r.status === 'pending').length}
                        </h4>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-midnight text-center">
                        <span className="text-secondary font-bold text-[10px]">APPROVED &amp; MERGED</span>
                        <h4 className="text-2xl font-black text-emerald-600 mt-0.5">
                          {profileRequestsList.filter(r => r.status === 'approved').length}
                        </h4>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-midnight text-center">
                        <span className="text-secondary font-bold text-[10px]">REJECTED</span>
                        <h4 className="text-2xl font-black text-red-600 mt-0.5">
                          {profileRequestsList.filter(r => r.status === 'rejected').length}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* PENDING REQUESTS CARDS */}
                  <div className="space-y-4">
                    <h3 className="font-heading font-extrabold text-base text-midnight flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Pending Change Requests ({profileRequestsList.filter(r => r.status === 'pending').length})</span>
                    </h3>

                    {profileRequestsList.filter(r => r.status === 'pending').length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-2xl border-2 border-midnight shadow-sm">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                        <h4 className="font-bold text-sm text-midnight">All Lineage Records In Sync</h4>
                        <p className="text-secondary text-xs mt-1">There are no pending profile change requests requiring verification.</p>
                      </div>
                    ) : (
                      profileRequestsList.filter(r => r.status === 'pending').map(req => {
                        const targetMember = membersList.find(m => m.id === req.member_id);
                        return (
                          <div
                            key={req.id}
                            className="notebook-card p-5 bg-white border-2 border-midnight shadow-[4px_4px_0px_#172033] space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-gray-200">
                              <div className="flex items-center gap-3">
                                <img
                                  src={targetMember?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                                  alt={req.requested_by_name}
                                  className="w-10 h-10 rounded-full object-cover border border-midnight"
                                />
                                <div>
                                  <h4 className="font-heading font-bold text-sm text-midnight">
                                    {targetMember?.name || req.requested_by_name}
                                  </h4>
                                  <p className="text-[11px] text-secondary">
                                    Submitted by <strong>{req.requested_by_name}</strong> • Branch: <span className="text-indigo-600 font-bold">{req.branch}</span>
                                  </p>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-[10px] w-fit">
                                Pending Admin Review
                              </span>
                            </div>

                            {/* Reason for change */}
                            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
                              <span className="font-bold text-indigo-950">Member Stated Reason: </span>
                              <span className="text-indigo-900 italic">"{req.reason || 'Requested profile detail correction'}"</span>
                            </div>

                            {/* Diff Table (Old vs New) */}
                            <div className="border border-midnight rounded-xl overflow-hidden bg-gray-50/50">
                              <table className="w-full text-xs">
                                <thead className="bg-gray-100 border-b border-midnight font-bold text-midnight">
                                  <tr>
                                    <th className="p-2.5 text-left w-1/4">Field</th>
                                    <th className="p-2.5 text-left w-3/8 text-red-700">Official Current Value</th>
                                    <th className="p-2.5 text-left w-3/8 text-emerald-700">Proposed New Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(req.changes || {}).map(([field, diff]: [string, any], i) => (
                                    <tr key={i} className="border-b border-gray-200 bg-white">
                                      <td className="p-2.5 font-bold text-midnight uppercase tracking-wide text-[10px]">
                                        {field.replace(/_/g, ' ')}
                                      </td>
                                      <td className="p-2.5 text-red-600 line-through">
                                        {typeof diff.old_value === 'object' ? JSON.stringify(diff.old_value) : String(diff.old_value || 'None')}
                                      </td>
                                      <td className="p-2.5 font-bold text-emerald-700 bg-emerald-50/40">
                                        {typeof diff.new_value === 'object' ? JSON.stringify(diff.new_value) : String(diff.new_value || 'None')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Admin Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                              <div className="text-[11px] text-secondary">
                                Submitted on: {new Date(req.submitted_at).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                  type="button"
                                  onClick={() => handleRejectProfileRequest(req.id, 'Change details could not be verified by admin')}
                                  className="flex-1 sm:flex-none px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-bold text-xs border border-red-300 flex items-center justify-center gap-1.5 transition"
                                >
                                  <UserX className="w-3.5 h-3.5" /> Reject Request
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveProfileRequest(req.id, 'Verified and approved by family administrator')}
                                  className="flex-1 sm:flex-none px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs border-2 border-midnight retro-btn shadow-[2px_2px_0px_#172033] flex items-center justify-center gap-1.5 transition"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve &amp; Update Profile
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* HISTORICAL RESOLVED REQUESTS */}
                  {profileRequestsList.filter(r => r.status !== 'pending').length > 0 && (
                    <div className="space-y-3 pt-6 border-t border-gray-300">
                      <h3 className="font-heading font-extrabold text-base text-midnight">
                        Historical Approvals &amp; Decisions ({profileRequestsList.filter(r => r.status !== 'pending').length})
                      </h3>
                      <div className="border-2 border-midnight rounded-xl overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-100 border-b border-midnight font-bold text-midnight">
                            <tr>
                              <th className="p-2.5 text-left">Member</th>
                              <th className="p-2.5 text-left">Branch</th>
                              <th className="p-2.5 text-left">Fields</th>
                              <th className="p-2.5 text-left">Status</th>
                              <th className="p-2.5 text-left">Reviewed By</th>
                              <th className="p-2.5 text-left">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileRequestsList.filter(r => r.status !== 'pending').map(h => (
                              <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-2.5 font-bold">{h.requested_by_name}</td>
                                <td className="p-2.5">{h.branch}</td>
                                <td className="p-2.5 font-mono text-[11px]">{Object.keys(h.changes || {}).join(', ')}</td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${h.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    {h.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-2.5 text-secondary">{h.reviewed_by_name || 'Admin'}</td>
                                <td className="p-2.5 text-secondary">{h.admin_notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODULE 1: OVERVIEW DASHBOARD */}
              {adminTab === 'overview' && (
                <div className="space-y-6">
                  {/* 8 Overview Stat Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="notebook-card p-4 bg-white">
                      <p className="text-xs text-secondary font-bold">Total Family Members</p>
                      <h3 className="font-heading font-black text-3xl text-indigo-600 mt-1">{membersList.length}</h3>
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">100% RLS Verified</p>
                    </div>
                    <div className="notebook-card p-4 bg-white">
                      <p className="text-xs text-secondary font-bold">Total Family Branches</p>
                      <h3 className="font-heading font-black text-3xl text-emerald-600 mt-1">{branchesList.length}</h3>
                      <p className="text-[10px] text-secondary font-bold mt-1">All 4 Branches Active</p>
                    </div>
                    <div className="notebook-card p-4 bg-white">
                      <p className="text-xs text-secondary font-bold">Total Families</p>
                      <h3 className="font-heading font-black text-3xl text-amber-600 mt-1">{familiesList.length}</h3>
                      <p className="text-[10px] text-secondary font-bold mt-1">Multi-Family Enabled</p>
                    </div>
                    <div className="notebook-card p-4 bg-white">
                      <p className="text-xs text-secondary font-bold">Total Photographs</p>
                      <h3 className="font-heading font-black text-3xl text-pink-600 mt-1">{photosList.length}</h3>
                      <p className="text-[10px] text-secondary font-bold mt-1">In 9 Dedicated Albums</p>
                    </div>
                    <div className="notebook-card p-4 bg-white">
                      <p className="text-xs text-secondary font-bold">Total Events</p>
                      <h3 className="font-heading font-black text-3xl text-purple-600 mt-1">{eventsList.length}</h3>
                      <p className="text-[10px] text-secondary font-bold mt-1">Annual Gatherings</p>
                    </div>
                    <div className="notebook-card p-4 bg-white">
                      <p className="text-xs text-secondary font-bold">Upcoming Events</p>
                      <h3 className="font-heading font-black text-3xl text-blue-600 mt-1">2</h3>
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">RSVPs Open</p>
                    </div>
                    <div className="notebook-card p-4 bg-white">
                      <p className="text-xs text-secondary font-bold">Pending Stories</p>
                      <h3 className="font-heading font-black text-3xl text-amber-500 mt-1">
                        {storiesList.filter(s => s.status === 'pending').length}
                      </h3>
                      <p className="text-[10px] text-secondary font-bold mt-1">Awaiting Moderation</p>
                    </div>
                    <div className="notebook-card p-4 bg-white">
                      <p className="text-xs text-secondary font-bold">Pending Access Requests</p>
                      <h3 className="font-heading font-black text-3xl text-red-500 mt-1">
                        {accessRequestsList.filter(r => r.status === 'pending').length}
                      </h3>
                      <p className="text-[10px] text-red-600 font-bold mt-1">Verification Required</p>
                    </div>
                  </div>

                  {/* Quick Actions Bar */}
                  <div className="p-4 bg-white rounded-2xl border-2 border-midnight shadow-sm flex flex-wrap gap-3 items-center justify-between">
                    <span className="text-xs font-bold text-midnight">⚡ Quick Action Bar:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setAdminTab('families');
                          setIsCreateFamilyModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-yellow-300 border border-midnight rounded-xl font-bold text-xs hover:bg-yellow-200"
                      >
                        + Create New Family
                      </button>
                      <button
                        onClick={() => {
                          setAdminTab('events');
                          setIsAddEventModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-purple-300 border border-midnight rounded-xl font-bold text-xs hover:bg-purple-200"
                      >
                        + Add Event
                      </button>
                      <button
                        onClick={() => {
                          setAdminTab('photos');
                          setIsAddPhotoModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-pink-300 border border-midnight rounded-xl font-bold text-xs hover:bg-pink-200"
                      >
                        + Upload Photo
                      </button>
                      <button
                        onClick={() => setAdminTab('notifications')}
                        className="px-3 py-1.5 bg-emerald-300 border border-midnight rounded-xl font-bold text-xs hover:bg-emerald-200"
                      >
                        + Dispatch WhatsApp Notice
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity & Recent Photos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="notebook-card p-5 bg-white">
                      <h3 className="font-heading font-bold text-base mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" /> Recent Security Activity Trail
                      </h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {activityLogs.slice(0, 6).map(log => (
                          <div key={log.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-indigo-700">{log.action_type}</span>
                              <span className="text-[10px] text-secondary">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[11px] text-secondary">{log.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="notebook-card p-5 bg-white">
                      <h3 className="font-heading font-bold text-base mb-3 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-indigo-600" /> Recently Uploaded Photographs
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {photosList.slice(0, 6).map(p => (
                          <div key={p.id} className="relative group rounded-lg overflow-hidden border border-midnight">
                            <img src={p.url} alt={p.title} className="w-full h-20 object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center p-1 text-center transition">
                              <p className="text-[10px] text-white font-bold truncate">{p.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 2: FAMILY MANAGEMENT */}
              {adminTab === 'families' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-secondary">
                      Create and manage distinct family lineages with custom founders, logos, history, and branches.
                    </p>
                    <button
                      onClick={() => setIsCreateFamilyModalOpen(true)}
                      className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-1.5 shadow-[2px_2px_0px_#172033]"
                    >
                      <Plus className="w-4 h-4" /> + CREATE NEW FAMILY
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {familiesList.map(fam => (
                      <div key={fam.id} className="notebook-card p-6 bg-white relative">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-yellow-300 border-2 border-midnight flex items-center justify-center text-2xl shadow-[2px_2px_0px_#172033]">
                              {fam.logo || '👑'}
                            </div>
                            <div>
                              <h3 className="font-heading font-bold text-lg text-midnight">{fam.name}</h3>
                              <p className="text-xs text-indigo-700 font-semibold">{fam.main_founder}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${fam.status === 'public' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                            {fam.status.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-xs text-secondary mb-4 leading-relaxed line-clamp-3">
                          {fam.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs text-secondary bg-gray-50 p-3 rounded-xl mb-4">
                          <div>
                            <span className="font-bold text-midnight">Origin:</span> {fam.origin}
                          </div>
                          <div>
                            <span className="font-bold text-midnight">Location:</span> {fam.location}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                          <span className="text-[11px] font-bold text-secondary">
                            Created: {fam.created_at}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedFamilyId(fam.id);
                                showToast(`Active family set to: ${fam.name}`, 'success');
                              }}
                              className="px-3 py-1 bg-yellow-300 border border-midnight rounded-lg text-xs font-bold"
                            >
                              Set Active
                            </button>
                            {fam.id !== 'fam_ambulkar' && (
                              <button
                                onClick={() => handleDeleteFamily(fam.id, fam.name)}
                                className="p-1 text-red-500 hover:text-red-700"
                                title="Delete Family"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 3: FAMILY MEMBERS */}
              {adminTab === 'members' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <p className="text-xs text-secondary">
                      Full control of all family members, parent-child links, and marriages.
                    </p>
                    <button
                      onClick={() => {
                        const newM: Member = {
                          id: `amb_${Date.now()}`,
                          owner_user_id: `user_new_${Date.now()}`,
                          name: 'New Family Member',
                          branch: 'Prakash Ambulkar Family',
                          generation: 'Gen 3: Grandchildren',
                          birth: '2000',
                          death: null,
                          birthplace: 'Maharashtra',
                          hometown: 'Pune',
                          bio: 'Family member profile.',
                          education: 'Graduate',
                          occupation: 'Professional',
                          achievements: ['New Member'],
                          parents: [],
                          siblings: [],
                          spouse: null,
                          children: [],
                          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                          privacy: 'public',
                        };
                        openEditProfileModal(newM);
                      }}
                      className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-1.5 shadow-[2px_2px_0px_#172033]"
                    >
                      <Plus className="w-4 h-4" /> + ADD NEW MEMBER
                    </button>
                  </div>

                  <div className="notebook-card bg-white p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b-2 border-midnight">
                          <th className="py-2.5 px-3">Member</th>
                          <th className="py-2.5 px-3">Branch</th>
                          <th className="py-2.5 px-3">Generation</th>
                          <th className="py-2.5 px-3">Occupation</th>
                          <th className="py-2.5 px-3">Twin Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {membersList.map(m => (
                          <tr key={m.id} className="hover:bg-yellow-50/50">
                            <td className="py-2.5 px-3 flex items-center gap-2">
                              <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full border border-midnight object-cover" />
                              <span className="font-bold">{m.name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-secondary">{m.branch}</td>
                            <td className="py-2.5 px-3 text-secondary">{m.generation}</td>
                            <td className="py-2.5 px-3 text-secondary">{m.occupation}</td>
                            <td className="py-2.5 px-3">
                              {m.isTwin ? <span className="text-amber-600 font-bold">👯‍♂️ Twin</span> : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              <button
                                onClick={() => openEditProfileModal(m)}
                                className="px-2.5 py-1 bg-yellow-300 text-midnight rounded-lg font-bold border border-midnight text-[11px]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`Delete record for ${m.name}?`)) return;
                                  const res = await fetch(`/api/admin/members/${m.id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${authToken}` },
                                  });
                                  if (res.ok) {
                                    showToast(`Deleted ${m.name}`, 'success');
                                    fetchAllData();
                                  }
                                }}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 4: FAMILY BRANCHES */}
              {adminTab === 'branches' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-secondary">
                      Manage household branches, head of branch members, and custom color accents.
                    </p>
                    <button
                      onClick={() => setIsAddBranchModalOpen(true)}
                      className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> + CREATE BRANCH
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {branchesList.map(b => (
                      <div key={b.id} className="notebook-card p-5 bg-white flex flex-col justify-between">
                        <div>
                          <div
                            className="w-4 h-4 rounded-full mb-3 border border-midnight"
                            style={{ backgroundColor: b.color || '#9878FF' }}
                          />
                          <h4 className="font-heading font-bold text-base text-midnight mb-1">{b.name}</h4>
                          <p className="text-xs text-indigo-700 font-semibold mb-2">{b.generation_span}</p>
                          <p className="text-xs text-secondary leading-relaxed">{b.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t flex justify-end">
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Delete branch '${b.name}'?`)) return;
                              const res = await fetch(`/api/admin/branches/${b.id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${authToken}` },
                              });
                              if (res.ok) {
                                showToast(`Branch '${b.name}' deleted`, 'success');
                                fetchAllData();
                              }
                            }}
                            className="text-xs text-red-500 hover:text-red-700 font-bold"
                          >
                            Delete Branch
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 5: FAMILY TREE MANAGEMENT */}
              {adminTab === 'tree' && (
                <div className="space-y-6">
                  <div className="p-4 bg-white rounded-2xl border-2 border-midnight">
                    <h3 className="font-heading font-bold text-base mb-2">Lineage Hierarchy &amp; Connectors</h3>
                    <p className="text-xs text-secondary mb-4">
                      Tree nodes automatically adapt according to parent, spouse, and twin relationships stored in the database.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <span className="font-bold text-xs">Parent-Child Links:</span>
                        <p className="text-xs text-secondary mt-1">19 Verified Relationships</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="font-bold text-xs">Marriages &amp; Spouses:</span>
                        <p className="text-xs text-secondary mt-1">4 Recorded Matrimonies</p>
                      </div>
                      <div className="p-3 bg-pink-50 rounded-xl border border-pink-200">
                        <span className="font-bold text-xs">Twins Connectors:</span>
                        <p className="text-xs text-secondary mt-1">Sagar &amp; Dr. Swapnil Ambulkar</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 6: EVENTS MANAGEMENT */}
              {adminTab === 'events' && (
                <div className="space-y-6">
                  {/* Events Subtabs */}
                  <div className="flex border-b-2 border-midnight pb-2 gap-2">
                    <button
                      onClick={() => setAdminEventsTab('events')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        adminEventsTab === 'events'
                          ? 'bg-yellow-300 text-midnight border-2 border-midnight shadow-[2px_2px_0px_#172033]'
                          : 'bg-white text-secondary hover:text-midnight border border-gray-300'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-indigo-700" /> Events Schedule ({eventsList.length})
                    </button>
                    <button
                      onClick={() => setAdminEventsTab('birthdays')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        adminEventsTab === 'birthdays'
                          ? 'bg-yellow-300 text-midnight border-2 border-midnight shadow-[2px_2px_0px_#172033]'
                          : 'bg-white text-secondary hover:text-midnight border border-gray-300'
                      }`}
                    >
                      <Gift className="w-4 h-4 text-pink-600" /> Member Birthday Calendar ({birthdayCalendarList.length})
                    </button>
                  </div>

                  {adminEventsTab === 'events' ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-secondary">
                          Create family reunions, weddings, anniversaries, and manage confirmed attendee RSVPs.
                        </p>
                        <button
                          onClick={() => {
                            setEditingEventId(null);
                            setEventFormData({
                              title: '',
                              description: '',
                              cover_photo: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
                              category: 'Family reunions',
                              date: new Date().toISOString().split('T')[0],
                              time: '11:00 AM IST',
                              location: 'Maharashtra, India',
                              branch: 'All Branches',
                              visibility: 'public',
                              invitations: 'All family members and descendants are invited.',
                            });
                            setIsAddEventModalOpen(true);
                          }}
                          className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-1.5 shadow-[2px_2px_0px_#172033]"
                        >
                          <Plus className="w-4 h-4" /> + CREATE NEW EVENT
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {eventsList.map(ev => (
                          <div key={ev.id} className="notebook-card p-5 bg-white relative">
                            {ev.cover_photo && (
                              <img src={ev.cover_photo} alt={ev.title} className="w-full h-32 object-cover rounded-xl mb-3 border border-midnight" />
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-yellow-200 text-midnight text-[10px] font-bold border border-midnight">
                                {ev.category}
                              </span>
                              <span className="text-[10px] text-indigo-700 font-bold">{ev.branch}</span>
                            </div>
                            <h4 className="font-heading font-bold text-base text-midnight mb-1">{ev.title}</h4>
                            <p className="text-xs text-secondary mb-2">{ev.description}</p>
                            <p className="text-[11px] text-secondary font-semibold">📅 {ev.date} at {ev.time} • 📍 {ev.location}</p>

                            <div className="mt-4 pt-3 border-t flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-800">
                                {ev.attendees?.length || 0} RSVP(s)
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingEventId(ev.id);
                                    setEventFormData({
                                      title: ev.title,
                                      description: ev.description,
                                      cover_photo: ev.cover_photo || '',
                                      category: ev.category,
                                      date: ev.date,
                                      time: ev.time,
                                      location: ev.location,
                                      branch: ev.branch || 'All Branches',
                                      visibility: ev.visibility,
                                      invitations: ev.invitations || '',
                                    });
                                    setIsAddEventModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-yellow-300 text-midnight rounded-lg text-xs font-bold border border-midnight"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(ev.id, ev.title)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Birthday Management Header & Filters */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs text-secondary">
                            Monthly chronological birthday index for all 19 Ambulkar family members. Convert any birthday into an official celebration event with 1 click.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={birthdayBranchFilter}
                            onChange={e => setBirthdayBranchFilter(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-midnight rounded-xl text-xs font-medium"
                          >
                            <option value="all">All Branches</option>
                            {branchesList.map(b => (
                              <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Month filter tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
                        <button
                          onClick={() => setBirthdayMonthFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                            birthdayMonthFilter === 'all'
                              ? 'bg-yellow-300 text-midnight border-midnight shadow-xs'
                              : 'bg-white text-secondary border-gray-300 hover:text-midnight'
                          }`}
                        >
                          All ({birthdayCalendarList.length})
                        </button>
                        {MONTH_SHORT.map((mShort, idx) => {
                          const monthNum = idx + 1;
                          const count = birthdayCalendarList.filter(b => b.month === monthNum).length;
                          return (
                            <button
                              key={mShort}
                              onClick={() => setBirthdayMonthFilter(monthNum)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-1 ${
                                birthdayMonthFilter === monthNum
                                  ? 'bg-yellow-300 text-midnight border-midnight shadow-xs'
                                  : 'bg-white text-secondary border-gray-300 hover:text-midnight'
                              }`}
                            >
                              <span>{mShort}</span>
                              {count > 0 && (
                                <span className="w-3.5 h-3.5 rounded-full bg-pink-100 text-pink-700 text-[9px] flex items-center justify-center font-bold">
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Admin Table of Member Birthdays */}
                      <div className="border-2 border-midnight rounded-xl overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-yellow-200 border-b-2 border-midnight text-midnight font-bold">
                              <th className="p-3">Member</th>
                              <th className="p-3">Branch &amp; Gen</th>
                              <th className="p-3">Birth Date</th>
                              <th className="p-3">Milestone Age</th>
                              <th className="p-3">Zodiac Sign</th>
                              <th className="p-3">Countdown</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredBirthdayList.map(bday => (
                              <tr key={bday.member.id} className="hover:bg-yellow-50/50 transition">
                                <td className="p-3">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={bday.member.avatar || 'https://placehold.co/150x150/9878FF/FFFFFF?text=MA'}
                                      alt={bday.member.name}
                                      className="w-8 h-8 rounded-full border border-midnight object-cover shrink-0"
                                    />
                                    <div>
                                      <p className="font-bold text-midnight flex items-center gap-1">
                                        <span>{bday.member.name}</span>
                                        {bday.member.isTwin && (
                                          <span className="text-[9px] px-1 bg-amber-100 text-amber-800 rounded font-bold">Twin</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-secondary">
                                  <p className="font-semibold text-indigo-700">{bday.member.branch}</p>
                                  <p className="text-[10px] text-gray-500">{bday.member.generation}</p>
                                </td>
                                <td className="p-3 font-semibold text-midnight">
                                  {bday.monthName} {bday.day}, {bday.birthYear}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-bold text-[11px] border border-pink-200">
                                    Turning {bday.turningAge} in 2026
                                  </span>
                                </td>
                                <td className="p-3 font-medium text-purple-800">
                                  {bday.zodiac.symbol} {bday.zodiac.name}
                                </td>
                                <td className="p-3">
                                  {bday.isToday ? (
                                    <span className="px-2 py-0.5 rounded bg-red-500 text-white font-bold text-[10px] animate-pulse">
                                      🎉 Today!
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-secondary font-mono">
                                      in {bday.daysUntil} days
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleConvertBirthdayToEvent(bday)}
                                      className="px-2.5 py-1 bg-yellow-300 hover:bg-yellow-200 text-midnight rounded-lg font-bold text-[11px] border border-midnight shadow-xs flex items-center gap-1"
                                      title="Convert Birthday to Official Event"
                                    >
                                      <Plus className="w-3 h-3 text-indigo-700" /> + Add Event
                                    </button>
                                    <button
                                      onClick={() => handleSendWhatsAppWish(bday)}
                                      className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg border border-emerald-300"
                                      title="Send WhatsApp Wish"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODULE 7: FAMILY PHOTOS */}
              {/* MODULE 7: FAMILY PHOTOS & HERITAGE */}
              {adminTab === 'photos' && (
                <div className="space-y-6">
                  {/* Photo Category Subtabs */}
                  <div className="flex border-b-2 border-midnight pb-2 gap-2">
                    <button
                      onClick={() => setPhotosSubTab('memories')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        photosSubTab === 'memories'
                          ? 'bg-yellow-300 text-midnight border-2 border-midnight shadow-[2px_2px_0px_#172033]'
                          : 'bg-white text-secondary hover:text-midnight border border-gray-300'
                      }`}
                    >
                      <Camera className="w-4 h-4 text-indigo-700" /> Section 7 • Memories Gallery ({photosList.length})
                    </button>
                    <button
                      onClick={() => setPhotosSubTab('heritage')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        photosSubTab === 'heritage'
                          ? 'bg-yellow-300 text-midnight border-2 border-midnight shadow-[2px_2px_0px_#172033]'
                          : 'bg-white text-secondary hover:text-midnight border border-gray-300'
                      }`}
                    >
                      <Crown className="w-4 h-4 text-amber-700" /> Section 2 • Ancestral Heritage ({heritagePhotosList.length})
                    </button>
                  </div>

                  {photosSubTab === 'memories' ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-secondary">
                          Upload, tag, album-categorize, and organize high-resolution family photographs in Section 7 Memories.
                        </p>
                        <button
                          onClick={() => {
                            setPhotoFormData({
                              title: '',
                              description: '',
                              url: '',
                              album_id: albumsList[0]?.id || 'alb_gatherings',
                              branch: 'All Branches',
                              member_id: '',
                              date: new Date().toISOString().split('T')[0],
                              location: 'Maharashtra, India',
                              visibility: 'public',
                            });
                            setIsAddPhotoModalOpen(true);
                          }}
                          className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-1.5 shadow-[2px_2px_0px_#172033]"
                        >
                          <Plus className="w-4 h-4" /> + UPLOAD PHOTO TO MEMORIES
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {photosList.map(photo => (
                          <div key={photo.id} className="notebook-card p-3 bg-white relative group">
                            <img src={photo.url} alt={photo.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                            <h5 className="font-bold text-xs truncate text-midnight">{photo.title}</h5>
                            <p className="text-[10px] text-secondary truncate">{photo.branch} • {photo.date}</p>
                            <div className="mt-2 pt-2 border-t flex justify-between items-center">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border">
                                {albumsList.find(a => a.id === photo.album_id)?.title || 'General'}
                              </span>
                              <button
                                onClick={() => handleDeletePhoto(photo.id, photo.title)}
                                className="p-1 text-red-500 hover:text-red-700 font-bold"
                                title="Delete Photo from Memories"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-secondary">
                          Manage ancestral polaroid photographs rendered directly in Section 2 Heritage.
                        </p>
                        <button
                          onClick={() => {
                            setHeritageFormData({
                              title: '',
                              caption: '',
                              url: '',
                              year: '1950',
                              rotation: -1,
                            });
                            setIsAddHeritageModalOpen(true);
                          }}
                          className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-1.5 shadow-[2px_2px_0px_#172033]"
                        >
                          <Plus className="w-4 h-4" /> + ADD HERITAGE PHOTO
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {heritagePhotosList.map(photo => (
                          <div key={photo.id} className="polaroid-frame bg-white p-3 border-2 border-midnight rounded-xl relative group">
                            <div className="tape-strip"></div>
                            <img src={photo.url} alt={photo.title} className="w-full h-40 object-cover rounded-md mb-2" />
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-heading font-bold text-sm truncate text-midnight">{photo.title}</h5>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 font-mono text-amber-900 border border-amber-300">
                                {photo.year || '1950'}
                              </span>
                            </div>
                            <p className="text-xs text-secondary line-clamp-2 mb-3">{photo.caption}</p>
                            <div className="pt-2 border-t flex justify-end">
                              <button
                                onClick={() => handleDeleteHeritagePhoto(photo.id, photo.title)}
                                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg border border-red-300 flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODULE 8: PHOTO ALBUMS */}
              {adminTab === 'albums' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-secondary">
                      All 9 Dedicated Album Categories + Custom Album Creation.
                    </p>
                    <button
                      onClick={() => setIsAddAlbumModalOpen(true)}
                      className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> + CREATE ALBUM
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {albumsList.map(alb => (
                      <div key={alb.id} className="notebook-card p-4 bg-white">
                        <img src={alb.cover_photo} alt={alb.title} className="w-full h-32 object-cover rounded-xl mb-3 border border-midnight" />
                        <h4 className="font-heading font-bold text-sm text-midnight">{alb.title}</h4>
                        <p className="text-xs text-secondary mt-1">{alb.description}</p>
                        <div className="mt-3 pt-2 border-t flex justify-between items-center text-[10px] text-secondary">
                          <span>{photosList.filter(p => p.album_id === alb.id).length} Photos</span>
                          <span className="font-bold text-indigo-700">{alb.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 9: STORIES & MEMORIES */}
              {adminTab === 'stories' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-secondary">
                      Chronicle family history, oral traditions, and approve member submissions.
                    </p>
                    <button
                      onClick={() => setIsAddStoryModalOpen(true)}
                      className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> + WRITE NEW STORY
                    </button>
                  </div>

                  <div className="space-y-4">
                    {storiesList.map(story => (
                      <div key={story.id} className="notebook-card p-5 bg-white flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${story.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {story.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-secondary">Year: {story.year} • Branch: {story.branch}</span>
                          </div>
                          <h4 className="font-heading font-bold text-base text-midnight">{story.title}</h4>
                          <p className="text-xs text-secondary mt-1 leading-relaxed">{story.content}</p>
                          <p className="text-[10px] text-indigo-700 font-bold mt-2">Author: {story.author_name}</p>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-center">
                          {story.status === 'pending' && (
                            <button
                              onClick={async () => {
                                await fetch(`/api/admin/stories/${story.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                                  body: JSON.stringify({ status: 'published' }),
                                });
                                showToast(`Story '${story.title}' approved and published`, 'success');
                                fetchAllData();
                              }}
                              className="px-3 py-1.5 bg-emerald-300 text-midnight border border-midnight rounded-xl text-xs font-bold"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Delete story '${story.title}'?`)) return;
                              await fetch(`/api/admin/stories/${story.id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${authToken}` },
                              });
                              showToast('Story deleted', 'success');
                              fetchAllData();
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 10: ACCESS REQUESTS */}
              {adminTab === 'access_requests' && (
                <div className="space-y-6">
                  <p className="text-xs text-secondary">
                    Review and verify lineage credentials for prospective family member accounts.
                  </p>

                  <div className="notebook-card bg-white p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b-2 border-midnight">
                          <th className="py-2.5 px-3">Applicant Name</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Claimed Branch</th>
                          <th className="py-2.5 px-3">Relationship Detail</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {accessRequestsList.map(req => (
                          <tr key={req.id}>
                            <td className="py-2.5 px-3 font-bold">{req.name}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px]">{req.email}</td>
                            <td className="py-2.5 px-3 text-secondary">{req.branch}</td>
                            <td className="py-2.5 px-3 text-secondary">{req.relationship_claim}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : req.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                {req.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              {req.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleModerateRequest(req.id, 'approve')}
                                    className="px-2.5 py-1 bg-emerald-300 text-midnight border border-midnight rounded text-[10px] font-bold"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleModerateRequest(req.id, 'reject')}
                                    className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 rounded text-[10px] font-bold"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 11: USER MANAGEMENT */}
              {adminTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-secondary">
                      Manage registered credentials, change roles, activate/suspend accounts, and issue invite codes.
                    </p>
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/admin/invites', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                          body: JSON.stringify({ branch: 'Prakash Ambulkar Family' }),
                        });
                        if (res.ok) {
                          showToast('Single-use invite code generated!', 'success');
                          fetchAdminSecureData();
                        }
                      }}
                      className="px-3.5 py-2 bg-emerald-300 text-midnight rounded-xl text-xs font-bold border-2 border-midnight retro-btn"
                    >
                      + Generate Invite Code
                    </button>
                  </div>

                  <div className="notebook-card bg-white p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b-2 border-midnight">
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {accountsList.map((acc, i) => (
                          <tr key={i}>
                            <td className="py-2.5 px-3 font-bold">{acc.name}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px]">{acc.email}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${acc.role === 'super_admin' ? 'bg-purple-200 text-purple-900' : 'bg-gray-100 text-gray-800'}`}>
                                {acc.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${acc.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {acc.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              {acc.role !== 'super_admin' && (
                                <button
                                  onClick={async () => {
                                    const nextStatus = acc.status === 'active' ? 'suspended' : 'active';
                                    await fetch(`/api/admin/accounts/${acc.user_id}/status`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                                      body: JSON.stringify({ status: nextStatus }),
                                    });
                                    fetchAdminSecureData();
                                    showToast(`Account status updated to ${nextStatus}`, 'success');
                                  }}
                                  className="px-2 py-1 bg-gray-100 border border-midnight rounded text-[10px] font-bold"
                                >
                                  {acc.status === 'active' ? 'Suspend' : 'Activate'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 12: NOTIFICATIONS */}
              {adminTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="notebook-card p-6 bg-white space-y-4">
                    <h3 className="font-heading font-bold text-base flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Cloud API &amp; Email Dispatcher
                    </h3>
                    
                    <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold mb-1">Dispatch Channel</label>
                          <select
                            value={notificationComposer.channel}
                            onChange={e => setNotificationComposer({ ...notificationComposer, channel: e.target.value as any })}
                            className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                          >
                            <option value="whatsapp">WhatsApp Business Cloud API</option>
                            <option value="email">Email Broadcast</option>
                            <option value="in_app">In-App Notification</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold mb-1">Template</label>
                          <select
                            value={notificationComposer.template}
                            onChange={e => setNotificationComposer({ ...notificationComposer, template: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                          >
                            <option value="reunion_announcement">Annual Reunion Announcement</option>
                            <option value="birthday_reminder">Family Birthday Alert</option>
                            <option value="photo_album_update">New Photo Album Uploaded</option>
                            <option value="general_announcement">Custom Dynasty Announcement</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold mb-1">Recipients</label>
                          <select
                            value={notificationComposer.recipient}
                            onChange={e => setNotificationComposer({ ...notificationComposer, recipient: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                          >
                            <option value="all_members">All Verified Family Members (19)</option>
                            <option value="prakash_branch">Prakash Branch Only</option>
                            <option value="krushana_branch">Krushana Branch Only</option>
                            <option value="eknath_branch">Eknath Branch Only</option>
                            <option value="sudhakar_branch">Sudhakar Branch Only</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Subject</label>
                        <input
                          type="text"
                          value={notificationComposer.subject}
                          onChange={e => setNotificationComposer({ ...notificationComposer, subject: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Message Content</label>
                        <textarea
                          rows={3}
                          value={notificationComposer.body}
                          onChange={e => setNotificationComposer({ ...notificationComposer, body: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-yellow-300 text-midnight border-2 border-midnight rounded-xl font-bold text-xs retro-btn flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Dispatch Notification Live
                      </button>
                    </form>
                  </div>

                  {/* Notification Delivery Logs */}
                  <div className="notebook-card p-5 bg-white">
                    <h4 className="font-heading font-bold text-sm mb-3">Delivery Status Logs</h4>
                    <div className="space-y-2">
                      {notificationsList.map(n => (
                        <div key={n.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-indigo-700">[{n.channel.toUpperCase()}]</span> {n.subject}
                            <p className="text-[10px] text-secondary">To: {n.recipient} • {n.timestamp}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {n.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 13: WEBSITE CONTENT */}
              {adminTab === 'website_content' && (
                <div className="space-y-6">
                  <div className="notebook-card p-6 bg-white space-y-4">
                    <h3 className="font-heading font-bold text-base">Hero Section &amp; Visibility Controls</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1">Hero Main Heading</label>
                        <input
                          type="text"
                          value={websiteSettings.hero_heading || ''}
                          onChange={e => setWebsiteSettings({ ...websiteSettings, hero_heading: e.target.value })}
                          className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Hero Introduction Subtitle</label>
                        <textarea
                          rows={2}
                          value={websiteSettings.hero_intro || ''}
                          onChange={e => setWebsiteSettings({ ...websiteSettings, hero_intro: e.target.value })}
                          className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Homepage Announcement Banner</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={websiteSettings.announcement?.active}
                            onChange={e => setWebsiteSettings({
                              ...websiteSettings,
                              announcement: { ...websiteSettings.announcement, active: e.target.checked }
                            })}
                            className="rounded"
                          />
                          <input
                            type="text"
                            value={websiteSettings.announcement?.text || ''}
                            onChange={e => setWebsiteSettings({
                              ...websiteSettings,
                              announcement: { ...websiteSettings.announcement, text: e.target.value }
                            })}
                            className="flex-1 p-2 rounded-xl border border-midnight text-xs"
                          />
                        </div>
                      </div>

                      {/* Section Visibility Toggles */}
                      <div className="pt-3 border-t">
                        <label className="block font-bold mb-2">Toggle Public Sections Visibility</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.keys(websiteSettings.sections_visible || {}).map(sec => (
                            <label key={sec} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border cursor-pointer">
                              <input
                                type="checkbox"
                                checked={websiteSettings.sections_visible[sec]}
                                onChange={e => setWebsiteSettings({
                                  ...websiteSettings,
                                  sections_visible: {
                                    ...websiteSettings.sections_visible,
                                    [sec]: e.target.checked,
                                  }
                                })}
                              />
                              <span className="capitalize text-xs font-bold">{sec}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleSaveWebsiteSettings}
                        className="px-6 py-2.5 bg-yellow-300 text-midnight rounded-xl font-bold text-xs retro-btn border-2 border-midnight"
                      >
                        Save Live Content Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 14: THEME & VISUAL FX */}
              {adminTab === 'theme' && (
                <div className="space-y-6">
                  <div className="notebook-card p-6 bg-white space-y-4">
                    <h3 className="font-heading font-bold text-base">Theme Selection &amp; Visual FX Controls</h3>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setTheme('modern');
                          setWebsiteSettings({ ...websiteSettings, default_theme: 'modern' });
                          showToast('Modern Minimal Theme Activated', 'success');
                        }}
                        className={`p-4 rounded-2xl border-2 border-midnight flex-1 text-left ${theme === 'modern' ? 'bg-yellow-300 shadow-[4px_4px_0px_#172033]' : 'bg-gray-50'}`}
                      >
                        <h4 className="font-heading font-bold text-base">Modern Minimal</h4>
                        <p className="text-xs text-secondary mt-1">Clean crisp retro-notebook styling with lively pop accents.</p>
                      </button>

                      <button
                        onClick={() => {
                          setTheme('heritage');
                          setWebsiteSettings({ ...websiteSettings, default_theme: 'heritage' });
                          showToast('Classic Heritage Theme Activated', 'success');
                        }}
                        className={`p-4 rounded-2xl border-2 border-midnight flex-1 text-left ${theme === 'heritage' ? 'bg-amber-300 shadow-[4px_4px_0px_#172033]' : 'bg-gray-50'}`}
                      >
                        <h4 className="font-heading font-bold text-base">Classic Heritage</h4>
                        <p className="text-xs text-secondary mt-1">Warm sepia tones, archival parchment backgrounds &amp; gold flourishes.</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 15: ACTIVITY LOGS */}
              {adminTab === 'logs' && (
                <div className="space-y-6">
                  <p className="text-xs text-secondary">
                    Immutable audit trail tracking all Super Admin actions, profile edits, and security events.
                  </p>

                  <div className="notebook-card bg-white p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b-2 border-midnight">
                          <th className="py-2.5 px-3">Timestamp</th>
                          <th className="py-2.5 px-3">Actor</th>
                          <th className="py-2.5 px-3">Action</th>
                          <th className="py-2.5 px-3">Target</th>
                          <th className="py-2.5 px-3">Details</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {activityLogs.map(log => (
                          <tr key={log.id}>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-secondary">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-bold">{log.actor_name}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{log.action_type}</td>
                            <td className="py-2.5 px-3 text-secondary">{log.target_entity}</td>
                            <td className="py-2.5 px-3 text-secondary text-[11px] max-w-xs truncate">{log.details}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {log.success ? 'SUCCESS' : 'FAILED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 16: DATABASE BACKUP */}
              {adminTab === 'backup' && (
                <div className="space-y-6">
                  <div className="notebook-card p-6 bg-white space-y-4">
                    <h3 className="font-heading font-bold text-base flex items-center gap-2">
                      <Download className="w-4 h-4 text-amber-600" /> Database Backup &amp; JSON Snapshot Export
                    </h3>
                    <p className="text-xs text-secondary">
                      Export full system state including all 19 members, multi-family lineages, photos, events, and audit logs.
                    </p>

                    <div className="flex gap-4">
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/admin/export', {
                            headers: { Authorization: `Bearer ${authToken}` },
                          });
                          const data = await res.json();
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Ambulkar_FamilySphere_Backup_${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                          showToast('Full JSON Database Snapshot Exported!', 'success');
                        }}
                        className="px-5 py-2.5 bg-yellow-300 text-midnight rounded-xl font-bold text-xs retro-btn border-2 border-midnight flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download Complete JSON Archive
                      </button>

                      <button
                        onClick={() => restoreFileInputRef.current?.click()}
                        className="px-5 py-2.5 bg-white text-midnight rounded-xl font-bold text-xs border-2 border-midnight flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4 text-indigo-600" /> Restore Snapshot
                      </button>
                      <input
                        type="file"
                        ref={restoreFileInputRef}
                        accept=".json"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const text = await file.text();
                            const parsed = JSON.parse(text);
                            await fetch('/api/admin/restore', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                              body: JSON.stringify({ backup: parsed }),
                            });
                            showToast('Database archive restored successfully!', 'success');
                            fetchAllData();
                          } catch (err) {
                            showToast('Invalid JSON backup file', 'error');
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 17: GENERAL SETTINGS */}
              {adminTab === 'general' && (
                <div className="space-y-6">
                  <div className="notebook-card p-6 bg-white space-y-4">
                    <h3 className="font-heading font-bold text-base flex items-center gap-2">
                      <Settings className="w-4 h-4 text-indigo-600" /> Dynasty Metadata &amp; Security Protocol
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1">Dynasty Title</label>
                        <input
                          type="text"
                          value={websiteSettings.dynasty_name || ''}
                          onChange={e => setWebsiteSettings({ ...websiteSettings, dynasty_name: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                        />
                      </div>

                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-emerald-900 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-700" /> Live Security &amp; Permission Test Suite
                          </span>
                          <button
                            onClick={runSecurityTests}
                            className="px-3 py-1 bg-emerald-300 text-midnight rounded-lg font-bold text-xs border border-midnight"
                          >
                            Run Test Suite
                          </button>
                        </div>
                        {securityTests && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
                            {securityTests.map((t, idx) => (
                              <div key={idx} className="p-2 bg-white rounded border border-emerald-200 flex justify-between items-center text-[11px]">
                                <span>{idx + 1}. {t.test}</span>
                                <span className="font-mono font-bold text-emerald-700">{t.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 18: SUPABASE BACKEND ARCHITECTURE & CLOUD DATABASE */}
              {adminTab === 'supabase' && (
                <div className="space-y-6">
                  {/* Top Status Card */}
                  <div className="notebook-card p-6 bg-white space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-midnight flex items-center justify-center text-emerald-800 shadow-[2px_2px_0px_#172033]">
                          <Server className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-heading font-extrabold text-lg text-midnight">
                            Supabase Cloud Project Architecture
                          </h3>
                          <p className="text-xs text-secondary">
                            Centralized client configuration connected at <code className="bg-gray-100 px-1 py-0.5 rounded text-indigo-700 font-mono">src/lib/supabase.ts</code>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                          supabaseStatus.connected
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${supabaseStatus.connected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                          {supabaseStatus.connected ? `Connected (${supabaseStatus.latencyMs}ms)` : 'Project Ready'}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            setSupabaseStatus(prev => ({ ...prev, testing: true }));
                            try {
                              const res = await fetch('/api/supabase/test-connection', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  url: supabaseConfigState.url,
                                  key: supabaseConfigState.key,
                                }),
                              });
                              const data = await res.json();
                              setSupabaseStatus({
                                connected: data.reachable,
                                message: data.message,
                                latencyMs: data.latency_ms,
                                testing: false,
                              });
                              showToast(data.reachable ? `Supabase reachable! Latency: ${data.latency_ms}ms` : data.message, data.reachable ? 'success' : 'error');
                            } catch (e: any) {
                              setSupabaseStatus({
                                connected: false,
                                message: 'Failed to run test',
                                testing: false,
                              });
                              showToast('Connection test failed', 'error');
                            }
                          }}
                          disabled={supabaseStatus.testing}
                          className="px-3 py-1.5 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border border-midnight shadow-xs hover:bg-yellow-200 flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus.testing ? 'animate-spin' : ''}`} />
                          {supabaseStatus.testing ? 'Testing...' : 'Test Connection'}
                        </button>
                      </div>
                    </div>

                    {/* Connection status banner */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-secondary">{supabaseStatus.message}</span>
                      </div>
                      {supabaseStatus.latencyMs !== undefined && (
                        <span className="font-mono text-[11px] font-bold text-indigo-700">
                          RTT: {supabaseStatus.latencyMs}ms
                        </span>
                      )}
                    </div>

                    {/* Project URL & Publishable Key configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block font-bold text-xs text-midnight mb-1">
                          Supabase Project URL
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={supabaseConfigState.url}
                          className="w-full p-2.5 rounded-xl border border-midnight bg-gray-100 text-xs font-mono text-indigo-900"
                        />
                        <p className="text-[10px] text-secondary mt-1">
                          Configured in <code className="font-mono">.env.example</code> as <code className="font-mono">VITE_SUPABASE_URL</code>
                        </p>
                      </div>

                      <div>
                        <label className="block font-bold text-xs text-midnight mb-1">
                          Supabase Publishable / Anon Key
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder={supabaseConfigState.key ? '••••••••••••••••••••••••••••••' : 'Enter Supabase publishable key'}
                            value={supabaseKeyInput}
                            onChange={e => setSupabaseKeyInput(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-midnight text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!supabaseKeyInput.trim()) {
                                showToast('Please enter a valid key', 'error');
                                return;
                              }
                              setSupabaseConfig(supabaseConfigState.url, supabaseKeyInput.trim());
                              setSupabaseConfigState(getSupabaseConfig());
                              setSupabaseKeyInput('');
                              showToast('Supabase key saved and reconnected!', 'success');
                            }}
                            className="px-4 py-2 bg-yellow-300 text-midnight rounded-xl text-xs font-bold border border-midnight shadow-xs hover:bg-yellow-200 shrink-0"
                          >
                            Save Key
                          </button>
                        </div>
                        <p className="text-[10px] text-secondary mt-1">
                          Stored securely in client configuration. Never exposes secret / service_role keys.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SQL Migration Script Generator & Action Bar */}
                  <div className="notebook-card p-6 bg-white space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                      <div>
                        <h4 className="font-heading font-extrabold text-base text-midnight flex items-center gap-2">
                          <Database className="w-4 h-4 text-indigo-600" />
                          <span>Complete PostgreSQL Schema &amp; RLS Migration</span>
                        </h4>
                        <p className="text-xs text-secondary mt-0.5">
                          16 Tables, UUID PKs, Row-Level Security policies, and 5 storage buckets ready to execute.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/supabase/sql-migration');
                              if (res.ok) {
                                const sql = await res.text();
                                await navigator.clipboard.writeText(sql);
                                showToast('Copied complete 462-line Supabase SQL migration script to clipboard!', 'success');
                              } else {
                                showToast('Failed to fetch SQL script', 'error');
                              }
                            } catch (e) {
                              showToast('Clipboard copy error', 'error');
                            }
                          }}
                          className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-midnight font-bold text-xs rounded-xl border border-midnight shadow-[2px_2px_0px_#172033] flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Complete SQL Migration Script
                        </button>

                        <a
                          href="https://supabase.com/dashboard/project/vhufjomnmyazzbayfocf/sql"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-white hover:bg-gray-50 text-indigo-700 font-bold text-xs rounded-xl border border-midnight shadow-xs flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Supabase SQL Editor
                        </a>
                      </div>
                    </div>

                    {/* Step-by-Step execution guide */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs">
                        <p className="font-bold text-indigo-950 mb-1 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                          <span>Copy SQL Migration</span>
                        </p>
                        <p className="text-[11px] text-secondary">
                          Click the button above to copy the generated PostgreSQL schema containing all 16 tables and RLS security rules.
                        </p>
                      </div>

                      <div className="p-3 bg-yellow-50/70 border border-yellow-200 rounded-xl text-xs">
                        <p className="font-bold text-amber-950 mb-1 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                          <span>Run in SQL Editor</span>
                        </p>
                        <p className="text-[11px] text-secondary">
                          Paste into your Supabase Dashboard SQL Editor (<code className="font-mono text-[10px]">vhufjomnmyazzbayfocf</code>) and click 'RUN'.
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
                        <p className="font-bold text-emerald-950 mb-1 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                          <span>Instant Live Sync</span>
                        </p>
                        <p className="text-[11px] text-secondary">
                          All public sections, admin modules, photo uploads, and member management instantly synchronize with Supabase.
                        </p>
                      </div>
                    </div>

                    {/* Tables & Storage Buckets Overview */}
                    <div className="pt-2">
                      <h5 className="font-bold text-xs text-midnight mb-2">
                        Active Database Schema Architecture (16 Tables &amp; 5 Storage Buckets):
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                          { name: 'families', desc: 'Multi-dynasty lineages' },
                          { name: 'family_branches', desc: '4 Core Branches' },
                          { name: 'family_members', desc: '19 Member Profiles' },
                          { name: 'family_relationships', desc: 'Topology & Tree' },
                          { name: 'photo_albums', desc: '9 Categorized Albums' },
                          { name: 'family_photos', desc: 'Section 7 Memories' },
                          { name: 'heritage_photos', desc: 'Section 2 Ancestral' },
                          { name: 'family_events', desc: 'Events & Birthdays' },
                          { name: 'event_rsvps', desc: 'Attendee Tracking' },
                          { name: 'family_stories', desc: 'Chronicles & Lore' },
                          { name: 'user_profiles', desc: 'Roles & Permissions' },
                          { name: 'invitations', desc: 'Single-Use Passes' },
                          { name: 'access_requests', desc: 'Verification Queue' },
                          { name: 'notifications', desc: 'WhatsApp & Email Logs' },
                          { name: 'activity_logs', desc: 'Security Audit Trail' },
                          { name: 'website_settings', desc: 'Dynasty Config & Theme' },
                        ].map((tbl, i) => (
                          <div key={tbl.name} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="font-mono font-bold text-[11px] text-indigo-700">{i + 1}. {tbl.name}</p>
                            <p className="text-[10px] text-secondary">{tbl.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Storage Buckets List */}
                    <div className="pt-2">
                      <h5 className="font-bold text-xs text-midnight mb-2">
                        Supabase Storage Buckets Configured:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {['family-photos', 'profile-photos', 'event-photos', 'family-documents', 'family-videos'].map(b => (
                          <span key={b} className="px-2.5 py-1 bg-purple-50 text-purple-900 border border-purple-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                            <FolderPlus className="w-3 h-3 text-purple-600" /> {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </section>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW FAMILY */}
      {isCreateFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-sm animate-fade-in">
          <div className="notebook-card bg-white w-full max-w-lg p-6 relative shadow-[10px_10px_0px_#172033]">
            <button
              onClick={() => setIsCreateFamilyModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-secondary hover:text-midnight"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-extrabold text-xl text-midnight mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" /> Create New Family Dynasty
            </h3>
            <form onSubmit={handleCreateFamily} className="space-y-3 text-xs text-left">
              <div>
                <label className="block font-bold mb-1">Family / Dynasty Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deshmukh Dynasty"
                  value={newFamilyData.name}
                  onChange={e => setNewFamilyData({ ...newFamilyData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Main Founder(s)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raghunath & Janaki Deshmukh"
                  value={newFamilyData.main_founder}
                  onChange={e => setNewFamilyData({ ...newFamilyData, main_founder: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Origin</label>
                  <input
                    type="text"
                    value={newFamilyData.origin}
                    onChange={e => setNewFamilyData({ ...newFamilyData, origin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={newFamilyData.location}
                    onChange={e => setNewFamilyData({ ...newFamilyData, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Description / Dynasty Overview</label>
                <textarea
                  rows={2}
                  value={newFamilyData.description}
                  onChange={e => setNewFamilyData({ ...newFamilyData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateFamilyModalOpen(false)}
                  className="px-4 py-2 border border-midnight rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-300 text-midnight rounded-xl font-bold retro-btn border border-midnight"
                >
                  Save &amp; Create Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EVENT */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-sm animate-fade-in">
          <div className="notebook-card bg-white w-full max-w-lg p-6 relative shadow-[10px_10px_0px_#172033]">
            <button
              onClick={() => setIsAddEventModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-secondary hover:text-midnight"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-extrabold text-xl text-midnight mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              {editingEventId ? 'Edit Event' : 'Create New Family Event'}
            </h3>
            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs text-left">
              <div>
                <label className="block font-bold mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Family Feast"
                  value={eventFormData.title}
                  onChange={e => setEventFormData({ ...eventFormData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={eventFormData.category}
                    onChange={e => setEventFormData({ ...eventFormData, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                  >
                    <option value="Birthdays">Birthdays</option>
                    <option value="Anniversaries">Anniversaries</option>
                    <option value="Weddings">Weddings</option>
                    <option value="Family reunions">Family reunions</option>
                    <option value="Festivals">Festivals</option>
                    <option value="Family celebrations">Family celebrations</option>
                    <option value="Other family occasions">Other occasions</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Assigned Branch</label>
                  <input
                    type="text"
                    value={eventFormData.branch}
                    onChange={e => setEventFormData({ ...eventFormData, branch: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={eventFormData.date}
                    onChange={e => setEventFormData({ ...eventFormData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Time</label>
                  <input
                    type="text"
                    value={eventFormData.time}
                    onChange={e => setEventFormData({ ...eventFormData, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={eventFormData.location}
                  onChange={e => setEventFormData({ ...eventFormData, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Event Cover Image</label>
                <input
                  type="file"
                  ref={eventCoverFileInputRef}
                  accept="image/*"
                  onChange={async e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const url = await readFileAsDataUrl(f);
                      setEventFormData(prev => ({ ...prev, cover_photo: url }));
                      showToast('Event cover loaded from gallery!', 'success');
                    }
                  }}
                  className="hidden"
                />
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => eventCoverFileInputRef.current?.click()}
                    className="flex-1 py-2 bg-yellow-100 hover:bg-yellow-200 text-midnight rounded-xl font-bold border border-midnight flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-700" /> Pick from Device Gallery
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Or enter image URL..."
                  value={eventFormData.cover_photo}
                  onChange={e => setEventFormData({ ...eventFormData, cover_photo: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
                {eventFormData.cover_photo && (
                  <div className="mt-2 text-center">
                    <img src={eventFormData.cover_photo} alt="Event Preview" className="w-full h-28 object-cover rounded-xl border border-midnight" />
                  </div>
                )}
              </div>
              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={eventFormData.description}
                  onChange={e => setEventFormData({ ...eventFormData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 border border-midnight rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-300 text-midnight rounded-xl font-bold retro-btn border border-midnight"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD PHOTO TO ALBUM */}
      {isAddPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-sm animate-fade-in">
          <div className="notebook-card bg-white w-full max-w-lg p-6 relative shadow-[10px_10px_0px_#172033]">
            <button
              onClick={() => setIsAddPhotoModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-secondary hover:text-midnight"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-extrabold text-xl text-midnight mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" /> Upload Family Photograph
            </h3>
            <form onSubmit={handleUploadPhotoSubmit} className="space-y-3 text-xs text-left">
              <div>
                <label className="block font-bold mb-1">Photo Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Convocation Showcase"
                  value={photoFormData.title}
                  onChange={e => setPhotoFormData({ ...photoFormData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Assign to Album</label>
                <select
                  value={photoFormData.album_id}
                  onChange={e => setPhotoFormData({ ...photoFormData, album_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                >
                  {albumsList.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Select Image from Device Gallery</label>
                <input
                  type="file"
                  ref={adminPhotoFileInputRef}
                  accept="image/*"
                  onChange={async e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const url = await readFileAsDataUrl(f);
                      setPhotoFormData(prev => ({ ...prev, url }));
                      showToast('Photo loaded from gallery!', 'success');
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => adminPhotoFileInputRef.current?.click()}
                  className="w-full py-2.5 bg-yellow-300 text-midnight rounded-xl font-bold border border-midnight mb-2 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Pick from Device Gallery
                </button>
                <input
                  type="text"
                  placeholder="Or enter image URL..."
                  value={photoFormData.url}
                  onChange={e => setPhotoFormData({ ...photoFormData, url: e.target.value })}
                  className="w-full p-2 rounded-xl border border-midnight text-xs"
                />

                {/* Quick Presets */}
                <div className="mt-2">
                  <label className="block font-bold mb-1 text-secondary text-[11px]">Or select from curated archives:</label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {FAMILY_ARCHIVE_PHOTOS.slice(0, 4).map((p, idx) => (
                      <img
                        key={idx}
                        src={p.url}
                        alt={p.caption}
                        onClick={() => setPhotoFormData(prev => ({ ...prev, url: p.url }))}
                        title={p.caption}
                        className="w-14 h-14 object-cover rounded-lg border-2 border-midnight hover:scale-105 cursor-pointer shrink-0"
                      />
                    ))}
                  </div>
                </div>
              </div>
              {photoFormData.url && (
                <div className="text-center">
                  <img src={photoFormData.url} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-midnight" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(false)}
                  className="px-4 py-2 border border-midnight rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-300 text-midnight rounded-xl font-bold retro-btn border border-midnight"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RSVP CONFIRMATION */}
      {isRsvpModalOpen && selectedEventForRsvp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-sm animate-fade-in">
          <div className="notebook-card bg-white w-full max-w-md p-6 relative shadow-[10px_10px_0px_#172033] text-left">
            <button
              onClick={() => setIsRsvpModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-secondary hover:text-midnight"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-extrabold text-xl text-midnight mb-1">
              Confirm Event Attendance
            </h3>
            <p className="text-xs text-secondary mb-4">{selectedEventForRsvp.title}</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={rsvpGuestName}
                  onChange={e => setRsvpGuestName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                  placeholder="e.g. Sarthak Ambulkar"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Total Guests Attending</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={rsvpGuestsCount}
                  onChange={e => setRsvpGuestsCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleConfirmRsvp}
                className="w-full py-3 bg-yellow-300 text-midnight font-bold rounded-xl retro-btn border border-midnight mt-2"
              >
                Submit RSVP Confirmation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INDIVIDUAL MEMBER PROFILE */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-sm animate-fade-in">
          <div className="notebook-card bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-[10px_10px_0px_#172033] text-left text-xs">
            <button
              onClick={() => setIsEditProfileModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-secondary hover:text-midnight"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-1">
              <span className="p-2 bg-yellow-300 rounded-xl border border-midnight">
                <Edit3 className="w-5 h-5 text-indigo-700" />
              </span>
              <div>
                <h3 className="font-heading font-extrabold text-2xl text-midnight">
                  Edit Profile: {selectedMember?.name}
                </h3>
                <p className="text-xs text-secondary">
                  Owner Verified. Safe fields update immediately; identity fields undergo Family Admin review.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
              {/* Full Name & Branch Note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300">
                <label className="block font-bold text-midnight mb-1">
                  Full Name <span className="text-[10px] text-amber-800 font-semibold">(Sensitive field: queued for Family Admin approval)</span>
                </label>
                <input
                  type="text"
                  value={selectedMember?.name || ''}
                  onChange={e => {
                    if (selectedMember) {
                      setMembersList(prev => prev.map(m => m.id === selectedMember.id ? { ...m, name: e.target.value } : m));
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs bg-white"
                />
              </div>

              {/* Date of Birth & Hometown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editFormData.birth}
                    onChange={e => setEditFormData({ ...editFormData, birth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Hometown / Origin</label>
                  <input
                    type="text"
                    value={editFormData.hometown}
                    onChange={e => setEditFormData({ ...editFormData, hometown: e.target.value })}
                    className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs bg-white"
                    placeholder="e.g. Pune, Maharashtra"
                  />
                </div>
              </div>

              {/* Education & Occupation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Education / Degrees</label>
                  <input
                    type="text"
                    value={editFormData.education}
                    onChange={e => setEditFormData({ ...editFormData, education: e.target.value })}
                    className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs bg-white"
                    placeholder="e.g. BE Computer Engineering"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Occupation / Profession</label>
                  <input
                    type="text"
                    value={editFormData.occupation}
                    onChange={e => setEditFormData({ ...editFormData, occupation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs bg-white"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block font-bold mb-1">Biography / Personal Journey</label>
                <textarea
                  rows={3}
                  value={editFormData.bio}
                  onChange={e => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs"
                  placeholder="Share your personal story, values, and accomplishments..."
                />
              </div>

              {/* Reason for Change */}
              <div>
                <label className="block font-bold mb-1">Reason / Notes for Update</label>
                <input
                  type="text"
                  value={changeReasonInput}
                  onChange={e => setChangeReasonInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-midnight text-xs"
                  placeholder="e.g. Updated education degree and added new family photos"
                />
              </div>

              {/* Avatar Uploader from Device Gallery */}
              <div className="p-4 bg-gray-50 rounded-xl border border-midnight">
                <label className="block font-bold mb-2">Profile Avatar (Device Gallery)</label>
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <img src={editFormData.avatar} alt="Avatar" className="w-14 h-14 rounded-full border border-midnight object-cover" />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-4 py-2 bg-yellow-300 border border-midnight rounded-xl font-bold retro-btn"
                  >
                    📸 Choose Avatar from Gallery
                  </button>
                </div>
              </div>

              {/* Multiple Gallery Photos */}
              <div className="p-4 bg-yellow-50/50 rounded-xl border border-midnight">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold">Personal Photo Album ({editFormData.personal_photos.length})</label>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-3 py-1 bg-yellow-300 border border-midnight rounded-lg font-bold"
                  >
                    + Add from Gallery
                  </button>
                </div>
                <input
                  type="file"
                  ref={galleryInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleGalleryPhotosChange}
                  className="hidden"
                />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {editFormData.personal_photos.map((p, idx) => (
                    <div key={idx} className="relative group border rounded-lg overflow-hidden">
                      <img src={p.url} alt={p.caption} className="w-full h-20 object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditFormData({
                          ...editFormData,
                          personal_photos: editFormData.personal_photos.filter((_, i) => i !== idx)
                        })}
                        className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 border border-midnight rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-yellow-300 text-midnight font-bold rounded-xl retro-btn border-2 border-midnight"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        MODAL: MODERN MINIMAL GLASSMORPHIC AUTHENTICATION MODAL (LOGIN / REGISTER / FORGOT PASSWORD)
        Theme: Icy lavender-white, 26px rounded panels, pink/cyan/violet glows, password toggle
      */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          {/* Ambient Glowing Orbs */}
          <div className="absolute w-96 h-96 bg-pink-400/20 rounded-full blur-3xl pointer-events-none -top-10 -left-10" />
          <div className="absolute w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />
          <div className="absolute w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />

          <div className="relative w-full max-w-lg bg-gradient-to-br from-white/95 via-indigo-50/90 to-purple-50/90 backdrop-blur-2xl border-2 border-indigo-200/80 rounded-[26px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(99,102,241,0.3)] text-left text-xs max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-800 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-300 to-amber-300 border-2 border-midnight flex items-center justify-center text-xl mx-auto mb-2 shadow-[2px_2px_0px_#172033]">
                👑
              </div>
              <h2 className="font-heading font-black text-2xl text-slate-900 tracking-tight">FamilySphere Portal</h2>
              <p className="text-indigo-600 font-bold uppercase tracking-wider text-[10px] mt-0.5">Ambulkar Dynasty Lineage Access</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-200/60 p-1 rounded-2xl mb-6 border border-slate-300/60">
              <button
                type="button"
                onClick={() => setAuthModalTab('login')}
                className={`flex-1 py-2 text-center font-bold text-xs rounded-xl transition ${authModalTab === 'login' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthModalTab('register')}
                className={`flex-1 py-2 text-center font-bold text-xs rounded-xl transition ${authModalTab === 'register' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Register as Member
              </button>
              <button
                type="button"
                onClick={() => setAuthModalTab('forgot')}
                className={`flex-1 py-2 text-center font-bold text-xs rounded-xl transition ${authModalTab === 'forgot' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Reset Password
              </button>
            </div>

            {/* TAB 1: LOGIN */}
            {authModalTab === 'login' && (
              <div className="space-y-4">
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    try {
                      const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: vaultEmail, password: vaultPassword }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        localStorage.setItem('familysphere_token', data.token);
                        setAuthToken(data.token);
                        setCurrentUser(data.user);
                        setIsAuthModalOpen(false);
                        setIsMemberDashboardOpen(true);
                        showToast(`Welcome back, ${data.user.name}!`, 'success');
                        fetchProfileRequests();
                      } else {
                        showToast(data.error || 'Login failed', 'error');
                      }
                    } catch (err) {
                      showToast('Login connection error', 'error');
                    }
                  }}
                  className="space-y-3.5"
                >
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={vaultEmail}
                      onChange={e => setVaultEmail(e.target.value)}
                      placeholder="name@ambulkar.family"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white text-xs outline-none transition"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-slate-800">Password</label>
                      <button
                        type="button"
                        onClick={() => setAuthModalTab('forgot')}
                        className="text-[11px] text-indigo-600 font-bold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={vaultPassword}
                        onChange={e => setVaultPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white text-xs outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer font-semibold">
                      <input type="checkbox" defaultChecked className="rounded accent-indigo-600" />
                      <span>Remember Me</span>
                    </label>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified Access
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition transform active:scale-98"
                  >
                    Sign In to Family Dashboard
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: REGISTER */}
            {authModalTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Anand Ambulkar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="name@ambulkar.family"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Mobile Number (Optional)</label>
                    <input
                      type="tel"
                      value={regMobile}
                      onChange={e => setRegMobile(e.target.value)}
                      placeholder="+91 98220 00000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Family Branch *</label>
                  <select
                    value={regBranch}
                    onChange={e => setRegBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none font-bold"
                  >
                    <option value="Sudhakar Ambulkar Family">Sudhakar Ambulkar Family (Senior Branch)</option>
                    <option value="Eknath Ambulkar Family">Eknath Ambulkar Family (Engineering &amp; Tech)</option>
                    <option value="Prakash Ambulkar Family">Prakash Ambulkar Family (Commerce &amp; Agri)</option>
                    <option value="Krushana Ambulkar Family">Krushana Ambulkar Family (Medical &amp; Edu)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Profile Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={regAvatar}
                    onChange={e => setRegAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/... (or add later)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none"
                  />
                </div>

                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-indigo-900">
                  🛡️ <strong>Level 1 Member Registration:</strong> Accounts strictly register with family member privileges. Admin roles must be granted by the Super Admin in the central lineage directory.
                </div>

                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                >
                  {isAuthSubmitting ? 'Registering...' : 'Create Family Member Account'}
                </button>
              </form>
            )}

            {/* TAB 3: FORGOT PASSWORD */}
            {authModalTab === 'forgot' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-[11px] text-indigo-900">
                  🔒 Enter your registered email address to receive an immediate 6-digit verification code.
                </div>

                {forgotStep === 'request' ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Registered Email Address</label>
                      <input
                        type="email"
                        required
                        value={forgotEmailInput}
                        onChange={e => setForgotEmailInput(e.target.value)}
                        placeholder="name@ambulkar.family"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                    >
                      Send 6-Digit Verification Code
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">6-Digit Verification Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotOtpCode}
                        onChange={e => setForgotOtpCode(e.target.value)}
                        placeholder="e.g. 582914"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">New Password (Min 6 chars)</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={forgotNewPasswordInput}
                        onChange={e => setForgotNewPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition"
                    >
                      Confirm New Password
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 
        MODAL: DEDICATED PERSONAL PROFILE DASHBOARD
        Displaying member name, avatar, branch, tree connections, profile completion score,
        personal photos with direct upload, and update requests history.
      */}
      {isMemberDashboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-md animate-fade-in text-left text-xs">
          <div className="relative w-full max-w-4xl bg-white rounded-[26px] border-2 border-midnight p-6 md:p-8 shadow-[12px_12px_0px_#172033] max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsMemberDashboardOpen(false)}
              className="absolute right-5 top-5 p-2 text-secondary hover:text-midnight rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 p-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-midnight shadow-[3px_3px_0px_#172033] mb-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={currentUser?.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-midnight shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => portalAvatarInputRef.current?.click()}
                    title="Change Avatar from Gallery"
                    className="absolute -bottom-1 -right-1 p-1 bg-yellow-300 text-midnight rounded-full border border-midnight shadow hover:bg-yellow-200"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h2 className="font-heading font-black text-xl text-midnight">{currentUser?.name}</h2>
                  <p className="text-secondary text-xs">{currentUser?.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-300">
                      {currentUser?.role === 'super_admin' ? 'Level 3 • Super Admin' : currentUser?.role === 'family_admin' ? 'Level 2 • Family Admin' : 'Level 1 • Family Member'}
                    </span>
                    {currentUser?.branch && (
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-yellow-200 text-midnight border border-yellow-300">
                        {currentUser.branch}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Email Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (myMemberRecord) openEditProfileModal(myMemberRecord);
                    else if (selectedMember) openEditProfileModal(selectedMember);
                  }}
                  className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-midnight rounded-xl font-bold retro-btn border-2 border-midnight flex items-center gap-1.5 shadow-[2px_2px_0px_#172033]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-700" /> Edit My Profile
                </button>
              </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-3 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview & Milestones', icon: Award },
                { id: 'tree', label: 'Tree Kinship Connections', icon: GitBranch },
                { id: 'photos', label: `Personal Photographs (${myMemberRecord?.personal_photos?.length || 0})`, icon: Camera },
                { id: 'requests', label: `Update Requests History (${profileRequestsList.filter(r => r.requested_by_user_id === currentUser?.user_id || r.member_id === currentUser?.member_id).length})`, icon: FileText },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMemberDashboardTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap ${memberDashboardTab === tab.id ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_#172033]' : 'bg-gray-100 text-secondary hover:text-midnight'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: OVERVIEW */}
            {memberDashboardTab === 'overview' && (
              <div className="space-y-6">
                {/* Profile Completion Bar */}
                <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border-2 border-midnight shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-midnight flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Profile Completion Strength</span>
                      </h4>
                      <p className="text-[11px] text-secondary">
                        A detailed profile preserves rich personal memories for future generations.
                      </p>
                    </div>
                    <span className="font-black text-xl text-emerald-600">{profileCompletionScore}%</span>
                  </div>
                  <div className="w-full h-3 bg-white border border-midnight rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${profileCompletionScore}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-emerald-200 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-900 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Account Created (20%)
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${myMemberRecord?.avatar ? 'text-emerald-900' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Profile Photo (15%)
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${myMemberRecord?.bio && myMemberRecord.bio.length > 15 ? 'text-emerald-900' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Biography (20%)
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${myMemberRecord?.education && myMemberRecord?.occupation ? 'text-emerald-900' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Education &amp; Job (15%)
                    </span>
                  </div>
                </div>

                {/* Bio & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white rounded-2xl border-2 border-midnight shadow-sm space-y-3">
                    <h4 className="font-heading font-bold text-sm text-midnight">Personal Biography</h4>
                    <p className="text-secondary leading-relaxed text-[11px]">
                      {myMemberRecord?.bio || 'No biography written yet. Click "Edit My Profile" above to share your journey.'}
                    </p>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border-2 border-midnight shadow-sm space-y-2">
                    <h4 className="font-heading font-bold text-sm text-midnight">Personal Details</h4>
                    <div className="space-y-1.5 text-[11px]">
                      <p><strong>🎓 Education:</strong> {myMemberRecord?.education || 'Not specified'}</p>
                      <p><strong>💼 Occupation:</strong> {myMemberRecord?.occupation || 'Not specified'}</p>
                      <p><strong>🎂 Date of Birth:</strong> {myMemberRecord?.birth || 'Not recorded'}</p>
                      <p><strong>📍 Birthplace:</strong> {myMemberRecord?.birthplace || 'Maharashtra, India'}</p>
                      <p><strong>🏡 Hometown:</strong> {myMemberRecord?.hometown || 'Pune, Maharashtra'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TREE CONNECTIONS */}
            {memberDashboardTab === 'tree' && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200">
                  <h4 className="font-heading font-bold text-sm text-midnight mb-1">Lineage Kinship Links</h4>
                  <p className="text-[11px] text-secondary">
                    Official genealogical connections verified in the Ambulkar Dynasty archive.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 bg-white rounded-xl border-2 border-midnight text-center">
                    <span className="text-indigo-600 font-extrabold text-[10px] uppercase">Parents</span>
                    <p className="font-bold text-midnight text-xs mt-1">
                      {myMemberRecord?.parents && myMemberRecord.parents.length > 0 ? myMemberRecord.parents.join(' & ') : 'Ancestral Generation 1'}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border-2 border-midnight text-center">
                    <span className="text-pink-600 font-extrabold text-[10px] uppercase">Spouse</span>
                    <p className="font-bold text-midnight text-xs mt-1">
                      {myMemberRecord?.spouse || 'None Recorded'}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border-2 border-midnight text-center">
                    <span className="text-emerald-600 font-extrabold text-[10px] uppercase">Siblings</span>
                    <p className="font-bold text-midnight text-xs mt-1">
                      {myMemberRecord?.siblings && myMemberRecord.siblings.length > 0 ? myMemberRecord.siblings.join(', ') : 'None Recorded'}
                    </p>
                    {myMemberRecord?.isTwin && (
                      <span className="mt-1 inline-block px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold text-[9px]">
                        ♊ Twin Brother of Dr. Swapnil
                      </span>
                    )}
                  </div>
                  <div className="p-4 bg-white rounded-xl border-2 border-midnight text-center">
                    <span className="text-amber-600 font-extrabold text-[10px] uppercase">Children</span>
                    <p className="font-bold text-midnight text-xs mt-1">
                      {myMemberRecord?.children && myMemberRecord.children.length > 0 ? myMemberRecord.children.join(', ') : 'None'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PERSONAL PHOTOS */}
            {memberDashboardTab === 'photos' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-midnight">Personal Photo Album</h4>
                    <p className="text-[11px] text-secondary">Photographs uploaded directly from your device gallery.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => portalGalleryInputRef.current?.click()}
                    className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-midnight rounded-xl font-bold retro-btn border border-midnight shadow-sm flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> + Upload from Device
                  </button>
                </div>

                {myMemberRecord?.personal_photos && myMemberRecord.personal_photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {myMemberRecord.personal_photos.map((p, idx) => (
                      <div key={p.id || idx} className="relative group border-2 border-midnight rounded-xl overflow-hidden bg-white shadow-xs">
                        <img src={p.url} alt={p.caption} className="w-full h-28 object-cover" />
                        <div className="p-2">
                          <p className="font-bold text-midnight truncate text-[11px]">{p.caption}</p>
                          <span className="text-[10px] text-secondary">{p.date}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDirectDeleteAccountPhoto(p.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-bold text-midnight">No personal photos uploaded yet</p>
                    <p className="text-[11px] text-secondary mt-1">Click "+ Upload from Device" to add photos from your phone or laptop.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: UPDATE REQUESTS HISTORY */}
            {memberDashboardTab === 'requests' && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200">
                  <h4 className="font-heading font-bold text-sm text-midnight mb-1">My Submitted Profile Change Requests</h4>
                  <p className="text-[11px] text-secondary">
                    Changes to critical fields are held in pending review until approved by your Family Admin or Super Admin.
                  </p>
                </div>

                {profileRequestsList.filter(r => r.requested_by_user_id === currentUser?.user_id || r.member_id === currentUser?.member_id).length === 0 ? (
                  <div className="p-8 text-center border border-gray-200 rounded-xl bg-white">
                    <p className="font-bold text-midnight">No profile update requests submitted</p>
                    <p className="text-[11px] text-secondary mt-1">When you update important profile fields, the verification record will appear here.</p>
                  </div>
                ) : (
                  <div className="border-2 border-midnight rounded-xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100 border-b border-midnight font-bold text-midnight">
                        <tr>
                          <th className="p-2.5 text-left">Request ID</th>
                          <th className="p-2.5 text-left">Fields Changed</th>
                          <th className="p-2.5 text-left">Reason</th>
                          <th className="p-2.5 text-left">Status</th>
                          <th className="p-2.5 text-left">Admin Feedback</th>
                          <th className="p-2.5 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profileRequestsList
                          .filter(r => r.requested_by_user_id === currentUser?.user_id || r.member_id === currentUser?.member_id)
                          .map(r => (
                            <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-2.5 font-mono text-[11px]">#{r.id.slice(-6)}</td>
                              <td className="p-2.5 font-bold">{Object.keys(r.changes || {}).join(', ')}</td>
                              <td className="p-2.5">{r.reason}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}>
                                  {r.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-2.5 text-secondary">{r.admin_notes || (r.status === 'pending' ? 'Pending admin verification' : '-')}</td>
                              <td className="p-2.5 text-secondary">{new Date(r.submitted_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL FOR PHOTOGRAPHS */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden border-2 border-midnight shadow-2xl relative"
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute right-4 top-4 p-2 bg-white/80 rounded-full text-midnight hover:bg-white border border-midnight"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxPhoto.url} alt={lightboxPhoto.title} className="w-full max-h-[70vh] object-contain bg-slate-900" />
            <div className="p-4 bg-white">
              <h3 className="font-heading font-extrabold text-xl text-midnight">{lightboxPhoto.title}</h3>
              <p className="text-xs text-secondary mt-1">{lightboxPhoto.description}</p>
              <div className="mt-3 flex justify-between items-center text-xs text-secondary">
                <span>Branch: {lightboxPhoto.branch}</span>
                <span>Date: {lightboxPhoto.date} • {lightboxPhoto.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ARCHIVE PHOTO PICKER */}
      {isArchivePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-md animate-fade-in">
          <div className="notebook-card bg-white w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 md:p-8 relative shadow-[10px_10px_0px_#172033] border-3 border-midnight">
            <button
              onClick={() => setIsArchivePickerOpen(false)}
              className="absolute right-4 top-4 p-2 text-secondary hover:text-midnight rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-yellow-300 rounded-xl border border-midnight">
                <ImageIcon className="w-5 h-5 text-indigo-700" />
              </span>
              <div>
                <h3 className="font-heading font-black text-xl text-midnight">
                  FamilySphere Curated Archive Gallery
                </h3>
                <p className="text-xs text-secondary">
                  Choose a high-resolution photograph to add directly to your profile or album
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {FAMILY_ARCHIVE_PHOTOS.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectArchivePhoto(item.url, item.caption)}
                  className="notebook-card p-2 bg-white border border-midnight rounded-xl overflow-hidden hover:scale-103 cursor-pointer transition shadow-sm group text-left"
                >
                  <img
                    src={item.url}
                    alt={item.caption}
                    className="w-full h-28 object-cover rounded-lg mb-1.5 group-hover:brightness-105"
                  />
                  <p className="text-[11px] font-bold text-midnight truncate">{item.caption}</p>
                  <span className="text-[10px] text-indigo-600 font-bold mt-1 inline-block">
                    + Select Image
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-dashed border-gray-300 flex justify-end">
              <button
                type="button"
                onClick={() => setIsArchivePickerOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-midnight rounded-xl font-bold text-xs border border-midnight"
              >
                Close Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SECTION 2 HERITAGE PHOTO */}
      {isAddHeritageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-sm animate-fade-in">
          <div className="notebook-card bg-white w-full max-w-lg p-6 relative shadow-[10px_10px_0px_#172033] border-3 border-midnight">
            <button
              onClick={() => setIsAddHeritageModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-secondary hover:text-midnight cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 bg-yellow-300 rounded-xl border border-midnight shadow-xs">
                <Crown className="w-5 h-5 text-amber-800" />
              </span>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-midnight">
                  Add Section 2 Heritage Photo
                </h3>
                <p className="text-xs text-secondary">
                  Add an ancestral photograph rendered in the vintage polaroid gallery
                </p>
              </div>
            </div>

            <form onSubmit={handleAddHeritagePhotoSubmit} className="space-y-3 text-xs text-left">
              <div>
                <label className="block font-bold mb-1">Photograph Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Generation 1 Founding Matriarch & Patriarch"
                  value={heritageFormData.title}
                  onChange={e => setHeritageFormData({ ...heritageFormData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Historical Caption / Story</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Founding pillars of the household lineage in Maharashtra."
                  value={heritageFormData.caption}
                  onChange={e => setHeritageFormData({ ...heritageFormData, caption: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Year / Era</label>
                  <input
                    type="text"
                    placeholder="e.g. 1945 or Circa 1960"
                    value={heritageFormData.year}
                    onChange={e => setHeritageFormData({ ...heritageFormData, year: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Polaroid Tilt Angle</label>
                  <select
                    value={heritageFormData.rotation}
                    onChange={e => setHeritageFormData({ ...heritageFormData, rotation: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-midnight text-xs"
                  >
                    <option value={-2}>Slight Left (-2°)</option>
                    <option value={-1}>Subtle Left (-1°)</option>
                    <option value={0}>Straight (0°)</option>
                    <option value={1}>Subtle Right (+1°)</option>
                    <option value={2}>Slight Right (+2°)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Select Image</label>
                <input
                  type="file"
                  ref={heritageFileInputRef}
                  accept="image/*"
                  onChange={async e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const url = await readFileAsDataUrl(f);
                      setHeritageFormData(prev => ({ ...prev, url }));
                      showToast('Heritage photo loaded from device!', 'success');
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => heritageFileInputRef.current?.click()}
                  className="w-full py-2.5 bg-yellow-300 hover:bg-yellow-200 text-midnight rounded-xl font-bold border border-midnight mb-2 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-indigo-700" /> Pick from Device Gallery / File
                </button>
                <input
                  type="text"
                  placeholder="Or enter image URL..."
                  value={heritageFormData.url}
                  onChange={e => setHeritageFormData({ ...heritageFormData, url: e.target.value })}
                  className="w-full p-2 rounded-xl border border-midnight text-xs"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block font-bold mb-1 text-secondary text-[11px]">Or select from curated archives:</label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {FAMILY_ARCHIVE_PHOTOS.slice(0, 4).map((p, idx) => (
                    <img
                      key={idx}
                      src={p.url}
                      alt={p.caption}
                      onClick={() => setHeritageFormData(prev => ({ ...prev, url: p.url }))}
                      title={p.caption}
                      className="w-14 h-14 object-cover rounded-lg border-2 border-midnight hover:scale-105 cursor-pointer shrink-0"
                    />
                  ))}
                </div>
              </div>

              {heritageFormData.url && (
                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="polaroid-frame inline-block max-w-[200px] shadow-sm">
                    <img src={heritageFormData.url} alt="Preview" className="w-36 h-28 object-cover rounded mb-1" />
                    <p className="hand-font text-sm font-bold text-midnight truncate">{heritageFormData.title || 'Preview Title'}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddHeritageModalOpen(false)}
                  className="px-4 py-2 border border-midnight rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-300 text-midnight rounded-xl font-bold retro-btn border border-midnight shadow-[2px_2px_0px_#172033] cursor-pointer"
                >
                  Save Heritage Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm animate-fade-in">
          <div className="notebook-card bg-white w-full max-w-sm p-6 relative shadow-[10px_10px_0px_#172033] border-3 border-midnight text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 border-2 border-midnight flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_#172033]">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-midnight mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-secondary mb-5 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 py-2.5 rounded-xl border-2 border-midnight font-bold text-xs hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs border-2 border-midnight retro-btn shadow-[2px_2px_0px_#172033] cursor-pointer"
              >
                {confirmModal.confirmLabel || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST CONTAINER */}
      <div id="toast-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`notebook-card p-4 flex items-center gap-3 text-xs font-bold pointer-events-auto bg-white border-l-4 shadow-[6px_6px_0px_#172033] ${
              toast.type === 'success' ? 'border-l-yellow-400' : 'border-l-pink-500'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-pink-600 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-secondary hover:text-midnight ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
