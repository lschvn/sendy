<template>
  <form @submit.prevent="uploadFile" class="space-y-6">
    <div class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" id="title" v-model="form.title" class="mt-1 block w-full rounded-lg border-gray-300 bg-white/50 backdrop-blur-sm shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:ring-opacity-50 transition-colors" />
      </div>

      <div>
        <label for="to" class="block text-sm font-medium text-gray-700">To</label>
        <input type="text" id="to" v-model="form.to" class="mt-1 block w-full rounded-lg border-gray-300 bg-white/50 backdrop-blur-sm shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:ring-opacity-50 transition-colors" />
      </div>

      <div>
        <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
        <textarea id="message" v-model="form.message" rows="3" class="mt-1 block w-full rounded-lg border-gray-300 bg-white/50 backdrop-blur-sm shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:ring-opacity-50 transition-colors"></textarea>
      </div>
    </div>

    <div>
      <label for="file-upload" class="block text-sm font-medium text-gray-700 mb-2">File</label>
      <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors duration-200 bg-white/30 backdrop-blur-sm">
        <div class="space-y-1 text-center">
          <Icon name="heroicons:cloud-arrow-up" class="mx-auto h-12 w-12 text-gray-400" />
          <div class="flex text-sm text-gray-600">
            <label for="file-upload" class="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-indigo-400 focus-within:ring-opacity-50">
              <span>Upload a file</span>
              <input id="file-upload" name="file-upload" type="file" class="sr-only" @change="handleFileChange" />
            </label>
            <p class="pl-1">or drag and drop</p>
          </div>
          <p class="text-xs text-gray-500">
            PNG, JPG, GIF up to 500MB
          </p>
        </div>
      </div>
      <p v-if="form.file" class="mt-2 text-sm text-gray-600">
        Selected file: {{ form.file.name }}
      </p>
    </div>

    <div>
      <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
        Send file
      </button>
    </div>
  </form>

  <div class="mt-6">
    <p :class="{'text-green-600': state.status === 'success', 'text-red-600': state.status === 'error'}" class="text-center font-medium">
      {{ state.message }}
    </p>
    <div v-if="state.progress > 0" class="mt-4">
      <!-- Pourcentage au-dessus de la barre -->
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-indigo-600">Progression</span>
        <span class="text-sm font-medium text-indigo-600">{{ state.progress }}%</span>
      </div>

      <!-- Container de la progress bar -->
      <div class="bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner relative">
        <!-- Barre de progression avec animation -->
        <div
          class="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 relative overflow-hidden transition-all duration-300 ease-out"
          :style="{ width: `${state.progress}%` }"
        >
          <!-- Effet de brillance -->
          <div class="absolute inset-0 progress-shine"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const state = ref({
  progress: 0,
  message: '',
  status: '',
})

const form = ref<{
  file: File | null,
  title: string,
  to: string,
  message: string,
}>({
  file: null,
  title: '',
  to: '',
  message: '',
})

async function uploadFile() {
  if (!form.value.file) {
    state.value.message = 'Please select a file'
    state.value.status = 'error'
    return
  }

  const fileSizeLimit = 500 * 1024 * 1024 // 500 MB

  if (form.value.file.size > fileSizeLimit) {
    const upload = useMultipartUpload('/api/upload/multipart')

    const metadata = {
      title: form.value.title,
      to: form.value.to,
      message: form.value.message,
    }

    const { completed, progress, abort } = upload(form.value.file, { metadata })

    watch(progress, (val) => {
      state.value.progress = Math.round(val)
    })

    try {
      const result = await completed
      state.value.message = 'Upload successful!'
      state.value.status = 'success'

      await $fetch('/api/upload/complete', {
        method: 'POST',
        body: {
          path: result.pathname,
          title: form.value.title,
          to: form.value.to,
          message: form.value.message,
        },
      })
    } catch (error) {
      state.value.message = 'An error occurred during upload'
      state.value.status = 'error'
    }
  } else {
    const formData = new FormData()
    Object.entries(form.value).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        state.value.message = 'Upload successful!'
        state.value.status = 'success'
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      state.value.message = 'An error occurred during upload'
      state.value.status = 'error'
    }
  }
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  form.value.file = target.files ? target.files[0] : null
}
</script>

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