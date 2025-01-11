import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material'; // Use Material UI components
import { Add } from '@mui/icons-material'; // "+" Icon for PDF
import { ArrowForward } from '@mui/icons-material'; // Arrow Icon for Suggestions

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle the PDF file upload logic here
      console.log('File selected:', file);
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="90vh" bgcolor="white" alignItems="center">
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

      {/* Outer Container for the Input Area */}
      <Box 
        padding={1.5} 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        borderRadius="50px"
        sx={{
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#f5f5f5',
          width: '85%',
          maxWidth: '400px', // Outer container with max width of 400px
          position: 'fixed', // Fixed position at the bottom of the viewport
          bottom: '1rem', // Adjusted bottom value for margin
          left: '50%',
          transform: 'translateX(-50%)', // Center the pill horizontally
          zIndex: 10, // Ensure it's above other content
        }}
      >
        {/* "+" Button for PDF Upload */}
        <Button
          onClick={() => document.getElementById('pdf-input').click()} // Trigger file input
          color="primary"
          variant="contained"
          sx={{
            padding: '4px',
            minWidth: 'auto',
            backgroundColor: '#d2d2d2',
            borderRadius: '50%',
            boxShadow: 'none',
            height: '28px', // Reduced size
            width: '28px', // Reduced size
          }}
        >
          <Add className="h-5 w-5" />
        </Button>

        {/* Hidden File Input for PDF */}
        <input
          id="pdf-input"
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* Input TextField */}
        <Box sx={{ flexGrow: 1, marginX: 1 }}>
          <TextField
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your data..."
            sx={{
              width: '100%',
              "& .MuiInputBase-root": {
                height: '36px',
                borderRadius: '20px',
                backgroundColor: '#ffffff',
              },
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
        </Box>

        {/* Send Button */}
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
            height: '28px', // Reduced size
            width: '28px', // Reduced size
          }}
        >
          <ArrowForward className="h-5 w-5" />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;
