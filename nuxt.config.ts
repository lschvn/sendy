// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxthub/core',
    'nuxt-auth-utils',
  ],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  ui: {
    prefix: 'Nuxt',
  },

  runtimeConfig: {
    mail_auth_key: process.env.NUXT_MAIL_AUTH_KEY,
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2024-12-23',

  nitro: {
    experimental: {
      openAPI: true,
      tasks: true,
    },
    scheduledTasks: {
      '0 0 * * *': ['file:purge'],
    },
    minify: false,
  },

  hub: {
    analytics: true,
    blob: true,
    kv: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
