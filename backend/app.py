from flask import Flask, jsonify, request
from gemini_service import generate_content

app = Flask(__name__)

# Define a route
@app.route('/')
def home():
    return "Hello, Flask!"

# Define an API endpoint for GET requests
@app.route('/api/data', methods=['GET'])
def get_data():
    data = {
        "message": "This is a sample API response"
    }
    return jsonify(data)

# Define another route to handle POST requests
@app.route('/api/data', methods=['POST'])
def post_data():
    # Get the prompt from the request body
    prompt = request.json.get("prompt", "")
    
    if prompt:
        response_text = generate_content(prompt)
        return jsonify({"response": response_text})
    else:
        return jsonify({"error": "No prompt provided"}), 400

if __name__ == '__main__':
    app.run(debug=True)
