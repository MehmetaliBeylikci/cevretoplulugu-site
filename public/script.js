// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = '#FFFFFF';
        navbar.style.backdropFilter = 'none';
    }
});

// Gallery Modal Logic
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('gallery-modal');
    if (!modal) return; // Don't run if modal is not on the page

    const galleryImage = document.getElementById('gallery-image');
    const closeButton = modal.querySelector('.close-button');
    const prevButton = modal.querySelector('.prev-button');
    const nextButton = modal.querySelector('.next-button');
    const galleryCards = document.querySelectorAll('.event-card, .project-card, .featured-project-card');

    let currentImages = [];
    let currentIndex = 0;

    function showImage(index) {
        if (index >= 0 && index < currentImages.length) {
            galleryImage.src = currentImages[index];
            galleryImage.style.maxHeight = '100vh'; // Stili doğrudan JS ile ayarla
            currentIndex = index;
        }
    }

    function openModal(images, index) {
        currentImages = images;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        showImage(index);
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
        currentImages = [];
        currentIndex = 0;
        galleryImage.src = ''; // Clear image src
    }

    function showNextImage() {
        const nextIndex = (currentIndex + 1) % currentImages.length;
        showImage(nextIndex);
    }

    function showPrevImage() {
        const prevIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        showImage(prevIndex);
    }

    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const imagesAttr = card.getAttribute('data-images');
            if (imagesAttr) {
                try {
                    const images = JSON.parse(imagesAttr);
                    if (images && images.length > 0) {
                        openModal(images, 0);
                    }
                } catch (e) {
                    console.error('Error parsing data-images attribute:', e);
                }
            }
        });
    });

    if(closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    if(nextButton) {
        nextButton.addEventListener('click', showNextImage);
    }
    if(prevButton) {
        prevButton.addEventListener('click', showPrevImage);
    }

    // Close modal by clicking on the background
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('active')) {
            if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'Escape') {
                closeModal();
            }
        }
    });
});
