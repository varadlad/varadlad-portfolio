'use strict';

// --------------------
// Utility: Toggle class
// --------------------
const elementToggleFunc = function (elem, className = "active") {
  elem.classList.toggle(className);
};

// --------------------
// Sidebar (mobile)
// --------------------
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", function () {
    elementToggleFunc(sidebar);
  });
}

// --------------------
// Testimonials Modal
// --------------------
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
};

testimonialsItem.forEach(item => {
  item.addEventListener("click", function () {
    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
    testimonialsModalFunc();
  });
});

if (modalCloseBtn) modalCloseBtn.addEventListener("click", testimonialsModalFunc);
if (overlay) overlay.addEventListener("click", testimonialsModalFunc);

// --------------------
// Custom Select & Project Filtering
// --------------------
const select = document.querySelector("[data-select]");
function getSelectItems() {
  return document.querySelectorAll("[data-select-item]");
}
const selectValue = document.querySelector("[data-select-value]");
const filterBtns = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter-item]");
const filterSelect = document.querySelector('.filter-select');
const selectList = document.querySelector('.select-list');
const projectItems = document.querySelectorAll('.project-item');

// --- Desktop: Filter buttons ---
let lastClickedBtn = filterBtns[0];
filterBtns.forEach(btn => {
  btn.addEventListener("click", function () {
    const selectedValue = btn.getAttribute("data-category");
    // Update select value for consistency
    const mainTitleSpan = btn.querySelector(".filter-title");
    if (selectValue) selectValue.innerText = mainTitleSpan ? mainTitleSpan.innerText : selectedValue;
    filterFunc(selectedValue);
    if (lastClickedBtn) lastClickedBtn.classList.remove("active");
    btn.classList.add("active");
    btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    lastClickedBtn = btn;
  });
});

// --- Filtering function ---
function filterFunc(selectedValue) {
  // Remove .active from all first, and force reflow to retrigger animation
  filterItems.forEach(item => {
    item.classList.remove("active");
    void item.offsetWidth; // Force reflow
  });
  if (selectedValue === "all") {
    filterItems.forEach(item => {
      item.classList.add("active");
    });
  } else {
    filterItems.forEach(item => {
      const categories = (item.dataset.category || "").split(" ");
      if (categories.includes(selectedValue)) {
        item.classList.add("active");
      }
    });
  }
}

// Store the original filterFunc as a global variable for animation enhancement
window.filterFunc = filterFunc;

// --- Custom select (dropdown) for mobile ---
if (select) {
  select.addEventListener("click", function (e) {
    e.stopPropagation();
    elementToggleFunc(select);
  });
}

getSelectItems().forEach(item => {
  item.addEventListener("click", function (e) {
    e.stopPropagation();
    const selectedValue = item.getAttribute("data-category");
    if (selectValue) selectValue.innerText = item.innerText;
    if (select) select.classList.remove("active");
    filterFunc(selectedValue);
  });
});

// --- Mobile: Fancy dropdown (filter-select/select-list) ---
if (filterSelect && selectList) {
  filterSelect.addEventListener('click', function (e) {
    e.stopPropagation();
    filterSelect.classList.toggle('open');
    selectList.classList.toggle('open');
  });

  document.addEventListener('click', function () {
    filterSelect.classList.remove('open');
    selectList.classList.remove('open');
  });

  getSelectItems().forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const category = btn.getAttribute('data-category');
      if (selectValue) selectValue.innerText = btn.innerText;
      filterSelect.classList.remove('open');
      selectList.classList.remove('open');
      // Multi-category filter logic for mobile dropdown
      projectItems.forEach(function(item) {
        item.classList.remove("active");
        void item.offsetWidth; // Force reflow
      });
      if (category === "all") {
        projectItems.forEach(function(item) {
          item.classList.add("active");
        });
      } else {
        projectItems.forEach(function(item) {
          const categories = (item.dataset.category || "").split(" ");
          if (categories.includes(category)) {
            item.classList.add("active");
          }
        });
      }
    });
  });
}

// --------------------
// Contact Form Validation
// --------------------
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

formInputs.forEach(input => {
  input.addEventListener("input", function () {
    if (form && form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
});

// --------------------
// Page Navigation - Disabled to prevent conflicts
// --------------------
// Navigation is now handled by enhancePageTransitions() function

// --------------------
// Project Modal Logic
// --------------------
(function() {
  if (!document.getElementById('project-modal')) {
    const modal = document.createElement('div');
    modal.id = 'project-modal';
    modal.className = 'project-modal';
    modal.innerHTML = `
      <div class="project-modal-overlay" id="project-modal-overlay"></div>
      <div class="project-modal-wrapper" role="dialog" aria-modal="true">
        <button class="project-modal-close" id="project-modal-close" aria-label="Close">&times;</button>
        <div class="project-modal-header">
          <img src="" alt="" class="project-modal-image" id="project-modal-image" style="display:none;">
          <h3 class="project-modal-title" id="project-modal-title"></h3>
        </div>
        <div class="project-modal-body" id="project-modal-body"></div>
        <div class="project-modal-footer">
          <button class="modal-prev-btn" id="modal-prev-btn">Previous</button>
          <button class="modal-next-btn" id="modal-next-btn">Next</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  (function() {
    const modal = document.getElementById('project-modal');
    const overlay = document.getElementById('project-modal-overlay');
    const closeBtn = document.getElementById('project-modal-close');
    const modalBody = document.getElementById('project-modal-body');
    const modalTitle = document.getElementById('project-modal-title');
    const modalImg = document.getElementById('project-modal-image');
    const btnPrev = document.getElementById('modal-prev-btn');
    const btnNext = document.getElementById('modal-next-btn');
    const modalFooter = modal.querySelector('.project-modal-footer');

    let currentPages = [];
    let currentPage = 0;

    function showPage(pageIdx) {
      currentPages.forEach((el, idx) => {
        el.style.display = '';
        if (idx === pageIdx) {
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      });
      // Hide/show prev/next buttons as needed
      if (btnPrev) {
        if (pageIdx === 0) {
          btnPrev.style.display = 'none';
        } else {
          btnPrev.style.display = '';
        }
      }
      if (btnNext) {
        if (pageIdx === currentPages.length - 1) {
          btnNext.style.display = 'none';
        } else {
          btnNext.style.display = '';
        }
      }
      // Alignment logic for modal footer
      if (modalFooter) {
        modalFooter.classList.remove('only-next', 'only-prev');
        const prevVisible = btnPrev && btnPrev.style.display !== 'none';
        const nextVisible = btnNext && btnNext.style.display !== 'none';
        if (!prevVisible && nextVisible) {
          modalFooter.classList.add('only-next');
        } else if (prevVisible && !nextVisible) {
          modalFooter.classList.add('only-prev');
        }
      }
      // Scroll modal body to top on page change
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
    }

    document.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const img = item.querySelector('img');
        const title = item.querySelector('.project-title');
        if (img) {
          modalImg.src = img.src;
          modalImg.alt = img.alt || '';
          modalImg.style.display = '';
        } else {
          modalImg.style.display = 'none';
        }
        modalTitle.textContent = title ? title.textContent : '';
        modalBody.innerHTML = '';
        currentPages = [];
        item.querySelectorAll('.modal-page').forEach(page => {
          const clone = page.cloneNode(true);
          clone.removeAttribute('style');
          clone.querySelectorAll('[style]').forEach(child => {
            child.removeAttribute('style');
          });
          modalBody.appendChild(clone);
          currentPages.push(clone);
        });
        currentPage = 0;
        if (currentPages.length > 0) {
          showPage(currentPage);
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Always scroll modal body to top when opening a project
        if (modalBody) modalBody.scrollTop = 0;
      });
    });

    btnPrev.addEventListener('click', function() {
      if (currentPage > 0) {
        currentPage--;
        showPage(currentPage);
      }
    });
    btnNext.addEventListener('click', function() {
      if (currentPage < currentPages.length - 1) {
        currentPage++;
        showPage(currentPage);
      }
    });

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      modalBody.innerHTML = '';
      currentPages = [];
      currentPage = 0;
    }
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e) {
      if (modal.classList.contains('active') && e.key === 'Escape') closeModal();
    });
  })();
})();

document.querySelectorAll('.project-img').forEach(img => {
  // Only wrap grid thumbnails, not images inside modals or .project-modal
  if (img.closest('.project-card') || img.closest('.project-modal')) return;

  const figure = document.createElement('figure');
  figure.className = 'project-card';
  img.parentNode.insertBefore(figure, img);
  figure.appendChild(img);

  const overlay = document.createElement('div');
  overlay.className = 'project-overlay';
  const icon = document.createElement('ion-icon');
  icon.setAttribute('name', 'eye-outline');
  overlay.appendChild(icon);
  figure.appendChild(overlay);
});

// Lightbox for images in project-modal (detail view)
document.addEventListener('click', function(e) {
  // Support both <img class="project-img"> and <a><img class="project-img"></a> in .project-modal
  let img = null;
  // If clicked element is an <a> with a child <img class="project-img"> or <img class="hepa-img">
  if (e.target.matches('.project-modal .image-row a')) {
    img = e.target.querySelector('img.project-img, img.hepa-img');
  } else if (e.target.matches('.project-modal img.project-img, .project-modal img.hepa-img')) {
    img = e.target;
  }
  if (img) {
    // Prevent default link navigation if inside <a>
    if (e.target.closest('a')) e.preventDefault();
    // Create lightbox overlay
    const lightbox = document.createElement('div');
    lightbox.style.position = 'fixed';
    lightbox.style.top = 0;
    lightbox.style.left = 0;
    lightbox.style.width = '100vw';
    lightbox.style.height = '100vh';
    lightbox.style.background = 'rgba(0,0,0,0.85)';
    lightbox.style.display = 'flex';
    lightbox.style.alignItems = 'center';
    lightbox.style.justifyContent = 'center';
    lightbox.style.zIndex = 99999;
    lightbox.style.cursor = 'zoom-out';

    const zoomImg = document.createElement('img');
    zoomImg.src = img.src;
    zoomImg.alt = img.alt || '';
    zoomImg.style.maxWidth = '90vw';
    zoomImg.style.maxHeight = '90vh';
    zoomImg.style.borderRadius = '8px';
    zoomImg.style.boxShadow = '0 8px 32px rgba(0,0,0,0.45)';
    zoomImg.style.background = '#222';

    lightbox.appendChild(zoomImg);
    document.body.appendChild(lightbox);

    function removeLightbox() {
      document.body.removeChild(lightbox);
      document.removeEventListener('keydown', escListener);
    }
    lightbox.addEventListener('click', removeLightbox);
    function escListener(ev) {
      if (ev.key === 'Escape') removeLightbox();
    }
    document.addEventListener('keydown', escListener);
  }
});

// --------------------
// Image Zoom Functionality
// --------------------
let zoomOverlay = null;
let currentZoomedImage = null;
let zoomLevel = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

// Create zoom overlay
function createZoomOverlay() {
  if (zoomOverlay) return zoomOverlay;
  
  zoomOverlay = document.createElement('div');
  zoomOverlay.className = 'image-zoom-overlay';
  zoomOverlay.innerHTML = `
    <div class="zoom-image-container">
      <button class="zoom-close-btn" onclick="closeImageZoom()">×</button>
      <img id="zoomed-image" alt="Zoomed image">
      <div class="zoom-controls">
        <button class="zoom-btn" onclick="zoomIn()">+</button>
        <button class="zoom-btn" onclick="resetZoom()">⌂</button>
        <button class="zoom-btn" onclick="zoomOut()">−</button>
      </div>
    </div>
  `;
  document.body.appendChild(zoomOverlay);
  
  // Close on overlay click (only when clicking outside the image container)
  zoomOverlay.addEventListener('click', function(e) {
    if (e.target === zoomOverlay) {
      closeImageZoom();
    }
  });
  
  // Prevent image container clicks from bubbling to overlay
  const imageContainer = zoomOverlay.querySelector('.zoom-image-container');
  imageContainer.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // Add keyboard support
  document.addEventListener('keydown', function(e) {
    if (zoomOverlay && zoomOverlay.classList.contains('active')) {
      switch(e.key) {
        case 'Escape':
          closeImageZoom();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    }
  });
  
  return zoomOverlay;
}

// Open image in zoom overlay - Fixed animation
function openImageZoom(imageSrc, imageAlt) {
  const overlay = createZoomOverlay();
  const zoomedImg = overlay.querySelector('#zoomed-image');
  
  currentZoomedImage = zoomedImg;
  zoomedImg.src = imageSrc;
  zoomedImg.alt = imageAlt || 'Zoomed image';
  
  // Reset zoom state
  zoomLevel = 1;
  translateX = 0;
  translateY = 0;
  updateImageTransform();
  
  // Smooth show animation
  overlay.style.display = 'flex';
  overlay.offsetHeight; // Force reflow
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Add touch/mouse events for pan and zoom
  addPanZoomEvents(zoomedImg);
}

// Close zoom overlay - Fixed animation
function closeImageZoom() {
  if (zoomOverlay) {
    zoomOverlay.classList.remove('active');
    
    setTimeout(() => {
      zoomOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
    
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
  }
}

// Zoom functions
function zoomIn() {
  zoomLevel = Math.min(zoomLevel * 1.3, 5);
  updateImageTransform();
}

function zoomOut() {
  zoomLevel = Math.max(zoomLevel / 1.3, 0.5);
  updateImageTransform();
}

function resetZoom() {
  zoomLevel = 1;
  translateX = 0;
  translateY = 0;
  updateImageTransform();
}

function updateImageTransform() {
  if (currentZoomedImage && currentZoomedImage.parentElement) {
    // Use more precise transform calculation
    const scaleTransform = `scale(${zoomLevel})`;
    const translateTransform = `translate(${translateX / zoomLevel}px, ${translateY / zoomLevel}px)`;
    currentZoomedImage.style.transform = `${scaleTransform} ${translateTransform}`;
    
    // Update cursor based on zoom level
    currentZoomedImage.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-in';
  }
}

// Add pan and zoom events
function addPanZoomEvents(img) {
  // Mouse events
  img.addEventListener('mousedown', startPan);
  document.addEventListener('mousemove', pan);
  document.addEventListener('mouseup', endPan);
  
  // Touch events
  img.addEventListener('touchstart', handleTouchStart, { passive: false });
  img.addEventListener('touchmove', handleTouchMove, { passive: false });
  img.addEventListener('touchend', endPan);
  
  // Mouse wheel zoom
  img.addEventListener('wheel', function(e) {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  });
}

function startPan(e) {
  if (zoomLevel > 1) {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    currentZoomedImage.style.cursor = 'grabbing';
  }
}

function pan(e) {
  if (isDragging && zoomLevel > 1) {
    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateImageTransform();
  }
}

function endPan() {
  isDragging = false;
  if (currentZoomedImage) {
    currentZoomedImage.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-out';
  }
}

function handleTouchStart(e) {
  if (e.touches.length === 1 && zoomLevel > 1) {
    const touch = e.touches[0];
    startPan({ clientX: touch.clientX, clientY: touch.clientY });
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 1 && isDragging) {
    e.preventDefault();
    const touch = e.touches[0];
    pan({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
  }
}

// Initialize zoom functionality for project modal images
document.addEventListener('DOMContentLoaded', function() {
  // Add click listeners to all project modal images
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('project-img') && e.target.closest('.project-modal')) {
      e.preventDefault();
      e.stopPropagation();
      openImageZoom(e.target.src, e.target.alt);
    }
  });
});

// --------------------
// Page Navigation (Template Version)
// --------------------
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const clickedLinkText = this.innerHTML.toLowerCase();
    
    // Remove active from all pages and links first
    for (let j = 0; j < pages.length; j++) {
      pages[j].classList.remove("active");
    }
    for (let k = 0; k < navigationLinks.length; k++) {
      navigationLinks[k].classList.remove("active");
    }
    
    // Add active to the matching page and clicked link
    for (let j = 0; j < pages.length; j++) {
      if (clickedLinkText === pages[j].dataset.page) {
        pages[j].classList.add("active");
        this.classList.add("active");
        window.scrollTo(0, 0);
        break;
      }
    }
  });
}

// Skill progress bar animations
const animateSkillBars = function() {
  const skillBars = document.querySelectorAll('.skill-progress-fill');
  
  const observeSkills = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, { threshold: 0.5 });
  
  skillBars.forEach(bar => observeSkills.observe(bar));
};

// Staggered project animations when filtering - Fixed flickering
const enhanceProjectFiltering = function() {
  const filterItems = document.querySelectorAll("[data-filter-item]");
  
  // Store original filterFunc to preserve existing functionality
  const originalFilterFunc = window.filterFunc;
  
  // Enhance existing filterFunc with smoother animations
  window.filterFunc = function(selectedValue) {
    // Remove any existing animation classes first
    filterItems.forEach(item => {
      item.classList.remove("animate-in");
      item.style.opacity = "";
      item.style.transform = "";
    });
    
    // Run original filter logic
    originalFilterFunc(selectedValue);
    
    // Add smooth entrance animations to newly active items
    setTimeout(() => {
      const activeItems = document.querySelectorAll("[data-filter-item].active");
      activeItems.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(15px)";
        
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, index * 80);
      });
    }, 50);
  };
};

// Enhanced modal animations
const enhanceModals = function() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  
  const originalShow = modal.classList.add;
  const originalHide = modal.classList.remove;
  
  // Override modal show
  modal.showWithAnimation = function() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add backdrop blur effect
    modal.style.backdropFilter = 'blur(8px)';
    
    // Animate modal wrapper
    const wrapper = modal.querySelector('.project-modal-wrapper');
    if (wrapper) {
      wrapper.style.animation = 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
  };
  
  // Override modal hide
  modal.hideWithAnimation = function() {
    const wrapper = modal.querySelector('.project-modal-wrapper');
    if (wrapper) {
      wrapper.style.animation = 'modalSlideOut 0.3s ease-in';
    }
    
    setTimeout(() => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      modal.style.backdropFilter = '';
    }, 300);
  };
};

// Image loading animations
const enhanceImageLoading = function() {
  const images = document.querySelectorAll('.project-card img');
  
  images.forEach(img => {
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    }
  });
};

// Touch feedback for mobile
const addTouchFeedback = function() {
  const touchElements = document.querySelectorAll('.project-card, .btn, .navbar-link');
  
  touchElements.forEach(element => {
    element.addEventListener('touchstart', function() {
      this.style.transform = this.style.transform + ' scale(0.98)';
    });
    
    element.addEventListener('touchend', function() {
      this.style.transform = this.style.transform.replace(' scale(0.98)', '');
    });
  });
};

// Smooth scroll indicator
const addScrollIndicator = function() {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, var(--orange-yellow-crayola), #ffed4e);
    z-index: 9999;
    transition: width 0.1s ease;
  `;
  document.body.appendChild(indicator);
  
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    indicator.style.width = scrolled + '%';
  });
};

// Initialize remaining animations (keeping project cards, modals, etc.)
document.addEventListener('DOMContentLoaded', function() {
  animateSkillBars();
  enhanceProjectFiltering();
  enhanceModals();
  enhanceImageLoading();
  addTouchFeedback();
  addScrollIndicator();
  
  // Ensure initial active page is visible
  const activePage = document.querySelector('article[data-page].active');
  if (activePage) {
    activePage.style.opacity = '1';
    activePage.style.transform = 'translateY(0)';
  }
});