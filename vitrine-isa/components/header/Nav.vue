<template>
  <header>
    <!-- Excellence Badge -->
    <div class="excellence-indicator"></div>

    <div class="logo-container">
      <NuxtLink to="/" class="logo-link">
        <div class="logo-glow"></div>
        <NuxtImg
          src="/logo-write.svg"
          alt="Logo ISA"
          width="200"
          height="auto"
          loading="lazy"
        />
      </NuxtLink>
    </div>

    <!-- Desktop Navigation -->
    <nav class="desktop-nav">
      <ul>
        <li v-for="(item, index) in navItems" :key="index">
          <NuxtLink :to="item.path" class="nav-link" active-class="active">
            <span class="link-text">{{ item.label }}</span>
            <span class="link-underline"></span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="button-container">
      <NuxtLink to="https://edu.isa-ambato.mg/login" class="student-button">
        <span class="button-glow"></span>
        <span class="button-content">
          <span class="button-text">Se connecter</span>
          <Icon name="hugeicons:login-03" size="18" />
        </span>
      </NuxtLink>
    </div>

    <!-- Mobile Hamburger Button -->
    <button
      class="hamburger"
      @click="toggleMenu"
      :class="{ 'is-active': isMenuOpen }"
    >
      <span class="hamburger-box">
        <span class="hamburger-inner"></span>
      </span>
    </button>

    <!-- Mobile Navigation -->
    <div
      class="mobile-nav"
      :class="{ 'is-open': isMenuOpen }"
      @click="closeMenu"
    >
      <div class="mobile-nav-content" @click.stop>
        <div class="mobile-nav-header">
          <div class="mobile-logo-container">
            <NuxtImg src="/logo-write.svg" alt="Logo ISA" width="120" />
          </div>
        </div>
        <ul>
          <li v-for="(item, index) in navItems" :key="index">
            <NuxtLink
              :to="item.path"
              class="mobile-nav-link"
              active-class="active"
              @click="closeMenu"
            >
              <span class="mobile-link-icon">◆</span>
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
        <div class="mobile-nav-footer">
          <NuxtLink
            to="https://edu.isa-ambato.mg/login"
            class="mobile-student-button"
            @click="closeMenu"
          >
            <span class="mobile-button-glow"></span>
            <span class="button-content">
              <span class="button-text">Se connecter</span>
              <Icon name="hugeicons:login-03" size="18" />
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
const navItems = [
  { path: "/", label: "Accueil" },
  { path: "/formations", label: "Nos Formations" },
  { path: "/admission", label: "Admission" },
  { path: "/contact", label: "Contact" },
];

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};

const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = "";
};
</script>

<style scoped>
/* ===== HEADER PREMIUM ===== */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2.5rem;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    0 1px 4px rgba(0, 0, 0, 0.04);
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.98),
    rgba(255, 255, 255, 0.95)
  );
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(var(--primary-color-rgb), 0.08);
}

/* Excellence Indicator */
.excellence-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--primary-color) 0%,
    var(--secondary-color) 50%,
    var(--primary-color) 100%
  );
  background-size: 200% 100%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* ===== LOGO PREMIUM ===== */
.logo-container {
  flex-shrink: 0;
  position: relative;
}

.logo-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  position: relative;
  transition: transform 0.3s ease;
}

.logo-link:hover {
  transform: translateY(-2px);
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140%;
  height: 140%;
  background: radial-gradient(
    circle,
    rgba(var(--primary-color-rgb), 0.15) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.logo-link:hover .logo-glow {
  opacity: 1;
}

.logo-subtitle {
  font-size: 0.65rem;
  color: var(--primary-color);
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: -8px;
  opacity: 0.8;
}

/* ===== NAVIGATION PREMIUM ===== */
.desktop-nav ul {
  display: flex;
  gap: 2.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  padding: 0.75rem 0;
  text-decoration: none;
  color: var(--black);
  font-weight: 500;
  position: relative;
  display: inline-block;
  transition: color 0.3s ease;
  letter-spacing: 0.3px;
}

.link-text {
  position: relative;
  z-index: 1;
}

.link-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--secondary-color)
  );
  transform: translateX(-50%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link:hover .link-underline,
.nav-link.active .link-underline {
  width: 100%;
}

.nav-link.active {
  color: var(--primary-color);
}

/* ===== BOUTON ÉTUDIANT PREMIUM ===== */
.button-container {
  flex-shrink: 0;
}

.student-button {
  display: inline-flex;
  align-items: center;
  padding: 0.65rem 1.5rem;
  border-radius: 30px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #4a90e2 100%);
  color: var(--white);
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.25);
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s ease;
}

.student-button:hover .button-glow {
  left: 100%;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.student-button:hover {
  background: linear-gradient(135deg, var(--secondary-color) 0%, #34d399 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(var(--primary-color-rgb), 0.35);
}

.button-text {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* ===== HAMBURGER PREMIUM ===== */
.hamburger {
  display: none;
  padding: 8px;
  border: none;
  background: rgba(var(--primary-color-rgb), 0.08);
  cursor: pointer;
  z-index: 101;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.hamburger:hover {
  background: rgba(var(--primary-color-rgb), 0.15);
  transform: scale(1.05);
}

.hamburger-box {
  width: 28px;
  height: 20px;
  display: inline-block;
  position: relative;
}

.hamburger-inner {
  width: 100%;
  height: 2.5px;
  background-color: var(--primary-color);
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.hamburger-inner::before,
.hamburger-inner::after {
  content: "";
  width: 100%;
  height: 2.5px;
  background-color: var(--primary-color);
  position: absolute;
  left: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.hamburger-inner::before {
  top: -8px;
}

.hamburger-inner::after {
  top: 8px;
}

.hamburger.is-active .hamburger-inner {
  background-color: transparent;
}

.hamburger.is-active .hamburger-inner::before {
  transform: translateY(8px) rotate(45deg);
  background-color: var(--primary-color);
}

.hamburger.is-active .hamburger-inner::after {
  transform: translateY(-8px) rotate(-45deg);
  background-color: var(--primary-color);
}

/* ===== MOBILE NAV PREMIUM ===== */
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-nav.is-open {
  opacity: 1;
  visibility: visible;
}

.mobile-nav-content {
  width: 90%;
  max-width: 420px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 0;
  transform: translateY(30px) scale(0.95);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
}

.mobile-nav.is-open .mobile-nav-content {
  transform: translateY(0) scale(1);
}

.mobile-nav-header {
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, #4a90e2 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.mobile-nav-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 30% 50%,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 60%
  );
}

.mobile-logo-container {
  position: relative;
  z-index: 1;
}

.mobile-excellence-badge {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.mobile-nav ul {
  list-style: none;
  padding: 1.5rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  text-decoration: none;
  color: var(--black);
  font-weight: 500;
  font-size: 1.05rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.mobile-link-icon {
  font-size: 0.6rem;
  color: var(--primary-color);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.mobile-nav-link:hover .mobile-link-icon,
.mobile-nav-link.active .mobile-link-icon {
  opacity: 1;
  transform: translateX(0);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--primary-color);
  background: linear-gradient(
    135deg,
    rgba(var(--primary-color-rgb), 0.08) 0%,
    rgba(var(--primary-color-rgb), 0.12) 100%
  );
  transform: translateX(8px);
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.15);
}

.mobile-nav-footer {
  padding: 1.5rem;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(var(--primary-color-rgb), 0.03)
  );
}

.mobile-student-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-radius: 30px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #4a90e2 100%);
  color: var(--white);
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.3);
  font-weight: 600;
}

.mobile-button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s ease;
}

.mobile-student-button:hover .mobile-button-glow {
  left: 100%;
}

.mobile-student-button:hover {
  background: linear-gradient(135deg, var(--secondary-color) 0%, #34d399 100%);
  transform: scale(1.03);
  box-shadow: 0 6px 25px rgba(var(--secondary-color-rgb), 0.35);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  header {
    padding: 1rem 1.5rem;
  }

  .desktop-nav,
  .button-container {
    display: none;
  }

  .hamburger {
    display: block;
  }

  .logo-subtitle {
    font-size: 0.55rem;
    letter-spacing: 1.5px;
  }
}

@media (min-width: 1025px) {
  .mobile-nav {
    display: none;
  }
}

@media (max-width: 768px) {
  header {
    padding: 0.75rem 1rem;
  }

  .logo-link img {
    width: 150px;
  }
}
</style>
