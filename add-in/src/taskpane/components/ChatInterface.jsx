import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import { Add, ArrowForward } from '@mui/icons-material';

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

      {/* Unified Container with Background */}
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
        {/* Text Input Area */}
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

        
        
        
        {/* Buttons Bar */}
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 4px',
          }}
        >
          {/* "+" Button for PDF Upload */}
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

          {/* Hidden File Input for PDF */}
          <input
            id="pdf-input"
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

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