from flask import Flask
from backend.todolist.todo import todo_bp
from dotenv import load_dotenv
import os

print("app.py start")

app = Flask(__name__)
app.config["SECRET_KEY"]=os.getenv("FLASK_SECRET_KEY")
app.register_blueprint(todo_bp)

print(app.url_map)

print("before run")

if __name__ == "__main__":
    print("in main")
    app.run(debug=True)
