<script setup lang="ts">
import type { FormSubmitEvent, FormError } from '#ui/types'

const state = reactive({
  progress: 0,
  message: '',
  status: '',
  isUploading: false,
  file: null as File | null,
  title: '',
  to: '',
  messageInput: '',
})

// Validation personnalisée
function validate(formData: any): FormError[] {
  const errors: FormError[] = []
  if (!formData.file) {
    errors.push({ name: 'file', message: 'Please select a file' })
  }
  return errors
}

async function onSubmit(event: FormSubmitEvent<any>) {
  const formData = event.data
  const fileSizeLimit = 100 * 1024 * 1024 // 100 MB

  // Reset l'état
  state.message = ''
  state.status = ''

  if (!formData.file) {
    state.message = 'Please select a file'
    state.status = 'error'
    return
  }

  state.isUploading = true

  if (formData.file.size > fileSizeLimit) {
    const upload = useMultipartUpload('/api/upload/multipart')
    const { completed, progress } = upload(formData.file)

    watch(progress, (val) => {
      state.progress = Math.round(val)
    })

    try {
      const result = await completed
      state.message = 'Upload successful!'
      state.status = 'success'
      await $fetch('/api/upload/complete', {
        method: 'POST',
        body: {
          path: result?.pathname || '',
          title: formData.title,
          to: formData.to,
          message: formData.messageInput,
        },
      })
    }
    catch (error) {
      state.message = 'An error occurred during upload'
      state.status = 'error'
    }
    finally {
      state.isUploading = false
    }
  }
  else {
    // Upload direct
    const plainFormData = new FormData()
    plainFormData.append('file', formData.file)
    plainFormData.append('title', formData.title)
    plainFormData.append('to', formData.to)
    plainFormData.append('message', formData.messageInput)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: plainFormData,
      })

      if (response.ok) {
        state.message = 'Upload successful!'
        state.status = 'success'
      }
      else {
        throw new Error('Upload failed')
      }
    }
    catch (error) {
      state.message = 'An error occurred during upload'
      state.status = 'error'
    }
    finally {
      state.isUploading = false
    }
  }
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  state.file = target.files ? target.files[0] : null
}
</script>

<template>
  <NuxtForm
    :state="state"
    :validate="validate"
    class="space-y-6"
    @submit="onSubmit"
  >
    <NuxtFormField
      name="title"
      label="Title"
      description="File title"
    >
      <NuxtInput
        v-model="state.title"
        type="text"
        placeholder="Enter a title"
      />
    </NuxtFormField>

    <NuxtFormField
      name="to"
      label="Recipient"
      description="Who will receive your file?"
    >
      <NuxtInput
        v-model="state.to"
        type="text"
        placeholder="Recipient's name or email"
      />
    </NuxtFormField>

    <NuxtFormField
      name="messageInput"
      label="Message"
      description="Write a short message"
    >
      <NuxtTextarea
        v-model="state.messageInput"
        :rows="3"
        placeholder="Optional message"
      />
    </NuxtFormField>

    <NuxtFormField
      name="file"
      label="File upload"
      description="PNG, JPG, GIF up to 500MB"
    >
      <NuxtInput
        type="file"
        accept="image/*"
        @change="handleFileChange"
      />
      <p
        v-if="state.file"
        class="mt-2 text-sm text-gray-600"
      >
        Selected file: {{ state.file.name }}
      </p>
    </NuxtFormField>

    <NuxtButton
      :disabled="state.isUploading"
      color="primary"
      type="submit"
    >
      Send file
    </NuxtButton>
  </NuxtForm>

  <div class="mt-6">
    <p
      :class="{
        'text-green-600': state.status === 'success',
        'text-red-600': state.status === 'error',
      }"
      class="text-center font-medium"
    >
      {{ state.message }}
    </p>

    <div
      v-if="state.progress > 0"
      class="mt-4"
    >
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-indigo-600">Progress</span>
        <span class="text-sm font-medium text-indigo-600">{{ state.progress }}%</span>
      </div>
      <div class="bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner relative">
        <div
          class="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 relative overflow-hidden transition-all duration-300 ease-out"
          :style="{ width: `${state.progress}%` }"
        >
          <div class="absolute inset-0 progress-shine" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-shine {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.4) 50%,
    rgba(255,255,255,0) 100%
  );
  animation: shine 1.5s infinite;
  transform: skewX(-20deg);
}

@keyframes shine {
  from {
    transform: translateX(-100%) skewX(-20deg);
  }
  to {
    transform: translateX(200%) skewX(-20deg);
  }
}
</style>
