// Importing a function from another module
import { loadAndDisplayBooks, loadRandomBooks } from './libraryContainer.js';

// Function for implementing debounce
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Function to perform the search
function performSearch() {
    const searchInput = document.querySelector('.searchInput');
    const query = searchInput.value.trim();
    
    if (query) {
        loadAndDisplayBooks(query);
    } else {
        loadRandomBooks();
    }
}

// Debounced version of the search function
const debouncedSearch = debounce(performSearch, 500);

// Initialization functions
function initializeSearch() {
    const searchInput = document.querySelector('.searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', debouncedSearch);
    }
}

// Export the function so other files can call it
export { initializeSearch };