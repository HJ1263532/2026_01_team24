from flask import Blueprint, request, jsonify
import requests
import os
import jwt

from backend.db import db
from datetime import datetime, timedelta

oauth_bp = Blueprint("oauth", __name__)

users = db.users


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

JWT_SECRET = os.getenv("JWT_SECRET")


# 1️Google code -> access token 교환
@oauth_bp.route("/api/auth/google", methods=["POST"])
def google_login():

    data = request.json
    code = data.get("code")

    if not code:
        return jsonify({"error": "code required"}), 400

    # Google token 요청
    token_url = "https://oauth2.googleapis.com/token"

    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": "postmessage",
        "grant_type": "authorization_code"
    }

    token_res = requests.post(token_url, data=token_data)

    token_json = token_res.json()

    access_token = token_json.get("access_token")

    if not access_token:
        return jsonify({"error": "token error"}), 400


    #Google user 정보 가져오기
    userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"

    userinfo_res = requests.get(
        userinfo_url,
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    userinfo = userinfo_res.json()

    google_id = userinfo["sub"]
    email = userinfo["email"]
    name = userinfo["name"]
    picture = userinfo["picture"]


    #MongoDB 사용자 확인
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


    #JWT 발급
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