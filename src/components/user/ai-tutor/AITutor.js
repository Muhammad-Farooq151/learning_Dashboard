"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Divider,
  TextField,
  IconButton,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { greenColor, bggreen } from "@/utils/Colors";
import { getStoredUser } from "@/utils/authStorage";
import QuicActions from "./QuicActions";

function AITutor() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI tutor. I can help you with course summaries, generate quizzes, create learning paths, and answer questions about your courses. What would you like to learn about today?",
      sender: "ai",
      timestamp: "10:00 PM",
    },
  ]);
  // Check if chat has started (user has sent at least one message)
  const hasChatStarted = messages.length > 1;
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "Course Summary - Web Dev", active: true },
    { id: 2, title: "Create MCQs from...", active: false },
    { id: 3, title: "Quiz Practice - JavaScript", active: false },
  ]);
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const user = getStoredUser();

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (hasChatStarted) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message.trim(),
        sender: "user",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // Simulate AI response after a delay
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          text: "Learning is a continuous journey. Just like printing and typesetting evolved over centuries, education too adapts with time. What matters most is building knowledge step by step and applying it to solve real-world challenges.",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  // Initial view (before chat starts)
  if (!hasChatStarted) {
    return (
      <Box
        sx={{
          px: { xs: 2, md: 2 },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Quick Actions Section */}
        <QuicActions />

        {/* Chat Interface */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* Today Divider */}
          <Box sx={{ position: "relative", my: 3, flexShrink: 0 }}>
            <Divider />
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                px: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Today
              </Typography>
            </Box>
          </Box>

          {/* Chat Messages */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              mb: 3,
              minHeight: 0,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: "4px",
                "&:hover": {
                  background: "#a8a8a8",
                },
              },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="flex-start">
              {/* AI Message Bubble */}
              <Box
                sx={{
                  maxWidth: "70%",
                  bgcolor: "#F1F5F9",
                  borderRadius: 3,
                  p: 2.5,
                  position: "relative",
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  Hello! I&apos;m your AI tutor. I can help you with course summaries, generate
                  quizzes, create learning paths, and answer questions about your courses. What
                  would you like to learn about today?
                </Typography>
              </Box>
              {/* AI Avatar */}
              <Avatar
                sx={{
                  bgcolor: greenColor,
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                }}
              >
                AI
              </Avatar>
            </Stack>

            {/* Timestamp */}
            <Box sx={{ display: "flex", justifyContent: "flex-start", pl: 7, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                10:00 PM
              </Typography>
            </Box>
          </Box>

          {/* Message Input - Fixed at Bottom */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "background.paper",
              borderRadius: 3,
              border: "1px solid #EDF1F7",
              p: 1,
              flexShrink: 0,
              position: "sticky",
              bottom: 0,
              zIndex: 10,
            }}
          >
            <IconButton
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
              }}
            >
              <AddIcon />
            </IconButton>
            <TextField
              fullWidth
              placeholder="Write Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="standard"
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  py: 1,
                  fontSize: "0.9375rem",
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!message.trim()}
              sx={{
                bgcolor: greenColor,
                color: "white",
                width: 40,
                height: 40,
                "&:hover": {
                  bgcolor: "#3DA882",
                },
                "&.Mui-disabled": {
                  bgcolor: "#E0E0E0",
                  color: "#9E9E9E",
                },
              }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  }

  // Chat view (after first message)
  return (
    <Box
      sx={{
        display: "flex",
        height: "90vh",
        my:2,
        minHeight: "90vh",
        overflow: "hidden",
      }}
    >
      {/* Left Sidebar - Chat History (17%) */}
      <Box
        sx={{
          width: "20%",
          bgcolor: "#329D7B",
          display: "flex",
          borderRadius:"14px",
          flexDirection: "column",
          height: "90vh",
        }}
      >
        {/* New Chat Button */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            startIcon={<EditOutlinedIcon sx={{ color: "white" }} />}
            sx={{
              bgcolor: "rgba(229, 255, 247, 0.2)",
              color: "white",
              textTransform: "none",
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#D0F5E8",
              },
            }}
            onClick={() => {
              setMessages([
                {
                  id: 1,
                  text: "Hello! I'm your AI tutor. I can help you with course summaries, generate quizzes, create learning paths, and answer questions about your courses. What would you like to learn about today?",
                  sender: "ai",
                  timestamp: "10:00 PM",
                },
              ]);
            }}
          >
            New Chat
          </Button>
        </Box>

        {/* Chat History */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "white", fontWeight: 600, mb: 1, px: 1 }}
          >
            Chat History
          </Typography>
          <List sx={{ p: 0 }}>
            {chatHistory.map((chat) => (
              <ListItem key={chat.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    bgcolor: chat.active ? "white" : "transparent",
                    color: chat.active ? "black" : "white",
                    py: 1.5,
                    "&:hover": {
                      bgcolor: chat.active ? bggreen : "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                    {chat.title}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Right Side - Main Chat Area (83%) */}
      <Box
        sx={{
          width: "80%",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          height: "90vh",
          position: "relative",
        }}
      >
        {/* Today Divider */}
        <Box sx={{ position: "relative", my: 3, flexShrink: 0, px: 3 }}>
          <Divider />
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              px: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Today
            </Typography>
          </Box>
        </Box>

        {/* Chat Messages */}
        <Box
          ref={messagesContainerRef}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: 3,
            pb: 2,
            minHeight: 0,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: "4px",
              "&:hover": {
                background: "#a8a8a8",
              },
            },
          }}
        >
          <Stack spacing={3}>
            {messages.map((msg) => (
              <Box key={msg.id}>
                {msg.sender === "ai" ? (
                  // AI Message (Left-aligned)
                  <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="flex-start">
                    <Box
                      sx={{
                        maxWidth: "70%",
                        bgcolor: "#F1F5F9",
                        borderRadius: 3,
                        p: 2.5,
                      }}
                    >
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {msg.text}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: greenColor,
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                      }}
                    >
                      AI
                    </Avatar>
                  </Stack>
                ) : (
                  // User Message (Right-aligned)
                  <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="flex-end">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        bgcolor: "#E0E0E0",
                      }}
                    >
                      {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>
                    <Box
                      sx={{
                        maxWidth: "70%",
                        bgcolor: "white",
                        borderRadius: 3,
                        p: 2.5,
                        border: "1px solid #EDF1F7",
                      }}
                    >
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {msg.text}
                      </Typography>
                    </Box>
                  </Stack>
                )}
                {/* Timestamp */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: msg.sender === "ai" ? "flex-start" : "flex-end",
                    pl: msg.sender === "ai" ? 7 : 0,
                    pr: msg.sender === "user" ? 7 : 0,
                    mt: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(msg.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ))}
            <div ref={chatEndRef} />
          </Stack>
        </Box>

        {/* Message Input - Fixed at Bottom */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "background.paper",
            borderRadius: 3,
            border: "1px solid #EDF1F7",
            p: 1,
            mx: 3,
            mb: 2,
            flexShrink: 0,
            position: "sticky",
            bottom: 0,
            zIndex: 10,
          }}
        >
          <IconButton
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
            }}
          >
            <AddIcon />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Write Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              "& .MuiInputBase-input": {
                py: 1,
                fontSize: "0.9375rem",
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{
              bgcolor: greenColor,
              color: "white",
              width: 40,
              height: 40,
              "&:hover": {
                bgcolor: "#3DA882",
              },
              "&.Mui-disabled": {
                bgcolor: "#E0E0E0",
                color: "#9E9E9E",
              },
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default AITutor;

