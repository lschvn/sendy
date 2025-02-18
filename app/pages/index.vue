<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <nav class="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 group cursor-pointer">
            <img
              class="translate-y-[1px] group-hover:scale-105 transition-transform duration-200"
              src="/white-icon.png"
              width="42"
              height="42"
              alt="Sendy Logo"
            >
            <span class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Sendy
            </span>
          </div>
          <div class="flex items-center gap-4">
            <a 
              href="https://lschvn.dev/en" 
              target="_blank"
              rel="noopener"
              class="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100/50 hover:bg-gray-100"
            >
              <Icon name="heroicons:user-circle" class="w-5 h-5" />
              <span>Portfolio</span>
            </a>
            <a 
              href="https://github.com/lschvn/sendy" 
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105"
            >
              <Icon name="mdi:github" class="w-5 h-5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-16">
      <div class="max-w-3xl mx-auto">
        <hgroup class="text-center mb-12">
          <h2 class="text-5xl font-bold pb-6 mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Simple file sharing
          </h2>
          <p class="text-xl text-gray-600 flex items-center justify-center gap-2">
            Sendy is a WeTransfer clone, operating on the edge. Built with <span class="text-indigo-400">Nuxt</span> & <span class="text-indigo-400">NuxtHub</span>
          </p>
        </hgroup>

        <section class="bg-white/50 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl">
          <div class="p-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Icon name="heroicons:cloud-arrow-up" class="w-6 h-6 text-indigo-600" />
              Send a file
            </h3>
            <UploadFileForm />
          </div>
        </section>

        <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="p-6 bg-white/50 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <Icon :name="feature.icon" class="w-12 h-12 text-indigo-600 mb-4" />
            <h4 class="text-lg font-semibold text-gray-900 mb-2">
              {{ feature.title }}
            </h4>
            <p class="text-gray-600">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </main>

    <footer class="mt-16 bg-white/70 backdrop-blur-md border-t border-gray-200">
      <div class="container mx-auto px-4 py-8">
        <p class="text-center text-sm text-gray-500">
          &copy; {{ new Date().getFullYear() }} Sendy. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const features = [
  {
    icon: 'heroicons:users',
    title: 'Open & Free',
    description: 'A collaborative open-source project, completely free thanks to Cloudflare and NuxtHub.',
  },
  {
    icon: 'heroicons:shield-check',
    title: 'Secure',
    description: 'Your files are encrypted and protected during transfer and storage.',
  },
  {
    icon: 'heroicons:bolt',
    title: 'Edge-Powered',
    description: 'Lightning-fast transfers using Cloudflare\'s global edge network.',
  },
]
</script>

<style scoped>
.router-link-active {
  @apply text-indigo-600;
}
</style>
