<template>
  <div class="demo-container">
    <h1>QuillContentViewer - Interface de l'Institut</h1>

    <!-- Exemple 1: Contenu d'un devoir -->
    <section class="demo-section">
      <h2>📋 Description d'un Devoir</h2>
      <QuillContentViewer :content="assignmentContent" />
    </section>

    <!-- Exemple 2: Contenu avec hauteur limitée -->
    <section class="demo-section">
      <h2>📄 Contenu avec Scrolling</h2>
      <QuillContentViewer :content="longContent" max-height="200px" :show-border="true" />
    </section>

    <!-- Exemple 3: Mode compact -->
    <section class="demo-section">
      <h2>📝 Mode Compact</h2>
      <QuillContentViewer :content="compactContent" :compact="true" :show-border="false" />
    </section>

    <!-- Exemple 4: Contenu riche avec tous les éléments -->
    <section class="demo-section">
      <h2>🎨 Contenu Riche Complet</h2>
      <QuillContentViewer :content="richContent" />
    </section>
  </div>
</template>

<script setup lang="ts">
import QuillContentViewer from '@/components/EDITOR/QuillContentViewer.vue'

// Exemple de contenu d'un devoir
const assignmentContent = `
  <h1>Examen Final - Algorithmique Avancée</h1>
  <p>Cet examen porte sur les <strong>concepts fondamentaux</strong> de l'algorithmique avancée que nous avons étudiés durant ce semestre.</p>
  
  <h2>Consignes générales</h2>
  <ul>
    <li>Durée: <strong>3 heures</strong></li>
    <li>Documents autorisés: <em>Aucun</em></li>
    <li>Calculatrice: <u>Non autorisée</u></li>
  </ul>
  
  <blockquote>
    "La simplicité est la sophistication suprême." - Léonard de Vinci
  </blockquote>
  
  <p>Bonne chance à tous ! 🍀</p>
`

// Contenu long pour démontrer le scroll
const longContent = `
  <h2>Cours Complet sur les Structures de Données</h2>
  
  <h3>1. Introduction</h3>
  <p>Les structures de données sont des moyens d'organiser et de stocker les données de manière efficace. Elles constituent le fondement de l'informatique moderne.</p>
  
  <h3>2. Les Tableaux</h3>
  <p>Un tableau est une structure de données linéaire qui stocke des éléments de même type dans des emplacements contigus de la mémoire.</p>
  <ul>
    <li>Accès direct aux éléments: O(1)</li>
    <li>Insertion/Suppression: O(n)</li>
    <li>Recherche: O(n) non trié, O(log n) trié</li>
  </ul>
  
  <h3>3. Les Listes Chaînées</h3>
  <p>Une liste chaînée est une collection d'éléments où chaque élément pointe vers le suivant.</p>
  
  <h3>4. Les Arbres</h3>
  <p>Un arbre est une structure hiérarchique composée de nœuds.</p>
  
  <h3>5. Les Graphes</h3>
  <p>Un graphe est un ensemble de sommets reliés par des arêtes.</p>
  
  <h3>6. Les Tables de Hachage</h3>
  <p>Une table de hachage utilise une fonction de hachage pour mapper les clés aux valeurs.</p>
`

// Contenu compact
const compactContent = `
  <p><strong>Rappel important:</strong> La remise du projet final est prévue pour le <em>15 décembre 2024</em> avant 23h59.</p>
`

// Contenu riche avec tous les éléments stylés
const richContent = `
  <h1>Guide Complet des Fonctionnalités</h1>
  
  <h2>Formatage du Texte</h2>
  <p>Voici les différents types de formatage disponibles:</p>
  <p><strong>Texte en gras</strong>, <em>texte en italique</em>, <u>texte souligné</u>, et <s>texte barré</s>.</p>
  
  <h2>Citations et Code</h2>
  <blockquote>
    Cette citation utilise le style institut avec une bordure bleu primaire et un arrière-plan dégradé.
  </blockquote>
  
  <p>Voici du code inline: <code>console.log('Hello World!');</code></p>
  
  <pre><code>// Exemple de bloc de code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}</code></pre>
  
  <h2>Listes Stylisées</h2>
  <h3>Liste à puces</h3>
  <ul>
    <li>Premier élément avec style institut</li>
    <li>Deuxième élément
      <ul>
        <li>Sous-élément niveau 2</li>
        <li>Autre sous-élément
          <ul>
            <li>Niveau 3 avec points plus petits</li>
          </ul>
        </li>
      </ul>
    </li>
    <li>Troisième élément</li>
  </ul>
  
  <h3>Liste numérotée</h3>
  <ol>
    <li>Première étape</li>
    <li>Deuxième étape</li>
    <li>Troisième étape</li>
  </ol>
  
  <h2>Liens et Couleurs</h2>
  <p>Voici un <a href="#" style="color: #5086c1;">lien avec la couleur primaire de l'institut</a>.</p>
  <p style="color: #30a855;">Texte avec la couleur secondaire de l'institut.</p>
  <p style="background-color: rgba(80, 135, 193, 0.18); padding: 0.25rem 0.5rem; border-radius: 4px;">Texte avec arrière-plan primaire.</p>
  
  <h2>Alignement</h2>
  <p style="text-align: center;">Texte centré</p>
  <p style="text-align: right;">Texte aligné à droite</p>
  <p style="text-align: justify;">Texte justifié qui s'étend sur toute la largeur disponible pour démontrer l'alignement justifié avec un texte suffisamment long.</p>
  
  <h2>Indentation</h2>
  <p>Paragraphe normal</p>
  <p style="padding-left: 2rem;">Paragraphe avec indentation niveau 1</p>
  <p style="padding-left: 4rem;">Paragraphe avec indentation niveau 2</p>
`
</script>

<style scoped>
.demo-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
}

.demo-container > h1 {
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: var(--background-light);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
}

.demo-section h2 {
  color: var(--text-dark);
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Variables CSS pour l'exemple */
:root {
  --primary-color: #5086c1;
  --primary-dark: #1a252f;
  --secondary-color: #30a855;
  --text-dark: #2d3436;
  --text-secondary: #636e72;
  --background-light: #f8f9fa;
  --border-light: #e9ecef;
  --radius-xl: 12px;
  --white: #ffffff;
}
</style>
