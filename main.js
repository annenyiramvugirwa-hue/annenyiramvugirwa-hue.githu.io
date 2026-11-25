/**
 * MINEMBWE SCHOOL - OFFICIAL JAVASCRIPT
 * Handles navigation, mobile drawer, counter animations,
 * gallery filters, lightbox modal, forms, and WhatsApp integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. STICKY NAVBAR & BACK-TO-TOP BUTTON
  const navbar = document.querySelector('.navbar');
  const backToTopBtn = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    if (window.scrollY > 350) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  });

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 2. ACTIVE NAVIGATION LINK DETECTION
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else if (currentPath.includes(href) && href !== 'index.html' && href !== './') {
      link.classList.add('active');
    }
  });

  // 3. MOBILE MENU TOGGLE
  const hamburger = document.querySelector('.hamburger');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileOverlay = document.querySelector('.mobile-nav-overlay');
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    mobileDrawer?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileDrawer?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openMobileMenu);
  mobileCloseBtn?.addEventListener('click', closeMobileMenu);
  mobileOverlay?.addEventListener('click', closeMobileMenu);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeLightbox();
      closeFeedbackModal();
    }
  });

  // 4. STAT COUNTER ANIMATION
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  if (statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          statNumbers.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const suffix = counter.getAttribute('data-suffix') || '';
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out quadratic
              const easeProgress = progress * (2 - progress);
              const currentVal = Math.floor(easeProgress * target);

              counter.innerText = currentVal.toLocaleString() + suffix;

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                counter.innerText = target.toLocaleString() + suffix;
              }
            }

            requestAnimationFrame(updateCounter);
          });
        }
      });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      statsObserver.observe(statsSection);
    }
  }

  // 5. ACCORDION / FAQ
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isActive = item.classList.contains('active');

      // Close all other accordion items
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherContent = otherItem.querySelector('.accordion-content');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        item.classList.remove('active');
        content.style.maxHeight = null;
      }
    });
  });

  // Open first accordion by default if present
  const firstAccordion = document.querySelector('.accordion-item');
  if (firstAccordion) {
    const header = firstAccordion.querySelector('.accordion-header');
    const content = firstAccordion.querySelector('.accordion-content');
    firstAccordion.classList.add('active');
    if (content) {
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  }

  // 6. GALLERY FILTERING & LIGHTBOX
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.querySelector('.lightbox-modal');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxTitle = document.querySelector('.lightbox-title');
  const lightboxCategory = document.querySelector('.lightbox-category');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  let currentGalleryList = [];
  let currentImageIndex = 0;

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterVal === 'all' || itemCategory === filterVal) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
      updateActiveGalleryList();
    });
  });

  function updateActiveGalleryList() {
    currentGalleryList = Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
  }

  updateActiveGalleryList();

  // Open Lightbox
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      updateActiveGalleryList();
      currentImageIndex = currentGalleryList.indexOf(item);
      if (currentImageIndex !== -1) {
        showLightboxImage(currentImageIndex);
        lightboxModal?.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function showLightboxImage(index) {
    if (!currentGalleryList[index]) return;
    const item = currentGalleryList[index];
    const imgEl = item.querySelector('.gallery-img');
    const captionEl = item.querySelector('.gallery-caption');
    const tagEl = item.querySelector('.gallery-tag');

    if (lightboxImg && imgEl) {
      lightboxImg.src = imgEl.src;
      lightboxImg.alt = imgEl.alt || 'Minembwe School Gallery Image';
    }
    if (lightboxTitle && captionEl) {
      lightboxTitle.innerText = captionEl.innerText;
    }
    if (lightboxCategory && tagEl) {
      lightboxCategory.innerText = tagEl.innerText;
    }
  }

  function closeLightbox() {
    lightboxModal?.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });

  lightboxPrev?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentImageIndex = (currentImageIndex - 1 + currentGalleryList.length) % currentGalleryList.length;
    showLightboxImage(currentImageIndex);
  });

  lightboxNext?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentImageIndex = (currentImageIndex + 1) % currentGalleryList.length;
    showLightboxImage(currentImageIndex);
  });

  // Lightbox keyboard arrows
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal?.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') {
      currentImageIndex = (currentImageIndex - 1 + currentGalleryList.length) % currentGalleryList.length;
      showLightboxImage(currentImageIndex);
    } else if (e.key === 'ArrowRight') {
      currentImageIndex = (currentImageIndex + 1) % currentGalleryList.length;
      showLightboxImage(currentImageIndex);
    }
  });

  // 7. TOAST NOTIFICATION UTILITY
  function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <div>${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4500);
  }

  // 8. FEEDBACK MODAL UTILITY
  const feedbackModal = document.getElementById('feedbackModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalOkBtn = document.getElementById('modalOkBtn');

  function openFeedbackModal(title, text, detailsHtml, whatsappUrl) {
    if (!feedbackModal) return;
    const modalTitle = feedbackModal.querySelector('.modal-title');
    const modalText = feedbackModal.querySelector('.modal-text');
    const modalDetails = feedbackModal.querySelector('.modal-details');
    const modalWhatsappBtn = feedbackModal.querySelector('.modal-whatsapp-btn');

    if (modalTitle) modalTitle.innerText = title;
    if (modalText) modalText.innerText = text;
    if (modalDetails) {
      modalDetails.innerHTML = detailsHtml;
      modalDetails.style.display = detailsHtml ? 'flex' : 'none';
    }
    if (modalWhatsappBtn && whatsappUrl) {
      modalWhatsappBtn.href = whatsappUrl;
      modalWhatsappBtn.style.display = 'inline-flex';
    } else if (modalWhatsappBtn) {
      modalWhatsappBtn.style.display = 'none';
    }

    feedbackModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeFeedbackModal() {
    feedbackModal?.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalCloseBtn?.addEventListener('click', closeFeedbackModal);
  modalOkBtn?.addEventListener('click', closeFeedbackModal);
  feedbackModal?.addEventListener('click', (e) => {
    if (e.target === feedbackModal) closeFeedbackModal();
  });

  // 9. ADMISSION INQUIRY FORM SUBMISSION
  const admissionForm = document.getElementById('admissionForm');
  if (admissionForm) {
    admissionForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const parentName = document.getElementById('parentName')?.value.trim();
      const studentName = document.getElementById('studentName')?.value.trim();
      const studentAge = document.getElementById('studentAge')?.value.trim();
      const classApplying = document.getElementById('classApplying')?.value;
      const phone = document.getElementById('phone')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim() || 'No additional note provided.';

      if (!parentName || !studentName || !phone || !classApplying) {
        showToast('Please fill in all required fields accurately.', 'error');
        return;
      }

      // Generate Random Application Reference
      const refNumber = 'MNB-' + Math.floor(100000 + Math.random() * 900000);

      const detailsHtml = `
        <div><strong>Application Ref:</strong> ${refNumber}</div>
        <div><strong>Parent/Guardian:</strong> ${parentName}</div>
        <div><strong>Student Name:</strong> ${studentName} (Age: ${studentAge})</div>
        <div><strong>Class Applied:</strong> ${classApplying}</div>
        <div><strong>Phone:</strong> ${phone}</div>
        <div><strong>Email:</strong> ${email || 'N/A'}</div>
      `;

      // Build WhatsApp message link
      const waText = encodeURIComponent(
        `Hello Minembwe School, I have submitted an admission inquiry.\n\n` +
        `*Application Ref:* ${refNumber}\n` +
        `*Parent Name:* ${parentName}\n` +
        `*Student Name:* ${studentName} (Age: ${studentAge})\n` +
        `*Class Applying For:* ${classApplying}\n` +
        `*Phone:* ${phone}\n` +
        `*Email:* ${email}\n` +
        `*Note:* ${message}`
      );
      const whatsappUrl = `https://wa.me/250732436371?text=${waText}`;

      openFeedbackModal(
        'Application Inquiry Received!',
        `Thank you, ${parentName}. Your admission inquiry for ${studentName} has been successfully recorded. Our admissions counselor will contact you shortly.`,
        detailsHtml,
        whatsappUrl
      );

      showToast('Application successfully submitted!', 'success');
      admissionForm.reset();
    });
  }

  // 10. CONTACT FORM SUBMISSION
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName')?.value.trim();
      const email = document.getElementById('contactEmail')?.value.trim();
      const phone = document.getElementById('contactPhone')?.value.trim();
      const subject = document.getElementById('contactSubject')?.value || 'General Inquiry';
      const message = document.getElementById('contactMessage')?.value.trim();

      if (!name || !email || !message) {
        showToast('Please provide your name, email, and message.', 'error');
        return;
      }

      const refTicket = 'TKT-' + Math.floor(1000 + Math.random() * 9000);

      const detailsHtml = `
        <div><strong>Inquiry Ticket:</strong> ${refTicket}</div>
        <div><strong>Sender:</strong> ${name}</div>
        <div><strong>Email:</strong> ${email}</div>
        <div><strong>Phone:</strong> ${phone || 'N/A'}</div>
        <div><strong>Subject:</strong> ${subject}</div>
      `;

      const waText = encodeURIComponent(
        `Hello Minembwe School,\n\n` +
        `I sent an inquiry via your website (Ticket #${refTicket}).\n` +
        `*Name:* ${name}\n` +
        `*Subject:* ${subject}\n` +
        `*Email:* ${email}\n` +
        `*Message:* ${message}`
      );
      const whatsappUrl = `https://wa.me/250732436371?text=${waText}`;

      openFeedbackModal(
        'Message Sent Successfully!',
        `Thank you for contacting Minembwe School. We have received your inquiry regarding "${subject}" and our office team will respond promptly.`,
        detailsHtml,
        whatsappUrl
      );

      showToast('Your message has been sent!', 'success');
      contactForm.reset();
    });
  }

  // 11. NEWSLETTER / FOOTER INQUIRY
  const footerForm = document.getElementById('footerNewsletterForm');
  if (footerForm) {
    footerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = footerForm.querySelector('input[type="email"]')?.value;
      if (email) {
        showToast('Thank you for subscribing to Minembwe School updates!', 'success');
        footerForm.reset();
      }
    });
  }
});
