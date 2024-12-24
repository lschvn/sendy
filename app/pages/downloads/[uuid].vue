<template>
  <div class="min-h-screen py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100">
    <NuxtContainer>
      <div class="max-w-3xl mx-auto">
        <NuxtCard
          v-if="file"
          class="backdrop-blur-xl bg-white/90 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <template #header>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <h1 class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    {{ file.name }}
                  </h1>
                  <p class="text-sm text-gray-500">
                    Partagé {{ formatTimeAgo(file.createdAt) }}
                  </p>
                </div>
                <NuxtBadge
                  color="primary"
                  variant="solid"
                  size="lg"
                  class="animate-fade-in"
                >
                  {{ formatFileSize(file.size) }}
                </NuxtBadge>
              </div>
            </div>
          </template>

          <div class="py-6">
            <NuxtDivider class="my-4" />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <NuxtCard class="bg-gray-50/50">
                <div class="space-y-4">
                  <div class="flex items-center space-x-3">
                    <NuxtAvatar
                      :src="getFileIcon(file.name)"
                      size="lg"
                      class="bg-primary-100"
                    />
                    <div>
                      <p class="font-medium text-gray-700">
                        Type
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ getFileType(file.name) }}
                      </p>
                    </div>
                  </div>
                </div>
              </NuxtCard>

              <NuxtCard class="bg-gray-50/50">
                <div class="space-y-4">
                  <div class="flex items-center space-x-3">
                    <NuxtIcon
                      name="i-heroicons-clock"
                      class="h-8 w-8 text-primary-500"
                    />
                    <div>
                      <p class="font-medium text-gray-700">
                        Date de partage
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ formatDate(file.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </NuxtCard>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-col sm:flex-row gap-4">
              <NuxtButton
                block
                color="primary"
                :loading="downloading"
                class="group relative overflow-hidden"
                @click="download"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <template #leading>
                  <NuxtIcon
                    name="i-heroicons-arrow-down-tray"
                    class="animate-bounce-subtle"
                  />
                </template>
                <span class="relative z-10">Télécharger</span>
              </NuxtButton>

              <NuxtButton
                block
                color="gray"
                variant="ghost"
                class="group hover:bg-gray-100 transition-colors"
                @click="copyShareLink"
              >
                <template #leading>
                  <NuxtIcon
                    name="i-heroicons-share"
                    class="group-hover:rotate-12 transition-transform"
                  />
                </template>
                Partager
              </NuxtButton>
            </div>
          </template>
        </NuxtCard>

        <NuxtSkeleton
          v-else
          class="h-[500px] w-full rounded-xl"
        />
      </div>
    </NuxtContainer>
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
const toast = useToast()
const uuid = route.params.uuid as string
const file = ref<FileDetails | null>(null)
const downloading = ref(false)

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
    minute: '2-digit',
  })
}

async function download() {
  if (!file.value) return
  downloading.value = true

  try {
    const link = document.createElement('a')
    link.href = `/assets/${file.value.path}`
    link.download = file.value.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de télécharger le fichier',
      color: 'red',
    })
  }
  finally {
    downloading.value = false
  }
}

async function copyShareLink() {
  const url = window.location.href
  await navigator.clipboard.writeText(url)
  toast.add({
    title: 'Succès',
    description: 'Lien copié dans le presse-papier',
    color: 'green',
  })
}

async function fetchFileDetails() {
  try {
    const response = await useFetch<FileDetails>(`/api/file/${uuid}`)
    file.value = response.data.value
  }
  catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Fichier non trouvé',
    })
  }
}

await fetchFileDetails()

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const icons: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    zip: '📦',
    rar: '📦',
  }
  return icons[ext || ''] || '📎'
}

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const types: Record<string, string> = {
    pdf: 'Document PDF',
    doc: 'Document Word',
    docx: 'Document Word',
    xls: 'Feuille Excel',
    xlsx: 'Feuille Excel',
    jpg: 'Image JPEG',
    jpeg: 'Image JPEG',
    png: 'Image PNG',
    gif: 'Image GIF',
    zip: 'Archive ZIP',
    rar: 'Archive RAR',
  }
  return types[ext || ''] || 'Fichier'
}

function formatTimeAgo(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}
</style>
