// Global variables
let favoriteBooks = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
let isLoading = false;
let currentOffset = 0;
let currentQuery = '';

// Function for creating a book card
function createBookCard(book) {
    const title = book.title || 'No title';
    const authors = book.author_name ? book.author_name.join(', ') : 'Unknown author';
    const year = book.first_publish_year || 'Unknown year';
    const coverId = book.cover_i;
    const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'https://via.placeholder.com/200x300?text=No+Cover';
    const bookKey = book.key;

    const isFavorite = favoriteBooks.some(favBook => favBook.key === bookKey);

    return `
            <div class="bookCard" data-book-key="${bookKey}">
                <div class="bookCoverContainer">
                    <img src="${coverUrl}" alt="${title}" class="bookCover">
                    <div class="favoriteButton ${isFavorite ? 'active' : ''}" data-book-key="${bookKey}">
                        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" x="0" y="0" rx="3" ry="3" />
                            <path d="M12.6667 9.33333C13.66 8.36 14.6667 7.19333 14.6667 5.66667C14.6667 4.69421 14.2804 3.76158 13.5928 3.07394C12.9051 2.38631 11.9725 2 11 2C9.82671 2 9.00004 2.33333 8.00004 3.33333C7.00004 2.33333 6.17337 2 5.00004 2C4.02758 2 3.09495 2.38631 2.40732 3.07394C1.71968 3.76158 1.33337 4.69421 1.33337 5.66667C1.33337 7.2 2.33337 8.36667 3.33337 9.33333L8.00004 14L12.6667 9.33333Z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class = "bookInfo">
                    <p class = "bookTitle">${title}</p>
                    <p class = "bookAuthor">${authors}</p>
                    <p class = "bookYear">${year}</p>
                </div>
            </div>`;
}

// Loading books into a libraryContainer
function loadBooks (books, append = false) {
    const gridContainer = document.getElementById('libraryContainer');
    if (!gridContainer) return;

    if (!append) {
        gridContainer.innerHTML = "";
    }

    if (books.length === 0 && !append) {
        gridContainer.innerHTML = '<p>No books matching your request were found.</p>';
        return;
    }

    const booksHTML = books.map(book => createBookCard(book)).join('');
    
    if (append) {
        gridContainer.innerHTML += booksHTML;
    } else {
        gridContainer.innerHTML = booksHTML;
    }
    
    addFavoriteButtonListeners();
}

// Asynchronous loading and display of books
async function loadAndDisplayBooks (query, append = false) {
    if (isLoading) return;
    isLoading = true;
    
    if (!append) {
        currentOffset = 0;
        currentQuery = query;
    }
    
    const gridContainer = document.getElementById ('libraryContainer');
    
    if (!append) {
        gridContainer.innerHTML = "<p>Loading...</p>";
    }
    
    try{
        const limit = 10;
        const offset = append ? currentOffset : 0;
        const searchQuery = query || 'subject:fiction';
        
        const response = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}&limit=${limit}&offset=${offset}`);

        if (!response.ok){
            throw new Error (`Error loading books: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.docs.length > 0) {
            currentOffset += limit;
            loadBooks(data.docs, append);
        } else if (!append) {
            gridContainer.innerHTML = '<p>No books matching your request were found.</p>';
        }
    } catch (error) {
        console.error(`Error searching for books for the request "${query}":`, error);
        if (!append) {
            gridContainer.innerHTML = `<p>Search failed. Error: ${error.message}</p>`;
        }
    } finally {
        isLoading = false;
    }
}

// Download random books
async function loadRandomBooks () {
    await loadAndDisplayBooks('');
}

// Add event handlers for the favorites buttons
function addFavoriteButtonListeners() {
    const favoriteButtons = document.querySelectorAll('.favoriteButton');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookKey = this.getAttribute('data-book-key');
            const bookCard = document.querySelector(`.bookCard[data-book-key="${bookKey}"]`);
            const bookTitle = bookCard.querySelector('.bookTitle').textContent;
            const bookAuthor = bookCard.querySelector('.bookAuthor').textContent;
            const bookYear = bookCard.querySelector('.bookYear').textContent;
            const bookCover = bookCard.querySelector('.bookCover').src;
            
            const bookIndex = favoriteBooks.findIndex(book => book.key === bookKey);
            
            if (bookIndex === -1) {
                favoriteBooks.push({
                    key: bookKey,
                    title: bookTitle,
                    author: bookAuthor,
                    year: bookYear,
                    cover: bookCover
                });
                this.classList.add('active');
            } else {
                favoriteBooks.splice(bookIndex, 1);
                this.classList.remove('active');
            }
            
            localStorage.setItem('favoriteBooks', JSON.stringify(favoriteBooks));
            
            updateFavoriteBooksDisplay();
        });
    });
}

// Update the display of favorite books
function updateFavoriteBooksDisplay() {
    const favoriteContainerBooks = document.querySelector('.favoriteContainerBooks');
    const favoriteCount = document.getElementById('favoriteCount');
    
    favoriteCount.textContent = favoriteBooks.length;

    favoriteContainerBooks.innerHTML = '';
    
    if (favoriteBooks.length === 0) {
        favoriteContainerBooks.innerHTML = '<p style="text-align: center; margin-top: 20px;">No favorite books yet.</p>';
        return;
    }
    
    favoriteBooks.forEach(book => {
        const favoriteBookElement = document.createElement('div');
        favoriteBookElement.className = 'favoriteBook';
        favoriteBookElement.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="favoriteBookCover">
            <div class="favoriteBookInfo">
                <div class="favoriteBookTitle">${book.title}</div>
                <div class="favoriteBookAuthor">${book.author}</div>
                <div class="favoriteBookYear">${book.year}</div>
            </div>
            <div class="favoriteBookButton" data-book-key="${book.key}">
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" x="0" y="0" rx="3" ry="3" />
                    <path d="M12.6667 9.33333C13.66 8.36 14.6667 7.19333 14.6667 5.66667C14.6667 4.69421 14.2804 3.76158 13.5928 3.07394C12.9051 2.38631 11.9725 2 11 2C9.82671 2 9.00004 2.33333 8.00004 3.33333C7.00004 2.33333 6.17337 2 5.00004 2C4.02758 2 3.09495 2.38631 2.40732 3.07394C1.71968 3.76158 1.33337 4.69421 1.33337 5.66667C1.33337 7.2 2.33337 8.36667 3.33337 9.33333L8.00004 14L12.6667 9.33333Z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        `;
        
        favoriteContainerBooks.appendChild(favoriteBookElement);
    });
    
// Event handlers for the remove from favorites buttons
    const favoriteBookButtons = document.querySelectorAll('.favoriteBookButton');
    
    favoriteBookButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookKey = this.getAttribute('data-book-key');
            favoriteBooks = favoriteBooks.filter(book => book.key !== bookKey);
            localStorage.setItem('favoriteBooks', JSON.stringify(favoriteBooks));

            updateFavoriteBooksDisplay();
            
            const favoriteButton = document.querySelector(`.favoriteButton[data-book-key="${bookKey}"]`);
            if (favoriteButton) {
                favoriteButton.classList.remove('active');
            }
        });
    });
}

// Handling infinite scrolling
function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        if (!isLoading) {
            loadAndDisplayBooks(currentQuery, true);
        }
    }
}

// Initialization functions
function initializeLibrary() {
    loadRandomBooks();
    updateFavoriteBooksDisplay();
    window.addEventListener('scroll', handleScroll);
}

// Export the function so other files can call it
export { initializeLibrary, loadAndDisplayBooks, loadRandomBooks };