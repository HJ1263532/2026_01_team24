from flask import Blueprint, request, jsonify
from backend.db import db
from datetime import datetime
from bson import ObjectId

todo_bp = Blueprint("todo", __name__)

todos = db.todos

@todo_bp.route("/api/todos", methods=["POST"])
def add_todo():
    data=request.json
    if not data or "title" not in data:
        return jsonify({"error": "title is not reqired"}),400
    
    doc={
        # 나중에 로그인 추가 되면 여기 userId추가해야함. "userId": current_user_id로 변경할 것
        "userId":None,
        "title": data["title"],
        "createdAt":datetime.utcnow()
    }

    result=todos.insert_one(doc)
    
    return jsonify({
        "id": str(result.inserted_id),
        "title":doc["title"],
        "createdAt":doc["createdAt"]
    }),201

@todo_bp.route("/api/todos/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id):

    result = todos.delete_one({
        "_id": ObjectId(todo_id)
    })

    if result.deleted_count == 0:
        return jsonify({"error": "not found"}), 404

    return jsonify({"message": "deleted"})

@todo_bp.route("/api/todos", methods=["GET"])
def get_todos():

    result = []

    for doc in todos.find().sort("createdAt", 1):
        result.append({
            "id": str(doc["_id"]),
            "title": doc["title"],
            "createdAt": doc["createdAt"]
        })

    return jsonify(result)
