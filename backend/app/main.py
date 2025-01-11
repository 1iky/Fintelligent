from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
from .managers.connection_manager import ConnectionManager
from .managers.excel_manager import ExcelManager
from .managers.ai_manager import AIManager
from . import config

app = FastAPI(title="Fintelligent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connection_manager = ConnectionManager()
excel_manager = ExcelManager()
ai_manager = AIManager(config.OPENAI_API_KEY)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    try:
        # Get initial Excel content
        excel_content = None
        if excel_manager.connect_to_excel():
            excel_content = excel_manager.read_active_sheet()
        
        # Get welcome message and initial suggestions
        welcome_message, initial_suggestions = ai_manager.analyze_message(
            "Generate a welcome message appropriate for the current context.",
            excel_content,
            is_initial=True
        )
        
        # Send welcome message with suggestions
        await websocket.send_json({
            "type": "assistant",
            "content": welcome_message,
            "suggestions": initial_suggestions
        })
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"Received message: {message}")  # Debug print
            
            # Update Excel content for each message
            excel_content = None
            if excel_manager.connect_to_excel():
                excel_content = excel_manager.read_active_sheet()
            
            try:
                if message.get("type") in ["message", "suggestion"]:
                    # Process message with AI - ongoing conversation without suggestions
                    analysis, _ = ai_manager.analyze_message(
                        message.get("content", ""), 
                        excel_content,
                        is_initial=False  # This ensures no suggestions for ongoing conversation
                    )
                    
                    await websocket.send_json({
                        "type": "assistant",
                        "content": analysis
                        # No suggestions field for ongoing conversation
                    })
                else:
                    await websocket.send_json({
                        "type": "assistant",
                        "content": "I received your message but I'm not sure how to process it. Could you please try again?"
                    })
                    
            except Exception as e:
                print(f"Error processing message: {e}")  # Debug print
                await websocket.send_json({
                    "type": "assistant",
                    "content": f"I encountered an error while processing your request. Please try again.",
                    "error": True
                })
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)