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

// --- Filtering function (matching template exactly) ---
function filterFunc(selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      // Force animation retrigger by briefly removing active class
      filterItems[i].classList.remove("active");
      // Use setTimeout to ensure animation retriggers
      setTimeout(() => {
        filterItems[i].classList.add("active");
      }, 10);
    } else {
      // Support multiple categories by checking if selectedValue is in the space-separated list
      const categories = (filterItems[i].dataset.category || "").split(" ");
      if (categories.includes(selectedValue)) {
        // Force animation retrigger by briefly removing active class
        filterItems[i].classList.remove("active");
        // Use setTimeout to ensure animation retriggers
        setTimeout(() => {
          filterItems[i].classList.add("active");
        }, 10);
      } else {
        filterItems[i].classList.remove("active");
      }
    }
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
      
      // Use the same filtering function for consistency
      filterFunc(category);
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
    // Stop event propagation to prevent double opening
    e.stopPropagation();
    e.stopImmediatePropagation();
    
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
    lightbox.style.backdropFilter = 'blur(8px)';

    // Create image container
    const imgContainer = document.createElement('div');
    imgContainer.style.position = 'relative';
    imgContainer.style.maxWidth = '90vw';
    imgContainer.style.maxHeight = '90vh';
    imgContainer.style.overflow = 'hidden';
    imgContainer.style.borderRadius = '12px';
    imgContainer.style.boxShadow = '0 25px 60px rgba(0,0,0,0.6), 0 10px 20px rgba(0,0,0,0.3)';
    imgContainer.style.background = '#222';
    imgContainer.style.cursor = 'grab';

    const zoomImg = document.createElement('img');
    zoomImg.src = img.src;
    zoomImg.alt = img.alt || '';
    zoomImg.style.width = '100%';
    zoomImg.style.height = 'auto';
    zoomImg.style.display = 'block';
    zoomImg.style.transition = 'transform 0.3s ease';
    zoomImg.style.userSelect = 'none';
    zoomImg.draggable = false;

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '10px';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.background = 'rgba(0,0,0,0.7)';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.zIndex = '1';
    closeBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    closeBtn.style.backdropFilter = 'blur(10px)';
    closeBtn.style.transition = 'all 0.2s ease';

    // Create zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.style.position = 'absolute';
    zoomControls.style.bottom = '15px';
    zoomControls.style.right = '15px';
    zoomControls.style.display = 'flex';
    zoomControls.style.gap = '8px';
    zoomControls.style.zIndex = '1';

    const zoomInBtn = document.createElement('button');
    zoomInBtn.innerHTML = '+';
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.innerHTML = '−';

    [zoomInBtn, zoomOutBtn].forEach(btn => {
      btn.style.width = '40px';
      btn.style.height = '40px';
      btn.style.border = 'none';
      btn.style.borderRadius = '50%';
      btn.style.background = 'rgba(0,0,0,0.7)';
      btn.style.color = 'white';
      btn.style.fontSize = '20px';
      btn.style.fontWeight = 'bold';
      btn.style.cursor = 'pointer';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
      btn.style.backdropFilter = 'blur(10px)';
      btn.style.transition = 'all 0.2s ease';
    });

    // Zoom functionality
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    function updateTransform() {
      zoomImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    }

    function resetZoom() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
      imgContainer.style.cursor = 'grab';
    }

    // Zoom in/out functions
    function zoomIn() {
      scale = Math.min(scale * 1.3, 5);
      updateTransform();
      imgContainer.style.cursor = scale > 1 ? 'grab' : 'grab';
    }

    function zoomOut() {
      scale = Math.max(scale / 1.3, 0.5);
      if (scale <= 1) {
        resetZoom();
      } else {
        updateTransform();
      }
    }

    // Mouse drag functionality
    imgContainer.addEventListener('mousedown', function(e) {
      if (scale > 1) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        imgContainer.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', function(e) {
      if (isDragging && scale > 1) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        translateX += deltaX / scale;
        translateY += deltaY / scale;
        updateTransform();
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        imgContainer.style.cursor = scale > 1 ? 'grab' : 'grab';
      }
    });

    // Wheel zoom
    imgContainer.addEventListener('wheel', function(e) {
      e.preventDefault();
      const delta = e.deltaY;
      if (delta < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    });

    // Button hover effects
    [closeBtn, zoomInBtn, zoomOutBtn].forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255,255,255,0.2)';
        this.style.transform = 'scale(1.1)';
      });
      btn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(0,0,0,0.7)';
        this.style.transform = 'scale(1)';
      });
    });

    // Event listeners
    zoomInBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      zoomIn();
    });

    zoomOutBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      zoomOut();
    });

    // Assembly
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomInBtn);
    imgContainer.appendChild(zoomImg);
    imgContainer.appendChild(closeBtn);
    imgContainer.appendChild(zoomControls);
    lightbox.appendChild(imgContainer);
    document.body.appendChild(lightbox);

    function removeLightbox() {
      if (document.body.contains(lightbox)) {
        document.body.removeChild(lightbox);
      }
      document.removeEventListener('keydown', escListener);
      document.removeEventListener('mousemove', arguments.callee);
      document.removeEventListener('mouseup', arguments.callee);
    }

    // Close handlers
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      removeLightbox();
    });

    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        removeLightbox();
      }
    });

    function escListener(ev) {
      if (ev.key === 'Escape') removeLightbox();
    }
    document.addEventListener('keydown', escListener);

    // Double-click to reset zoom
    imgContainer.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      resetZoom();
    });
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
    <button class="zoom-close-btn" onclick="closeImageZoom()">×</button>
    <div class="zoom-controls">
      <button class="zoom-btn" onclick="zoomIn()">+</button>
      <button class="zoom-btn" onclick="resetZoom()">⌂</button>
      <button class="zoom-btn" onclick="zoomOut()">−</button>
    </div>
    <img id="zoomed-image" alt="Zoomed image">
  `;
  document.body.appendChild(zoomOverlay);
  
  // Close on overlay click (but not on image click)
  zoomOverlay.addEventListener('click', function(e) {
    if (e.target === zoomOverlay) {
      closeImageZoom();
    }
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
// Page Navigation (Template Approach)
// --------------------

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
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

// Enhanced staggered project animations when filtering - REMOVED TO PREVENT CONFLICTS
// Original filterFunc is kept simple to match template behavior

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

// Handle image lazy loading if supported
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  if ('loading' in HTMLImageElement.prototype) {
    img.addEventListener('load', () => img.classList.add('loaded'));
  }
});

// --------------------
// Initialize project filtering - Simple initialization only
// --------------------
function initializeProjectAnimations() {
  // Ensure all projects start in the correct state
  filterItems.forEach(item => {
    // Show all projects initially (All category is default)
    item.classList.add('active');
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeProjectAnimations);

// --------------------
// Initialize all animations
document.addEventListener('DOMContentLoaded', function() {
  animateSkillBars();
  // enhanceProjectFiltering(); // REMOVED - was causing conflicts
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