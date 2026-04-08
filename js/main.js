/**
 * Main JavaScript functionality for the a16z speedrun FAQ page
 * This file handles:
 * - FAQ accordion functionality
 * - Search functionality
 * - Category filtering
 * - Current year in footer
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Initialize localization (defined in localization.js)
    initLocalization();
    
    // Initialize FAQ functionality
    initFAQ();
    
    // Initialize search functionality
    initSearch();
    
    // Initialize category filtering
    initCategoryFilters();
});

/**
 * Initialize FAQ accordion functionality
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Toggle active class for current item
            item.classList.toggle('active');
            // No need to manually change the icon text, we'll use CSS transform
        });
    });
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('faq-search');
    const faqItems = document.querySelectorAll('.faq-item');
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm.length === 0) {
            // Show all items if search is empty
            faqItems.forEach(item => {
                item.classList.remove('hidden');
            });
            
            // Reset category filters
            document.querySelector('.category-btn[data-category="all"]').click();
            return;
        }
        
        // Filter items based on search term
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
        
        // Show/hide categories based on visible items
        updateCategoryVisibility();
    });
}

/**
 * Initialize category filtering
 */
function initCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const faqCategories = document.querySelectorAll('.faq-category');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            const category = button.getAttribute('data-category');
            
            if (category === 'all') {
                // Show all categories
                faqCategories.forEach(cat => cat.classList.remove('hidden'));
            } else {
                // Hide all categories first
                faqCategories.forEach(cat => cat.classList.add('hidden'));
                
                // Show only the selected category
                document.querySelector(`.faq-category[data-category="${category}"]`).classList.remove('hidden');
            }
            
            // Clear search input
            document.getElementById('faq-search').value = '';
            
            // Reset item visibility
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('hidden');
            });
        });
    });
}

/**
 * Update category visibility based on visible items
 */
function updateCategoryVisibility() {
    const faqCategories = document.querySelectorAll('.faq-category');
    
    faqCategories.forEach(category => {
        const items = category.querySelectorAll('.faq-item');
        const hasVisibleItems = Array.from(items).some(item => !item.classList.contains('hidden'));
        
        if (hasVisibleItems) {
            category.classList.remove('hidden');
        } else {
            category.classList.add('hidden');
        }
    });
}