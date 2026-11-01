function injectCaptureButton() {
  if (document.getElementById('bill-capture-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'bill-capture-btn';
  btn.textContent = '抓取本月账单';
  btn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: #1677ff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    z-index: 999999;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;

    btn.onclick = async () => {
      try {
        btn.textContent = '抓取中...';
        btn.disabled = true;
        console.log('=== 开始抓取支付宝账单 ===');

        const bills = parseAlipayBillsUniversal();
        console.log('解析完成，共找到账单:', bills.length);
        
        if (bills.length === 0) {
          alert('未抓取到账单，请打开控制台查看详细调试信息！');
          return;
        }

        // 关键：使用 HTTPS
        for (const bill of bills) {
          await fetch('https://localhost:5002/api/bills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bill)
          });
        }

        alert(`抓取成功！共导入 ${bills.length} 条真实账单`);
        window.location.reload();

      } catch (error) {
        console.error('抓取失败：', error);
        alert('抓取失败：' + error.message);
      } finally {
        btn.textContent = '抓取本月账单';
        btn.disabled = false;
      }
    };

  document.body.appendChild(btn);
}

// 通用解析函数（和之前一样，已经验证成功）
function parseAlipayBillsUniversal() {
  let bills = [];
  const tables = document.querySelectorAll('table');
  
  let targetTable = null;
  for (const table of tables) {
    const headerText = table.querySelector('thead')?.innerText || '';
    if (headerText.includes('创建时间') && headerText.includes('名称') && headerText.includes('金额')) {
      targetTable = table;
      break;
    }
  }

  if (!targetTable) return [];

  const headerRow = targetTable.querySelector('thead tr');
  const headers = Array.from(headerRow.querySelectorAll('th')).map(th => th.innerText.trim());
  
  const colIndex = {
    time: headers.findIndex(h => h.includes('创建时间') || h.includes('交易时间')),
    name: headers.findIndex(h => h.includes('名称') || h.includes('交易名称')),
    amount: headers.findIndex(h => h.includes('金额')),
  };

  const dataRows = targetTable.querySelectorAll('tbody tr');

  dataRows.forEach(row => {
    try {
      const cols = row.querySelectorAll('td');
      if (cols.length < 3) return;

      const timeStr = cols[colIndex.time]?.innerText.trim() || '';
      const merchant = cols[colIndex.name]?.innerText.trim() || '';
      const amountStr = cols[colIndex.amount]?.innerText.trim() || '';
      
      if (!amountStr.startsWith('-')) return;

      const amount = parseFloat(amountStr.replace(/[^\d.]/g, ''));
      if (isNaN(amount) || amount <= 0) return;

      bills.push({
        date: formatDate(timeStr),
        amount: amount,
        category: autoCategorize(merchant),
        merchant: merchant
      });
    } catch (e) {}
  });

  return bills;
}

function autoCategorize(merchant) {
  const m = merchant || '';
  if (/美团|饿了么|餐饮|咖啡|奶茶|餐厅|面包|肯德基|麦当劳|星巴克/.test(m)) return '餐饮外卖';
  if (/滴滴|高德|地铁|公交|出租车|出行/.test(m)) return '交通出行';
  if (/淘宝|京东|拼多多|天猫|超市|百货|美妆|服饰/.test(m)) return '购物消费';
  if (/视频|会员|游戏|影院|娱乐|音乐/.test(m)) return '娱乐休闲';
  if (/房租|水电|燃气|物业/.test(m)) return '居住水电';
  if (/医院|药店|体检|医疗/.test(m)) return '医疗健康';
  return '其他';
}

function formatDate(dateStr) {
  try {
    if (dateStr.includes(' ')) {
      const datePart = dateStr.split(' ')[0];
      if (datePart.includes('.')) {
        const parts = datePart.split('.');
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
    }
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

// 注入按钮
const observer = new MutationObserver(() => {
  injectCaptureButton();
  observer.disconnect();
});
observer.observe(document, { childList: true, subtree: true });

window.addEventListener('load', injectCaptureButton);
setTimeout(injectCaptureButton, 1000);