from fastapi import FastAPI
import openai

app = FastAPI()

# Define a route for testing
@app.get("/")
def read_root():
    return {"message": "Hello from Fintelligent backend!"}

# Example of an OpenAI interaction
@app.post("/ask_openai/")
async def ask_openai(question: str):
    openai.api_key = "your_openai_api_key_here"
    response = openai.Completion.create(
        engine="text-davinci-003",  # Choose the engine (GPT-3.5)
        prompt=question,
        max_tokens=150
    )
    return {"answer": response.choices[0].text.strip()}
