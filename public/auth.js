/* ==========================================================================
   FamilySphere Member Authentication JavaScript
   Connects to Express / Supabase backend endpoints
   ========================================================================== */

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
  }
}

function fillDemo(email, pass) {
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  if (emailInput && passInput) {
    emailInput.value = email;
    passInput.value = pass;
    showAlert('Selected demo credentials. Click "Sign In" below to authenticate.', 'success');
  }
}

function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('alertBox');
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `alert-box alert-${type}`;
  alertBox.style.display = 'flex';
}

function clearAlert() {
  const alertBox = document.getElementById('alertBox');
  if (alertBox) alertBox.style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  clearAlert();
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const remember = document.getElementById('rememberMe')?.checked;
  const btn = document.getElementById('loginBtn');

  if (!email || !password) {
    showAlert('Please provide both email and password.');
    return;
  }

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Verifying credentials...';
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember }),
    });

    const data = await res.json();
    if (!res.ok) {
      showAlert(data.error || 'Authentication failed. Please check your credentials.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Sign In to Family Dashboard';
      }
      return;
    }

    // Save token and user session
    localStorage.setItem('familysphere_token', data.token);
    localStorage.setItem('familysphere_user', JSON.stringify(data.user));

    showAlert(`Welcome back, ${data.user.name}! Redirecting to your profile dashboard...`, 'success');
    setTimeout(() => {
      window.location.href = '/member-dashboard.html';
    }, 900);
  } catch (err) {
    showAlert('Network error communicating with family server. Please try again.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Sign In to Family Dashboard';
    }
  }
}

async function handleRegister(e) {
  e.preventDefault();
  clearAlert();
  const name = document.getElementById('regName')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const mobile = document.getElementById('regMobile')?.value.trim();
  const branch = document.getElementById('regBranch')?.value;
  const password = document.getElementById('regPassword')?.value;
  const confirmPassword = document.getElementById('regConfirm')?.value;
  const avatar = document.getElementById('regAvatar')?.value.trim();
  const btn = document.getElementById('regBtn');

  if (!name || !email || !branch || !password) {
    showAlert('Please fill in all required fields marked with an asterisk (*).', 'error');
    return;
  }

  if (password.length < 6) {
    showAlert('Password must be at least 6 characters in length.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Passwords do not match. Please re-enter identical passwords.', 'error');
    return;
  }

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Creating account & linking profile...';
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, mobile, branch, password, avatar }),
    });

    const data = await res.json();
    if (!res.ok) {
      showAlert(data.error || 'Registration failed.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Create Member Account';
      }
      return;
    }

    localStorage.setItem('familysphere_token', data.token);
    localStorage.setItem('familysphere_user', JSON.stringify(data.user));

    showAlert('Registration successful! Redirecting to your personal family dashboard...', 'success');
    setTimeout(() => {
      window.location.href = '/member-dashboard.html';
    }, 1000);
  } catch (err) {
    showAlert('Error communicating with family server. Please check your network.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Create Member Account';
    }
  }
}

function toggleForgotPassword(show) {
  const form = document.getElementById('loginForm');
  const forgot = document.getElementById('forgotPasswordView');
  if (form && forgot) {
    form.style.display = show ? 'none' : 'block';
    forgot.style.display = show ? 'block' : 'none';
  }
}

async function handleSendResetCode() {
  const email = document.getElementById('forgotEmail')?.value.trim();
  if (!email) {
    showAlert('Please enter your email to receive a password reset code.', 'error');
    return;
  }
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(data.error || 'Failed to send reset code.', 'error');
      return;
    }
    showAlert(`Reset code sent! For this demo, your code is: ${data.demo_code}`, 'success');
    const step2 = document.getElementById('forgotStep2');
    if (step2) {
      step2.style.display = 'block';
      const resetCodeInput = document.getElementById('resetCode');
      if (resetCodeInput && data.demo_code) resetCodeInput.value = data.demo_code;
    }
  } catch (err) {
    showAlert('Network error sending reset code.', 'error');
  }
}

async function handleVerifyReset() {
  const email = document.getElementById('forgotEmail')?.value.trim();
  const code = document.getElementById('resetCode')?.value.trim();
  const newPassword = document.getElementById('resetNewPass')?.value;
  if (!email || !code || !newPassword) {
    showAlert('Please provide the reset code and a new password.', 'error');
    return;
  }
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(data.error || 'Reset code verification failed.', 'error');
      return;
    }
    showAlert('Password successfully reset! You can now log in with your new password.', 'success');
    setTimeout(() => {
      toggleForgotPassword(false);
      const passField = document.getElementById('loginPassword');
      if (passField) passField.value = newPassword;
    }, 1200);
  } catch (err) {
    showAlert('Error resetting password.', 'error');
  }
}
