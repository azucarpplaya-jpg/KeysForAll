import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

// Helper to generate a random secure string
function generateSecureString(length: number = 12): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => dec.toString(16).padStart(2, '0')).join('');
}

// 1. Admin Verification
export function isAdmin(): boolean {
  const user = auth.currentUser;
  return user !== null && user.displayName === "TypeFlow";
}

// 2. Admin Action: Ban a user
export async function banUser(userUidToBan: string) {
  if (!isAdmin()) {
    throw new Error("Unauthorized! Only TypeFlow can ban users.");
  }
  const banRef = doc(db, "banned_users", userUidToBan);
  await setDoc(banRef, {
    bannedAt: new Date().toISOString(),
    bannedBy: "TypeFlow"
  });
}

// 3. Username Availability Check
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const cleanedUsername = username.trim().toLowerCase();
  if (!cleanedUsername) return false;

  const usernameRef = doc(db, "usernames", cleanedUsername);
  const snap = await getDoc(usernameRef);
  return !snap.exists(); // Returns true if the username is free
}

// 4. Secure Signup with a Unique Username
export async function signupWithUsername(chosenUsername: string): Promise<User> {
  const cleanedUsername = chosenUsername.trim();
  const lowerUsername = cleanedUsername.toLowerCase();

  // Ensure username is not already taken
  const available = await isUsernameAvailable(lowerUsername);
  if (!available) {
    throw new Error("This username is already taken. Please choose another one!");
  }

  // Generate secure backend credentials
  const uniqueId = generateSecureString(6); 
  const dummyEmail = `user_${uniqueId}@typeflow.local`;
  const dummyPassword = generateSecureString(16);

  // Create Firebase Auth account
  const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, dummyPassword);
  const user = userCredential.user;

  // Save username to the Auth profile
  await updateProfile(user, { displayName: cleanedUsername });

  // Reserve the username in Firestore to prevent others from taking it
  const usernameRef = doc(db, "usernames", lowerUsername);
  await setDoc(usernameRef, { uid: user.uid });

  // Save backup credentials locally for recovery
  localStorage.setItem("tf_backup_creds", JSON.stringify({ email: dummyEmail, password: dummyPassword }));
  return user;
}

// 5. Restore Login (Restores session if cache/cookies are cleared)
export async function loginWithBackupCredentials(): Promise<User | null> {
  const backupRaw = localStorage.getItem("tf_backup_creds");
  if (!backupRaw) {
    console.log("No backup credentials found in localStorage.");
    return null;
  }

  try {
    const { email, password } = JSON.parse(backupRaw);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Successfully restored session from backup credentials.");
    return userCredential.user;
  } catch (error) {
    console.error("Backup restore failed:", error);
    return null;
  }
}

// 6. Unified Initialization check (Auto-login / Auto-migrate / Ban Check)
export function initializeAppAuth(callbacks: {
  onSignedIn: (user: User) => void;
  onBanned: () => void;
  onSignedOut: () => void;
}) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Check if user is banned
      const banRef = doc(db, "banned_users", user.uid);
      const banSnap = await getDoc(banRef);

      if (banSnap.exists()) {
        callbacks.onBanned();
        await signOut(auth);
      } else {
        callbacks.onSignedIn(user);
      }
    } else {
      // Check if they can be restored from backup
      const restoredUser = await loginWithBackupCredentials();
      if (restoredUser) return; // loginWithBackupCredentials triggers onAuthStateChanged again

      // Check if they need migration from the old system
      const oldUserDataRaw = localStorage.getItem("old_user_profile");
      if (oldUserDataRaw) {
        try {
          const oldData = JSON.parse(oldUserDataRaw);
          const oldName = oldData.displayName || oldData.username || "Guest";
          const newUser = await signupWithUsername(oldName);
          localStorage.removeItem("old_user_profile");
          callbacks.onSignedIn(newUser);
        } catch (error) {
          callbacks.onSignedOut();
        }
      } else {
        callbacks.onSignedOut();
      }
    }
  });
}
