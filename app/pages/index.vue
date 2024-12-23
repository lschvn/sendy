<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession()
</script>

<template>
  <NuxtContainer>
    <AuthForm v-if="!loggedIn" />
    <div v-else>
      <NuxtBadge
        color="success"
      >
        Connected as {{ user!.email }}
      </NuxtBadge>
      <NuxtButton
        loading-auto
        class="cursor-pointer"
        color="error"
        icon="mdi:logout"
        @click="clear"
      >
        Logout
      </NuxtButton>
      <UploadFileForm />
    </div>
  </NuxtContainer>
</template>
