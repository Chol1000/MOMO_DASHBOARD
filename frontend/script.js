import { renderCharts } from './chart.js';

// DOM Elements
const loadingElement = document.getElementById('loading');
const errorMessageElement = document.getElementById('error-message');
const successMessageElement = document.getElementById('success-message');
const noDataElement = document.getElementById('no-data');
const searchInput = document.getElementById('search');
const typeFilter = document.getElementById('type-filter');
const startDateFilter = document.getElementById('start-date');
const endDateFilter = document.getElementById('end-date');
const applyFiltersButton = document.getElementById('apply-filters');
const resetFiltersButton = document.getElementById('reset-filters');
const tableBody = document.getElementById('table-body');

let transactions = [];

// Fetch transactions from backend
async function fetchTransactions() {
    loadingElement.style.display = 'block';
    errorMessageElement.style.display = 'none';
    successMessageElement.style.display = 'none';
    noDataElement.style.display = 'none';

    try {
        const response = await fetch('/frontend/transactions.json'); // Ensure correct path
        if (!response.ok) throw new Error('Failed to load transactions');
        
        transactions = await response.json();
        renderData(transactions);
        showSuccess("Data loaded successfully!");
    } catch (error) {
        console.error("Error loading transactions:", error);
        errorMessageElement.textContent = "Error loading transactions. Please try again later.";
        errorMessageElement.style.display = 'block';
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Render Table and Charts
function renderData(data) {
    renderTable(data);
    renderCharts(data);
}

// Render Table with Transaction Data
function renderTable(data) {
    tableBody.innerHTML = '';
    if (data.length === 0) {
        noDataElement.style.display = 'block';
    } else {
        noDataElement.style.display = 'none';
        tableBody.innerHTML = data.map(transaction => `
            <tr>
                <td>${transaction.id}</td>
                <td>${transaction.category}</td>
                <td>${transaction.amount.toLocaleString()} RWF</td>
                <td>${transaction.fee.toLocaleString()} RWF</td>
                <td>${new Date(transaction.date).toLocaleString()}</td>
            </tr>
        `).join('');
    }
}

// Filter Transactions
function filterTransactions() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const startDate = startDateFilter.value ? new Date(startDateFilter.value) : null;
    const endDate = endDateFilter.value ? new Date(endDateFilter.value) : null;

    let filteredData = transactions.filter(transaction => {
        const matchesSearch = searchTerm ? 
            transaction.category?.toLowerCase().includes(searchTerm) 
            : true;
        
        const matchesType = selectedType !== 'all' ? transaction.category === selectedType : true;
        
        const transactionDate = new Date(transaction.date);
        const matchesDate = startDate && endDate ? transactionDate >= startDate && transactionDate <= endDate : true;

        return matchesSearch && matchesType && matchesDate;
    });

    renderData(filteredData);
    showSuccess("Filters applied successfully!");
}

// Reset Filters
function resetFilters() {
    searchInput.value = '';
    typeFilter.value = 'all';
    startDateFilter.value = '';
    endDateFilter.value = '';
    renderData(transactions);
    showSuccess("Filters reset successfully!");
}

// Show Success Message
function showSuccess(message) {
    successMessageElement.textContent = message;
    successMessageElement.style.display = 'block';
    errorMessageElement.style.display = 'none';
    setTimeout(() => successMessageElement.style.display = 'none', 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    searchInput.addEventListener('input', filterTransactions);
    typeFilter.addEventListener('change', filterTransactions);
    startDateFilter.addEventListener('change', filterTransactions);
    endDateFilter.addEventListener('change', filterTransactions);
    applyFiltersButton.addEventListener('click', filterTransactions);
    resetFiltersButton.addEventListener('click', resetFilters);
    
    fetchTransactions();
});

