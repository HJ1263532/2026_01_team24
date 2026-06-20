from flask import Flask
from flask import send_from_directory
from backend.todolist.todo import todo_bp
from backend.diary.diary import diary_bp
from backend.chat.chat import chat_bp
from backend.calendar.calendar import calendar_bp
from dotenv import load_dotenv
from backend.oauth.oauth import oauth_bp
import os
from flask_cors import CORS

from apscheduler.schedulers.background import BackgroundScheduler
from backend.notification_job import check_todo_notifications

print("app.py start")

# load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:8081"}})
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY")
app.register_blueprint(todo_bp)
app.register_blueprint(diary_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(oauth_bp)
app.register_blueprint(calendar_bp)

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads",filename)

print(app.url_map)

# ✅ 스케줄러 등록 (debug 모드 중복 실행 방지)
def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_todo_notifications, "interval", minutes=1)
    scheduler.start()
    print("scheduler started")

print("before run")

if __name__ == "__main__":
    print("in main")

    # ⚠️ Flask debug 리로더 때문에 두 번 실행되는 것 방지
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
        start_scheduler()

    # app.run(debug=True)
    app.run(host="0.0.0.0", port=5000, debug=True)

