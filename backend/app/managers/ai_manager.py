# backend/app/managers/ai_manager.py
from openai import OpenAI
from typing import Tuple, List, Optional

class AIManager:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
    
    def get_initial_suggestions(self, excel_data: dict = None) -> List[str]:
        """Get suggestions for when user first joins the chat"""
        if not excel_data or 'data' not in excel_data or not excel_data['data']:
            return [
                "I have a question about financial data",
                "How can I get started with Excel?",
                "Learn about available features"
            ]
        else:
            # Excel data exists, provide data-specific suggestions
            return [
                "Analyze this data",
                "Show data summary",
                "Find trends in the data"
            ]
    
    def analyze_message(self, message: str, excel_data: dict = None, is_initial: bool = False) -> Tuple[str, Optional[List[str]]]:
        try:
            # Construct the prompt based on available data
            prompt = f"User message: {message}\n"
            if excel_data and 'data' in excel_data:
                prompt += f"Excel data context: {str(excel_data['data'])}\n"
            
            if not is_initial:
                # For ongoing conversation, add instruction to end with a question if appropriate
                prompt += "\nIf relevant, end your response with a question about what else the user would like to know about their data."
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": """You are a helpful AI assistant analyzing Excel financial data. 
                                                    If there's no Excel data, you're still helpful with general financial queries. 
                                                    Keep responses concise and focused. 
                                                    Don't add any latex to your responses.
                                                    End your responses with a question if relevant.
                                                    Don't make lists or bullet points, keep it in sentence structure.
                     """},
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extract the main response
            analysis = response.choices[0].message.content
            
            # Only return suggestions for initial messages
            suggestions = self.get_initial_suggestions(excel_data) if is_initial else None
            
            return analysis, suggestions
            
        except Exception as e:
            print(f"AI Error: {str(e)}")  # Debug print
            return "I encountered an error while processing your request. Please try again.", None