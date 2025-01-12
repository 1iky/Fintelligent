from typing import Dict, List, Any, Optional, Tuple
from openai import OpenAI
import pandas as pd
import json
import re

class AIManager:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        self.current_excel_context = None
    
    def analyze_message(self, message: str, excel_context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Analyze user message and generate appropriate response or Excel commands
        """
        try:
            # Update Excel context
            self.current_excel_context = excel_context

            # Construct the system prompt
            system_prompt = """You are an AI assistant integrated with Excel.
            If there's no Excel data, you're still helpful with general financial queries. 
            Keep responses concise and focused. 
            Don't add any latex to your responses.
            End your responses with a question if relevant.
            Don't make lists or bullet points, keep it in sentence structure.
            When you are updating for calculations, don't put any quotes around the formula.


            You can:
            1. Analyze Excel data and provide insights
            2. Modify cells directly using cell references (e.g., A1, B2)
            3. Apply formatting and formulas
            
            When responding to requests that require Excel modifications:
            1. Use specific cell references
            2. Return commands in a structured format
            3. Explain what changes will be made

            
            For Excel updates, return commands like:
            UPDATE A1 TO 100
            UPDATE B2 TO =SUM(B1:B10)
            FORMAT A1:A10 AS CURRENCY
            """

            # Construct user prompt with context
            user_prompt = f"User request: {message}\n"
            if excel_context:
                user_prompt += f"Current Excel context:\n"
                user_prompt += f"- Active range: {excel_context.get('activeRange', 'None')}\n"
                user_prompt += f"- Used range: {excel_context.get('address', 'None')}\n"
                if 'values' in excel_context:
                    user_prompt += "- Data preview: "
                    user_prompt += str(pd.DataFrame(excel_context['values'][:5]).to_string())

            # Get AI response
            response = self.client.chat.completions.create(
                model="gpt-4",  
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )

            ai_response = response.choices[0].message.content

            # Check if response contains Excel commands
            if self._contains_excel_command(message):
                return self._parse_excel_commands(ai_response)
            
            # If it's an analysis request, process the data
            if any(word in message.lower() for word in ['analyze', 'calculate', 'find', 'show']):
                return self._process_analysis_request(ai_response)
            
            # Regular response
            return {
                "type": "message",
                "content": ai_response
            }

        except Exception as e:
            return {
                "type": "error",
                "message": f"Error processing request: {str(e)}"
            }

    def _contains_excel_command(self, message: str) -> bool:
        """Check if message contains Excel command keywords"""
        command_keywords = [
            'update', 'change', 'set', 'modify', 'insert',
            'format', 'style', 'color', 'fill',
            'formula', 'calculate', '=sum', '=average',
            'average', 'sum', 'put', 'place'  
        ]
        # Also check for cell references
        cell_pattern = r'[A-Z]\d+(?::[A-Z]\d+)?'
        has_cell_reference = bool(re.search(cell_pattern, message.upper()))
        
        return has_cell_reference or any(keyword in message.lower() for keyword in command_keywords)

    def _parse_excel_commands(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response for Excel commands"""
        try:
            updates = []
            commands = []
            lines = ai_response.split('\n')
            
            
            if not any('UPDATE' in line.upper() or 'FORMAT' in line.upper() for line in lines):
                lines = self._convert_to_excel_commands(ai_response)
            
            for line in lines:
                # Parse UPDATE commands
                if 'UPDATE' in line.upper():
                    match = re.match(r'UPDATE\s+([A-Z]\d+)\s+TO\s+(.+)', line.upper())
                    if match:
                        cell, value = match.groups()
                        # Handle formula cases
                        if 'AVERAGE' in value:
                            value = value.replace('AVERAGE', '=AVERAGE')
                        elif 'SUM' in value:
                            value = value.replace('SUM', '=SUM')
                        updates.append({
                            "type": "update",
                            "cell": cell,
                            "value": value.strip()
                        })
                
                # Parse FORMAT commands
                elif 'FORMAT' in line.upper():
                    match = re.match(r'FORMAT\s+([A-Z]\d+(?::[A-Z]\d+)?)\s+AS\s+(.+)', line.upper())
                    if match:
                        range_, format_type = match.groups()
                        updates.append({
                            "type": "format",
                            "range": range_,
                            "format": format_type.strip()
                        })
                
                # Store the command for reference
                if 'UPDATE' in line.upper() or 'FORMAT' in line.upper():
                    commands.append(line.strip())

            if updates:
                return {
                    "type": "excel_update",
                    "content": "I'll help you modify the Excel sheet:\n" + "\n".join(commands),
                    "updates": updates
                }
            
            return {
                "type": "message",
                "content": ai_response
            }

        except Exception as e:
            return {
                "type": "error",
                "message": f"Error parsing Excel commands: {str(e)}"
            }

    def _convert_to_excel_commands(self, text: str) -> List[str]:
        """Convert natural language to Excel commands"""
        commands = []
        # Look for patterns like "average of A1:A3 in A4" or "put average of A1:A3 in A4"
        avg_match = re.search(r'average\s+of\s+([A-Z]\d+(?::[A-Z]\d+)?)\s+(?:in|to|into|at)\s+([A-Z]\d+)', text.lower())
        if avg_match:
            source, dest = avg_match.groups()
            commands.append(f"UPDATE {dest} TO =AVERAGE({source})")
        
        # Look for patterns like "sum of A1:A3 in A4"
        sum_match = re.search(r'sum\s+of\s+([A-Z]\d+(?::[A-Z]\d+)?)\s+(?:in|to|into|at)\s+([A-Z]\d+)', text.lower())
        if sum_match:
            source, dest = sum_match.groups()
            commands.append(f"UPDATE {dest} TO =SUM({source})")
            
        return commands

    def _process_analysis_request(self, ai_response: str) -> Dict[str, Any]:
        """Process data analysis requests"""
        try:
            if not self.current_excel_context or 'values' not in self.current_excel_context:
                return {
                    "type": "message",
                    "content": ai_response
                }

            df = pd.DataFrame(self.current_excel_context['values'])
            
            # Add analysis results to the response
            analysis_details = {
                "rows": len(df),
                "columns": len(df.columns),
                "numeric_columns": len(df.select_dtypes(include=['int64', 'float64']).columns),
                "has_missing_values": df.isnull().any().any(),
            }

            return {
                "type": "message",
                "content": ai_response,
                "analysis": analysis_details
            }

        except Exception as e:
            return {
                "type": "error",
                "message": f"Error processing analysis: {str(e)}"
            }

    def get_suggestions(self, excel_context: Optional[Dict] = None) -> List[str]:
        """Generate context-aware suggestions"""
        suggestions = []
        
        if excel_context and 'values' in excel_context:
            df = pd.DataFrame(excel_context['values'])
            
            # Add data-specific suggestions
            if len(df.select_dtypes(include=['int64', 'float64']).columns) > 0:
                suggestions.extend([
                    "Analyze this data",
                    "Create a summary analysis",
                    "Find trends in the data"
                ])
            
            if excel_context.get('activeRange'):
                suggestions.append(f"Analyze selected range: {excel_context['activeRange']}")
        
        # Add general suggestions
        suggestions.extend([
            "I have a question about financial data",
            "How can I get started with Excel?",
            "Learn about available features"
        ])
        
        return suggestions[:5]  