import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

def configure_db():
    key_path = os.getenv('FIRESTORE_PATH')  # Get the API key from the .env file
    if key_path is None:
        raise ValueError("Firestone key path not found in environment variables")
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)
    print("Firestore initialized successfully!")

    return firestore.client()

def add_comment(url, text, comment, username="Anonymous"):
    db = configure_db()
    doc_ref = db.collection("comments").document(url)  # Use URL as document ID

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
    doc_ref = db.collection("comments").document(url)
    doc = doc_ref.get()

    if not doc.exists:
        print(f"No comments in {url}")
        return []
    
    data = doc.to_dict()
    comments = data.get("comments", [])

    if text_filter:
        comments = [c for c in comments if c.get("text") == text_filter]

    return comments

if __name__ == "__main__":

    url="bbc.com"
    text="blah blah blah"
    comment="good chat"
    username = "fish02"
    #add_comment(url, text, comment, username)

    all_comments = read_comments(url)
    for comment in all_comments:
        print(comment)
