// ===========================
// Smooth Scroll for Anchor Links
// ===========================
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

// ===========================
// Intersection Observer for Animation on Scroll
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe capability cards
document.querySelectorAll('.capability-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// ===========================
// Video Performance Optimization
// ===========================
const video = document.querySelector('.video-text video');

if (video) {
    // Pause video when not in viewport to save resources
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play().catch(err => console.log('Video play failed:', err));
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.25 });

    videoObserver.observe(video);

    // Ensure video plays on load
    window.addEventListener('load', () => {
        video.play().catch(err => console.log('Video autoplay failed:', err));
    });
}

// ===========================
// Dynamic Year in Footer
// ===========================
const updateFooterYear = () => {
    const yearElement = document.querySelector('.footer-info p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = `© ${currentYear} Applexium. All Rights Reserved.`;
    }
};

updateFooterYear();

// ===========================
// Parallax Effect for Hero Section
// ===========================
let ticking = false;

const updateParallax = () => {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');
    
    if (heroSection && scrolled < window.innerHeight) {
        heroSection.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
    
    ticking = false;
};

const requestParallaxUpdate = () => {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
};

window.addEventListener('scroll', requestParallaxUpdate);

// ===========================
// CTA Button Ripple Effect
// ===========================
const ctaButton = document.querySelector('.cta-button');

if (ctaButton) {
    ctaButton.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
}

// ===========================
// Capability Cards Stagger Animation
// ===========================
const cards = document.querySelectorAll('.capability-card');

cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

// ===========================
// Mobile Menu Toggle (if needed in future)
// ===========================
const handleResize = () => {
    const width = window.innerWidth;
    
    // Adjust video text size on very small screens
    if (width < 400) {
        const videoText = document.querySelector('.video-text h1');
        if (videoText) {
            videoText.style.fontSize = '60px';
        }
    }
};

window.addEventListener('resize', handleResize);
handleResize();

// ===========================
// Console Message
// ===========================
console.log('%c🚀 Applexium - Built with Excellence', 'color: #7de2d1; font-size: 16px; font-weight: bold;');

