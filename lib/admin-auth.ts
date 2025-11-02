// Admin authentication with encrypted credentials
import { encrypt, decrypt } from './encryption';

// Default admin credentials (should be changed after first use)
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'Admin@12345'; // Change this immediately!

// Hash password using simple but effective algorithm
function hashPassword(password: string): string {
  // Simple hash function for client-side (not cryptographically secure, but sufficient for basic protection)
  let hash = 0;
  const salt = 'admin-salt-2024-secure';
  const saltedPassword = password + salt;
  
  for (let i = 0; i < saltedPassword.length; i++) {
    const char = saltedPassword.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex string
  return Math.abs(hash).toString(16);
}

// Initialize admin credentials if they don't exist
function initializeAdminCredentials(): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem('admin_credentials');
  if (!stored) {
    // Store encrypted credentials
    const credentials = {
      username: encrypt(DEFAULT_USERNAME),
      passwordHash: hashPassword(DEFAULT_PASSWORD)
    };
    localStorage.setItem('admin_credentials', JSON.stringify(credentials));
  }
}

// Get stored admin credentials
function getStoredCredentials(): { username: string; passwordHash: string } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('admin_credentials');
    if (!stored) {
      initializeAdminCredentials();
      return getStoredCredentials();
    }
    
    const encrypted = JSON.parse(stored);
    return {
      username: decrypt(encrypted.username),
      passwordHash: encrypted.passwordHash
    };
  } catch (error) {
    console.error('Error getting stored credentials:', error);
    return null;
  }
}

// Update admin credentials
export function updateAdminCredentials(username: string, newPassword: string, currentPassword: string): boolean {
  if (typeof window === 'undefined') return false;
  
  // Verify current password first
  if (!verifyAdminCredentials(getStoredCredentials()?.username || '', currentPassword)) {
    return false;
  }
  
  try {
    const credentials = {
      username: encrypt(username),
      passwordHash: hashPassword(newPassword)
    };
    localStorage.setItem('admin_credentials', JSON.stringify(credentials));
    
    // Clear current session
    clearAdminSession();
    return true;
  } catch (error) {
    console.error('Error updating credentials:', error);
    return false;
  }
}

// Verify admin credentials
export function verifyAdminCredentials(username: string, password: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const stored = getStoredCredentials();
  if (!stored) {
    initializeAdminCredentials();
    return verifyAdminCredentials(username, password);
  }
  
  const decryptedUsername = stored.username.toLowerCase().trim();
  const inputUsername = username.toLowerCase().trim();
  const inputPasswordHash = hashPassword(password);
  
  return decryptedUsername === inputUsername && stored.passwordHash === inputPasswordHash;
}

// Create admin session
export function createAdminSession(): void {
  if (typeof window === 'undefined') return;
  
  // Create session token
  const sessionToken = encrypt(Date.now().toString() + Math.random().toString());
  const sessionData = {
    token: sessionToken,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  localStorage.setItem('admin_session', JSON.stringify(sessionData));
}

// Check if admin is authenticated
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const sessionData = localStorage.getItem('admin_session');
    if (!sessionData) return false;
    
    const session = JSON.parse(sessionData);
    
    // Check if session expired
    if (session.expiresAt < Date.now()) {
      clearAdminSession();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking admin session:', error);
    return false;
  }
}

// Clear admin session
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_session');
}

// Login function
export function loginAdmin(username: string, password: string): boolean {
  if (verifyAdminCredentials(username, password)) {
    createAdminSession();
    return true;
  }
  return false;
}

// Logout function
export function logoutAdmin(): void {
  if (typeof window === 'undefined') return;
  
  // Clear admin session
  clearAdminSession();
  
  // Remove admin credentials from localStorage
  localStorage.removeItem('admin_credentials');
}

// Initialize on load
if (typeof window !== 'undefined') {
  initializeAdminCredentials();
}

