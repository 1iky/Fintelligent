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
        # Send welcome message
        await websocket.send_json({
            "type": "assistant",
            "content": "Hello! I'm here to help analyze your data. How can I assist you today?",
            "suggestions": [
                "Analyze current data",
                "Help me get started",
                "Show available features"
            ]
        })
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"Received message: {message}")  # Debug print
            
            # Try to get Excel content, but don't fail if unavailable
            excel_content = None
            if excel_manager.connect_to_excel():
                excel_content = excel_manager.read_active_sheet()
            
            try:
                if message.get("type") in ["message", "suggestion"]:
                    # Process message with AI - now synchronous
                    analysis, suggestions = ai_manager.analyze_message(
                        message.get("content", ""), 
                        excel_content
                    )
                    
                    await websocket.send_json({
                        "type": "assistant",
                        "content": analysis,
                        "suggestions": suggestions
                    })
                else:
                    await websocket.send_json({
                        "type": "assistant",
                        "content": "I received your message but I'm not sure how to process it. Could you please try again?",
                        "suggestions": ["Try sending a message", "Ask for help"]
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.DEBUG_MODE
    )