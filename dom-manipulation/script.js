// Simulated server URL (using JSONPlaceholder for mock data)
const serverUrl = "https://jsonplaceholder.typicode.com/posts";

// Load quotes from local storage or use default quotes
const quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { text: "Do what you can, with what you have, where you are.", category: "Wisdom" }
];

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories(); // Update categories when saving new quotes
}

// Function to fetch quotes from the "server" (mock API)
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(serverUrl);
        const serverQuotes = await response.json();
        const serverData = serverQuotes.map(item => ({
            text: item.title, // Just for the sake of example
            category: "General" // Hardcoded category for simplicity
        }));
        
        resolveConflicts(serverData);
    } catch (error) {
        console.error("Error fetching data from server:", error);
    }
}

// Function to resolve conflicts between local and server quotes
function resolveConflicts(serverData) {
    // Check if the server data is different from the local data
    if (JSON.stringify(quotes) !== JSON.stringify(serverData)) {
        // Simple conflict resolution: Server data takes precedence
        quotes.length = 0; // Clear local quotes
        quotes.push(...serverData); // Sync with server data
        saveQuotes();
        alert("Quotes have been updated from the server.");
    }
}

// Periodically check for updates from the server
setInterval(fetchQuotesFromServer, 30000); // Sync every 30 seconds

// Function to display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = "No quotes available.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = `${selectedQuote.text} - (<strong>${selectedQuote.category}</strong>)`;
    sessionStorage.setItem("lastQuote", JSON.stringify(selectedQuote)); // Store last viewed quote in session storage
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value.trim();
    const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();
    
    if (newQuoteText === "" || newQuoteCategory === "") {
        alert("Please enter both a quote and a category.");
        return;
    }
    
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes(); // Save to local storage
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
}

// Function to create and add the form dynamically
function createAddQuoteForm() {
    const formContainer = document.createElement("div");

    const inputText = document.createElement("input");
    inputText.id = "newQuoteText";
    inputText.type = "text";
    inputText.placeholder = "Enter a new quote";
    
    const inputCategory = document.createElement("input");
    inputCategory.id = "newQuoteCategory";
    inputCategory.type = "text";
    inputCategory.placeholder = "Enter quote category";
    
    const addButton = document.createElement("button");
    addButton.textContent = "Add Quote";
    addButton.addEventListener("click", addQuote);
    
    const exportButton = document.createElement("button");
    exportButton.textContent = "Export Quotes";
    exportButton.addEventListener("click", exportToJsonFile);
    
    const importInput = document.createElement("input");
    importInput.type = "file";
    importInput.id = "importFile";
    importInput.accept = ".json";
    importInput.addEventListener("change", importFromJsonFile);
    
    const categoryFilter = document.createElement("select");
    categoryFilter.id = "categoryFilter";
    categoryFilter.addEventListener("change", filterQuotes);
    
    formContainer.appendChild(inputText);
    formContainer.appendChild(inputCategory);
    formContainer.appendChild(addButton);
    formContainer.appendChild(exportButton);
    formContainer.appendChild(importInput);
    formContainer.appendChild(categoryFilter);
    
    document.body.appendChild(formContainer);
    populateCategories();
}

// Function to populate category filter dropdown
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore last selected category filter
    const lastSelectedCategory = localStorage.getItem("selectedCategory");
    if (lastSelectedCategory) {
        categoryFilter.value = lastSelectedCategory;
        filterQuotes();
    }
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem("selectedCategory", selectedCategory);
    
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = "";
    
    const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = "No quotes available for this category.";
        return;
    }
    
    filteredQuotes.forEach(q => {
        const quoteElement = document.createElement("p");
        quoteElement.innerHTML = `${q.text} - (<strong>${q.category}</strong>)`;
        quoteDisplay.appendChild(quoteElement);
    });
}

// Function to export quotes as a JSON file
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                alert("Quotes imported successfully!");
            } else {
                alert("Invalid JSON format. Please provide a valid quotes file.");
            }
        } catch (error) {
            alert("Error parsing JSON file.");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

document.addEventListener("DOMContentLoaded", () => {
    createAddQuoteForm();
    showRandomQuote(); // Show an initial quote when the page loads
});
