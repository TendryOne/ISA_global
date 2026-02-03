# QuillContentViewer Component

Ce composant permet d'afficher proprement le contenu HTML généré par l'éditeur Quill avec les styles de l'institut.

## Utilisation

```vue
<template>
  <div>
    <!-- Affichage simple -->
    <QuillContentViewer :content="assignmentDescription" />

    <!-- Avec bordure et hauteur limitée -->
    <QuillContentViewer :content="assignmentDescription" max-height="300px" :show-border="true" />

    <!-- Version compacte sans bordure -->
    <QuillContentViewer :content="assignmentDescription" :show-border="false" :compact="true" />
  </div>
</template>

<script setup>
import QuillContentViewer from '@/components/EDITOR/QuillContentViewer.vue'

const assignmentDescription = `
  <h1>Introduction à l'Algorithmique</h1>
  <p>Ce devoir porte sur les <strong>concepts fondamentaux</strong> de l'algorithmique.</p>
  <blockquote>
    L'algorithmique est la science des algorithmes.
  </blockquote>
  <ul>
    <li>Complexité temporelle</li>
    <li>Structures de données</li>
    <li>Tri et recherche</li>
  </ul>
`
</script>
```

## Props

| Prop         | Type      | Default  | Description                            |
| ------------ | --------- | -------- | -------------------------------------- |
| `content`    | `string`  | `''`     | Le contenu HTML à afficher             |
| `maxHeight`  | `string`  | `'none'` | Hauteur maximale (ex: '300px', '50vh') |
| `showBorder` | `boolean` | `true`   | Afficher la bordure et l'ombre         |
| `compact`    | `boolean` | `false`  | Mode compact avec moins de padding     |

## Fonctionnalités

- ✅ Styles optimisés pour le contenu Quill
- ✅ Thème de l'institut (couleurs primaires/secondaires)
- ✅ Responsive design
- ✅ Scrollbar personnalisée
- ✅ Support complet des éléments HTML (titres, listes, citations, code, etc.)
- ✅ Animations et transitions fluides
- ✅ Mode compact pour les espaces restreints
