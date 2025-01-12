import React, { useState, useRef, useEffect } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const ChatInterface = () => {
  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion) => {
    if (wsRef.current && wsStatus === 'connected') {
      // Add user message to chat
      setMessages(prev => [...prev, {
        type: 'user',
        content: suggestion
      }]);

      // Send suggestion to WebSocket server
      wsRef.current.send(JSON.stringify({
        type: 'suggestion',
        content: suggestion
      }));
    }
  };

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const wsRef = useRef(null);

  // Initialize Excel and WebSocket
  useEffect(() => {
    const initializeExcel = async () => {
      try {
        await Office.onReady();
        // Get the current worksheet data
        await syncExcelData();
      } catch (error) {
        console.error('Error initializing Excel:', error);
      }
    };

    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8000/ws');
      
      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setWsStatus('connected');
      };

      ws.onmessage = async (event) => {
        console.log('Received message:', event.data);
        const response = JSON.parse(event.data);
        
        try {
          if (response.type === 'excel_update') {
            // Handle Excel update commands
            let updateSuccess = true;
            try {
              await Excel.run(async (context) => {
                const sheet = context.workbook.worksheets.getActiveWorksheet();
                
                for (const update of response.updates) {
                  const { cell, value } = update;
                  const range = sheet.getRange(cell);
                  range.values = [[value]];
                }
                
                await context.sync();
              });
            } catch (error) {
              console.error('Error updating Excel:', error);
              updateSuccess = false;
            }

            setMessages(prev => [...prev, {
              type: 'assistant',
              content: response.content,
              updates: updateSuccess ? response.updates : undefined,
              error: !updateSuccess
            }]);
          } else if (response.error) {
            setMessages(prev => [...prev, {
              type: 'assistant',
              content: response.message || 'An error occurred',
              error: true
            }]);
          } else {
            setMessages(prev => {
              const newMessage = {
                type: 'assistant',
                content: response.content,
                suggestions: isFirstMessage ? response.suggestions : undefined
              };
              if (isFirstMessage) {
                setTimeout(() => setIsFirstMessage(false), 0);
              }
              return [...prev, newMessage];
            });
          }
        } catch (error) {
          console.error('Error processing message:', error);
          setMessages(prev => [...prev, {
            type: 'assistant',
            content: 'Failed to process the update.',
            error: true
          }]);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsStatus('disconnected');
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsStatus('error');
      };

      wsRef.current = ws;
    };

    initializeExcel();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Sync Excel data with backend
  const syncExcelData = async () => {
    try {
      await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const usedRange = sheet.getUsedRange();
        usedRange.load(['values', 'address']);
        await context.sync();

        if (wsRef.current && wsStatus === 'connected') {
          wsRef.current.send(JSON.stringify({
            type: 'excel_sync',
            content: {
              values: usedRange.values,
              address: usedRange.address
            }
          }));
        }
      });
    } catch (error) {
      console.error('Error syncing Excel data:', error);
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() && wsRef.current && wsStatus === 'connected') {
      setMessages(prev => [...prev, {
        type: 'user',
        content: inputValue.trim()
      }]);

      // Get current Excel context before sending message
      try {
        await Excel.run(async (context) => {
          const sheet = context.workbook.worksheets.getActiveWorksheet();
          const usedRange = sheet.getUsedRange();
          usedRange.load(['values', 'address']);
          await context.sync();

          wsRef.current.send(JSON.stringify({
            type: 'message',
            content: inputValue.trim(),
            excel_context: {
              values: usedRange.values,
              address: usedRange.address
            }
          }));
        });
      } catch (error) {
        console.error('Error getting Excel context:', error);
      }

      setInputValue('');
    }
  };

  // Status colour of WebSocket connection
  const getStatusColor = () => {
    switch (wsStatus) {
      case 'connected':
        return '#4CAF50';  
      case 'disconnected':
        return '#f44336';  
      case 'error':
        return '#ff9800';  
      default:
        return '#bdbdbd';  
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!isInitialRender) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setIsInitialRender(false);
    }
  }, [messages, isInitialRender]);

  return (
    <Box display="flex" flexDirection="column" height="79vh" bgcolor="white" alignItems="center"
      sx={{ overflow: 'hidden' }}>
      {/* Status Indicator */}
      <Box sx={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Box
          sx={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
          }}
        />
      </Box>

      {/* Chat Messages */}
      <Box 
        flexGrow={1} 
        width="100%"
        sx={{
          position: 'relative',
          paddingBottom: '100px',
          overflowY: 'auto',
        }}
        ref={chatContainerRef}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: 2,
            overflowY: 'scroll',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            marginBottom: '80px',
          }}
        >
          <Box display="flex" flexDirection="column" gap={2}>
            {messages.map((message, index) => (
              <Box key={index} display="flex" flexDirection="column" gap={1}>
                {message.type === 'assistant' && (
                  <Box className="text-sm leading-relaxed" sx={{ alignSelf: 'flex-start' }}>
                    {message.content}
                    {message.updates && !message.error && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <div className="text-xs text-gray-600">Updates made:</div>
                        {message.updates.map((update, i) => (
                          <div key={i} className="text-xs">
                            {update.cell}: {update.value}
                          </div>
                        ))}
                      </Box>
                    )}
                    {message.suggestions && (
                      <Box display="flex" flexDirection="column" gap={1} mt={1}>
                        <Box className="text-sm text-gray-600"></Box>
                        {message.suggestions.map((suggestion, i) => (
                          <Button 
                            key={i}
                            variant="outlined"
                            fullWidth
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
                {message.type === 'user' && (
                  <Box 
                    className="text-sm" 
                    sx={{
                      backgroundColor: '#e0f7fa',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      alignSelf: 'flex-end',
                      maxWidth: '70%',
                      wordWrap: 'break-word',
                    }}
                  >
                    {message.content}
                  </Box>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        </Box>
      </Box>

      {/* Input Area */}
      <Box 
        sx={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          maxWidth: '400px',
          backgroundColor: '#f5f5f5',
          borderRadius: '25px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <TextField
          multiline
          maxRows={8}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about your Excel data..."
          sx={{
            width: '100%',
            "& .MuiInputBase-root": {
              maxHeight: '150px',
              overflowY: 'auto',
              backgroundColor: 'transparent',
              padding: '6px 12px',
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { border: 'none' },
              "&:hover fieldset": { border: 'none' },
              "&.Mui-focused fieldset": { border: 'none' },
            },
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0 4px',
          }}
        >
          <Button
            onClick={handleSend}
            color="primary"
            variant="contained"
            sx={{
              padding: '4px',
              minWidth: 'auto',
              backgroundColor: '#4CAF50',
              borderRadius: '50%',
              boxShadow: 'none',
              height: '25px', 
              width: '25px',
              '&:hover': {
                backgroundColor: '#43a047',
              },
            }}
          >
            <ArrowForward className="h-5 w-5" />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterface;