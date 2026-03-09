from flask import Flask
from backend.todolist.todo import todo_bp
from dotenv import load_dotenv
from backend.oauth.oauth import oauth_bp
import os

from apscheduler.schedulers.background import BackgroundScheduler
from backend.notification_job import check_todo_notifications

print("app.py start")

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY")
app.register_blueprint(todo_bp)
app.register_blueprint(oauth_bp)

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

    app.run(debug=True)