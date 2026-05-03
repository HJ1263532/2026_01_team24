from flask import Blueprint, request, jsonify
from backend.oauth.oauth import verify_token
import requests

calendar_bp = Blueprint("calendar", __name__)

GOOGLE_CALENDAR_BASE_URL = "https://www.googleapis.com/calendar/v3"


def get_google_access_token():
    token = request.headers.get("Google-Access-Token")
    if not token:
        return None
    return token.strip()


def get_google_headers(access_token):
    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }


@calendar_bp.route("/api/calendar/events", methods=["GET"])
def get_events():
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    google_access_token = get_google_access_token()
    if not google_access_token:
        return jsonify({"error": "google access token required"}), 400

    params = {
        "maxResults": 50,
        "singleEvents": "true",
        "orderBy": "startTime"
    }

    time_min = request.args.get("timeMin")
    time_max = request.args.get("timeMax")

    if time_min:
        params["timeMin"] = time_min
    if time_max:
        params["timeMax"] = time_max

    response = requests.get(
        f"{GOOGLE_CALENDAR_BASE_URL}/calendars/primary/events",
        headers={"Authorization": f"Bearer {google_access_token}"},
        params=params
    )

    try:
        response_data = response.json()
    except Exception:
        response_data = {"raw": response.text}

    if response.status_code != 200:
        return jsonify({
            "error": "google calendar api error",
            "google_response": response_data
        }), response.status_code

    events = response_data.get("items", [])

    result = []
    for event in events:
        result.append({
            "id": event.get("id"),
            "summary": event.get("summary"),
            "description": event.get("description"),
            "location": event.get("location"),
            "start": event.get("start"),
            "end": event.get("end"),
            "status": event.get("status"),
            "htmlLink": event.get("htmlLink")
        })

    return jsonify(result), 200


@calendar_bp.route("/api/calendar/events", methods=["POST"])
def create_event():
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    google_access_token = get_google_access_token()
    if not google_access_token:
        return jsonify({"error": "google access token required"}), 400

    data = request.get_json(silent=True) or {}

    summary = data.get("summary")
    start_datetime = data.get("startDateTime")
    end_datetime = data.get("endDateTime")

    if not summary:
        return jsonify({"error": "summary is required"}), 400
    if not start_datetime:
        return jsonify({"error": "startDateTime is required"}), 400
    if not end_datetime:
        return jsonify({"error": "endDateTime is required"}), 400

    event_body = {
        "summary": summary,
        "description": data.get("description", ""),
        "location": data.get("location", ""),
        "start": {
            "dateTime": start_datetime,
            "timeZone": "Asia/Seoul"
        },
        "end": {
            "dateTime": end_datetime,
            "timeZone": "Asia/Seoul"
        }
    }

    response = requests.post(
        f"{GOOGLE_CALENDAR_BASE_URL}/calendars/primary/events",
        headers=get_google_headers(google_access_token),
        json=event_body
    )

    try:
        response_data = response.json()
    except Exception:
        response_data = {"raw": response.text}

    if response.status_code not in [200, 201]:
        return jsonify({
            "error": "google calendar api error",
            "google_response": response_data
        }), response.status_code

    return jsonify({
        "message": "event created",
        "event": {
            "id": response_data.get("id"),
            "summary": response_data.get("summary"),
            "description": response_data.get("description"),
            "location": response_data.get("location"),
            "start": response_data.get("start"),
            "end": response_data.get("end"),
            "htmlLink": response_data.get("htmlLink")
        }
    }), 201


@calendar_bp.route("/api/calendar/events/<event_id>", methods=["PATCH"])
def update_event(event_id):
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    google_access_token = get_google_access_token()
    if not google_access_token:
        return jsonify({"error": "google access token required"}), 400

    data = request.get_json(silent=True) or {}

    # 1) 기존 이벤트 조회
    get_response = requests.get(
        f"{GOOGLE_CALENDAR_BASE_URL}/calendars/primary/events/{event_id}",
        headers={"Authorization": f"Bearer {google_access_token}"}
    )

    try:
        current_event = get_response.json()
    except Exception:
        current_event = {"raw": get_response.text}

    if get_response.status_code != 200:
        return jsonify({
            "error": "failed to fetch current event",
            "google_response": current_event
        }), get_response.status_code

    # 2) 필요한 필드만 덮어쓰기
    updated_event = {
        "summary": data.get("summary", current_event.get("summary")),
        "description": data.get("description", current_event.get("description", "")),
        "location": data.get("location", current_event.get("location", "")),
        "start": current_event.get("start"),
        "end": current_event.get("end")
    }

    if "startDateTime" in data:
        updated_event["start"] = {
            "dateTime": data["startDateTime"],
            "timeZone": "Asia/Seoul"
        }

    if "endDateTime" in data:
        updated_event["end"] = {
            "dateTime": data["endDateTime"],
            "timeZone": "Asia/Seoul"
        }

    if not updated_event.get("start") or not updated_event.get("end"):
        return jsonify({"error": "event must have start and end"}), 400

    # 3) 전체 업데이트
    update_response = requests.put(
        f"{GOOGLE_CALENDAR_BASE_URL}/calendars/primary/events/{event_id}",
        headers=get_google_headers(google_access_token),
        json=updated_event
    )

    try:
        response_data = update_response.json()
    except Exception:
        response_data = {"raw": update_response.text}

    if update_response.status_code != 200:
        return jsonify({
            "error": "google calendar api error",
            "google_response": response_data
        }), update_response.status_code

    return jsonify({
        "message": "event updated",
        "event": {
            "id": response_data.get("id"),
            "summary": response_data.get("summary"),
            "description": response_data.get("description"),
            "location": response_data.get("location"),
            "start": response_data.get("start"),
            "end": response_data.get("end"),
            "htmlLink": response_data.get("htmlLink")
        }
    }), 200


@calendar_bp.route("/api/calendar/events/<event_id>", methods=["DELETE"])
def delete_event(event_id):
    user_id = verify_token()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    google_access_token = get_google_access_token()
    if not google_access_token:
        return jsonify({"error": "google access token required"}), 400

    response = requests.delete(
        f"{GOOGLE_CALENDAR_BASE_URL}/calendars/primary/events/{event_id}",
        headers={"Authorization": f"Bearer {google_access_token}"}
    )

    if response.status_code not in [200, 204]:
        try:
            response_data = response.json()
        except Exception:
            response_data = {"raw": response.text}

        return jsonify({
            "error": "google calendar api error",
            "google_response": response_data
        }), response.status_code

    return jsonify({"message": "event deleted"}), 200