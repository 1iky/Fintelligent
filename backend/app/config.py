import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("No OPENAI_API_KEY found in environment variables")

DEBUG_MODE = True
HOST = "0.0.0.0"
PORT = 8000