// Import all initialization functions
import { initializeTheme } from './theme.js';
import { initializeLibrary } from './libraryContainer.js';
import { initializeSearch } from './search.js';

// Importing the main CSS file
import '../css/style.css';

// Run all modules when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeLibrary();
    initializeSearch();
});