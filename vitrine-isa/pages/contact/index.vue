<template>
  <div class="contact-page">
    <!-- Hero Section -->
    <section class="contact-hero">
      <div class="hero-background">
        <div class="hero-gradient"></div>
        <div class="hero-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
        </div>
      </div>
      <div class="hero-content">
        <div class="hero-breadcrumb">
          <NuxtLink to="/">Accueil</NuxtLink>
          <Icon name="ph:caret-right" />
          <span class="current">Contact</span>
        </div>
        <h1>Contactez-Nous</h1>
        <p class="hero-subtitle">
          Notre équipe est à votre écoute pour répondre à toutes vos questions sur nos formations, 
          l'admission et accompagner votre projet académique.
        </p>
      </div>
    </section>

    <div class="content-wrapper">
      <contactFaq />
      <contactForm />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Contact',
  meta: [
    {
      name: 'description',
      content: 'Contactez l\'équipe de l\'ISA pour toute question sur nos formations, l\'admission ou les partenariats. Réponse garantie sous 24h.'
    },
    {
      name: 'keywords',
      content: 'contact ISA, admission université, renseignements formations, contact université Madagascar'
    },
    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Contact - Institut Supérieur d\'Ambatomirahavavy' },
    { property: 'og:description', content: 'Contactez notre équipe pédagogique pour plus d\'informations' },
    { property: 'og:image', content: 'https://www.isa-ambato.mg/logo-seo.jpg' },
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Contact - ISA' },
  ],
  link: [
    { rel: 'canonical', href: 'https://isa-ambato.mg/contact' }
  ]
});
</script>

<style scoped>
.contact-page {
  background: linear-gradient(to bottom, #fafbfc 0%, white 100%);
  min-height: 100vh;
  position: relative;
}

/* Hero Section */
.contact-hero {
  position: relative;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: clamp(4rem, 10vw, 6rem) 2rem clamp(3rem, 8vw, 5rem);
  overflow: hidden;
  z-index: 1;
}

.hero-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.1), transparent);
}

.hero-shapes {
  position: absolute;
  inset: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -50px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: 10%;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.hero-breadcrumb a {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.hero-breadcrumb a:hover {
  opacity: 0.8;
}

.hero-breadcrumb .current {
  font-weight: 600;
}

.contact-hero h1 {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2.5vw, 1.3rem);
  opacity: 0.95;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem 4rem;
  position: relative;
  z-index: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 2rem 1rem;
  }
  
  .shape-1,
  .shape-2 {
    width: 150px;
    height: 150px;
  }
}
</style>