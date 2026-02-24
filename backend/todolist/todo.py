from flask import Blueprint, request, jsonify
from backend.db import db
from datetime import datetime
from bson import ObjectId

todo_bp = Blueprint("todo", __name__)

todos = db.todos

# todo작성
@todo_bp.route("/api/todos", methods=["POST"])
def add_todo():
    data=request.json
    if not data or "title" not in data:
        return jsonify({"error": "title is not reqired"}),400
    
    doc={
        # 나중에 로그인 추가 되면 여기 userId추가해야함. "userId": current_user_id로 변경할 것
        "userId":None,
        "title": data["title"],
        "isCompleted": False,   # ← 기본값
        "createdAt":datetime.utcnow()
    }

    result=todos.insert_one(doc)
    
    return jsonify({
        "id": str(result.inserted_id),
        "title":doc["title"],
        "isCompleted":doc["isCompleted"],
        "createdAt":doc["createdAt"]
    }),201

# todo삭제
@todo_bp.route("/api/todos/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id):

    result = todos.delete_one({
        "_id": ObjectId(todo_id)
    })

    if result.deleted_count == 0:
        return jsonify({"error": "not found"}), 404

    return jsonify({"message": "deleted"})

#리스트 전체 조회
@todo_bp.route("/api/todos", methods=["GET"])
def get_todos():

    result = []

    for doc in todos.find().sort("createdAt", 1):
        result.append({
            "id": str(doc["_id"]),
            "title": doc["title"],
            "isCompleted":doc["isCompleted"],
            "createdAt": doc["createdAt"]
        })

    return jsonify(result)

#완료 표시
@todo_bp.route("/api/todos/<todo_id>/complete", methods=["PATCH"])
def complete_todo(todo_id):

    body = request.get_json()
    is_completed = body.get("isCompleted")

    result = todos.update_one(
        {"_id": ObjectId(todo_id)},
        {"$set": {"isCompleted": is_completed}}
    )

    if result.matched_count == 0:
        return jsonify({"message": "todo not found"}), 404

    return jsonify({"message": "updated"}), 200


@todo_bp.route("/api/todos/update/<todo_id>", methods=["PATCH"])
def update_todo(todo_id):

    body = request.get_json()

    update_data = {}

    if "title" in body:
        update_data["title"] = body["title"]

    if not update_data:
        return jsonify({"message": "nothing to update"}), 400

    result = todos.update_one(
        {"_id": ObjectId(todo_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return jsonify({"message": "todo not found"}), 404

    return jsonify({"message": "updated"}), 200
