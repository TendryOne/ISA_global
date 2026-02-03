<template>
  <div class="university-contact">
    <!-- Section FAQ -->
    <div class="faq-section">
      <div class="faq-header">
        <h2 class="faq-title">Questions Fréquentes</h2>
        <p class="faq-subtitle">
          Trouvez rapidement les réponses à vos interrogations sur notre
          établissement et nos formations
        </p>
      </div>

      <div class="faq-container">
        <div
          v-for="(item, index) in faqs"
          :key="index"
          class="faq-card"
          :class="{ active: activeIndex === index }"
          @click="toggleFAQ(index)"
        >
          <div class="faq-question">
            <div class="question-content">
              <div class="question-icon">
                <Icon :name="item.icon" />
              </div>
              <h3>{{ item.question }}</h3>
            </div>
            <div class="faq-arrow" :class="{ rotated: activeIndex === index }">
              <Icon name="ph:caret-down" />
            </div>
          </div>
          <transition name="slide">
            <div v-show="activeIndex === index" class="faq-answer">
              <p>{{ item.answer }}</p>
              <div class="answer-footer">
                <div class="answer-meta">
                  <Icon name="ph:info" />
                  <span>{{ item.meta }}</span>
                </div>
                <NuxtLink v-if="item.link" :to="item.link" class="faq-link">
                  Consulter la page dédiée
                  <Icon name="ph:arrow-right" />
                </NuxtLink>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="faq-footer">
        <div class="footer-content">
          <div class="footer-icon-wrapper">
            <Icon name="ph:chat-circle-dots" class="footer-icon" />
          </div>
          <div class="footer-text">
            <h3>Vous n'avez pas trouvé votre réponse ?</h3>
            <p>
              Contactez-nous directement via WhatsApp, Messenger ou Email. Notre
              équipe vous répondra rapidement.
            </p>
          </div>
        </div>
        <button class="scroll-down-btn" @click="scrollToContact">
          <span>Voir nos moyens de contact</span>
          <Icon name="ph:caret-down" class="pulse-icon" />
        </button>
      </div>
    </div>

    <!-- Composant Contact ci-dessous -->
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const activeIndex = ref<number | null>(null);

const faqs = ref([
  {
    question: "Quand ont lieu les admissions à l'ISA ?",
    answer:
      "Les admissions se font chaque année. Les périodes de rentrée et d'ouverture des candidatures sont toujours annoncées sur le site officiel de l'ISA.",
    meta: "Consultez le site pour les dates précises",
    icon: "ph:calendar",
    link: "/admission",
  },
  {
    question: "Quels sont les documents requis pour l'inscription ?",
    answer:
      "Photo d'identité, CIN ou acte de naissance (pour les moins de 18 ans), certificat de résidence de moins de 3 mois, relevé de notes du baccalauréat. Si votre baccalauréat est antérieur à l'année en cours, le relevé de notes du bac sera obligatoire pour l'inscription définitive à l'université.",
    meta: "Documents officiels et à jour",
    icon: "ph:file-text",
    link: "/admission",
  },
  {
    question: "L'institut est-il agréé par l'État ?",
    answer:
      "Oui, l'ISA est agréé par l'État pour toutes ses filières jusqu'au niveau licence.",
    meta: "Établissement agréé par l'État",
    icon: "ph:seal-check",
    link: "/formations",
  },
  {
    question: "Comment se déroulent les cours à l'ISA ?",
    answer:
      "Les cours sont dispensés en mode hybride : il y a des regroupements en présentiel, mais certains cours sont aussi proposés uniquement en ligne selon la matière. Les cours pratiques et certains modules sont assurés en présentiel lors des regroupements.",
    meta: "Hybride : présentiel et en ligne",
    icon: "ph:monitor",
    link: "/formations",
  },
  {
    question: "Comment sont fixés les frais de scolarité à l'ISA ?",
    answer:
      "Les frais de scolarité à l'ISA diffèrent selon la filière choisie et l'année d'études. Ils sont soigneusement étudiés chaque année afin de garantir un enseignement de qualité, tout en restant accessibles au plus grand nombre de jeunes malagasy. Notre politique tarifaire vise à offrir une formation supérieure reconnue, sans imposer de charges financières excessives aux familles.",
    meta: "Tarifs adaptés et réévalués chaque année",
    icon: "ph:currency-circle-dollar",
    link: "/admission",
  },
  {
    question: "Pourquoi choisir l'ISA ?",
    answer:
      "Choisir l'ISA, c'est opter pour un institut agréé par l'État, qui propose un enseignement hybride innovant (présentiel et en ligne), des formations reconnues et professionnalisantes, un accompagnement personnalisé pour les stages et l'insertion professionnelle, ainsi que des frais de scolarité adaptés au contexte malagasy. Notre équipe pédagogique engagée, nos regroupements et ateliers pratiques, et notre réseau d'entreprises partenaires offrent à chaque étudiant les meilleures conditions pour réussir et s'épanouir dans son parcours universitaire.",
    meta: "Excellence, accessibilité et accompagnement",
    icon: "ph:star",
    link: "/",
  },
]);

const toggleFAQ = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

const scrollToContact = () => {
  // Scroll vers la section contact qui suit ce composant
  const contactElement = document.getElementById("contact-form-section");
  if (contactElement) {
    contactElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
</script>

<style scoped>
.university-contact {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

/* Style FAQ Section */
.faq-section {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 86, 179, 0.08);
  margin-bottom: 3rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.faq-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.faq-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.faq-subtitle {
  font-size: clamp(1rem, 2vw, 1.15rem);
  color: #555;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.faq-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--primary-color-extra-light);
  border-radius: 50px;
  color: var(--primary-color);
  font-weight: 500;
}

.stat-icon {
  font-size: 1.2rem;
}

.faq-container {
  max-width: 900px;
  margin: 0 auto;
}

.faq-card {
  border: 1px solid var(--gray-super-light);
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #fafbfc;
}

.faq-card:hover {
  border-color: var(--primary-color-light);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 86, 179, 0.1);
}

.faq-card.active {
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 8px 25px rgba(0, 86, 179, 0.12);
}

.faq-question {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s;
}

.faq-card.active .faq-question {
  background: linear-gradient(
    135deg,
    var(--primary-color-extra-light),
    transparent
  );
}

.question-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.question-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.faq-question h3 {
  font-size: clamp(1rem, 2vw, 1.1rem);
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0;
  line-height: 1.4;
}

.faq-arrow {
  color: var(--gray);
  font-size: 1.3rem;
  transition: all 0.3s ease;
}

.faq-arrow.rotated {
  transform: rotate(180deg);
  color: var(--primary-color);
}

.faq-card:hover .faq-arrow {
  color: var(--primary-color);
}

.faq-answer {
  padding: 0 1.5rem;
  background: white;
}

.faq-answer p {
  color: var(--gray-dark);
  line-height: 1.6;
  padding: 1rem 0;
  margin: 0;
  border-top: 1px solid var(--gray-super-light);
  font-size: 0.98rem;
}

.answer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0 1.25rem;
  border-top: 1px solid var(--gray-super-light);
}

.answer-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray);
  font-size: 0.9rem;
  font-weight: 500;
}

.faq-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--secondary-color);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 0.75rem 1.5rem;
  background: var(--secondary-color-light);
  border-radius: 50px;
}

.faq-link:hover {
  background: var(--secondary-color);
  color: white;
  transform: translateX(5px);
}

.faq-footer {
  background: linear-gradient(
    135deg,
    rgba(80, 134, 193, 0.08),
    rgba(48, 168, 85, 0.08)
  );
  border-radius: 16px;
  padding: 2.5rem 2rem;
  margin-top: 2.5rem;
  text-align: center;
  border: 2px dashed rgba(80, 134, 193, 0.25);
  position: relative;
  overflow: hidden;
}

.faq-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--secondary-color)
  );
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.footer-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: bounce 2s ease-in-out infinite;
}

.footer-icon {
  font-size: 2rem;
  color: white;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.footer-text {
  text-align: left;
  flex: 1;
  max-width: 600px;
}

.footer-text h3 {
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.footer-text p {
  color: var(--gray);
  margin: 0;
  line-height: 1.6;
  font-size: 0.98rem;
}

.scroll-down-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(80, 134, 193, 0.3);
}

.scroll-down-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(80, 134, 193, 0.4);
}

.pulse-icon {
  font-size: 1.3rem;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}

/* Animations */
.slide-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .faq-section {
    padding: 2.5rem;
  }
}

@media (max-width: 768px) {
  .university-contact {
    padding: 2rem 1rem;
  }

  .faq-section {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .faq-question {
    padding: 1rem 1.25rem;
  }

  .question-content {
    gap: 0.75rem;
  }

  .question-icon {
    width: 2.2rem;
    height: 2.2rem;
    font-size: 1.2rem;
  }

  .answer-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .footer-text {
    text-align: center;
  }

  .scroll-down-btn {
    width: 100%;
    justify-content: center;
    padding: 0.9rem 1.75rem;
    font-size: 1rem;
  }

  .footer-icon-wrapper {
    width: 3rem;
    height: 3rem;
  }

  .footer-icon {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .faq-section {
    padding: 1.25rem;
  }

  .faq-footer {
    padding: 2rem 1.25rem;
  }

  .faq-answer {
    padding: 0 1.25rem;
  }

  .question-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1.1rem;
  }

  .scroll-down-btn {
    padding: 0.85rem 1.5rem;
    font-size: 0.95rem;
  }

  .footer-icon-wrapper {
    width: 2.75rem;
    height: 2.75rem;
  }
}
</style>
