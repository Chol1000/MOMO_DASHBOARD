# app.py
from flask import Flask, jsonify, request
from database import get_transactions, get_transaction_by_id

# Initialize Flask app
app = Flask(__name__)

# Root route
@app.route('/')
def home():
    return "Welcome to the MTN MoMo Dashboard API!"

# API endpoint to fetch all transactions
@app.route('/transactions', methods=['GET'])
def transactions():
    try:
        # Fetch all transactions from the database
        transactions = get_transactions()
        return jsonify(transactions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint to fetch transactions by category
@app.route('/transactions/<category>', methods=['GET'])
def transactions_by_category(category):
    try:
        # Fetch all transactions from the database
        transactions = get_transactions()
        # Filter transactions by category
        filtered_transactions = [t for t in transactions if t['transaction_type'] == category]
        return jsonify(filtered_transactions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint to fetch a single transaction by ID
@app.route('/transactions/id/<int:transaction_id>', methods=['GET'])
def transaction_by_id(transaction_id):
    try:
        # Fetch the transaction by ID
        transaction = get_transaction_by_id(transaction_id)
        if transaction:
            return jsonify(transaction)
        else:
            return jsonify({"error": "Transaction not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
