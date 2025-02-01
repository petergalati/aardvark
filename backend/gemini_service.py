import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Print the API key to verify it is loaded (optional debugging)
print(os.getenv('GEMINI_API_KEY'))

def configure_ai():
    # Get the API key from the .env file
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key is None:
        raise ValueError("API key not found in environment variables")

    # Configure the generative AI with your key
    genai.configure(api_key=api_key)
    # Use the right model name, e.g., "gemini-2.0-bison" or "gemini-2.0-flash-exp"
    return genai.GenerativeModel("gemini-2.0-flash-exp")

def generate_content(prompt: str) -> str:
    model = configure_ai()
    response = model.generate_content(prompt)
    # If you need the raw text portion:
    return response.text
