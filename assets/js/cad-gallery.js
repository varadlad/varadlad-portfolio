document.addEventListener('DOMContentLoaded', function() {
    // Initialize lightbox functionality
    const cadItems = document.querySelectorAll('.cad-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-content img');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const cadDescription = document.querySelector('.cad-description');
    
    let currentIndex = 0;
    const cadImages = [];
    const cadCaptions = [];
    
    // Store all CAD images and their captions
    cadItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const caption = item.dataset.caption || '';
        cadImages.push(img.src);
        cadCaptions.push(caption);
        
        // Add click event to each CAD item
        item.addEventListener('click', () => {
            currentIndex = index;
            updateLightbox();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
        });
    });
    
    // Update lightbox with current image and caption
    function updateLightbox() {
        lightboxImg.src = cadImages[currentIndex];
        cadDescription.textContent = cadCaptions[currentIndex] || '';
    }
    
    // Close lightbox
    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    });
    
    // Navigate to previous image
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + cadImages.length) % cadImages.length;
        updateLightbox();
    });
    
    // Navigate to next image
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % cadImages.length;
        updateLightbox();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + cadImages.length) % cadImages.length;
            updateLightbox();
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % cadImages.length;
            updateLightbox();
        }
    });
    
    // Close when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
