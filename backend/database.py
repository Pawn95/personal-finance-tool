import sqlite3
from datetime import datetime

DB_PATH = 'finance.db'

def init_db():
    """初始化数据库，创建账单和储蓄目标表"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 账单表
    c.execute('''CREATE TABLE IF NOT EXISTS bills
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  date TEXT NOT NULL,
                  amount REAL NOT NULL,
                  category TEXT NOT NULL,
                  merchant TEXT)''')
    
    # 储蓄目标表
    c.execute('''CREATE TABLE IF NOT EXISTS savings
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  goal_name TEXT NOT NULL,
                  target_amount REAL NOT NULL,
                  current_amount REAL DEFAULT 0,
                  deadline TEXT NOT NULL)''')
    
    conn.commit()
    conn.close()

# 账单操作
def add_bill(date, amount, category, merchant):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO bills (date, amount, category, merchant) VALUES (?, ?, ?, ?)",
              (date, amount, category, merchant))
    conn.commit()
    conn.close()

def get_all_bills():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM bills ORDER BY date DESC")
    bills = c.fetchall()
    conn.close()
    return [{"id": b[0], "date": b[1], "amount": b[2], "category": b[3], "merchant": b[4]} for b in bills]

# 储蓄目标操作
def add_saving(goal_name, target_amount, deadline):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO savings (goal_name, target_amount, deadline) VALUES (?, ?, ?)",
              (goal_name, target_amount, deadline))
    conn.commit()
    conn.close()

def get_all_savings():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM savings")
    savings = c.fetchall()
    conn.close()
    return [{"id": s[0], "goal_name": s[1], "target_amount": s[2], "current_amount": s[3], "deadline": s[4]} for s in savings]

# 初始化数据库
if __name__ == '__main__':
    init_db()