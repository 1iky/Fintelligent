from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
from .managers.connection_manager import ConnectionManager
from .managers.excel_manager import ExcelManager
from .managers.ai_manager import AIManager
from . import config
import re

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
        
        # Get welcome message and suggestions
        welcome_response = ai_manager.analyze_message(
            "Generate a welcome message appropriate for the current context.",
            excel_content
        )
        
        # Send welcome message with suggestions
        await websocket.send_json({
            "type": "message",
            "content": welcome_response["content"],
            "suggestions": ai_manager.get_suggestions(excel_content)
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
                message_type = message.get("type", "")
                
                if message_type == "excel_sync":
                    # Handle Excel sync requests
                    response = {
                        "type": "message",
                        "content": "Excel data synced successfully",
                        "suggestions": ai_manager.get_suggestions(message.get("content"))
                    }
                    await websocket.send_json(response)
                
                elif message_type in ["message", "suggestion"]:
                    # Process message with AI
                    response = ai_manager.analyze_message(
                        message.get("content", ""),
                        message.get("excel_context", excel_content)
                    )
                    
                    # Handle Excel updates
                    if response.get("type") == "excel_update" and response.get("updates"):
                        update_success = True
                        for update in response["updates"]:
                            if update["type"] == "update":
                                if not excel_manager.update_cell(update["cell"], update["value"]):
                                    update_success = False
                                    break
                            elif update["type"] == "format":
                                if not excel_manager.format_range(update["range"], update["format"]):
                                    update_success = False
                                    break
                        
                        # Add appropriate status message
                        if update_success:
                            response["content"] += "\n\nExcel has been updated successfully!"
                        else:
                            response["content"] += "\n\nSome Excel updates failed. Please check the formula and try again."
                    
                    await websocket.send_json(response)
                
                elif message_type == "file":
                    # Handle file content updates
                    response = {
                        "type": "message",
                        "content": "File content received and processed",
                        "suggestions": ai_manager.get_suggestions(message.get("content"))
                    }
                    await websocket.send_json(response)
                
                else:
                    response = {
                        "type": "error",
                        "content": "Unsupported message type",
                        "error": True
                    }
                    await websocket.send_json(response)
                    
            except Exception as e:
                print(f"Error processing message: {e}")  # Debug print
                await websocket.send_json({
                    "type": "error",
                    "content": f"Error: {str(e)}",
                    "error": True
                })
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
        print("Client disconnected")  # Debug print