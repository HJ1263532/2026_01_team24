from flask import Blueprint, request, jsonify
from backend.db import db
from datetime import datetime
import os
from dotenv import load_dotenv
import google.generativeai as genai

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

env_path = os.path.join(BASE_DIR, "setting", ".env")
print("ENV PATH =", env_path)

load_dotenv(env_path, override=True)

key = os.getenv("GOOGLE_API_KEY")
print("GOOGLE_API_KEY =", key)

if not key:
    raise RuntimeError("GOOGLE_API_KEY not loaded")

chat_bp=Blueprint("chat", __name__)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model=genai.GenerativeModel("gemini-2.5-flash")

chats = db.chats

@chat_bp.route("/api/chat", methods=["POST"])
def chat_test():
#테스트 함수
    data = request.get_json(silent=True) or {}
    user_message=data.get("message")

    if not user_message:
        return jsonify({"error": "message is required"}), 400

    # — Gemini 모델로 응답 생성 —
    chat_session = model.start_chat()
    response = chat_session.send_message(user_message)

    # — DB 저장 (요청 + 응답 함께) —
    doc = {
        "userMessage": user_message,
        "botReply": response.text,
        "createdAt": datetime.utcnow()
    }

    result = chats.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    return jsonify(doc), 201