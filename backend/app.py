from flask import Flask, jsonify, request
from datetime import date
from gemini_service import generate_content
from firestore import add_comment, read_comments
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Define a route
@app.route('/')
def home():
    return "Hello, Flask!"

# Define an API endpoint for GET requests
@app.route('/api/test', methods=['GET'])
def get_data():
    data = {
        "message": "good shit"
    }
    return jsonify(data)

# Define another route to handle POST requests
@app.route('/api/generate', methods=['POST'])
def post_data():
    claim = request.json.get("claim", "")

    today = date.today()
    parsed_date = request.json.get("date", today.strftime("%d-%m-%Y"))
    
    if claim:
        response_text = generate_content(claim, parsed_date)
        return jsonify({"response": response_text})
    else:
        return jsonify({"error": "No prompt provided"}), 400
    
# Define an endpoint to add a comment to Firestore
@app.route('/api/comments', methods=['POST'])
def add_comment_api():
    data = request.json
    url = data.get("url", "")
    text = data.get("text", "")
    comment = data.get("comment", "")
    username = data.get("username", "Anonymous")
    
    if url and text and comment:
        add_comment(url, text, comment, username)
        return jsonify({"message": "Comment added successfully"})
    else:
        return jsonify({"error": "Missing required fields"}), 400

# Define an endpoint to read comments from Firestore
@app.route('/api/comments', methods=['GET'])
def read_comments_api():
    url = request.args.get("url")
    text_filter = request.args.get("text_filter", None)
    
    if url:
        comments = read_comments(url, text_filter)
        return jsonify({"comments": comments})
    else:
        return jsonify({"error": "Missing URL parameter"}), 400

if __name__ == '__main__':
    app.run(debug=True)
