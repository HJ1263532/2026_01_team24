from flask import Blueprint, request, jsonify
from backend.db import db
from datetime import datetime

diary_bp = Blueprint("diary", __name__)

diaries = db.diaries


@diary_bp.route("/api/diary", methods=["POST"])
def create_diary():
    data=request.get_json(silent=True) or {}
    title=data.get("title")
    if not title:
        return jsonify({"error":"제목이 필요합니다"}), 400

    content=data.get("content")
    if not content:
        return jsonify({"error":"내용이 필요합니다" }), 400
    
    doc={
        "title":title,
        "content":content,
        "createdAt":datetime.utcnow(),
        "updatedAt":datetime.utcnow()
    }

    result=diaries.insert_one(doc)
    doc["_id"]=str(result.inserted_id)
    doc["createdAt"]=doc["createdAt"].isoformat()
    doc["updatedAt"]=doc["updatedAt"].isoformat()
    return jsonify(doc), 201