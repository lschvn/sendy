<script setup lang="ts">
import { reactive, ref } from 'vue'
import * as z from 'zod'
import { useToast } from '#imports'

type ServerResponse = { status: number }

const { loggedIn, user } = useUserSession()

const showCodeForm = ref(false)

const emailSchema = z.object({
  email: z.string().email('Invalid email format'),
})

const emailState = reactive<{ email: string }>({
  email: '',
})

const codeSchema = z.object({
  code: z.array(z.string()).length(6, 'You must enter a 6-digit code'),
})

const codeState = reactive<{ code: string[] }>({
  code: [],
})

async function onEmailSubmit({ data }: { data: { email: string } }) {
  try {
    const res = await $fetch<ServerResponse>('/api/auth/code/request', {
      method: 'POST',
      body: { email: data.email },
    })
    if (res?.status === 200) {
      showCodeForm.value = true
    }
  }
  catch (err) {
    console.error(err)
    alert('Error requesting code')
  }
}

async function onCodeSubmit({ data }: { data: { code: string[] } }) {
  try {
    const joinedCode = data.code.join('')
    console.log(joinedCode)
    const res = await $fetch<ServerResponse>('/api/auth/code/verify', {
      method: 'POST',
      body: { email: emailState.email, code: joinedCode },
    })
    if (res?.status === 200) {
      useToast().add({
        title: 'Success',
        description: 'You have successfully verified your email.',
        color: 'success',
      })
      reloadNuxtApp()
    }
  }
  catch (err) {
    console.error(err)
    useToast().add({
      title: 'Invalid code',
      description: 'The code you entered is invalid. Please try again.',
      color: 'error',
    })
  }
}
</script>

<template>
  <NuxtContainer>
    <NuxtBadge
      v-if="loggedIn && user"
      color="success"
    >
      Connected as {{ user.email }}
    </NuxtBadge>
    <NuxtForm
      :schema="emailSchema"
      :state="emailState"
      class="space-y-4"
      @submit="onEmailSubmit"
    >
      <NuxtFormField
        name="email"
        label="Email"
      >
        <NuxtInput
          v-model="emailState.email"
          type="email"
          placeholder="you@example.com"
        />
      </NuxtFormField>
      <NuxtButton
        loading-auto
        class="cursor-pointer"

        type="submit"
        color="primary"
      >
        Send code
      </NuxtButton>
    </NuxtForm>

    <div
      v-if="showCodeForm"
      class="mt-4"
    >
      <NuxtForm
        :schema="codeSchema"
        :state="codeState"
        class="space-y-4"
        @submit="onCodeSubmit"
      >
        <NuxtFormField
          name="code"
          label="Code"
        >
          <NuxtPinInput
            v-model="codeState.code"
            :length="6"
            type="number"
          />
        </NuxtFormField>
        <NuxtButton
          loading-auto
          class="cursor-pointer"
          type="submit"
          color="primary"
        >
          Verify
        </NuxtButton>
      </NuxtForm>
    </div>
  </NuxtContainer>
</template>
