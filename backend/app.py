from flask import Flask, request, jsonify
from flask_cors import CORS
import database
from datetime import datetime

app = Flask(__name__)

# 仅允许本地 HTTPS 调用
CORS(app, origins=["https://consumeprod.alipay.com"], supports_credentials=True)

# 账单API
@app.route('/api/bills', methods=['GET', 'POST', 'OPTIONS'])
def handle_bills():
    if request.method == 'OPTIONS':
        return '', 200
    if request.method == 'POST':
        data = request.json
        database.add_bill(data['date'], data['amount'], data['category'], data.get('merchant', ''))
        return jsonify({"status": "success"})
    else:
        return jsonify(database.get_all_bills())

# 储蓄目标API
@app.route('/api/savings', methods=['GET', 'POST', 'OPTIONS'])
def handle_savings():
    if request.method == 'OPTIONS':
        return '', 200
    if request.method == 'POST':
        data = request.json
        database.add_saving(data['goal_name'], data['target_amount'], data['deadline'])
        return jsonify({"status": "success"})
    else:
        return jsonify(database.get_all_savings())

# 分析API
@app.route('/api/analyze', methods=['GET', 'OPTIONS'])
def analyze():
    if request.method == 'OPTIONS':
        return '', 200
    bills = database.get_all_bills()
    savings = database.get_all_savings()
    
    now = datetime.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_expense = sum(b['amount'] for b in bills if datetime.strptime(b['date'], '%Y-%m-%d') >= month_start)
    
    saving_plan = None
    if savings:
        s = savings[0]
        deadline = datetime.strptime(s['deadline'], '%Y-%m-%d')
        days_left = (deadline - now).days
        if days_left > 0:
            needed = s['target_amount'] - s['current_amount']
            monthly_needed = needed / (days_left / 30)
            saving_plan = {
                "goal_name": s['goal_name'],
                "monthly_needed": round(monthly_needed, 2),
                "days_left": days_left
            }
    
    return jsonify({
        "monthly_expense": monthly_expense,
        "saving_plan": saving_plan
    })

if __name__ == '__main__':
    database.init_db()
    # 关键：启动 HTTPS
    app.run(
        debug=True,
        port=5002,
        host='0.0.0.0',
        ssl_context=('certs/cert.pem', 'certs/key.pem')
    )