from flask import Blueprint, request, jsonify
from backend.db import db
from datetime import datetime
from bson import ObjectId

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

#일기 전체 조회
@diary_bp.route("/api/diary", methods=["GET"])
def get_diaries():
    docs=list(diaries.find().sort("createdAt",-1))
    result=[]
    for doc in docs:
        result.append({
            "_id":str(doc["_id"]),
            "title":doc["title"],
            "content":doc["content"],
            "createdAt":doc["createdAt"].isoformat(),
            "updatedAt":doc["updatedAt"].isoformat()
        })
    return jsonify(result), 200

#일기 단일 조회
@diary_bp.route("/api/diary/<diary_id>", methods=["GET"])
def get_diary(diary_id):
    try:
        doc=diaries.find_one({"_id": ObjectId(diary_id)})
    except:
        return jsonify({"error":"잘못된 id 형식입니다"}),400
    if not doc:
        return jsonify({"error":"해당하는 diary를 찾을 수 없습니다"}),404
    
    result={
            "_id":str(doc["_id"]),
            "title":doc["title"],
            "content":doc["content"],
            "createdAt":doc["createdAt"].isoformat(),
            "updatedAt":doc["updatedAt"].isoformat()
    }
    return jsonify(result), 200


@diary_bp.route("/api/diary/<diary_id>", methods=["PATCH"])
def update_diary(diary_id):
    data=request.get_json(silent=True) or {}

    update_fields={}
    
    if "title" in data:
        title=data.get("title")
        if not title:
            return jsonify({"error":"제목이 비어있습니다"}), 400
        update_fields["title"]=title

    if "content" in data:
        content=data.get("content")
        if not content:
            return jsonify({"error":"내용이 비어있습니다"}), 400
        update_fields["content"]=content

    if not update_fields:
        return jsonify({"error":"변경된 사항이 없습니다"}), 400
    
    update_fields["updatedAt"]=datetime.utcnow()

    try:
        result=diaries.update_one(
            {"_id":ObjectId(diary_id)},
            {"$set":update_fields}
        )
    except:
        return jsonify({"error":"잙못된 id"}), 400
    
    if result.matched_count==0:
        return jsonify({"error":"해당하는 diary를 찾을 수 없습니다"}),404
    
    doc=diaries.find_one({"_id":ObjectId(diary_id)})

    response={
        "_id":str(doc["_id"]),
        "title":doc["title"],
        "content":doc["content"],
        "createdAt":doc["createdAt"].isoformat(),
        "updatedAt":doc["updatedAt"].isoformat()
    }
    return jsonify(response), 200


@diary_bp.route("/api/diary/<diary_id>", methods=["DELETE"])
def delete_diary(diary_id):
    try:
        result=diaries.delete_one({"_id":ObjectId(diary_id)})
    except:
        return jsonify({"error":"잘못된 id"}), 400
    
    if result.deleted_count==0:
        return jsonify({"error":"해당하는 diary를 찾을 수 없습니다"})
    
    return jsonify({"message":"삭제완료"}), 200