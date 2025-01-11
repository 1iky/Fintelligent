import React, { useState, useRef, useEffect } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { Add, ArrowForward } from '@mui/icons-material';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [isFirstMessage, setIsFirstMessage] = useState(true);  // Track if it's the first message
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const wsRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8000/ws');
      
      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setWsStatus('connected');
      };

      ws.onmessage = (event) => {
        console.log('Received message:', event.data);
        const response = JSON.parse(event.data);
        
        if (response.error) {
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
            // Update isFirstMessage after the first message is added
            if (isFirstMessage) {
              setTimeout(() => setIsFirstMessage(false), 0);
            }
            return [...prev, newMessage];
          });
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

    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []); // Empty dependency array since connection should only be established once

  const handleSend = () => {
    if (inputValue.trim() && wsRef.current && wsStatus === 'connected') {
      // Add user message to chat
      setMessages(prev => [...prev, {
        type: 'user',
        content: inputValue.trim()
      }]);

      // Send message to WebSocket server
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: inputValue.trim()
      }));

      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (wsRef.current && wsStatus === 'connected') {
      setMessages(prev => [...prev, {
        type: 'user',
        content: suggestion
      }]);

      wsRef.current.send(JSON.stringify({
        type: 'suggestion',
        content: suggestion
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && wsRef.current && wsStatus === 'connected') {
      const reader = new FileReader();
      reader.onload = (event) => {
        wsRef.current.send(JSON.stringify({
          type: 'file',
          content: event.target.result
        }));
      };
      reader.readAsText(file);
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

  // Connection status indicator
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

  return (
    <Box display="flex" flexDirection="column" height="80vh" bgcolor="white" alignItems="center"
      sx={{ overflow: 'hidden' }}>
      {/* Status Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
        }}
      />
      
      {/* Chat Area */}
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
            '&::-webkit-scrollbar': {
              display: 'none'
            },
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
                    {message.suggestions && (
                      <Box display="flex" flexDirection="column" gap={1} mt={1}>
                        <Box className="text-sm text-gray-600">Would you like me to:</Box>
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

      {/* Input Container */}
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
          placeholder="Ask about your data..."
          sx={{
            width: '100%',
            "& .MuiInputBase-root": {
              maxHeight: '150px',
              overflowY: 'auto',
              backgroundColor: 'transparent',
              padding: '6px 12px',
              '& textarea': {
                maxHeight: '150px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#bdbdbd',
                  borderRadius: '4px',
                },
              },
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                border: 'none',
              },
              "&:hover fieldset": {
                border: 'none',
              },
              "&.Mui-focused fieldset": {
                border: 'none',
              },
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
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 4px',
          }}
        >
          <Button
            onClick={() => document.getElementById('pdf-input').click()}
            color="primary"
            variant="contained"
            sx={{
              padding: '4px',
              minWidth: 'auto',
              backgroundColor: '#d2d2d2',
              borderRadius: '50%',
              boxShadow: 'none',
              height: '25px', 
              width: '25px',
              '&:hover': {
                backgroundColor: '#bdbdbd',
              },
            }}
          >
            <Add className="h-5 w-5" />
          </Button>

          <input
            id="pdf-input"
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

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