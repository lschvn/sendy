<template>
  <form class="space-y-6" @submit.prevent="uploadFile">
    <div class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="mt-1 block w-full px-4 py-2 rounded-lg bg-white/50 backdrop-blur-sm border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-400 shadow-sm transition-all duration-200"
          placeholder="Enter a title"
        >
      </div>

      <div>
        <label for="to" class="block text-sm font-medium text-gray-700">To</label>
        <input
          id="to"
          v-model="form.to"
          type="text"
          class="mt-1 block w-full px-4 py-2 rounded-lg bg-white/50 backdrop-blur-sm border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-400 shadow-sm transition-all duration-200"
            placeholder="Enter recipient(s) - Separate multiple emails with commas"
        >
      </div>

      <div>
        <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          id="message"
          v-model="form.message"
          rows="3"
          class="mt-1 block w-full px-4 py-2 rounded-lg bg-white/50 backdrop-blur-sm border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-400 shadow-sm transition-all duration-200 resize-none"
          placeholder="Write your message here..."
        />
      </div>
    </div>

    <div>
      <label for="file-upload" class="block text-sm font-medium text-gray-700 mb-2">File</label>
      <!-- Affichage conditionnel -->
      <div v-if="!form.file">
      <label 
        class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors duration-200 bg-white/30 backdrop-blur-sm cursor-pointer"
        @dragover.prevent
        @drop.prevent="handleFileDrop"
      >
        <div class="space-y-1 text-center">
        <Icon name="heroicons:cloud-arrow-up" class="mx-auto h-12 w-12 text-indigo-400" />
        <div class="flex text-sm text-gray-600">
          <span class="relative font-medium text-indigo-600 hover:text-purple-500 transition-colors">
          Upload a file
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            class="sr-only"
            @change="handleFileChange"
          >
          </span>
          <p class="pl-1">
          or drag and drop
          </p>
        </div>
        <p class="text-xs text-gray-500">
          PNG, JPG, GIF up to 500MB
        </p>
        </div>
      </label>
      </div>
      <div v-else class="flex flex-col items-center justify-center p-4 border-2 border-indigo-200 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
      <Icon name="heroicons:check-circle" class="w-12 h-12 text-indigo-500" />
      <p class="mt-2 text-sm font-medium text-indigo-600">File selected: {{ form.file.name }}</p>
      </div>
    </div>

    <div>
      <button type="submit" :disabled="isUploading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
        Send file
      </button>
    </div>
  </form>

  <div class="mt-6">
    <p :class="{ 'text-green-600': state.status === 'success', 'text-red-600': state.status === 'error' }" class="text-center font-medium">
      {{ state.message }}
    </p>

    <!-- Bouton de copie de l'URL -->
    <div v-if="state.url" class="mt-4">
      <button
        @click="copyUrlToClipboard"
        class="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white/70 hover:border-indigo-300 transition-all duration-200"
      >
        <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" class="w-5 h-5" />
        <span>{{ copied ? 'Copied!' : 'Copy sharing link' }}</span>
      </button>
    </div>

    <div v-if="state.progress > 0" class="mt-4">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-indigo-600">Progression</span>
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

<script setup lang="ts">
const state = ref({
  progress: 0,
  message: '',
  status: '',
  url: '', // Ajout de l'URL
})

const form = ref<{
  file: File | null
  title: string
  to: string
  message: string
}>({
  file: null,
  title: '',
  to: '',
  message: '',
})

const isUploading = ref(false)
const copied = ref(false)

// Nouvelle fonction resetForm() qui préserve state.url
function resetForm() {
  form.value = { file: null, title: '', to: '', message: '' }
  state.value = { progress: 0, message: '', status: '', url: state.value.url }
  copied.value = false
}

async function uploadFile() {
  console.log('Starting upload process...')
  if (!form.value.file) {
    state.value.message = 'Please select a file'
    state.value.status = 'error'
    return
  }

  isUploading.value = true
  const fileSizeLimit = 100 * 1024 * 1024 // 100 MB
  console.log('File size:', form.value.file.size, 'bytes')

  if (form.value.file.size > fileSizeLimit) {
    console.log('Using multipart upload for large file')
    const upload = useMultipartUpload('/api/upload/multipart')

    const metadata = {
      title: form.value.title,
      to: form.value.to,
      message: form.value.message,
    }
    console.log('Upload metadata:', metadata)

    const { completed, progress, abort } = upload(form.value.file)

    watch(progress, (val) => {
      state.value.progress = Math.round(val)
      console.log('Upload progress:', val)
    })

    try {
      const result = await completed
      console.log('Multipart upload completed:', result)

      const response = await $fetch('/api/upload/complete', {
        method: 'POST',
        body: {
          path: result?.pathname || '',
          title: form.value.title,
          to: form.value.to,
          message: form.value.message,
        },
      })

      console.log('Complete API response:', response)
      
      if (response) {
        state.value.message = 'Upload successful!'
        state.value.status = 'success'
        if (response.url) {
          state.value.url = response.url
        }
        resetForm()
      }
    }
    catch (error) {
      console.error('Upload error:', error)
      state.value.message = 'File uploaded but email sending may have failed'
      state.value.status = 'success' // On change en success car le fichier est bien uploadé
    }
    finally {
      isUploading.value = false
    }
  }
  else {
    console.log('Using regular upload for small file')
    const formData = new FormData()
    Object.entries(form.value).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('Upload response status:', response.status)
      
      // Vérifions d'abord si la réponse a du contenu
      const contentType = response.headers.get('content-type')
      let data = null

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
          console.log('Upload response data:', data)
        } catch (jsonError) {
          console.warn('Could not parse JSON response:', jsonError)
        }
      } else {
        console.log('Response is not JSON:', await response.text())
      }

      if (response.ok) {
        state.value.message = 'Upload successful!'
        state.value.status = 'success'
        
        // Si nous avons des données JSON avec une URL, on l'utilise
        if (data?.url) {
          state.value.url = data.url
          console.log('URL from response:', data.url)
        }
        
        resetForm()
      } else {
        throw new Error(`Upload failed with status: ${response.status}`)
      }
    }
    catch (error) {
      console.error('Upload error details:', error)
      
      // Gestion plus fine des erreurs
      if (error.toString().includes('email')) {
        state.value.message = 'File uploaded but email sending failed'
        state.value.status = 'success'
      } else {
        state.value.message = `Upload failed: ${error.message || 'Unknown error'}`
        state.value.status = 'error'
      }
    }
    finally {
      isUploading.value = false
    }
  }
}

async function copyUrlToClipboard() {
  try {
    await navigator.clipboard.writeText(state.value.url)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch (err) {
    console.error('Failed to copy:', err)
  }
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  form.value.file = target.files ? target.files[0] : null
}

function handleFileDrop(event: DragEvent) {
  const droppedFiles = event.dataTransfer?.files
  if (droppedFiles?.[0]) {
    form.value.file = droppedFiles[0]
  }
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

/* Ajout de styles pour les inputs */
input::placeholder,
textarea::placeholder {
  color: #9CA3AF;
  opacity: 0.6;
}

input:hover,
textarea:hover {
  @apply ring-gray-300;
  background-color: rgba(255, 255, 255, 0.6);
}

input:focus,
textarea:focus {
  @apply outline-none;
  background-color: rgba(255, 255, 255, 0.8);
}

/* Add hover effect for the drop zone */
.cursor-pointer:hover {
  @apply bg-white/40;
}
</style>
