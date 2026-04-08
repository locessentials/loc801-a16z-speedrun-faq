/**
 * Localization utilities for the a16z speedrun FAQ page
 * 
 * This file handles:
 * - Loading locale files
 * - Applying translations to the DOM
 * - Language switching
 * - Date and currency formatting
 * - Testing and validation functions
 */

// Global variables for translation state
window.translations = {}; // Will hold all translations
window.currentLocale = 'en'; // Default language

/**
 * Initialize localization functionality
 */
function initLocalization() {
    // Load the default language first (English)
    loadLocale('en', (data) => {
        window.translations.en = data;
        applyTranslations();
        
        // Check browser language or localStorage preference
        const savedLocale = localStorage.getItem('preferred-language');
        if (savedLocale && savedLocale !== 'en') {
            switchLanguage(savedLocale);
        }
        
        // Set up language switcher buttons
        initLanguageSwitcher();
        
        // Update UI to show current language
        updateLanguageUI();

        // Initialize testing panel
        initTestingPanel();
    });
}

/**
 * Load a locale file
 * @param {string} locale - Locale code (e.g., 'en', 'es', 'fr')
 * @param {Function} callback - Function to call when loading is complete
 */
function loadLocale(locale, callback) {
    fetch(`locales/${locale}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load locale: ${locale}`);
            }
            return response.json();
        })
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.error(`Error loading locale ${locale}:`, error);
            // If we can't load the requested locale, fallback to English
            if (locale !== 'en') {
                window.currentLocale = 'en';
                updateLanguageUI();
                applyTranslations();
            }
        });
}

/**
 * Apply translations to all elements with data-i18n attributes
 */
function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    let translatedCount = 0;
    let totalCount = elements.length;
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = getTranslation(key);
        
        // Remove any previous missing-translation class
        
        if (translation) {
            // Don't modify elements that are links or contain links in special cases
            if ((el.tagName === 'A') || 
                (key === 'banner.text') || 
                (key === 'eligibility.a2') || 
                (hasNestedLink(el) && !shouldUpdateWithHTML(key))) {
                
                // If it's a standalone link, just update its text content
                if (el.tagName === 'A') {
                    el.textContent = translation;
                } 
                // For other special cases, handle links carefully
                else {
                    updateElementPreservingLinks(el, key, translation);
                }
            } else {
                // For normal elements without links, just update text content
                el.textContent = translation;
            }
            translatedCount++;
        } else {
            // Mark as missing translation
            // el.classList.add('missing-translation');
        }
    });
    
    // Apply translations to attributes (like placeholder, title, etc.)
    const attributeElements = document.querySelectorAll('[data-i18n-attr]');
    attributeElements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const attr = el.getAttribute('data-i18n-attr');
        const translation = getTranslation(key);
        
        if (translation && attr) {
            el.setAttribute(attr, translation);
        }
    });
    
    // Format dates according to locale
    formatDates();
    
    // Format currencies according to locale
    formatCurrencies();
    
    // Update testing panel statistics
    updateTestingStats(translatedCount, totalCount);
}

/**
 * Check if an element contains links
 * @param {HTMLElement} el - Element to check
 * @returns {boolean} True if element contains links
 */
function hasNestedLink(el) {
    return el.querySelector('a') !== null;
}

/**
 * Determine if a specific key should be updated with HTML
 * @param {string} key - Translation key
 * @returns {boolean} True if should update HTML for this key
 */
function shouldUpdateWithHTML(key) {
    // List keys that should NOT have their HTML structure modified
    const preserveHTMLKeys = [
        'faq.contactIntro',
        // Add other keys here if they should preserve HTML structure
    ];
    
    return !preserveHTMLKeys.includes(key);
}

/**
 * Update element content while preserving links
 * @param {HTMLElement} el - Element to update
 * @param {string} key - Translation key
 * @param {string} translation - Translation text
 */
function updateElementPreservingLinks(el, key, translation) {
    if (key === 'banner.text') {
        // Handle banner text with link
        handleBannerText(el, translation);
    } else if (key === 'eligibility.a2') {
        // Handle eligibility answer with link
        handleEligibilityA2(el, translation);
    } else if (key === 'faq.contactIntro') {
        // Just update the text for the intro part, don't touch structure
        el.textContent = translation;
    } else {
        // Generic handling for other elements with links
        // This is a simple implementation - might need to be enhanced
        const links = Array.from(el.querySelectorAll('a'));
        if (links.length === 0) {
            el.textContent = translation;
            return;
        }
        
        // Store original links with their text content
        const originalLinks = links.map(link => {
            return {
                element: link,
                text: link.textContent,
                html: link.outerHTML
            };
        });
        
        // Try to insert links back at the right positions
        let newContent = translation;
        originalLinks.forEach(linkInfo => {
            // Try to find link text in translation
            if (newContent.includes(linkInfo.text)) {
                newContent = newContent.replace(
                    linkInfo.text, 
                    linkInfo.html
                );
            }
        });
        
        // Only update with HTML if we successfully replaced all links
        let allLinksReplaced = true;
        originalLinks.forEach(linkInfo => {
            if (!newContent.includes(linkInfo.html)) {
                allLinksReplaced = false;
            }
        });
        
        if (allLinksReplaced) {
            el.innerHTML = newContent;
        } else {
            // Fallback: just update text and log warning
            console.warn(`Could not preserve links for key: ${key}`);
            el.textContent = translation;
        }
    }
}

/**
 * Handle banner text with link
 * @param {HTMLElement} el - Banner element
 * @param {string} translation - Translation text
 */
function handleBannerText(el, translation) {
    const linkEl = el.querySelector('a');
    if (!linkEl) {
        el.textContent = translation;
        return;
    }
    
    const linkText = linkEl.textContent;
    const linkHtml = linkEl.outerHTML;
    
    // Check if the translation contains the link text
    if (translation.includes(linkText)) {
        // Replace the link text with the link HTML
        el.innerHTML = translation.replace(linkText, linkHtml);
    } else {
        // If the link text isn't in the translation, try to place it at the end
        // This is a fallback and might not be ideal
        console.warn(`Banner translation doesn't contain link text: ${linkText}`);
        el.innerHTML = translation + ' ' + linkHtml;
    }
}

/**
 * Handle eligibility answer with link
 * @param {HTMLElement} el - Eligibility answer element
 * @param {string} translation - Translation text
 */
function handleEligibilityA2(el, translation) {
    // First check if there's already a link
    let linkEl = el.querySelector('a');
    
    if (!linkEl) {
        // If no link exists, create one with the right styling
        linkEl = document.createElement('a');
        linkEl.href = 'https://sr.a16z.com/';
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
        linkEl.className = 'banner-link';
        linkEl.textContent = 'sr.a16z.com';
    }
    
    const linkText = 'sr.a16z.com';
    const linkHtml = linkEl.outerHTML;
    
    // Check if the translation contains the link text
    if (translation.includes(linkText)) {
        // Replace the link text with the link HTML
        el.innerHTML = translation.replace(linkText, linkHtml);
    } else {
        // If the link text isn't in the translation
        console.warn(`Eligibility translation doesn't contain link text: ${linkText}`);
        el.textContent = translation;
    }
}

/**
 * Get a translation for a key
 * Uses dot notation (e.g., 'page.title')
 * @param {string} key - Translation key
 * @param {string} defaultValue - Default value if translation not found
 * @returns {string} Translated text or default value
 */
function getTranslation(key, defaultValue = '') {
    const locale = window.currentLocale;
    const translations = window.translations[locale] || {};
    
    // Split the key by dots to access nested properties
    const parts = key.split('.');
    let result = translations;
    
    // Navigate through the object
    for (const part of parts) {
        if (result && typeof result === 'object' && part in result) {
            result = result[part];
        } else {
            // Key not found, return default
            return defaultValue;
        }
    }
    
    // If we found a string, return it
    if (typeof result === 'string') {
        return result;
    }
    
    // If it's not a string (e.g., an object), return default
    return defaultValue;
}

/**
 * Initialize language switcher buttons
 */
function initLanguageSwitcher() {
    const buttons = document.querySelectorAll('.lang-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
}

/**
 * Switch to a different language
 * @param {string} locale - Locale code to switch to
 */
function switchLanguage(locale) {
    // If we already have this locale loaded
    if (window.translations[locale]) {
        window.currentLocale = locale;
        applyTranslations();
        updateLanguageUI();
        
        // Save preference
        localStorage.setItem('preferred-language', locale);
        return;
    }
    
    // Otherwise, load the locale first
    loadLocale(locale, (data) => {
        window.translations[locale] = data;
        window.currentLocale = locale;
        applyTranslations();
        updateLanguageUI();
        
        // Save preference
        localStorage.setItem('preferred-language', locale);
    });
}

/**
 * Update UI to reflect current language
 */
function updateLanguageUI() {
    const buttons = document.querySelectorAll('.lang-btn');
    
    buttons.forEach(button => {
        const lang = button.getAttribute('data-lang');
        
        if (lang === window.currentLocale) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Handle RTL languages if needed (e.g., Arabic, Hebrew)
    document.documentElement.style.setProperty('--text-direction', 
        ['ar', 'he'].includes(window.currentLocale) ? 'rtl' : 'ltr');
}

/**
 * Format dates according to current locale
 */
function formatDates() {
    const dateElements = document.querySelectorAll('.localize-date');
    
    dateElements.forEach(el => {
        const dateStr = el.getAttribute('data-date');
        
        try {
            const date = new Date(dateStr);
            
            // Format date according to locale
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            el.textContent = date.toLocaleDateString(window.currentLocale, options);
        } catch (error) {
            console.error('Error formatting date:', error);
            el.textContent = dateStr; // Fallback to original string
        }
    });
}

/**
 * Format currencies according to current locale
 */
function formatCurrencies() {
    const currencyElements = document.querySelectorAll('.localize-currency');
    
    currencyElements.forEach(el => {
        const amount = parseFloat(el.getAttribute('data-amount'));
        const currency = el.getAttribute('data-currency');
        
        try {
            // Format currency according to locale
            const formatter = new Intl.NumberFormat(window.currentLocale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            
            el.textContent = formatter.format(amount);
        } catch (error) {
            console.error('Error formatting currency:', error);
            el.textContent = `${currency} ${amount}`; // Fallback
        }
    });
}

/**
 * Update testing panel statistics
 * @param {number} translatedCount - Number of translated elements
 * @param {number} totalCount - Total number of elements to translate
 */
function updateTestingStats(translatedCount, totalCount) {
    const percentElement = document.getElementById('translated-percent');
    const missingElement = document.getElementById('missing-count');
    
    if (percentElement && missingElement) {
        const percent = totalCount > 0 ? Math.round((translatedCount / totalCount) * 100) : 100;
        const missing = totalCount - translatedCount;
        
        percentElement.textContent = `${percent}%`;
        missingElement.textContent = missing;
        
        // Highlight if there are issues
        if (percent < 100) {
            percentElement.style.color = 'orange';
        } else {
            percentElement.style.color = 'lightgreen';
        }
    }
}

/**
 * Initialize testing panel functionality
 * This entire function (and the localization.js file) can be removed
 * once localization is complete and the site is ready to go live.
 */
function initTestingPanel() {
    const testingPanel = document.getElementById('testing-panel');

    // Toggle panel with keyboard shortcut (Ctrl+Shift+L)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            testingPanel.classList.toggle('active');
        }
    });

    // Helper: get all translatable elements excluding the testing panel itself
    function getTranslatableElements() {
        return Array.from(document.querySelectorAll('[data-i18n]')).filter(
            el => !testingPanel.contains(el)
        );
    }

    // Show/hide translation keys button
    document.getElementById('show-keys').addEventListener('click', function() {
        document.body.classList.toggle('showing-keys');
        const elements = getTranslatableElements();

        if (document.body.classList.contains('showing-keys')) {
            // Replace content with translation keys only
            elements.forEach(el => {
                el.setAttribute('data-original-text', el.textContent);
                el.textContent = el.getAttribute('data-i18n');
            });
            this.textContent = getTranslation('testing.hideKeys', 'Hide Translation Keys');
        } else {
            // Restore original content only
            elements.forEach(el => {
                if (el.hasAttribute('data-original-text')) {
                    el.textContent = el.getAttribute('data-original-text');
                    el.removeAttribute('data-original-text');
                }
            });
            this.textContent = getTranslation('testing.showKeys', 'Show Translation Keys');
        }
    });

    // Highlight/Unhighlight missing translations
    let highlightingActive = false;
    const highlightButton = document.getElementById('highlight-missing');

    highlightButton.addEventListener('click', function() {
        if (!highlightingActive) {
            const missingElements = [];

            getTranslatableElements().forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (!getTranslation(key)) {
                    el.classList.add('missing-translation');
                    missingElements.push(el);
                }
            });

            if (missingElements.length > 0) {
                missingElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                this.textContent = getTranslation('testing.unhighlightMissing', 'Unhighlight Missing');
                highlightingActive = true;
            } else {
                alert('Congratulations! There are no missing translations.');
            }
        } else {
            document.querySelectorAll('.missing-translation').forEach(el => {
                el.classList.remove('missing-translation');
            });
            this.textContent = getTranslation('testing.highlightMissing', 'Highlight Missing');
            highlightingActive = false;
        }
    });

    // Download current locale as JSON
    document.getElementById('download-locale').addEventListener('click', function() {
        const currentLocale = window.currentLocale || 'en';
        const translations = window.translations[currentLocale] || {};
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(translations, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${currentLocale}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
}