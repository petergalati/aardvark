from flask import Flask, jsonify, request
from gemini_service import generate_content
import json

app = Flask(__name__)

# Simple test route
@app.route('/')
def home():
    return "Hello, Flask!"

# Example GET route
@app.route('/api/test', methods=['GET'])
def get_data():
    data = {
        "message": "This is a test endpoint!"
    }
    return jsonify(data)

# The main POST endpoint that your Chrome Extension will call
@app.route('/api/evidence', methods=['POST'])
def get_evidence():
    # Get the user-selected text from the request
    prompt = request.json.get("prompt", "")

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    # We'll pass a specialized prompt to Gemini asking for "evidence supporting the following"
    # and instructing it to return JSON with 'summary' and 'evidence'
    gemini_prompt = (
        f"Is there evidence supporting the following text?"
        f"Please respond with links to corroborating evidence"
        f"Text: \"{prompt}\""
    )

    # This calls Gemini in gemini_service.py
    response_text = generate_content(gemini_prompt)

    # Try to parse the response if Gemini returns JSON.
    # If Gemini doesn't return valid JSON, fallback to a simpler structure.
    try:
        response_json = json.loads(response_text)
    except:
        # If not parseable as JSON, just wrap it in a standard format
        response_json = {
            "summary": response_text,
            "evidence": []
        }

    return jsonify(response_json)

if __name__ == '__main__':
    app.run(debug=True)
