// useAuth.ts - Authentication composable
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";

export function useAuth() {
  const user = ref<User | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  let unsubscribe: (() => void) | null = null;

  const signInWithGoogle = async () => {
    try {
      error.value = null;
      isLoading.value = true;

      const result = await signInWithPopup(auth, googleProvider);

      // Optional: Get additional user info
      // const credential = GoogleAuthProvider.credentialFromResult(result)
      // const token = credential?.accessToken

      console.log("Successfully signed in:", result.user.displayName);
    } catch (err: any) {
      console.error("Sign in error:", err);

      // Handle specific error codes
      if (err.code === "auth/popup-closed-by-user") {
        error.value = "Sign in was cancelled";
      } else if (err.code === "auth/popup-blocked") {
        error.value = "Popup was blocked by browser";
      } else {
        error.value = "Failed to sign in with Google";
      }
    } finally {
      isLoading.value = false;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      console.log("Successfully signed out");
    } catch (err) {
      console.error("Sign out error:", err);
      error.value = "Failed to sign out";
    }
  };

  const clearError = () => {
    error.value = null;
  };

  onMounted(() => {
    // Listen for authentication state changes
    unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser;
      isLoading.value = false;
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return {
    user,
    isLoading,
    error,
    signInWithGoogle,
    signOutUser,
    clearError,
    isAuthenticated: computed(() => !!user.value),
  };
}
