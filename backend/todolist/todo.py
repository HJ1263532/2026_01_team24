from flask import Blueprint, request, jsonify
from backend.db import db
from datetime import datetime
from bson import ObjectId
from zoneinfo import ZoneInfo
from datetime import datetime

todo_bp = Blueprint("todo", __name__)

todos = db.todos

def parse_datetime(value):
    if value is None:
        return None
    return datetime.fromisoformat(value)

# todo작성
@todo_bp.route("/api/todos", methods=["POST"])
def add_todo():
    data=request.json
    if not data or "title" not in data:
        return jsonify({"error": "title is not reqired"}),400
    elif "dueDate" not in data:
        return jsonify({"error":"dueDate is not reqired"}),400
    
    try:
        due_date = parse_datetime(data.get("dueDate"))
        remind_at = parse_datetime(data.get("remindAt"))
    except ValueError:
        return jsonify({"error": "invalid datetime format"}), 400
    
    doc={
        # 나중에 로그인 추가 되면 여기 userId추가해야함. "userId": current_user_id로 변경할 것
        "userId":None,
        "title": data["title"],
        "isCompleted": False,   # ← 기본값
        "createdAt":datetime.utcnow(),
        #dueDate와 remindAt은 사용자가 직접 적는 부분이지만 백으로 들어올 때에는 무조건 ISO형식으로 들어와야
        "dueDate": due_date,
        "remindAt": remind_at,

        "remindNotified": False,
        "dueBeforeNotified": False
    }

    result=todos.insert_one(doc)
    
    return jsonify({
        "id": str(result.inserted_id),
        "title":doc["title"],
        "isCompleted":doc["isCompleted"],
        "createdAt":doc["createdAt"],
        "dueDate": doc["dueDate"],
        "remindAt": doc["remindAt"]
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
            "createdAt": doc["createdAt"],
            "dueDate": doc.get["dueDate"],
            "remindAt": doc.get["remindAt"]
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

#todo수정
@todo_bp.route("/api/todos/update/<todo_id>", methods=["PATCH"])
def update_todo(todo_id):

    body = request.get_json()

    update_data = {}

    if "title" in body:
        update_data["title"] = body["title"]

    if not update_data:
        return jsonify({"message": "nothing to update"}), 400
    
    if "dueDate" in body:
        update_data["dueDate"] = parse_datetime(body["dueDate"])

    if "remindAt" in body:
        update_data["remindAt"] = parse_datetime(body["remindAt"])

    result = todos.update_one(
        {"_id": ObjectId(todo_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return jsonify({"message": "todo not found"}), 404

    return jsonify({"message": "updated"}), 200