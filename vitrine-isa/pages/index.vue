<template>
  <div>
    <HomePresentation />
    <HomeWhyUs />
    <HomeMission />
    <HomeProcessus />
    <HomeDirectorWords />
    <HomePartner />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Accueil",
  meta: [
    {
      name: 'description',
      content: 'Promouvons le développement étudiant, l\'insertion professionnelle et la citoyenneté responsable. Découvrez nos formations à Madagascar.'
    },
    {
      name: 'keywords',
      content: 'institut supérieur, Madagascar, Ambatomirahavavy, formation, éducation, université, études supérieures, savoir, savoir-faire, savoir-être'
    },

    { property: 'og:title', content: "ISA - Institut supérieur d'Ambatomirahavavy" },
    { property: 'og:description', content: "Savoir, savoir-faire, savoir-être : Bâtissons un avenir responsable." },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.isa-ambato.mg' },
    { property: 'og:image', content: 'https://www.isa-ambato.mg/logo-seo.jpg' },
    { property: 'og:locale', content: 'fr_MG' },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: 'contact@isa-ambato.mg' },
    { name: 'twitter:title', content: "ISA - Institut supérieur d'Ambatomirahavavy" },
    { name: 'twitter:description', content: "Découvrez notre institut et nos missions éducatives." },
    { name: 'twitter:image', content: 'https://www.isa-ambato.mg/logo-seo.jpg' },

  ],
  link: [
    { rel: 'canonical', href: 'https://isa-ambato.mg/Accueil' }
  ]
})

</script>

<style scoped></style>