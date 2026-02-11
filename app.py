from flask import Flask
from backend.todolist.todo import todo_bp

print("app.py start")

app = Flask(__name__)
app.register_blueprint(todo_bp)

print("before run")

if __name__ == "__main__":
    print("in main")
    app.run(debug=True)
