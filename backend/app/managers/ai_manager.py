from openai import OpenAI
from typing import Tuple, List

class AIManager:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        
    def analyze_message(self, message: str, excel_data: dict = None) -> Tuple[str, List[str]]:
        try:
            # Construct the prompt based on available data
            prompt = f"User message: {message}\n"
            if excel_data and 'data' in excel_data:
                prompt += f"Excel data context: {str(excel_data['data'])}\n"
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # GPT-4o mini
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant analyzing Excel financial data. If there's no Excel data, you're still helpful with general queries. Keep responses concise and focused."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extract the main response
            analysis = response.choices[0].message.content
            
            # Generate relevant suggestions based on the context
            suggestions = [
                "Tell me more",
                "Show insights",
                "What else can you do?"
            ]
            
            return analysis, suggestions
            
        except Exception as e:
            print(f"AI Error: {str(e)}")  # Debug print
            return f"I encountered an error while processing your request. Please try again.", [
                "Try another question",
                "Ask for help",
                "Start over"
            ]