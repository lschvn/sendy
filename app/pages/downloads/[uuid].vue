<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-3xl mx-auto">
        <div v-if="file" class="bg-white/50 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-8">
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <h1 class="text-2xl font-bold text-gray-900">{{ file.name }}</h1>
              <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {{ formatFileSize(file.size) }}
              </span>
            </div>
          </div>

          <!-- Informations du fichier -->
          <div class="space-y-4 mb-8">
            <div class="flex items-center gap-2">
              <Icon name="heroicons:document" class="w-5 h-5 text-gray-400" />
              <span class="text-gray-700">{{ file.name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="heroicons:clock" class="w-5 h-5 text-gray-400" />
              <span class="text-gray-700">{{ formatDate(file.createdAt) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="download"
              class="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
              Télécharger
            </button>
            <button
              @click="copyShareLink"
              class="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Icon name="heroicons:share" class="w-5 h-5" />
              Partager
            </button>
          </div>
        </div>
        <!-- Loading state -->
        <div v-else>
          <div class="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FileDetails {
  id: string
  name: string
  path: string
  size: number
  createdAt: number
}

const route = useRoute()
const uuid = route.params.uuid as string
const file = ref<FileDetails | null>(null)

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function download() {
  if (!file.value) return

  const link = document.createElement('a')
  link.href = `/assets/${file.value.path}`
  link.download = file.value.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function copyShareLink() {
  const url = window.location.href
  await navigator.clipboard.writeText(url)
  alert('Lien copié !')
}

async function fetchFileDetails() {
  try {
    const response = await useFetch<FileDetails>(`/api/file/${uuid}`)
    file.value = response.data.value
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Fichier non trouvé'
    })
  }
}

await fetchFileDetails()
</script>