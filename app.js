/**
 * StratéNova - Interactive Features
 * - Mobile menu toggle
 * - IDT interactive calculator
 * - Form handling with validation & confirmation
 * - Smooth scroll & active navigation highlights
 * - Modal management (RGPD, CGU)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile drawer when clicking a link
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. IDT Interactive Simulator
  const rangeDelais = document.getElementById('range-delais');
  const rangeProcess = document.getElementById('range-process');
  const rangeSilos = document.getElementById('range-silos');

  const valDelais = document.getElementById('val-delais');
  const valProcess = document.getElementById('val-process');
  const valSilos = document.getElementById('val-silos');

  const simScore = document.getElementById('sim-score');
  const simStatus = document.getElementById('sim-status');

  function updateSimulator() {
    if (!rangeDelais || !rangeProcess || !rangeSilos) return;

    const delais = parseInt(rangeDelais.value, 10);
    const process = parseInt(rangeProcess.value, 10);
    const silos = parseInt(rangeSilos.value, 10);

    // Labels
    valDelais.textContent = `${delais > 65 ? 'Élevés' : delais > 35 ? 'Moyens' : 'Faibles'} (${delais}%)`;
    valProcess.textContent = `${process > 65 ? 'Faible' : process > 35 ? 'Moyenne' : 'Forte'} (${process}%)`;
    valSilos.textContent = `${silos > 65 ? 'Critique' : silos > 35 ? 'Sensible' : 'Fluide'} (${silos}%)`;

    // Calculate score (weighted average)
    const score = Math.round((delais * 0.4) + (process * 0.3) + (silos * 0.3));

    if (simScore) {
      simScore.textContent = `${score} / 100`;
    }

    if (simStatus) {
      if (score >= 60) {
        simStatus.textContent = 'Zone de vigilance critique';
        simStatus.className = 'sim-result-status alert-critical';
      } else if (score >= 35) {
        simStatus.textContent = 'Zone d’alerte modérée';
        simStatus.className = 'sim-result-status alert-moderate';
      } else {
        simStatus.textContent = 'Zone maîtrisée & saine';
        simStatus.className = 'sim-result-status alert-healthy';
      }
    }
  }

  if (rangeDelais && rangeProcess && rangeSilos) {
    rangeDelais.addEventListener('input', updateSimulator);
    rangeProcess.addEventListener('input', updateSimulator);
    rangeSilos.addEventListener('input', updateSimulator);
    updateSimulator();
  }

  // 3. Contact Form Submission
  const rdvForm = document.getElementById('rdv-form');
  const formFeedback = document.getElementById('form-feedback');

  if (rdvForm) {
    // Les demandes sont transmises par email à l'adresse du cabinet via FormSubmit
    const RDV_ENDPOINT = 'https://formsubmit.co/ajax/info@stratenova.net';
    const submitBtn = rdvForm.querySelector('button[type="submit"]');

    const showFeedback = (html, type) => {
      if (!formFeedback) return;
      formFeedback.innerHTML = html;
      formFeedback.className = `form-feedback ${type}`;
      formFeedback.style.display = 'block';
    };

    const escapeHtml = (str) => str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    rdvForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nom = document.getElementById('contact-nom').value.trim();
      const email = document.getElementById('contact-email').value.trim();

      if (!nom || !email) {
        showFeedback('Veuillez remplir les champs obligatoires (nom et email).', 'alert-critical');
        return;
      }

      const sujetSelect = document.getElementById('contact-sujet');
      const payload = {
        'Nom complet': nom,
        'Courriel': email,
        'Téléphone': document.getElementById('contact-tel').value.trim() || '—',
        'Entreprise & Poste': document.getElementById('contact-ste').value.trim() || '—',
        'Objet': sujetSelect.options[sujetSelect.selectedIndex].text,
        'Message': document.getElementById('contact-msg').value.trim() || '—',
        _subject: `Nouvelle demande de rendez-vous – ${nom}`,
        _replyto: email,
        _template: 'table',
        _captcha: 'false',
        _honey: rdvForm.querySelector('input[name="_honey"]')?.value || ''
      };

      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours…';
      }

      try {
        const response = await fetch(RDV_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false || result.success === 'false') {
          throw new Error(result.message || `HTTP ${response.status}`);
        }

        showFeedback(
          `<strong>Merci ${escapeHtml(nom)} !</strong> Votre demande de rendez-vous a bien été transmise. Un associé de StratéNova prendra contact avec vous sous 24 à 48 heures.`,
          'success'
        );
        rdvForm.reset();
      } catch (err) {
        console.error('Envoi du formulaire impossible :', err);
        showFeedback(
          'Une erreur est survenue lors de l’envoi. Merci de réessayer ou de nous écrire directement à <a href="mailto:info@stratenova.net">info@stratenova.net</a>.',
          'alert-critical'
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      }
    });
  }

  // 4. Modals (RGPD & CGU)
  const modalTriggers = document.querySelectorAll('.modal-trigger');
  const modals = document.querySelectorAll('.modal');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('href').replace('#', '');
      const modal = document.getElementById(targetId);
      if (modal) {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  modals.forEach(modal => {
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
      });
    }
  });

  // Current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
