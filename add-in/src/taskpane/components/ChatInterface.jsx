import React, { useState } from 'react';
import { SendHorizontal} from 'lucide-react';
import { Button, TextField, Box } from '@mui/material'; // Use Material UI components

const ChatInterface = () => {
    const [messages, setMessages] = useState([{
      type: 'assistant',
      content: 'I noticed your spreadsheet contains revenue data',
      suggestions: [
        'Analyze revenue trends',
        'Create monthly summary',
        'Generate visualizations'
      ]
    }]);
    const [inputValue, setInputValue] = useState('');
  
    const handleSend = () => {
      if (inputValue.trim()) {
        setMessages([...messages, { 
          type: 'user', 
          content: inputValue.trim() 
        }]);
        setInputValue('');
      }
    };
  
    const handleSuggestionClick = (suggestion) => {
      setMessages([...messages, { 
        type: 'user', 
        content: suggestion 
      }]);
    };
  
    return (
      <Box display="flex" flexDirection="column" height="100vh" bgcolor="white">
        {/* Header removed - No title or top bar */}
        
        {/* Chat Area */}
        <Box flexGrow={1} padding={2} overflow="auto">
          <Box display="flex" flexDirection="column" gap={2}>
            {messages.map((message, index) => (
              <Box key={index} display="flex" flexDirection="column" gap={1}>
                {message.type === 'assistant' && (
                  <>
                    <Box className="text-sm leading-relaxed">{message.content}</Box>
                    {message.suggestions && (
                      <Box display="flex" flexDirection="column" gap={1}>
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
                  </>
                )}
                {message.type === 'user' && (
                  <Box className="text-sm">{message.content}</Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
  
        {/* Input Area */}
        <Box borderTop={1} padding={2} display="flex" gap={2} alignItems="center">
          <TextField
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your data..."
            fullWidth
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <Button 
            onClick={handleSend}
            color="primary"
            variant="contained"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </Box>
      </Box>
    );
  };
  
  export default ChatInterface;