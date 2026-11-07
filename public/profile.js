/* ==========================================================================
   FamilySphere Member Dashboard & Profile Logic
   ========================================================================== */

let currentMember = null;
let currentSession = null;

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('familysphere_token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  await loadProfileData(token);
});

async function loadProfileData(token) {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.authenticated) {
      localStorage.removeItem('familysphere_token');
      window.location.href = '/login.html';
      return;
    }

    currentSession = data.user;
    document.getElementById('userName').textContent = currentSession.name;
    document.getElementById('userEmail').textContent = currentSession.email;
    if (currentSession.avatar) {
      document.getElementById('userAvatar').src = currentSession.avatar;
    }

    // Role badge
    const roleBadge = document.getElementById('roleBadge');
    if (currentSession.role === 'super_admin') {
      roleBadge.textContent = 'Level 3 • Super Admin';
      roleBadge.className = 'badge-pill badge-super';
    } else if (currentSession.role === 'family_admin') {
      roleBadge.textContent = 'Level 2 • Family Admin';
      roleBadge.className = 'badge-pill badge-admin';
    } else {
      roleBadge.textContent = 'Level 1 • Family Member';
      roleBadge.className = 'badge-pill badge-member';
    }

    const branchBadge = document.getElementById('branchBadge');
    if (currentSession.branch) {
      branchBadge.textContent = currentSession.branch;
    }

    // Fetch members list to find matching profile
    const membersRes = await fetch('/api/members');
    const membersList = await membersRes.json();
    currentMember = membersList.find(m => m.id === currentSession.member_id || m.owner_user_id === currentSession.user_id) || membersList[0];

    if (currentMember) {
      document.getElementById('userBio').textContent = currentMember.bio || 'No personal biography added yet.';
      document.getElementById('userEdu').textContent = currentMember.education || 'Not specified';
      document.getElementById('userOcc').textContent = currentMember.occupation || 'Not specified';
      document.getElementById('userBirthplace').textContent = currentMember.birthplace || 'Maharashtra';
      document.getElementById('userHometown').textContent = currentMember.hometown || 'Maharashtra';
      document.getElementById('userBirth').textContent = currentMember.birth || 'Not specified';

      // Kinship
      document.getElementById('treeParents').textContent = (currentMember.parents && currentMember.parents.length > 0) ? currentMember.parents.join(' & ') : 'Ancestral Generation 1';
      document.getElementById('treeSpouse').textContent = currentMember.spouse || 'None Recorded';
      document.getElementById('treeSiblings').textContent = (currentMember.siblings && currentMember.siblings.length > 0) ? currentMember.siblings.join(', ') : 'None Recorded';
      document.getElementById('treeChildren').textContent = (currentMember.children && currentMember.children.length > 0) ? currentMember.children.join(', ') : 'None Recorded';

      renderPersonalPhotos(currentMember.personal_photos || []);
      calculateCompletion(currentMember);
    }

    await loadRequests(token);
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

function calculateCompletion(m) {
  let score = 20; // Base account registered
  const checklist = [];
  checklist.push('✅ Member account created and email verified');

  if (m.avatar && !m.avatar.includes('placeholder')) {
    score += 15;
    checklist.push('✅ Profile photograph uploaded');
  } else {
    checklist.push('❌ Add custom profile photograph (+15%)');
  }

  if (m.bio && m.bio.length > 15) {
    score += 20;
    checklist.push('✅ Personal biography documented');
  } else {
    checklist.push('❌ Write personal biography (+20%)');
  }

  if (m.education && m.occupation) {
    score += 15;
    checklist.push('✅ Education and vocation details added');
  } else {
    checklist.push('❌ Complete education & occupation (+15%)');
  }

  if (m.birth) {
    score += 15;
    checklist.push('✅ Date of birth verified');
  } else {
    checklist.push('❌ Confirm date of birth (+15%)');
  }

  if (m.personal_photos && m.personal_photos.length > 0) {
    score += 15;
    checklist.push(`✅ Uploaded ${m.personal_photos.length} personal photograph(s)`);
  } else {
    checklist.push('❌ Upload photographs to personal gallery (+15%)');
  }

  score = Math.min(score, 100);
  const percentEl = document.getElementById('completionPercent');
  const barEl = document.getElementById('completionBar');
  const listEl = document.getElementById('completionChecklist');

  if (percentEl) percentEl.textContent = `${score}%`;
  if (barEl) barEl.style.width = `${score}%`;
  if (listEl) {
    listEl.innerHTML = checklist.map(item => `<li style="margin-bottom: 0.35rem;">${item}</li>`).join('');
  }
}

function renderPersonalPhotos(photos) {
  const grid = document.getElementById('personalPhotosGrid');
  if (!grid) return;
  if (!photos || photos.length === 0) {
    grid.innerHTML = '<p style="font-size: 0.8rem; color: #94a3b8; grid-column: 1 / -1;">No personal photos uploaded yet. Click "+ Upload from Device" above.</p>';
    return;
  }

  grid.innerHTML = photos.map(p => `
    <div style="position: relative; border-radius: 14px; overflow: hidden; border: 1.5px solid #cbd5e1; background: #fff;">
      <img src="${p.url}" alt="${p.caption}" class="photo-thumb" />
      <div style="padding: 0.4rem; font-size: 0.7rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${p.caption || 'Family Photo'}
      </div>
    </div>
  `).join('');
}

async function loadRequests(token) {
  try {
    const res = await fetch('/api/profile-requests', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const requests = await res.json();
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;

    if (!requests || requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 1.5rem;">No profile update requests submitted yet.</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map(r => {
      const fieldNames = Object.keys(r.changes || {}).join(', ');
      const statusColor = r.status === 'approved' ? '#10b981' : r.status === 'rejected' ? '#ef4444' : '#f59e0b';
      const statusBg = r.status === 'approved' ? '#d1fae5' : r.status === 'rejected' ? '#fee2e2' : '#fef3c7';
      return `
        <tr>
          <td style="font-family: monospace; font-size: 0.72rem;">#${r.id.slice(-6)}</td>
          <td><strong>${fieldNames || 'Profile details'}</strong></td>
          <td>${r.reason || 'Update request'}</td>
          <td>
            <span style="background: ${statusBg}; color: ${statusColor}; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; text-transform: uppercase;">
              ${r.status}
            </span>
          </td>
          <td>${r.admin_notes || (r.status === 'pending' ? 'Pending admin review' : '-')}</td>
          <td style="color: #64748b;">${new Date(r.submitted_at).toLocaleDateString()}</td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    console.error('Error loading requests:', e);
  }
}

function switchTab(tabId, btn) {
  ['tab-overview', 'tab-tree', 'tab-photos', 'tab-requests'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? (id === 'tab-overview' ? 'grid' : 'block') : 'none';
  });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function openEditModal() {
  if (!currentMember) return;
  document.getElementById('editName').value = currentMember.name || '';
  document.getElementById('editBirth').value = currentMember.birth || '';
  document.getElementById('editHometown').value = currentMember.hometown || '';
  document.getElementById('editEdu').value = currentMember.education || '';
  document.getElementById('editOcc').value = currentMember.occupation || '';
  document.getElementById('editBio').value = currentMember.bio || '';
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const token = localStorage.getItem('familysphere_token');
  if (!token || !currentMember) return;

  const name = document.getElementById('editName').value.trim();
  const birth = document.getElementById('editBirth').value;
  const hometown = document.getElementById('editHometown').value.trim();
  const education = document.getElementById('editEdu').value.trim();
  const occupation = document.getElementById('editOcc').value.trim();
  const bio = document.getElementById('editBio').value.trim();
  const reason = document.getElementById('editReason').value.trim();

  try {
    const res = await fetch(`/api/members/${currentMember.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        birth,
        hometown,
        education,
        occupation,
        bio,
        reason: reason || 'Member updated profile via dashboard',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to update profile.');
      return;
    }

    if (data.notice) {
      alert(`Changes submitted! ${data.notice}`);
    } else {
      alert('Profile updated successfully!');
    }

    closeEditModal();
    await loadProfileData(token);
  } catch (err) {
    alert('Error saving profile changes.');
  }
}

async function handleDirectUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0 || !currentMember) return;
  const token = localStorage.getItem('familysphere_token');

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      const updatedPhotos = currentMember.personal_photos ? [...currentMember.personal_photos] : [];
      updatedPhotos.push({
        id: 'photo_' + Date.now() + '_' + i,
        url: dataUrl,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        date: new Date().toISOString().split('T')[0],
      });

      await fetch(`/api/members/${currentMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ personal_photos: updatedPhotos }),
      });

      await loadProfileData(token);
    };
    reader.readAsDataURL(file);
  }
}

function handleLogout() {
  localStorage.removeItem('familysphere_token');
  localStorage.removeItem('familysphere_user');
  window.location.href = '/login.html';
}
