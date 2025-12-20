document.addEventListener('DOMContentLoaded', ()=>{

    // creating the quotes data
    // If quotes exist in localStorage, load them
    // Otherwise, use default quotes
    const quotes = JSON.parse(localStorage.getItem('quotes')) ||[
        {text:  'Code is like humor. When you have to explain it, it’s bad.', category:'programming'},
        {text: 'Simplicity is the soul of efficiency.', category:'programming'},
        {text: "Believe you can and you're halfway there", category: 'motivation'},
        {text: 'Success is not final, failure is not fatal', category: 'motivation'}
    ]

    let selectedCategory = localStorage.getItem('lastCategory') || 'all';

    const quoteDisplay = document.querySelector('#quoteDisplay');
    const categoryFilter = document.querySelector('#categoryFilter');
    const formContainer = document.querySelector('#formContainer');
    const newQuote = document.getElementById('newQuote');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    const syncQuotes = document.getElementById('syncStatus');
    const url = 'https://jsonplaceholder.typicode.com/posts';


    // Create the form for adding new quotes
    createAddQuoteForm();
    // Create the category dropdown
    populateCategories();
    // Display a quote when the page loads
    filterQuotes();
    
    newQuote.addEventListener('click', filterQuotes)
    exportBtn.addEventListener('click', exportQuotes)
    importFile.addEventListener('change', importFromJsonFile)
    categoryFilter.addEventListener('change', filterQuotes);


    // SAVE QUOTES TO LOCAL STORAGE
    function saveQuotes(){
        // Convert quotes array to JSON string and store it
        localStorage.setItem('quotes', JSON.stringify(quotes))
    }


    // Displays a random quote based on the selected category
    // function showRandomQuote(){
    //     let filteredQuotes = quotes;

    //     // If a specific category is selected,
    //     // filter quotes to match that category
    //     if(selectedCategory !== 'All') {
    //         filteredQuotes = quotes.filter(q => q.category === selectedCategory)
    //     }

    //     // If no quotes exist for the selected category,
    //     // show a message and stop the function

    //     if (filteredQuotes.length === 0){
    //         quoteDisplay.textContent = 'No quotes available for this category.';
    //         return;
    //     }

    //     // Generate a random index
    //     const randomIndex = Math.floor(Math.random() * filteredQuotes.length);

    //     // Get a random quote from the filtered list
    //     const quote = filteredQuotes[randomIndex];

    //     // Save last shown quote in sessionStorage (temporary)
    //     sessionStorage.setItem("lastQuote", JSON.stringify(quote));

    //     // Display the quote in the DOM

    //     quoteDisplay.innerHTML =`
    //     <p>"${quote.text}"</p>
    //     <small>${quote.category}</small>
    //     `;
    // }


    function filterQuotes() {

        selectedCategory = categoryFilter.value;

        // Persist selected category
        localStorage.setItem('lastCategory', selectedCategory);

        // Filter quotes based on category
        const filteredQuotes = selectedCategory === 'all'
            ? quotes
            : quotes.filter(q => q.category === selectedCategory);

        // Handle empty category
        if (filteredQuotes.length === 0) {
            quoteDisplay.textContent = 'No quotes available for this category.';
            return;
        }

        // Display random filtered quote
        const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

        //Save last shown quote in sessionStorage (temporary)
        sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));

        quoteDisplay.innerHTML = `
            <p>"${randomQuote.text}"</p>
            <small>${randomQuote.category}</small>
        `;
    }



    function populateCategories(){

        // Clear previous dropdown (important when categories update)
        categoryFilter.innerHTML =  `
            <option value="all">All Categories</option>
        `;


        // Get unique categories from quotes
        // Set removes duplicates
        const categories = [...new Set(quotes.map(q => q.category))];

        // Create an option for each category
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        // Restore last selected category
        categoryFilter.value = selectedCategory;

        
    }


    // Creates the "Add Quote" form dynamically
    function createAddQuoteForm() {

        const quoteInput = document.createElement('input');
        quoteInput.placeholder = "Enter a new quote";


        const categoryInput = document.createElement('input');
        categoryInput.placeholder = 'Enter a new category'
        

        // Button to add the new quote
        const addBtn = document.createElement('button');
        addBtn.textContent = 'AddQuotes'

        
        // When button is clicked, add the quote
        addBtn.addEventListener('click', ()=>{
            if (!quoteInput.value || !categoryInput.value){
                alert('Fill Everthing')
                return;
            }

            quotes.push({
                text: quoteInput.value.trim(),
                category: categoryInput.value.trim().toLowerCase()
            });


            // Update category dropdown and show a quote and save quote
            saveQuotes()
            populateCategories();
            filterQuotes()
            postQuoteToServer(quotes);

            // Clear input fields after adding
            quoteInput.value = '';
            categoryInput.value = '';
        });


        // Append form elements to the page
        formContainer.append(quoteInput, categoryInput, addBtn)
    }


    // POST QUOTE TO SERVER

    function postQuoteToServer(quote){
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quote)
        })
        .then(res => res.json())
        .then(() => notifyUser('Quote synced to server'))
        .catch(() => notifyUser('Server sync failed'));
    }


    // EXPORT QUOTES AS JSON FILE
    function exportQuotes(){
        // Create a JSON file from the quotes array
        const blob = new Blob([JSON.stringify(quotes, null, 2)], {type: 'application/json'});

        // Create a temporary download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json'
        a.click();

        // Clean up memory
        URL.revokeObjectURL(url);

    }


    // IMPORT QUOTES FROM JSON FILE
    function importFromJsonFile(events){
        const reader = new FileReader();
        // Read file content
        reader.onload = ()=>{
            const importedQuotes = JSON.parse(reader.result);

            // Add imported quotes to existing ones
            quotes.push(...importedQuotes);

            // Save and refresh UI
            saveQuotes();
            populateCategories();
            filterQuotes();
            alert("Quotes imported!");
        };

        // Read uploaded file as text
        reader.readAsText(events.target.files[0]);
    }

    async function fetchQuotesFromServer() {
        try {
            const serverUrl = await fetch(url);
            const data = serverUrl.JSON();

            // Convert server posts → quotes format
            const serverQuotes = data.map(post => ({
            text: post.title,
            category: server
            }))

            resolveConflicts(serverQuotes);

        }catch(error){
            console.error('server fetch failed', error);
        }

    }

    function resolveConflicts(serverQuotes){

        const localQuotes = JSON.parse(localStorage.getItem('quotes')) || []

        // Simple conflict strategy: server overwrites local

        localStorage.setItem('quotes', JSON.stringify(serverQuotes));
        quotes.length = 0;
        quotes.push(...serverQuotes);

        populateCategories()
        filterQuotes()
        notifyUser("Quotes synced with server!")
    }


    function notifyUser(message) {
        syncQuotes.textContent = message;
        setTimeout(() => {
            syncQuotes.textContent = '';
        }, 4000);
    }

    setInterval(fetchQuotesFromServer, 30000);


})