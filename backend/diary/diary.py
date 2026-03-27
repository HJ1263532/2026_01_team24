from flask import Blueprint, request, jsonify
from backend.db import db
from backend.oauth.oauth import verify_token
from datetime import datetime
from bson import ObjectId
import os
import uuid
from werkzeug.utils import secure_filename

diary_bp = Blueprint("diary", __name__)
diaries = db.diaries
ALLOWED_MOODS = ["happy", "sad", "angry", "tired", "calm"]

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@diary_bp.route("/api/diary", methods=["POST"])
def create_diary():
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    data = request.form or {}

    title = data.get("title")
    if not title:
        return jsonify({"error": "제목이 필요합니다"}), 400

    content = data.get("content")
    if not content:
        return jsonify({"error": "내용이 필요합니다"}), 400

    mood = data.get("mood")
    if not mood:
        return jsonify({"error": "기분 선택이 필요합니다"}), 400

    if mood not in ALLOWED_MOODS:
        return jsonify({
            "error": "올바르지 않은 기분 값입니다",
            "allowedMoods": ALLOWED_MOODS
        }), 400

    image_urls = []

    if "images" in request.files:
        files = request.files.getlist("images")

        for file in files:
            if file and file.filename:
                if not allowed_file(file.filename):
                    return jsonify({"error": "허용되지 않는 파일 형식입니다."}), 400

                original_filename = secure_filename(file.filename)
                ext = original_filename.rsplit(".", 1)[1].lower()
                unique_filename = f"{uuid.uuid4().hex}.{ext}"
                filepath = os.path.join(UPLOAD_FOLDER, unique_filename)

                file.save(filepath)
                image_urls.append(f"/uploads/{unique_filename}")

    doc = {
        "userId": ObjectId(user_id),
        "title": title,
        "content": content,
        "mood": mood,
        "imageUrls": image_urls,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    result = diaries.insert_one(doc)

    response = {
        "_id": str(result.inserted_id),
        "userId": user_id,
        "title": title,
        "content": content,
        "mood": mood,
        "imageUrls": image_urls,
        "createdAt": doc["createdAt"].isoformat(),
        "updatedAt": doc["updatedAt"].isoformat()
    }
    return jsonify(response), 201


@diary_bp.route("/api/diary", methods=["GET"])
def get_diaries():
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    docs = list(
        diaries.find({"userId": ObjectId(user_id)}).sort("createdAt", -1)
    )

    result = []
    for doc in docs:
        result.append({
            "_id": str(doc["_id"]),
            "userId": str(doc["userId"]),
            "title": doc["title"],
            "content": doc["content"],
            "mood": doc.get("mood"),
            "imageUrls": doc.get("imageUrls", []),
            "createdAt": doc["createdAt"].isoformat(),
            "updatedAt": doc["updatedAt"].isoformat()
        })

    return jsonify(result), 200


@diary_bp.route("/api/diary/<diary_id>", methods=["GET"])
def get_diary(diary_id):
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    try:
        doc = diaries.find_one({
            "_id": ObjectId(diary_id),
            "userId": ObjectId(user_id)
        })
    except:
        return jsonify({"error": "잘못된 id 형식입니다"}), 400

    if not doc:
        return jsonify({"error": "해당하는 diary를 찾을 수 없습니다"}), 404

    result = {
        "_id": str(doc["_id"]),
        "userId": str(doc["userId"]),
        "title": doc["title"],
        "content": doc["content"],
        "mood": doc.get("mood"),
        "imageUrls": doc.get("imageUrls", []),
        "createdAt": doc["createdAt"].isoformat(),
        "updatedAt": doc["updatedAt"].isoformat()
    }
    return jsonify(result), 200


@diary_bp.route("/api/diary/<diary_id>", methods=["PATCH"])
def update_diary(diary_id):
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    update_fields = {}

    if "title" in data:
        title = data.get("title")
        if not title:
            return jsonify({"error": "제목이 비어있습니다"}), 400
        update_fields["title"] = title

    if "content" in data:
        content = data.get("content")
        if not content:
            return jsonify({"error": "내용이 비어있습니다"}), 400
        update_fields["content"] = content

    if "mood" in data:
        mood = data.get("mood")
        if not mood:
            return jsonify({"error": "기분 값이 비어있습니다"}), 400
        if mood not in ALLOWED_MOODS:
            return jsonify({
                "error": "올바르지 않은 기분 값입니다",
                "allowedMoods": ALLOWED_MOODS
            }), 400
        update_fields["mood"] = mood

    if not update_fields:
        return jsonify({"error": "변경된 사항이 없습니다"}), 400

    update_fields["updatedAt"] = datetime.utcnow()

    try:
        result = diaries.update_one(
            {
                "_id": ObjectId(diary_id),
                "userId": ObjectId(user_id)
            },
            {"$set": update_fields}
        )
    except:
        return jsonify({"error": "잘못된 id"}), 400

    if result.matched_count == 0:
        return jsonify({"error": "해당하는 diary를 찾을 수 없습니다"}), 404

    doc = diaries.find_one({
        "_id": ObjectId(diary_id),
        "userId": ObjectId(user_id)
    })

    response = {
        "_id": str(doc["_id"]),
        "userId": str(doc["userId"]),
        "title": doc["title"],
        "content": doc["content"],
        "mood": doc["mood"],
        "imageUrls": doc.get("imageUrls", []),
        "createdAt": doc["createdAt"].isoformat(),
        "updatedAt": doc["updatedAt"].isoformat()
    }
    return jsonify(response), 200


@diary_bp.route("/api/diary/<diary_id>", methods=["DELETE"])
def delete_diary(diary_id):
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    try:
        result = diaries.delete_one({
            "_id": ObjectId(diary_id),
            "userId": ObjectId(user_id)
        })
    except:
        return jsonify({"error": "잘못된 id"}), 400

    if result.deleted_count == 0:
        return jsonify({"error": "해당하는 diary를 찾을 수 없습니다"}), 404

    return jsonify({"message": "삭제완료"}), 200
