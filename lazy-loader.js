'''// lazy-loader.js
class LazyLoader {
    static init() {
        const images = document.querySelectorAll('img[data-src]');
        
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('lazy-loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    LazyLoader.init();
});
'''