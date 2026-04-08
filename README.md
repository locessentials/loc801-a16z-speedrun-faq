# Webpage Localization Project: a16z Speedrun FAQ

## Overview
In this project, you will localize a simplified version of the [a16z Speedrun FAQ page](https://speedrun.a16z.com/faq). The project is set up to ensure that no text is missed during translation: every string on the page is tied to a translation key, and the built-in testing panel lets you track your progress, identify missing translations, and download your work at any point.

Try it out: Navigate to [https://locessentials.github.io/loc801-a16z-speedrun-faq/](https://locessentials.github.io/loc801-a16z-speedrun-faq/) on Chrome. (The functionality described does not work on Opera.) Enable and disable the Translation Testing pane by clicking `ctrl+shift+L`. This will toggle the localization completeness panel on and off.

The project also tests your ability to handle common website localization challenges, including text translation, date formatting, currency localization, and maintaining correct HTML attributes.

## Project Structure
```
project/
├── index.html              # Main HTML file with localization hooks
├── styles/
│   └── styles.css          # Styling with localization-specific variables
├── js/
│   ├── main.js             # Core functionality (search, filter, accordion)
│   └── localization.js     # Localization utilities + translation testing panel
├── locales/
│   ├── en.json             # Complete English strings (reference)
│   ├── es.json             # Spanish template (you will complete)
│   └── fr.json             # French template (you may complete)
└── img/
    ├── favicon.ico         # speedrun favicon
    ├── logo.png            # a16z speedrun logo
    └── speedrun.png/       # speedrun 'SR' logo
```

## Important: Understanding the Localization Pattern

### Single HTML File Approach
This project uses a single HTML file for all languages, rather than creating separate HTML files for each language (like faq-es.html or faq-fr.html). **This is intentional** and follows modern internationalization practices.

### HTML and JSON Redundancy - By Design
You'll notice that the HTML file contains English text content that seems to duplicate what's in the `en.json` file. This redundancy is also by design:

1. **The HTML contains:**
   - Default language content - the English here serves as a fallback so the page displays something even if the .json files don't load
   - `data-i18n` attributes serve as lookup keys for translations
   - `data-i18n-attr` attributes that specify which HTML attributes should be localized

2. **The JSON files contain:**
   - Translations for all supported languages, including English
   - These translations are accessed using the `data-i18n` keys

3. **How it works:**
   - When the page loads, it initially displays the English content from the HTML
   - The `localization.js` script loads the appropriate language file based on user selection
   - It replaces the content of elements with matching translations from the JSON file
   - It also updates HTML attributes (like title, alt, placeholder) using the `data-i18n-attr` system

### How the Language Picker Works
The language switcher in the header allows users to change the display language without reloading the page:

```html
<div class="language-switcher">
   <a href="/index.html" target="_blank" data-lang="en" class="lang-btn" data-i18n="language.english">ENGLISH</a>
   <a href="#" target="_blank" data-lang="es" class="lang-btn" data-i18n="language.spanish">ESPAÑOL</a>
</div>
```

Here's how it works:

1. **Selection**: When a user clicks a language button, the JavaScript reads the `data-lang` attribute to identify which language was selected.

2. **Loading the Translation**: The `localization.js` script makes an AJAX request to fetch the corresponding JSON file (e.g., `es.json` for Spanish).

3. **Applying Translations**: Once loaded, the script:
   - Scans the document for elements with `data-i18n` attributes
   - Replaces their content with translations from the JSON file
   - Updates attributes specified by `data-i18n-attr` (like placeholders, alt text, etc.)
   - Updates special elements like dates and currency values to match the locale format

4. **Persistence**: The selected language preference is stored in the browser's localStorage, so when the user returns to the site, their language preference is remembered.

5. **UI Updates**: The active language button is highlighted to show the current selection.

This client-side approach is efficient because it only loads the needed language files and allows for instant language switching without page reloads.

### Handling Metadata
The localization script handles document metadata (like page title and meta description) automatically:

```html
<meta name="description" content="FAQ page for a16z speedrun program" 
      data-i18n-attr="content" data-i18n="page.description">
<title data-i18n="page.title">Speedrun - FAQ</title>
```

When a user switches languages, these metadata elements will be updated with the corresponding translations from the JSON files.

**Your task is to translate the JSON files only, not to create separate HTML files or modify the existing HTML content.**

This pattern provides several benefits:
- Simpler maintenance (only one HTML file to update if structure changes)
- Fallback content if translations fail to load
- Page renders immediately before JavaScript runs
- Better SEO as search engines can index content without JavaScript
- Site works even with JavaScript disabled (progressive enhancement)

## Deploying to Production
This project is designed so that the translation testing panel can be cleanly removed when the localization is complete and the page is ready to go live. All testing panel logic — the keyboard shortcut, the show/hide keys toggle, the highlight missing button, and the download button — lives entirely in `localization.js`. To deploy a clean production version, simply remove the `<script src="js/localization.js"></script>` tag from `index.html` and exclude the file from your deployment.

**Note:** This same separation has not yet been applied to `styles.css`. That file currently contains styling for both the page itself and the translation testing panel. As an extra challenge, consider splitting it into two files — `styles.css` for the page and `localization.css` for the testing panel — so that the testing styles can be excluded from production just as cleanly as the JavaScript.

## Your Tasks

### 1. Complete the locale files
- Using the English JSON file (`en.json`) as a reference, complete the Spanish (`es.json`) and if you wish the French (`fr.json`) locale files.
- Ensure all strings are properly translated and maintain the correct JSON format.
- Pay attention to nested objects in the JSON structure.

Be aware that the `en.json` file contains around 2000 words for translation. To speed up your work, consider following an automatic translation + post-editing workflow.

### 2. As you work, test your localization
- Use the built-in testing panel (**toggle with Ctrl+Shift+L**) to:
  - Check for missing translations
  - Verify that all strings are properly displayed
  - Test the language switching functionality

**Note:** The testing panel works best when previewing the page in Chrome. It does not work in Opera.

### 3. Properly localize special content
- **Dates**: The application deadline date (May 11th, 2025) should be formatted according to each locale.
- **Currency**: The investment amount ($1,000,000) should be formatted according to each locale.
- **Pluralization**: Handle any pluralization issues that may arise in your target languages.

### 4. Update HTML attributes
- Ensure that all localized attributes (like `placeholder`, `title`, `alt`) are correctly updated.
- Check that your translations fit in the design without breaking the layout.


## Localization Testing Framework
The project includes a simple testing framework to help you validate your work:

- **Language Switcher**: Click on the names of the languages in the header to switch between languages.
- **Testing Panel**: Use Ctrl+Shift+L to toggle the testing panel, showing:
  - Percentage of translated strings
  - Number of missing translations
  - Option to show translation keys instead of content (useful for identifying strings requiring translation)
  - Option to highlight/unhighlight missing translations
  - Download the current version of your JSON files

**Note:** You'll need to work in Chrome for the testing panel to work.

When you've translated all strings, selecting "Highlight Missing" will show an alert congratulating you on completing the translation!

## Evaluation Criteria
If you're completing this project as part of a course, your submission will be evaluated based on:

1. **Completeness**: All strings properly translated in both target languages
2. **Accuracy**: Translations that convey the correct meaning and context
3. **Formatting**: Proper handling of dates, currencies, and special characters
4. **Technical implementation**: Correct JSON formatting and structure
5. **Cultural adaptation**: Appropriate adjustments for the target culture

## Tips for Success
- Use the testing panel regularly to check your progress
- Start with the navigation and UI elements before tackling the longer FAQ content
- Pay special attention to context-dependent translations
- Test with different browser widths to ensure your translations fit the design
- Remember that some terms may be kept in English (like "a16z" and "speedrun")
- Focus only on translating the JSON files, not modifying the HTML content

Good luck with your localization project!
