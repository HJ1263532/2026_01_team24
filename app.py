from flask import Flask
from backend.todolist.todo import todo_bp
from backend.diary.diary import diary_bp
from backend.chat.chat import chat_bp
print("app.py start")

app = Flask(__name__)
app.register_blueprint(todo_bp)
app.register_blueprint(diary_bp)
app.register_blueprint(chat_bp)

print("before run")

if __name__ == "__main__":
    print("in main")
    app.run(debug=True)
