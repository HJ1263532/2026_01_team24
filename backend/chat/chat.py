from flask import Blueprint, request, jsonify
from backend.db import db
from datetime import datetime
from zoneinfo import ZoneInfo
import os
from dotenv import load_dotenv
import google.generativeai as genai

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

env_path = os.path.join(BASE_DIR, "setting", ".env")
print("ENV PATH =", env_path)

load_dotenv(env_path, override=True)

key = os.getenv("GEMINI_API_KEY")
#print("GEMINI_API_KEY =", key)

if not key:
    raise RuntimeError("GEMINI_API_KEY not loaded")

chat_bp=Blueprint("chat", __name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

chats = db.chats
todos = db.todos
diaries = db.diaries

def get_today_todos():
    """오늘 이후 todo를 전부 가져온다 (KST 기준, 완료 포함)"""
    kst = ZoneInfo("Asia/Seoul")
    now_kst = datetime.now(kst)
    today_start = now_kst.replace(hour=0, minute=0, second=0, microsecond=0)

    # DB에는 UTC로 저장되어 있으므로 변환
    start_utc = today_start.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)

    docs = todos.find({
        "dueDate": {"$gte": start_utc}
    }).sort("dueDate", 1)

    result = []
    for doc in docs:
        status = "완료" if doc.get("isCompleted") else "미완료"
        due = doc.get("dueDate")
        due_str = due.strftime("%Y-%m-%d") if due else "기한 없음"
        result.append(f"- {doc['title']} (마감: {due_str}, {status})")
    return result

def get_recent_diaries():
    """최근 7개 일기를 가져온다"""
    docs = diaries.find().sort("createdAt", -1).limit(7)
    result = []
    for doc in docs:
        date_str = doc["createdAt"].strftime("%Y-%m-%d")
        result.append(f"- [{date_str}] {doc['title']}: {doc['content']}")
    return result

def get_chat_history():
    """최근 15개 대화를 history 형식으로 가져온다"""
    docs = list(chats.find().sort("createdAt", -1).limit(15))
    docs.reverse()  # 오래된 순으로 정렬

    history = []
    for doc in docs:
        history.append({"role": "user", "parts": [doc["userMessage"]]})
        history.append({"role": "model", "parts": [doc["botReply"]]})
    return history

def build_system_instruction():
    """todo와 diary 데이터를 system instruction으로 구성"""
    parts = ["너는 사용자의 일상을 돕는 친절한 AI 비서야. 아래 정보를 참고해서 대화해줘."]

    todo_list = get_today_todos()
    if todo_list:
        parts.append("\n[오늘의 할 일]\n" + "\n".join(todo_list))
    else:
        parts.append("\n[오늘의 할 일]\n- 등록된 할 일이 없습니다.")

    diary_list = get_recent_diaries()
    if diary_list:
        parts.append("\n[최근 일기]\n" + "\n".join(diary_list))

    return "\n".join(parts)

@chat_bp.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message=data.get("message")

    if not user_message:
        return jsonify({"error": "message is required"}), 400

    # system instruction에 todo/diary 정보 삽입
    system_instruction = build_system_instruction()
    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        system_instruction=system_instruction
    )

    # 과거 대화 15개를 history로 전달
    history = get_chat_history()
    chat_session = model.start_chat(history=history)
    response = chat_session.send_message(user_message)

    # DB 저장
    doc = {
        "userMessage": user_message,
        "botReply": response.text,
        "createdAt": datetime.utcnow()
    }

    result = chats.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    return jsonify(doc), 201
