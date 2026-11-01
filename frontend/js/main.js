const API_URL = 'http://localhost:5000/api';

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadAnalysis();
    loadBills();
    document.getElementById('bill-date').valueAsDate = new Date();
    document.getElementById('saving-deadline').valueAsDate = new Date(Date.now() + 90*24*60*60*1000); // 默认3个月后
});

// 加载分析数据
async function loadAnalysis() {
    const res = await fetch(`${API_URL}/analyze`);
    const data = await res.json();
    document.getElementById('monthly-expense').textContent = `¥${data.monthly_expense.toFixed(2)}`;
    if (data.saving_plan) {
        document.getElementById('saving-plan').textContent = 
            `${data.saving_plan.goal_name}：每月需存¥${data.saving_plan.monthly_needed}`;
    }
}

// 加载账单列表
async function loadBills() {
    const res = await fetch(`${API_URL}/bills`);
    const bills = await res.json();
    const list = document.getElementById('bill-list');
    list.innerHTML = bills.slice(0, 10).map(b => 
        `<li><span>${b.date} - ${b.category} - ${b.merchant || ''}</span><span>¥${b.amount.toFixed(2)}</span></li>`
    ).join('');
}

// 提交账单
document.getElementById('bill-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bill = {
        date: document.getElementById('bill-date').value,
        amount: parseFloat(document.getElementById('bill-amount').value),
        category: document.getElementById('bill-category').value,
        merchant: document.getElementById('bill-merchant').value
    };
    await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(bill)
    });
    e.target.reset();
    document.getElementById('bill-date').valueAsDate = new Date();
    loadAnalysis();
    loadBills();
});

// 提交储蓄目标
document.getElementById('saving-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saving = {
        goal_name: document.getElementById('saving-name').value,
        target_amount: parseFloat(document.getElementById('saving-target').value),
        deadline: document.getElementById('saving-deadline').value
    };
    await fetch(`${API_URL}/savings`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(saving)
    });
    e.target.reset();
    document.getElementById('saving-deadline').valueAsDate = new Date(Date.now() + 90*24*60*60*1000);
    loadAnalysis();
});