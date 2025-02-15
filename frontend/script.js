// DOM Elements
const loadingElement = document.getElementById('loading');
const errorMessageElement = document.getElementById('error-message');
const searchInput = document.getElementById('search');
const typeFilter = document.getElementById('type-filter');
const dateFilter = document.getElementById('date-filter');
const applyFiltersButton = document.getElementById('apply-filters');
const tableBody = document.getElementById('table-body');

// Global Variables
let transactions = []; // Store all transactions for filtering
let barChart, pieChart, lineChart; // Chart instances

// Fetch Transactions from the backend
async function fetchTransactions() {
    try {
        loadingElement.style.display = 'block'; // Show loading state
        errorMessageElement.style.display = 'none'; // Hide error message

        const response = await fetch("http://localhost:5000/api/transactions");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        transactions = await response.json();
        renderTable(transactions);
        renderCharts(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        errorMessageElement.style.display = 'block'; // Show error message
    } finally {
        loadingElement.style.display = 'none'; // Hide loading state
    }
}

// Render Table with transaction data
function renderTable(data) {
    tableBody.innerHTML = data.map(transaction => `
        <tr>
            <td>${transaction.id}</td>
            <td>${transaction.type}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.sender}</td>
            <td>${transaction.receiver}</td>
            <td>${transaction.date}</td>
        </tr>
    `).join('');
}

// Render Charts using Chart.js
function renderCharts(data) {
    const labels = data.map(t => t.date);
    const amounts = data.map(t => t.amount);
    const types = [...new Set(data.map(t => t.type))]; // Unique transaction types

    // Destroy existing charts if they exist
    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();
    if (lineChart) lineChart.destroy();

    // Bar Chart (Transaction Volume by Type)
    const ctxBar = document.getElementById('bar-chart').getContext('2d');
    barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: types,
            datasets: [{
                label: 'Transaction Amount (RWF)',
                data: types.map(type => data.filter(t => t.type === type).reduce((sum, t) => sum + t.amount, 0)),
                backgroundColor: 'rgba(10, 31, 68, 0.6)', // Dark blue
                borderColor: 'rgba(10, 31, 68, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Pie Chart (Transaction Distribution)
    const ctxPie = document.getElementById('pie-chart').getContext('2d');
    pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: types,
            datasets: [{
                label: 'Transaction Types',
                data: types.map(type => data.filter(t => t.type === type).length),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        }
    });

    // Line Chart (Monthly Transaction Summary)
    const ctxLine = document.getElementById('line-chart').getContext('2d');
    lineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Transaction Amount (RWF)',
                data: amounts,
                backgroundColor: 'rgba(10, 31, 68, 0.2)', // Dark blue
                borderColor: 'rgba(10, 31, 68, 1)',
                borderWidth: 1,
                fill: true
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Filter Transactions
function filterTransactions() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedDate = dateFilter.value;

    const filteredData = transactions.filter(transaction => {
        const matchesSearch = transaction.sender.toLowerCase().includes(searchTerm) ||
                             transaction.receiver.toLowerCase().includes(searchTerm) ||
                             transaction.type.toLowerCase().includes(searchTerm);
        const matchesType = selectedType === 'all' || transaction.type === selectedType;
        const matchesDate = !selectedDate || transaction.date.startsWith(selectedDate);

        return matchesSearch && matchesType && matchesDate;
    });

    renderTable(filteredData);
    renderCharts(filteredData);
}

// Event Listeners
searchInput.addEventListener('input', filterTransactions);
typeFilter.addEventListener('change', filterTransactions);
dateFilter.addEventListener('change', filterTransactions);
applyFiltersButton.addEventListener('click', filterTransactions);

// Fetch and display data on page load
fetchTransactions();
