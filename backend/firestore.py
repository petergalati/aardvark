import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import re

load_dotenv()

db = None

def configure_db():
    global db
    if db is None:  # Only initialize Firestore once
        key_path = os.getenv('FIRESTORE_PATH')  # Get the API key from .env
        if key_path is None:
            raise ValueError("Firestore key path not found in environment variables")
        
        cred = credentials.Certificate(key_path)
        
        # Check if Firebase app is already initialized
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
            print("Firestore initialized successfully!")
        
        db = firestore.client()
    
    return db  # Return Firestore client instance

def sanitize_url(url):
    """ Convert URL into a Firestore-safe document ID by replacing special characters. """
    return re.sub(r'[^a-zA-Z0-9_-]', '_', url)  # Replace invalid characters with '_'

def add_comment(url, text, comment, username="Anonymous"):
    db = configure_db()
    doc_id = sanitize_url(url)
    doc_ref = db.collection("comments").document(doc_id)  # Use URL as document ID

    # Store comment as a list of dictionaries
    doc_ref.set(
        {
            "url": url,
            "comments": firestore.ArrayUnion([
                {"text": text,"user": username, "comment": comment}
            ])
        },
        merge=True  # Merge instead of overwriting existing comments
    )

    print(f"Comment added to {url}")

def read_comments(url, text_filter=None):
    db = configure_db()
    doc_id = sanitize_url(url)
    doc_ref = db.collection("comments").document(doc_id)
    doc = doc_ref.get()

    if not doc.exists:
        print(f"No comments in {url}")
        return []
    
    data = doc.to_dict()
    comments = data.get("comments", [])

    if text_filter:
        comments = [c for c in comments if c.get("text") == text_filter]

    return comments

'''
if __name__ == "__main__":

    url="bbc.com"
    text="blah blah blah"
    comment="good chat"
    username = "fish02"
    #add_comment(url, text, comment, username)

    all_comments = read_comments(url)
    for comment in all_comments:
        print(comment)
'''