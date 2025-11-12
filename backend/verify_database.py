"""
Database verification script
Checks the contents of the seeded database
"""
import sqlite3
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

def verify_database():
    """Verify the contents of the seeded database"""
    
    db_path = "intellica_seeded.db"
    
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("=" * 60)
    print("DATABASE VERIFICATION REPORT")
    print("=" * 60)
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print(f"\nTables found: {len(tables)}")
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"  {table_name}: {count} records")
    
    print("\n" + "=" * 60)
    print("SAMPLE DATA")
    print("=" * 60)
    
    # Sample users
    print("\nUSERS (Sample):")
    cursor.execute("SELECT id, email, full_name, role FROM users LIMIT 5")
    users = cursor.fetchall()
    for user in users:
        print(f"  ID: {user[0]}, Email: {user[1]}, Name: {user[2]}, Role: {user[3]}")
    
    # Sample products
    print("\nPRODUCTS (Sample):")
    cursor.execute("SELECT id, name, price, category FROM products LIMIT 5")
    products = cursor.fetchall()
    for product in products:
        print(f"  ID: {product[0][:8]}..., Name: {product[1]}, Price: ${product[2]}, Category: {product[3]}")
    
    # Sample orders
    print("\nORDERS (Sample):")
    cursor.execute("SELECT id, customer_id, status, total FROM orders LIMIT 5")
    orders = cursor.fetchall()
    for order in orders:
        print(f"  ID: {order[0][:8]}..., Customer: {order[1]}, Status: {order[2]}, Total: ${order[3]}")
    
    # Sample tickets
    print("\nTICKETS (Sample):")
    cursor.execute("SELECT id, customer_id, agent_id, subject, status FROM tickets LIMIT 5")
    tickets = cursor.fetchall()
    for ticket in tickets:
        print(f"  ID: {ticket[0][:8]}..., Customer: {ticket[1]}, Agent: {ticket[2]}, Subject: {ticket[3][:30]}..., Status: {ticket[4]}")
    
    print("\n" + "=" * 60)
    print("VERIFICATION COMPLETE")
    print("=" * 60)
    
    conn.close()

if __name__ == "__main__":
    verify_database()