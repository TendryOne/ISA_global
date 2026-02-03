<template>
  <section class="director-message">
    <div class="container">
      <div class="message-wrapper" data-aos="fade-up">
        <!-- Director Photo -->
        <div class="director-photo-container">
          <div class="director-photo">
            <img src="/director-demo.jpeg" alt="Directeur de l'école ISA" class="photo" loading="lazy" />
            <div class="photo-overlay"></div>
            <div class="photo-frame"></div>
          </div>
        </div>

        <!-- Director Message -->
        <div class="message-content">
          <div class="section-header">
            <span class="section-tag">Le Mot du directeur Général</span>
            <div class="title-decoration">
              <div class="decoration-line"></div>
              <div class="decoration-dot"></div>
            </div>
          </div>

          <div class="message-header">
            <h2 class="message-intro">
              <span class="quote-mark">"</span>
              Bienvenue sur le site officiel de l'Institut Supérieur d'Ambatomirahavavy (ISA)
            </h2>
          </div>

          <div class="message-text">
            <div class="message-paragraph">
              <p>C'est avec une grande fierté que je vous adresse ces quelques mots au nom de toute notre communauté
                éducative. L'ISA est bien plus qu'un établissement d'enseignement supérieur : c'est un lieu de formation,
                d'accompagnement, de transformation et d'espoir pour la jeunesse malagasy.</p>
            </div>

            <div class="message-paragraph">
              <p>Notre mission est claire : transmettre le savoir, le savoir-faire et le savoir-être, afin de former des
                citoyens responsables, compétents et engagés dans le développement de leur région et de leur pays. Nous
                croyons fermement que chaque étudiant porte en lui un potentiel unique à révéler et à cultiver.</p>
            </div>

            <div class="message-paragraph">
              <p>À l'ISA, nous offrons une formation ancrée dans la réalité, qui allie rigueur académique et ouverture sur
                le monde professionnel. Nos parcours — Gestion et Création d'Entreprise, Bâtiment et Travaux Publics, et
                Informatique — sont pensés pour répondre aux défis actuels de Madagascar.</p>
            </div>

            <div class="message-paragraph">
              <p>Dans un esprit de proximité, d'innovation et de responsabilité, nous mettons tout en œuvre pour offrir un
                environnement propice à l'épanouissement intellectuel, humain et professionnel de chacun. Nous croyons en
                une pédagogie active et accompagnée, adaptée au contexte local, qui privilégie la pratique, la solidarité,
                l'autonomie et la responsabilité.</p>
            </div>

            <div class="highlight-box">
              <div class="quote-icon">
                <Icon name="mdi:format-quote-open" class="quote-icon-open" />
              </div>
              <p class="slogan">Notre slogan, <strong>"Savoir, savoir-faire, savoir-être : bâtir un futur
                  responsable"</strong>,</p>
              <p class="slogan-continuation">résume l'âme de notre engagement.</p>
              <div class="quote-icon">
                <Icon name="mdi:format-quote-close" class="quote-icon-close" />
              </div>
            </div>

            <div class="message-paragraph">
              <p>Au nom de toute l'équipe de l'ISA, je vous souhaite la bienvenue et vous invite à explorer notre site, à
                découvrir notre vision et à rejoindre une aventure éducative tournée vers l'excellence et l'humain.</p>
            </div>

            <div class="director-signature">
              <div class="signature-line"></div>
              <div class="director-info">
                <h3 class="director-name">RANAIVOSON Alain Michel</h3>
                <p class="director-title">Directeur Général</p>
                <p class="director-institution">Institut Supérieur d'Ambatomirahavavy (ISA)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.director-message {
  padding: clamp(4rem, 10vw, 8rem) 1rem;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 50%, #f0f7ff 100%);
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.message-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(3rem, 6vw, 5rem);
  align-items: start;
}

.director-photo-container {
  position: relative;
  height: 100%;
}

.director-photo {
  position: relative;
  height: 100%;
  min-height: 650px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(80, 134, 193, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

.photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg, 
    rgba(80, 134, 193, 0.1) 0%, 
    rgba(48, 168, 85, 0.05) 100%
  );
  z-index: 1;
}

.photo-frame {
  position: absolute;
  inset: -2px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)) border-box;
  border-radius: 24px;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 2;
}

.director-photo:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 35px 80px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(80, 134, 193, 0.2);
}

.director-photo:hover .photo {
  transform: scale(1.05);
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-tag {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-weight: 600;
  font-size: clamp(0.8rem, 2vw, 0.875rem);
  border-radius: 50px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  align-self: flex-start;
  box-shadow: 0 8px 25px rgba(80, 134, 193, 0.3);
}

.title-decoration {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.decoration-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

.decoration-dot {
  width: 8px;
  height: 8px;
  background: var(--secondary-color);
  border-radius: 50%;
}

.message-header {
  margin-bottom: 1.5rem;
}

.message-intro {
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  line-height: 1.4;
  color: var(--primary-dark);
  font-weight: 700;
  position: relative;
}

.quote-mark {
  font-size: 4rem;
  line-height: 0;
  color: var(--primary-color);
  vertical-align: middle;
  margin-right: 0.5rem;
  opacity: 0.8;
}

.message-text {
  font-size: clamp(1rem, 2.5vw, 1.125rem);
  line-height: 1.7;
  color: var(--gray-dark);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-paragraph {
  position: relative;
}

.message-paragraph p {
  margin: 0;
  text-align: justify;
}

.highlight-box {
  position: relative;
  background: linear-gradient(135deg, var(--primary-color-extra-light), rgba(48, 168, 85, 0.1));
  border-left: 4px solid var(--secondary-color);
  padding: 2.5rem 2rem;
  border-radius: 0 16px 16px 0;
  margin: 2rem 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.quote-icon {
  position: absolute;
  color: var(--secondary-color);
  opacity: 0.3;
}

.quote-icon-open {
  top: 1rem;
  left: 1rem;
  font-size: 2.5rem;
}

.quote-icon-close {
  bottom: 1rem;
  right: 1rem;
  font-size: 2.5rem;
}

.slogan {
  font-style: italic;
  color: var(--primary-dark);
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  font-size: clamp(1.1rem, 3vw, 1.25rem);
}

.slogan-continuation {
  font-style: italic;
  color: var(--primary-color);
  font-weight: 500;
  margin: 0;
  font-size: clamp(1rem, 2.8vw, 1.125rem);
}

.director-signature {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--gray-super-light);
}

.signature-line {
  width: 150px;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  margin-bottom: 1.5rem;
  border-radius: 2px;
}

.director-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.director-name {
  font-size: clamp(1.25rem, 3.5vw, 1.5rem);
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0;
}

.director-title {
  font-size: clamp(1rem, 2.8vw, 1.125rem);
  color: var(--secondary-color);
  font-weight: 600;
  margin: 0;
}

.director-institution {
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  color: var(--gray);
  font-weight: 500;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .message-wrapper {
    gap: clamp(3rem, 5vw, 4rem);
  }

  .director-photo {
    min-height: 550px;
  }
}

@media (max-width: 768px) {
  .director-message {
    padding: clamp(4rem, 8vw, 6rem) 1rem;
  }

  .message-wrapper {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .director-photo {
    min-height: 400px;
    max-width: 500px;
    margin: 0 auto;
  }

  .section-tag {
    align-self: center;
  }

  .message-text {
    gap: clamp(1rem, 3vw, 1.5rem);
  }
}

@media (max-width: 480px) {
  .director-photo {
    min-height: 350px;
  }

  .highlight-box {
    padding: clamp(1.5rem, 4vw, 2rem);
    margin: clamp(1.5rem, 3vw, 2rem) 0;
  }

  .quote-mark {
    font-size: clamp(2.5rem, 8vw, 3.5rem);
  }
}
</style>