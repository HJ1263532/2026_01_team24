from datetime import datetime, timedelta
from backend.db import db

todos = db.todos

def check_todo_notifications():

    now = datetime.utcnow()

    # 1️⃣ remindAt 기준 알림 (10분 이내에 지난 것만)
    remind_targets = todos.find({
        "remindAt": {"$ne": None, "$lte": now, "$gte": now - timedelta(minutes=10)},
        "remindNotified": False
    })

    for todo in remind_targets:
        send_push(todo, "remindAt")
        todos.update_one(
            {"_id": todo["_id"]},
            {"$set": {"remindNotified": True}}
        )

    # 2️⃣ dueDate - 1시간 기준 알림 (remindAt 없는 경우만, 마감 전인 것만)
    due_targets = todos.find({
        "remindAt": None,
        "dueBeforeNotified": False,
        "dueDate": {
            "$ne": None,
            "$lte": now + timedelta(hours=1),
            "$gte": now
        }
    })

    for todo in due_targets:
        send_push(todo, "dueBefore")
        todos.update_one(
            {"_id": todo["_id"]},
            {"$set": {"dueBeforeNotified": True}}
        )


def send_push(todo, mode):
    """
    여기서 FCM 등으로 푸시 보내면 된다.
    지금은 테스트용 로그만 찍자.
    """
    if mode == "remindAt":
        print(f"[REMIND] {todo['title']}")
    else:
        print(f"[DUE-1H] {todo['title']}")