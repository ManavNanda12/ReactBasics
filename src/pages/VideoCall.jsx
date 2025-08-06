import React, { useContext, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Button,
  Box,
  Grid,
  Card,
  Divider,
  Avatar,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HeaderContext } from '../layout/Header';
import io from 'socket.io-client';
import CommonMethods from '../common/CommonMethods';
import PersonIcon from '@mui/icons-material/Person';

// Socket instance (not auto-connected)
const socket = io(process.env.REACT_APP_SOCKET_URL, {
  autoConnect: false,
  auth: { token: localStorage.getItem("token") }
});

export default function VideoCall() {
  const { t } = useTranslation();
  const { currentTheme } = useContext(HeaderContext);
  const theme = createTheme({ palette: { mode: currentTheme } });

  const { getMethod } = CommonMethods();
  const loggedInUserId = localStorage.getItem("userId");
  const loggedInEmail = localStorage.getItem("email");

  const [userList, setUserList] = useState([]);
  const [joined, setJoined] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [callState, setCallState] = useState('idle'); // idle, calling, in-call
  const [incomingCall, setIncomingCall] = useState(null); // Store incoming call data

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const peerRef = useRef(null);
  const targetUserRef = useRef(null);
  const localStreamRef = useRef(null);
  const isInitiatorRef = useRef(false);

  // Generate consistent room ID from two user IDs
  const generateRoomId = (user1, user2) => {
    return [user1, user2].sort().join("-");
  };

  // Fetch users list excluding self
  const fetchUsers = async () => {
    try {
      const res = await getMethod(`${process.env.REACT_APP_API_URL}/users`);
      setUserList(res.data.filter(user => user.email !== loggedInEmail));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const setupConnection = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      if (localRef.current) {
        localRef.current.srcObject = stream;
      }

      // Create peer connection with ICE servers
      peerRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        peerRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerRef.current.ontrack = (event) => {
        console.log("📺 Received remote stream");
        if (remoteRef.current && event.streams[0]) {
          remoteRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerRef.current.onicecandidate = (event) => {
        if (event.candidate && targetUserRef.current) {
          console.log("🧊 Sending ICE candidate");
          socket.emit("ice-candidate", {
            target: targetUserRef.current,
            candidate: event.candidate,
          });
        }
      };

      // Handle connection state changes
      peerRef.current.onconnectionstatechange = () => {
        console.log("🔗 Connection state:", peerRef.current.connectionState);
        if (peerRef.current.connectionState === 'connected') {
          setCallState('in-call');
        } else if (peerRef.current.connectionState === 'failed') {
          console.log("❌ Connection failed, attempting restart");
          restartConnection();
        }
      };

    } catch (error) {
      console.error("❌ Error setting up connection:", error);
    }
  };

  const restartConnection = async () => {
    if (peerRef.current) {
      peerRef.current.restartIce();
    }
  };

  const startCall = async (user) => {
    if (!user || !user._id || !loggedInUserId) {
      console.warn("❌ Invalid user selected for call");
      return;
    }
    
    setSelectedUser(user);
    setCallState('calling');
    targetUserRef.current = user._id;
    isInitiatorRef.current = true;

    const roomId = generateRoomId(loggedInUserId, user._id);

    await setupConnection();
    
    if (!socket.connected) {
      socket.connect();
    }

    // Join room first
    socket.emit("join-room", roomId);
    
    // Then initiate call
    socket.emit("call-user", {
      target: user._id,
      callerName: localStorage.getItem("name") || "Someone",
      callerId: loggedInUserId,
    });

    setJoined(true);
  };

  const answerCall = async (callerId, callerName) => {
    console.log("📞 Answering call from:", callerName);
    setCallState('calling');
    targetUserRef.current = callerId;
    isInitiatorRef.current = false;
    
    const roomId = generateRoomId(loggedInUserId, callerId);
    
    await setupConnection();
    
    if (!socket.connected) {
      socket.connect();
    }
    
    socket.emit("join-room", roomId);
    socket.emit("call-answered", { callerId });
    setJoined(true);
  };

  const endCall = () => {
    // Close peer connection
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clear video elements
    if (localRef.current) {
      localRef.current.srcObject = null;
    }
    if (remoteRef.current) {
      remoteRef.current.srcObject = null;
    }

    // Reset state
    setCallState('idle');
    setJoined(false);
    setSelectedUser(null);
    targetUserRef.current = null;
    isInitiatorRef.current = false;

    // Notify other user
    if (targetUserRef.current) {
      socket.emit("call-ended", { target: targetUserRef.current });
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log("🔔 Notification permission granted");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!loggedInUserId) return;
    
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("register-user", loggedInUserId);

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [loggedInUserId]);

  useEffect(() => {
    if (!loggedInUserId) return;

    const handleUserJoined = async (data) => {
      const { userId, roomId } = data;
      console.log("🟢 User joined room:", userId, roomId);
      
      // Only create offer if you're the initiator
      if (isInitiatorRef.current && peerRef.current) {
        try {
          const offer = await peerRef.current.createOffer();
          await peerRef.current.setLocalDescription(offer);

          socket.emit("offer", {
            target: userId,
            sdp: offer,
          });
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      }
    };

    const handleOffer = async ({ sdp, caller }) => {
      console.log("📥 Received offer from:", caller);
      
      if (!peerRef.current) {
        console.log("No peer connection, setting up...");
        await setupConnection();
      }

      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);

        socket.emit("answer", {
          target: caller,
          sdp: answer,
        });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    };

    const handleAnswer = async ({ sdp }) => {
      console.log("✅ Received answer");
      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (candidate && peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    };

    const handleIncomingCall = ({ callerName, callerId }) => {
      console.log("📞 Incoming call from:", callerName, callerId);
      
      // Prevent notification loop - don't notify if already in a call
      if (callState !== 'idle') {
        console.log("Already in call, ignoring incoming call");
        return;
      }

      // Store incoming call data for dialog
      setIncomingCall({ callerName, callerId });

      if (Notification.permission === 'granted') {
        const notification = new Notification(`${callerName} is calling you`, {
          body: "Click to answer the call",
          icon: "../assets/images/bannerLogo.png",
          tag: `call-${callerId}`,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
          handleAcceptCall();
        };

        // Auto-close notification after 30 seconds
        setTimeout(() => notification.close(), 30000);
      }
    };

    const handleCallEnded = () => {
      console.log("📴 Call ended by remote user");
      endCall();
    };

    // Bind socket listeners
    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-ended", handleCallEnded);

    // Cleanup
    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-ended", handleCallEnded);
    };
  }, [loggedInUserId, callState]);

  // Handle incoming call actions
  const handleAcceptCall = () => {
    if (incomingCall) {
      answerCall(incomingCall.callerId, incomingCall.callerName);
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      // Optionally emit call-rejected event to backend
      socket.emit("call-rejected", { callerId: incomingCall.callerId });
      setIncomingCall(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          {t('videoCall') || 'Video Call'}
        </Typography>

        <Grid container spacing={3}>
          {/* Left - User List */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('availableUsers') || 'Available Users'}
              </Typography>
              <Divider />
              <Box mt={2} display="flex" flexDirection="column" gap={2}>
                {userList.map((user) => (
                  <Zoom in key={user._id}>
                    <Card
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        boxShadow: selectedUser?._id === user._id ? 6 : 1,
                        transition: '0.3s',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography fontWeight="medium">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => startCall(user)}
                        disabled={callState !== 'idle'}
                      >
                        {callState === 'calling' ? 'Calling...' : 
                         callState === 'in-call' ? 'In Call' : 
                         t('startCall') || 'Start Call'}
                      </Button>
                    </Card>
                  </Zoom>
                ))}
              </Box>
            </Card>
          </Grid>

          {/* Right - Video Area */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, borderRadius: 3 }}>
              {callState !== 'idle' && (
                <Box mb={2} textAlign="center">
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={endCall}
                    sx={{ mb: 2 }}
                  >
                    End Call
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Call Status: {callState}
                  </Typography>
                </Box>
              )}
              
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Typography variant="subtitle1" textAlign="center" gutterBottom>
                    {t('localVideo') || 'Local Video'}
                  </Typography>
                  <video
                    ref={localRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ 
                      width: '100%', 
                      maxWidth: '320px', 
                      borderRadius: '12px',
                      backgroundColor: '#000'
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1" textAlign="center" gutterBottom>
                    {t('remoteVideo') || 'Remote Video'}
                  </Typography>
                  <video
                    ref={remoteRef}
                    autoPlay
                    playsInline
                    style={{ 
                      width: '100%', 
                      maxWidth: '320px', 
                      borderRadius: '12px',
                      backgroundColor: '#000'
                    }}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>

        {/* Incoming Call Dialog */}
        <Dialog
          open={!!incomingCall}
          onClose={() => {}} // Prevent closing by clicking outside
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center' }}>
            📞 Incoming Call
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {incomingCall?.callerName || 'Unknown Caller'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              is calling you...
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleRejectCall}
              sx={{ minWidth: 100 }}
            >
              Decline
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleAcceptCall}
              sx={{ minWidth: 100 }}
            >
              Accept
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}