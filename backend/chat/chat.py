from flask import Blueprint, request, jsonify
from backend.db import db
from datetime import datetime

chat_bp=Blueprint("chat", __name__)
chats = db.chats

@chat_bp.route("/api/chat", methods=["POST"])
def chat_test():
#테스트 함수
    data = request.get_json(silent=True) or {}

    doc = {
        "content": data.get("test"),
        "createdAt": datetime.utcnow()
    }
    result=chats.insert_one(doc)
    doc["_id"]=str(result.inserted_id)
    
    return jsonify(doc), 201