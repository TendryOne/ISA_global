// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig : {
    public : {
      maintenanceMode: false
    }
  },
  modules: ['@nuxt/icon', '@nuxt/image', '@nuxt/eslint', '@nuxt/fonts', '@nuxtjs/sitemap', "@vueuse/nuxt"],

  icon: {
    serverBundle: {
      collections: [
        'heroicons',
        'hugeicons',
        'material-symbols',
        'mdi',
        'ph',
        'svg-spinners',
        'twemoji'
      ]
    }
  },

  css: [
    "./assets/css/main.css"
  ],

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'fr'
      },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo300x300.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff' },
        { name: 'author', content: "Institut Supérieur d'Ambatomirahavavy" },
        { name: 'keywords', content: 'institut supérieur, Madagascar, Ambatomirahavavy, formation, éducation, études supérieures' }
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Institut Supérieur d'Ambatomirahavavy",
            "alternateName": "ISA",
            "url": "https://www.isa-ambato.mg",
            "logo": "https://www.isa-ambato.mg/logo300x300.svg",
            "description": "Institution d'enseignement supérieur promouvant le savoir, savoir-faire et savoir-être à Madagascar",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "MG",
              "addressRegion": "Ambatomirahavavy"
            },
            "sameAs": [
              "https://www.facebook.com/ISA22Ambato"
            ]
          })
        }
        ,
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Formations ISA Ambatomirahavavy",
            "description": "Découvrez nos programmes de formation professionnelle et licences adaptés au contexte malgache",
            "url": "https://www.isa-ambato.mg/formations",
            "mainEntity": {
              "@type": "OfferCatalog",
              "name": "Nos Formations",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "name": "Gestion & Création d'Entreprise",
                  "description": "Licence professionnelle en gestion entrepreneuriale",
                  "educationalCredentialAwarded": "Licence Professionnelle",
                  "programPrerequisites": "Baccalauréat"
                },
                {
                  "@type": "Offer",
                  "name": "Bâtiment et Travaux Publics",
                  "description": "Formation professionnelle qualifiante en BTP",
                  "educationalCredentialAwarded": "Attestation de Formation Professionnelle"
                },
                {
                  "@type": "Offer",
                  "name": "Informatique",
                  "description": "Licence professionnelle en développement informatique",
                  "educationalCredentialAwarded": "Licence Professionnelle",
                  "programPrerequisites": "Baccalauréat"
                }
              ]
            }
          })
        },
      ]
    }
  },

  sitemap: {
    exclude: [
      '/admin/**',
      '/etudiant/**',
      '/professeur/**'
    ],
    defaults: {
      changefreq: 'weekly',
      priority: 0.8
    }
  },

  // Configuration de Nuxt Image
  image: {
    domains: ['www.isa-ambato.mg'],
    format: ['webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }
  },
  vite : {
    server : {
      proxy : {
        '/api/v1': {
          target: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000',
          changeOrigin: true
          // Pas besoin de rewrite ici
        }
      }
    }
  }

})