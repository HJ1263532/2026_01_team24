from flask import Blueprint, request, jsonify
from backend.db import db
from backend.oauth.oauth import verify_token
from datetime import datetime
from bson import ObjectId
from zoneinfo import ZoneInfo

todo_bp = Blueprint("todo", __name__)

todos = db.todos

def parse_datetime(value):
    if value is None:
        return None

    kst = ZoneInfo("Asia/Seoul")

    dt = datetime.fromisoformat(value)

    # 사용자가 보낸 시간은 한국시간이라고 가정
    dt_kst = dt.replace(tzinfo=kst)

    # UTC로 변환해서 저장
    dt_utc = dt_kst.astimezone(ZoneInfo("UTC"))

    # Mongo에 넣기 좋게 tz 제거
    return dt_utc.replace(tzinfo=None)

# todo작성
@todo_bp.route("/api/todos", methods=["POST"])
def add_todo():
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

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

    now_utc = datetime.utcnow()
    if due_date and due_date < now_utc:
        return jsonify({"error": "dueDate cannot be in the past"}), 400
    if remind_at and remind_at < now_utc:
        return jsonify({"error": "remindAt cannot be in the past"}), 400

    doc={
        "userId": user_id,
        "title": data["title"],
        "isCompleted": False,
        "createdAt":datetime.utcnow(),
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
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    result = todos.delete_one({
        "_id": ObjectId(todo_id),
        "userId": user_id
    })

    if result.deleted_count == 0:
        return jsonify({"error": "not found"}), 404

    return jsonify({"message": "deleted"})

#리스트 전체 조회
@todo_bp.route("/api/todos", methods=["GET"])
def get_todos():
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    result = []

    for doc in todos.find({"userId": user_id}).sort("createdAt", 1):
        result.append({
            "id": str(doc["_id"]),
            "title": doc["title"],
            "isCompleted":doc["isCompleted"],
            "createdAt": doc["createdAt"],
            "dueDate": doc.get("dueDate"),
            "remindAt": doc.get("remindAt")
        })

    return jsonify(result)

#완료 표시
@todo_bp.route("/api/todos/<todo_id>/complete", methods=["PATCH"])
def complete_todo(todo_id):
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    result = todos.update_one(
        {"_id": ObjectId(todo_id), "userId": user_id},
        {"$set": {"isCompleted": request.get_json().get("isCompleted")}}
    )

    if result.matched_count == 0:
        return jsonify({"message": "todo not found"}), 404

    return jsonify({"message": "updated"}), 200

#todo수정
@todo_bp.route("/api/todos/update/<todo_id>", methods=["PATCH"])
def update_todo(todo_id):
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    body = request.get_json()

    update_data = {}

    if "title" in body:
        update_data["title"] = body["title"]

    if "dueDate" in body:
        update_data["dueDate"] = parse_datetime(body["dueDate"])

    if "remindAt" in body:
        update_data["remindAt"] = parse_datetime(body["remindAt"])

    now_utc = datetime.utcnow()
    if "dueDate" in update_data and update_data["dueDate"] and update_data["dueDate"] < now_utc:
        return jsonify({"error": "dueDate cannot be in the past"}), 400
    if "remindAt" in update_data and update_data["remindAt"] and update_data["remindAt"] < now_utc:
        return jsonify({"error": "remindAt cannot be in the past"}), 400

    if not update_data:
        return jsonify({"message": "nothing to update"}), 400

    result = todos.update_one(
        {"_id": ObjectId(todo_id), "userId": user_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return jsonify({"message": "todo not found"}), 404

    return jsonify({"message": "updated"}), 200
