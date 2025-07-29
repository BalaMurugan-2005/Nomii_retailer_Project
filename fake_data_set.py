import os
import pandas as pd
import random
from faker import Faker
from datetime import datetime, timedelta

# Initialize Faker
fake = Faker()
Faker.seed(0)
random.seed(0)

# File paths
PRODUCTS_FILE = 'data/Products.xlsx'
ORDERS_FILE = 'data/retailer_orders.xlsx'
AI_SUGGESTIONS_FILE = 'data/Ai_suggestion_products.xlsx'
DELIVERY_STATUS_FILE = 'data/deliverystatus.xlsx'
MONEY_SPENT_FILE = 'data/MoneySpent.xlsx'
REWARDS_FILE = 'data/retailer_rewards.xlsx'
USERS_FILE = 'data/retailer_users.xlsx'

required_files = {
    PRODUCTS_FILE: ['ProductID', 'Name', 'Category', 'Price', 'Supplier', 'Stock'],
    ORDERS_FILE: ['OrderID', 'RetailerID', 'ProductID', 'ProductName', 'Quantity', 'Price', 'Total', 'OrderDate', 'Status'],
    AI_SUGGESTIONS_FILE: ['ProductID', 'Name', 'Category', 'Reason'],
    DELIVERY_STATUS_FILE: ['OrderID', 'Status', 'LastUpdate', 'DeliveryAgent'],
    MONEY_SPENT_FILE: ['TransactionID', 'RetailerID', 'Amount', 'Date', 'Description'],
    REWARDS_FILE: ['RetailerID', 'Points', 'Badges', 'Level'],
    USERS_FILE: ['RetailerID', 'ShopName', 'OwnerName', 'Location', 'Phone', 'Email', 'Password']
}

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

data_frames = {}

# === USERS ===
users = []
retailer_ids = []
for i in range(1, 51):
    retailer_id = f"R{i:03}"
    retailer_ids.append(retailer_id)
    users.append([
        retailer_id,
        fake.company(),
        fake.name(),
        fake.city(),
        fake.phone_number(),
        fake.email(),
        fake.password()
    ])
data_frames[USERS_FILE] = pd.DataFrame(users, columns=required_files[USERS_FILE])

# === PRODUCTS ===
products = []
product_ids = []
for i in range(1, 51):
    product_id = f"P{i:03}"
    product_ids.append(product_id)
    products.append([
        product_id,
        fake.word().capitalize(),
        random.choice(['Grocery', 'Beverage', 'Personal Care', 'Household']),
        round(random.uniform(10, 500), 2),
        fake.company(),
        random.randint(10, 100)
    ])
data_frames[PRODUCTS_FILE] = pd.DataFrame(products, columns=required_files[PRODUCTS_FILE])

# === ORDERS ===
orders = []
order_ids = []
for i in range(1, 51):
    order_id = f"O{i:03}"
    order_ids.append(order_id)
    retailer_id = random.choice(retailer_ids)
    product = random.choice(products)
    quantity = random.randint(1, 10)
    price = product[3]
    total = round(quantity * price, 2)
    orders.append([
        order_id,
        retailer_id,
        product[0],
        product[1],
        quantity,
        price,
        total,
        fake.date_between(start_date='-30d', end_date='today').strftime('%Y-%m-%d'),
        random.choice(['Pending', 'Delivered', 'In Transit'])
    ])
data_frames[ORDERS_FILE] = pd.DataFrame(orders, columns=required_files[ORDERS_FILE])

# === AI Suggestions ===
ai_suggestions = []
for product in products:
    ai_suggestions.append([
        product[0],
        product[1],
        product[2],
        random.choice(['High demand', 'Seasonal trend', 'Low stock in area'])
    ])
data_frames[AI_SUGGESTIONS_FILE] = pd.DataFrame(ai_suggestions, columns=required_files[AI_SUGGESTIONS_FILE])

# === Delivery Status ===
delivery_status = []
for order in orders:
    delivery_status.append([
        order[0],               # OrderID from orders
        order[8],               # Status
        fake.date_between(start_date='-30d', end_date='today').strftime('%Y-%m-%d'),
        fake.name()
    ])
data_frames[DELIVERY_STATUS_FILE] = pd.DataFrame(delivery_status, columns=required_files[DELIVERY_STATUS_FILE])

# === Money Spent ===
money_spent = []
for i in range(1, 51):
    retailer_id = random.choice(retailer_ids)
    amount = round(random.uniform(100, 1000), 2)
    money_spent.append([
        f"T{i:03}",
        retailer_id,
        amount,
        fake.date_between(start_date='-30d', end_date='today').strftime('%Y-%m-%d'),
        random.choice(['Order Payment', 'Subscription', 'Service Fee'])
    ])
data_frames[MONEY_SPENT_FILE] = pd.DataFrame(money_spent, columns=required_files[MONEY_SPENT_FILE])

# === Rewards ===
rewards = []
for retailer_id in retailer_ids:
    rewards.append([
        retailer_id,
        random.randint(100, 1000),
        random.choice(['Bronze', 'Silver', 'Gold']),
        random.choice(['Level 1', 'Level 2', 'Level 3'])
    ])
data_frames[REWARDS_FILE] = pd.DataFrame(rewards, columns=required_files[REWARDS_FILE])

# === Save to Excel ===
for path, df in data_frames.items():
    df.to_excel(path, index=False)

# Check result
print(pd.read_excel(PRODUCTS_FILE).head())
