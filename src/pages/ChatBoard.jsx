import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  Box, IconButton, Paper, Avatar, TextField, Button, Typography,
  useMediaQuery
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HeaderContext } from '../layout/Header';
import { motion, AnimatePresence } from 'framer-motion';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import '../assets/designfiles/ChatBoard.css';
import { useLocation } from 'react-router-dom'; 
import CommonMethods from '../common/CommonMethods';

export default function ChatBoard() {
  const { currentTheme } = useContext(HeaderContext);
  const theme = createTheme({ palette: { mode: currentTheme } });
  const { getMethod , postMethod} = CommonMethods();

  const [isChatBoxOpen, setChatBoxOpen] = useState(false);
  const [chatData, setChatData] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const toggleChatBox = () => setChatBoxOpen(!isChatBoxOpen);
  const [isAiResponsding, setIsAiResponsding] = useState(false);

  const isMobile = useMediaQuery('(max-width:600px)');
  const chatBoxWidth = isMobile ? '95%' : 500;
  const chatBoxHeight = isMobile ? '75%' : 520;

  const messagesEndRef = useRef(null);

  const clientId = localStorage.getItem('userEmail') || 'guest_' + Date.now();

  const fetchChatData = async () => {
    try {
      const res = await getMethod(`${process.env.REACT_APP_API_URL}/ai/get/${clientId}`);
      setChatData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const tempUserMessage = {
        message: newMessage,
        messageBy: 'user',
        temp: true, 
      };
      setChatData(prev => [...prev, tempUserMessage]);
      setNewMessage('');
      setIsAiResponsding(true);
      const res = await postMethod(`${process.env.REACT_APP_API_URL}/ai/chat`, {
        message: newMessage,
        uniqueUserId: clientId
      });

      if (res.data && res.data.aiMessage) {
        setChatData(prev => [
          ...prev.filter(msg => !msg.temp),
          res.data.userMessage,
          res.data.aiMessage,
        ]);
      }
      
    } catch (error) {
      console.log(error);
    } finally {
      setIsAiResponsding(false);
    }
  };

  const handleKeyPress = (e) => {
    if(isAiResponsding) return;
    if (e.key === 'Enter') handleSend();
  };

  useEffect(() => {
    fetchChatData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatData]);

  useEffect(() => {
    if (isChatBoxOpen) {
      scrollToBottom();
    }
  }, [isChatBoxOpen]);

  const currentRoute = useLocation();
  const currentPath = currentRoute.pathname;

  return (
    <>
    {currentPath === "/login" ? null : (
    <ThemeProvider theme={theme}>
      <Box>
        {/* Floating Button */}
        <IconButton
          onClick={toggleChatBox}
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            borderRadius: '50%',
            width: 60,
            height: 60,
            zIndex: 1301,
          }}
        >
          {isChatBoxOpen ? <CloseIcon /> : <SmartToyIcon />}
        </IconButton>

        {/* Chat Box */}
        <AnimatePresence>
          {isChatBoxOpen && (
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed',
                bottom: 90,
                left: 20,
                zIndex: 1300,
                width: chatBoxWidth,
                height: chatBoxHeight,
                overflow: 'visible',
              }}
            >
              <Paper
                elevation={6}
                sx={{
                  p: 2,
                  height: '100%',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >

                {/* Chat Messages */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '100%' }}>
                  <Box className="chat-container px-2 py-2">
                    {chatData.map((item, index) => {
                      const isUser = item.messageBy === 'user';
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Box
                            display="flex"
                            justifyContent={isUser ? 'flex-end' : 'flex-start'}
                            alignItems="flex-end"
                            gap={1.2}
                            className="mt-2"
                          >
                            {!isUser && (
                              <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                whileHover={{ boxShadow: '0 0 12px 4px rgba(0, 200, 255, 0.6)', scale: 1.05 }}
                                style={{ borderRadius: '50%' }}
                              >
                                <Avatar
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: 'grey.800',
                                    boxShadow: '0 0 8px 2px rgba(0, 200, 255, 0.3)',
                                  }}
                                  src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                                />
                              </motion.div>
                            )}

                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              style={{ maxWidth: '75%' }}
                            >
                              <Box
                                sx={{
                                  bgcolor: isUser ? 'primary.main' : theme.palette.background.paper,
                                  color: isUser ? '#fff' : theme.palette.text.primary,
                                  p: 1.5,
                                  borderRadius: 3,
                                  borderTopLeftRadius: isUser ? 12 : 0,
                                  borderTopRightRadius: isUser ? 0 : 12,
                                  boxShadow: 2,
                                  wordBreak: 'break-word',
                                }}
                              >
                                {item.message}
                              </Box>
                            </motion.div>

                            {isUser && (
                              <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                whileHover={{ boxShadow: '0 0 12px 4px rgba(0, 145, 255, 0.4)', scale: 1.05 }}
                                style={{ borderRadius: '50%' }}
                              >
                                <Avatar
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: 'primary.main',
                                    boxShadow: '0 0 8px 2px rgba(0, 145, 255, 0.2)',
                                  }}
                                  src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                                />
                              </motion.div>
                            )}
                          </Box>
                        </motion.div>
                      );
                    })}
                    {isAiResponsding && (
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <Avatar
                          src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                          sx={{ width: 32, height: 32 }}
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <Typography variant="body2">Thinking...</Typography>
                        </motion.div>
                      </Box>
                    )}
                    <div ref={messagesEndRef} />
                  </Box>
                </Box>

                {/* Chat Input */}
                <Box display="flex" gap={1} mt={2}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/^\s+/, '');
                    }}
                    onKeyDown={handleKeyPress}
                  />
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Button
                      disabled={isAiResponsding}
                      variant="contained"
                      onClick={handleSend}
                      sx={{ borderRadius: 5, px: 3 }}
                    >
                      Send
                    </Button>
                  </motion.div>
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </ThemeProvider>
    )}
    </>
  );
}
