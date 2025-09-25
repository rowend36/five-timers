<script setup lang="ts">
import { useAuth } from "../hooks/useAuth";

const {
  user,
  isLoading,
  error,
  isAuthenticated,
  signInWithGoogle,
  signOutUser,
  clearError,
} = useAuth();

const handleSignIn = () => {
  clearError();
  signInWithGoogle();
};

const handleSignOut = () => {
  clearError();
  signOutUser();
};
</script>

<template>
  <div class="auth-container">
    <!-- Sign In Button (when not authenticated) -->
    <button
      v-if="!isAuthenticated"
      @click="handleSignIn"
      :disabled="isLoading"
      class="google-signin-btn"
      :class="{ loading: isLoading }"
    >
      <div class="btn-content">
        <svg class="google-icon" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span v-if="!isLoading">Sign in with Google</span>
        <span v-else class="loading-text">Signing in...</span>
      </div>
    </button>

    <!-- User Profile (when authenticated) -->
    <div v-else class="user-profile">
      <div class="user-info">
        <img
          v-if="user?.photoURL"
          :src="user.photoURL"
          :alt="user.displayName || 'User'"
          class="user-avatar"
        />
        <div class="user-details">
          <div class="user-name">{{ user?.displayName || "Anonymous" }}</div>
          <div class="user-email">{{ user?.email }}</div>
        </div>
      </div>
      <button @click="handleSignOut" class="signout-btn" title="Sign out">
        <svg viewBox="0 0 24 24" class="signout-icon">
          <path
            fill="currentColor"
            d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
          />
        </svg>
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <span>{{ error }}</span>
      <button @click="clearError" class="error-close">×</button>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Google Sign In Button */
.google-signin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  min-width: 200px;
  position: relative;
}

.google-signin-btn:hover:not(:disabled) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.12);
  border-color: #bdc1c6;
}

.google-signin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-signin-btn.loading {
  pointer-events: none;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.loading-text {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* User Profile */
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: white;
  font-size: 14px;
}

.user-email {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.signout-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.signout-icon {
  width: 16px;
  height: 16px;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  color: #f44336;
  font-size: 14px;
  backdrop-filter: blur(5px);
}

.error-close {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-close:hover {
  background: rgba(244, 67, 54, 0.1);
  border-radius: 50%;
}
</style>
