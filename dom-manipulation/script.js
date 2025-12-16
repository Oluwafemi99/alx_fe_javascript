document.addEventListener('DOMContentLoaded', ()=>{

    // creating the quotes data
    const quotes = [
        {text:  'Code is like humor. When you have to explain it, it’s bad.', category:'programming'},
        {text: 'Simplicity is the soul of efficiency.', category:'programming'},
        {text: "Believe you can and you're halfway there", category: 'multivation'},
        {text: 'Success is not final, failure is not fatal', category: 'multivation'}
    ]

    let selectedCategory = 'All';

    const quoteDisplay = document.querySelector('#quoteDisplay');
    const categoryContainer = document.querySelector('#categoryContainer');
    const formContainer = document.querySelector('#formContainer');
    const newQuote = document.getElementById('newQuote');


    // Display a quote when the page loads
    showRandomQuote()
    // Create the form for adding new quotes
    createAddQuoteForm()
    // Create the category dropdown
    createCategorySelector()

    
    newQuote.addEventListener('click', showRandomQuote)


    // Displays a random quote based on the selected category
    function showRandomQuote(){
        let filteredQuotes = quotes;

        // If a specific category is selected,
        // filter quotes to match that category
        if(selectedCategory !== 'All') {
            filteredQuotes = quotes.filter(q => q.category === selectedCategory)
        }

        // If no quotes exist for the selected category,
        // show a message and stop the function

        if (quotes.length === ''){
            quoteDisplay.textContent = 'No quotes available for this category.';
            return;
        }

        // Generate a random index
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);

        // Get a random quote from the filtered list
        const quote = filteredQuotes[randomIndex];

        // Display the quote in the DOM

        quoteDisplay.innerHTML =`
        <p>"${quote.text}"</p>
        <small>${quote.category}</small>
        `;
    }

    function createCategorySelector(){

        // Clear previous dropdown (important when categories update)
        categoryContainer.innerHTML = ''

        // Create the select element
        const select = document.createElement('select');

        // Get unique categories from quotes
        // Set removes duplicates
        const categories = ['All', ...new Set(quotes.map(q => q.category))];

        // Create an option for each category
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option)
        });

        // Update selected category when user changes dropdown
        select.addEventListener('change', (e) => {
            selectedCategory = e.target.value;
            showRandomQuote()
        })

        // Add the dropdown to the page
        categoryContainer.appendChild(select);
        
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
            addQuote(quoteInput.value, categoryInput.value);
        })

        // Clear input fields after adding

        quoteInput.value = '';
        categoryInput.value = '';


        // Append form elements to the page
        formContainer.appendChild(quoteInput);
        formContainer.appendChild(categoryInput);
        formContainer.appendChild(addBtn);
    }

    function addQuote(text, category){

        if(text.trim()==='' || category.trim()===''){
            alert('please enter a value');
            return;
        }
        quotes.push({
            text: text.trim(),
            category: category.trim()
        })


        // Update category dropdown and show a quote
        createCategorySelector();
        showRandomQuote()
    }
})