<script setup lang="ts">
import { provide } from "vue";
import { useAuth } from "../hooks/useAuth";

const authState = useAuth();
const { user, isLoading, isAuthenticated } = authState;

// Provide auth state to all child components
provide("auth", authState);
</script>
<template>
  <div v-if="isLoading" class="auth-loading">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>
  <slot v-else :user="user" :isAuthenticated="isAuthenticated" />
</template>
