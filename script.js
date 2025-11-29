// ===========================
// Floating Lines Animation
// ===========================
const canvas = document.getElementById('floating-lines');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let time = 0;
    const heroWrapper = document.querySelector('.hero-wrapper');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = heroWrapper ? heroWrapper.offsetHeight : window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    const lineCount = 7;
    const lineDistance = 30;
    const bendStrength = 70;

    function drawWave(yOffset, waveOffset) {
        ctx.beginPath();
        const segments = 120;

        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * canvas.width;
            const normalizedX = (x / canvas.width - 0.5) * 2;

            const wave1 = Math.sin(normalizedX * 2.5 + time * 0.4 + waveOffset) * bendStrength;
            const wave2 = Math.sin(normalizedX * 4 + time * 0.25 + waveOffset * 0.7) * (bendStrength * 0.25);
            const wave3 = Math.cos(normalizedX * 1.5 + time * 0.5 + waveOffset * 1.2) * (bendStrength * 0.15);

            const y = canvas.height * 0.55 + yOffset + wave1 + wave2 + wave3;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.strokeStyle = 'rgba(60, 180, 172, 0.55)';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < lineCount; i++) {
            const yOffset = (i - lineCount / 2) * lineDistance;
            const waveOffset = i * 0.6;
            drawWave(yOffset, waveOffset);
        }

        time += 0.012;
        requestAnimationFrame(animate);
    }

    animate();
}

// ===========================
// Mobile Menu Toggle
// ===========================
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            if (navLinks.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// ===========================
// AOS Initialization
// ===========================
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
}

// ===========================
// Product Cards Mouse Tracking Effect
// ===========================
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    });

    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');
    });
});

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
