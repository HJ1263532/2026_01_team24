from flask import Blueprint, request, jsonify
import requests
import os
import jwt

from backend.db import db
from datetime import datetime, timedelta
from bson import ObjectId

oauth_bp = Blueprint("oauth", __name__)

users = db.users

# 중복 로그인 방지용 인덱스
users.create_index("googleId", unique=True)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

JWT_SECRET = os.getenv("JWT_SECRET")


# JWT 검증 함수
def verify_token():

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["userId"]
    except:
        return None


# Google 로그인
@oauth_bp.route("/api/auth/google", methods=["POST"])
def google_login():

    data = request.json
    access_token = data.get("accessToken")

    if not access_token:
        return jsonify({"error": "accessToken required"}), 400

    # Google user 정보 가져오기
    userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"

    userinfo_res = requests.get(
        userinfo_url,
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    userinfo = userinfo_res.json()

    # 디버깅용 (문제 발생 시 확인)
    print("GOOGLE USERINFO:", userinfo)

    # userinfo 검증
    if "sub" not in userinfo:
        return jsonify({
            "error": "google userinfo error",
            "google_response": userinfo
        }), 400

    google_id = userinfo.get("sub")
    email = userinfo.get("email")
    name = userinfo.get("name")
    picture = userinfo.get("picture")

    # MongoDB 사용자 확인
    user = users.find_one({"googleId": google_id})

    if not user:

        new_user = {
            "googleId": google_id,
            "email": email,
            "name": name,
            "picture": picture,
            "createdAt": datetime.utcnow()
        }

        result = users.insert_one(new_user)

        user_id = str(result.inserted_id)

    else:
        user_id = str(user["_id"])

    # JWT 발급
    payload = {
        "userId": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7)
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "name": name,
            "picture": picture
        }
    })


# 로그인 상태 확인
@oauth_bp.route("/api/auth/check", methods=["GET"])
def check_login():

    user_id = verify_token()

    if not user_id:
        return jsonify({"loggedIn": False}), 401

    user = users.find_one({"_id": ObjectId(user_id)})

    return jsonify({
        "loggedIn": True,
        "userId": user_id
    })


# 로그아웃
@oauth_bp.route("/api/auth/logout", methods=["POST"])
def logout():

    return jsonify({
        "message": "logout success"
    })

# 사용자 조회
@oauth_bp.route("/api/auth/me", methods=["GET"])
def get_me():

    user_id = verify_token()

    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    user = users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"error": "user not found"}), 404

    return jsonify({
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "picture": user["picture"]
    })