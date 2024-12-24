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
  <div class="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm">
    <NuxtForm
      :state="state"
      :validate="validate"
      class="space-y-8"
      @submit="onSubmit"
    >
      <NuxtFormField
        name="title"
        label="Title"
        description="File title"
        class="space-y-2"
      >
        <NuxtInput
          v-model="state.title"
          type="text"
          placeholder="Enter a title"
          class="w-full"
        />
      </NuxtFormField>

      <NuxtFormField
        name="to"
        label="Recipient"
        description="Who will receive your file?"
        class="space-y-2"
      >
        <NuxtInput
          v-model="state.to"
          type="text"
          placeholder="Recipient's name or email"
          class="w-full"
        />
      </NuxtFormField>

      <NuxtFormField
        name="messageInput"
        label="Message"
        description="Write a short message"
        class="space-y-2"
      >
        <NuxtTextarea
          v-model="state.messageInput"
          :rows="3"
          placeholder="Optional message"
          class="w-full"
        />
      </NuxtFormField>

      <NuxtFormField
        name="file"
        label="File upload"
        description="PNG, JPG, GIF up to 500MB"
        class="space-y-2"
      >
        <div class="flex items-center justify-center w-full">
          <label class="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-300">
            <div class="flex flex-col items-center justify-center pt-7">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="pt-1 text-sm tracking-wider text-gray-400">
                Drop your file here or click to browse
              </p>
            </div>
            <NuxtInput
              type="file"
              accept="image/*"
              class="opacity-0"
              @change="handleFileChange"
            />
          </label>
        </div>
        <p
          v-if="state.file"
          class="mt-2 text-sm text-gray-600 flex items-center"
        >
          <svg class="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ state.file.name }}
        </p>
      </NuxtFormField>

      <div class="flex justify-end">
        <NuxtButton
          :disabled="state.isUploading"
          :loading="state.isUploading"
          color="primary"
          type="submit"
          class="px-6"
        >
          {{ state.isUploading ? 'Sending...' : 'Send file' }}
        </NuxtButton>
      </div>
    </NuxtForm>

    <div class="mt-8">
      <p
        v-if="state.message"
        :class="{
          'bg-green-50 text-green-700': state.status === 'success',
          'bg-red-50 text-red-700': state.status === 'error',
        }"
        class="p-4 rounded-lg text-center font-medium transition-all duration-300"
      >
        {{ state.message }}
      </p>

      <div
        v-if="state.progress > 0"
        class="mt-6"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">Upload progress</span>
          <span class="text-sm font-medium text-gray-700">{{ state.progress }}%</span>
        </div>
        <div class="bg-gray-100 rounded-full h-5 overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 relative"
            :style="{ width: `${state.progress}%` }"
          >
            <div class="absolute inset-0 progress-shine" />
          </div>
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
    rgba(255,255,255,0.3) 50%,
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
