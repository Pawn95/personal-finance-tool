"""本地开发用启动器。

生产配置在 app.py 中（HTTPS + 仅允许支付宝域名），本文件用于本地调试：
- 关闭 SSL，使用 HTTP
- 端口 5000，与 frontend/js/main.js 中的 API_URL 一致
- 放开本地 CORS，方便前端静态页跨域调用
"""
from flask_cors import CORS
import app as backend_app

# 覆盖 CORS，允许所有来源（仅本地开发用）
CORS(backend_app.app)

if __name__ == '__main__':
    backend_app.database.init_db()
    backend_app.app.run(debug=True, port=5000, host='127.0.0.1', ssl_context=None)
