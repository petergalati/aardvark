import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

print(os.getenv('GEMINI_API_KEY'))

def configure_ai():
    api_key = os.getenv('GEMINI_API_KEY')  # Get the API key from the .env file
    if api_key is None:
        raise ValueError("API key not found in environment variables")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.0-flash-exp")

def generate_content(prompt: str):
    model = configure_ai()
    response = model.generate_content(prompt)
    return response.text
