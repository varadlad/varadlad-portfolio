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
  // Multi-category filter logic
  if (selectedValue === "all") {
    // Show each project only once
    filterItems.forEach(item => {
      item.classList.add("active");
    });
  } else {
    filterItems.forEach(item => {
      // Split data-category by space and check if any matches selectedValue
      const categories = (item.dataset.category || "").split(" ");
      if (categories.includes(selectedValue)) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }
}

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
        if (category === "all") {
          item.classList.add("active");
        } else {
          const categories = (item.dataset.category || "").split(" ");
          if (categories.includes(category)) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        }
      });
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
// Page Navigation
// --------------------
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("article[data-page]");

navigationLinks.forEach(link => {
  link.addEventListener("click", function () {
    const target = this.textContent.trim().toLowerCase();
    navigationLinks.forEach(l => l.classList.remove("active"));
    pages.forEach(page => {
      if (page.dataset.page === target) {
        page.classList.add("active");
      } else {
        page.classList.remove("active");
      }
    });
    this.classList.add("active");
    window.scrollTo(0, 0);
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
      btnPrev.disabled = (pageIdx === 0);
      btnNext.disabled = (pageIdx === currentPages.length - 1);
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
  // If clicked element is an <a> with a child <img class="project-img">
  if (e.target.matches('.project-modal .image-row a')) {
    img = e.target.querySelector('img.project-img');
  } else if (e.target.matches('.project-modal img.project-img')) {
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