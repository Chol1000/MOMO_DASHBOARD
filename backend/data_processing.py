import xml.etree.ElementTree as ET
import re
import logging

# Set up logging
logging.basicConfig(filename='logs/unprocessed_messages.log', level=logging.INFO)

def parse_xml(file_path):
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        print(f"Root element: {root.tag}")  # Debug: Print the root element
        print(f"Number of <sms> elements: {len(root.findall('sms'))}")  # Debug: Count <sms> elements
        transactions = []
        skipped_messages = 0

        for sms in root.findall('sms'):
            print(ET.tostring(sms, encoding='unicode'))  # Debug: Print each <sms> element
            
            # Access the 'body' attribute of the <sms> tag
            body = sms.attrib.get('body')
            if body is None:
                skipped_messages += 1
                logging.warning(f"Skipping SMS: No 'body' attribute found. Full SMS: {ET.tostring(sms, encoding='unicode')}")
                continue

            print(f"Processing SMS body: {body}")  # Debug: Print the body content
            try:
                category, amount, fee, date = categorize_sms(body)
                transactions.append({
                    'category': category,
                    'amount': amount,
                    'fee': fee,
                    'date': date,
                    'body': body
                })
            except Exception as e:
                skipped_messages += 1
                logging.warning(f"Unprocessed message: {body}. Error: {e}")

        logging.info(f"Processed {len(transactions)} transactions. Skipped {skipped_messages} messages.")
        return transactions

    except ET.ParseError as e:
        logging.error(f"Error parsing XML file: {e}")
        return []
    except FileNotFoundError as e:
        logging.error(f"File not found: {e}")
        return []
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        return []

def categorize_sms(body):
    print(f"Categorizing SMS: {body}")  # Debug: Print the body being categorized

    # Determine the category (case-insensitive)
    body_lower = body.lower()
    if "received" in body_lower:
        category = "Incoming Money"
    elif "payment" in body_lower or "transferred" in body_lower or "paid" in body_lower:
        category = "Payments to Code Holders"
    elif "withdrawn" in body_lower or "withdrawal" in body_lower:
        category = "Withdrawals from Agents"
    elif "purchased" in body_lower or "data bundle" in body_lower or "airtime" in body_lower:
        category = "Internet and Voice Bundle Purchases"
    elif "deposit" in body_lower:
        category = "Incoming Money"
    elif "bill" in body_lower or "utility" in body_lower:
        category = "Bill Payments"
    else:
        category = "Other"
        logging.info(f"SMS categorized as 'Other': {body}")  # Log unprocessed messages
    
    # Extract amount (handles amounts with or without commas)
    amount_match = re.search(r'(\d{1,3}(?:,\d{3})*|\d+) RWF', body)
    if amount_match is None:
        raise ValueError(f"Amount not found in body: {body}")
    amount = amount_match.group(1).replace(",", "")  # Remove commas for conversion to int
    print(f"Amount matched: {amount_match.group(1)}")  # Debug: Print the matched amount
    
    # Extract fee (if mentioned)
    fee_match = re.search(r'(fee|charges)[: ]*(\d{1,3}(?:,\d{3})*|\d+) RWF', body_lower)
    fee = int(fee_match.group(2).replace(",", "")) if fee_match else 0
    print(f"Fee matched: {fee}")  # Debug: Print the matched fee
    
    # Extract date
    date_match = re.search(r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}', body)
    if date_match is None:
        raise ValueError(f"Date not found in body: {body}")
    date = date_match.group()
    
    print(f"Category: {category}, Amount: {amount}, Fee: {fee}, Date: {date}")  # Debug: Print extracted values
    return category, int(amount), fee, date

if __name__ == "__main__":
    transactions = parse_xml("sms_data.xml")
    print(f"Processed {len(transactions)} transactions.")
