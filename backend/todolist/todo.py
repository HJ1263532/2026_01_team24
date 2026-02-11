from flask import Blueprint, request, jsonify
from backend.db import db
from datetime import datetime

todo_bp = Blueprint("todo", __name__)

todos = db.todos


@todo_bp.route("/api/todos/test", methods=["POST"])
def mongo_test():
#테스트 함수
    data = request.get_json(silent=True) or {}

    doc = {
        "title": data.get("title", "test"),
        "createdAt": datetime.utcnow()
    }

    result = todos.insert_one(doc)

    return jsonify({
        "inserted_id": str(result.inserted_id)
    })
