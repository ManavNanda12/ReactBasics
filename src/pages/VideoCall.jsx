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

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const peerRef = useRef(null);
  const targetUserRef = useRef(null);

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
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localRef.current.srcObject = stream;

    peerRef.current = new RTCPeerConnection();

    stream.getTracks().forEach(track => {
      peerRef.current.addTrack(track, stream);
    });

    peerRef.current.ontrack = (event) => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = event.streams[0];
      }
    };

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate && targetUserRef.current) {
        socket.emit("ice-candidate", {
          target: targetUserRef.current,
          candidate: event.candidate,
        });
      }
    };
  };

  const startCall = async (user) => {
    if (!user || !user._id || !user.email || !loggedInUserId) {
      console.warn("❌ Invalid user selected for call");
      return;
    }
    

    setSelectedUser(user);
    targetUserRef.current = user._id;

    const roomId = generateRoomId(loggedInUserId, user._id);

    await setupConnection();
    socket.connect();

    socket.emit("join-room", roomId);
    setJoined(true);
  };

  useEffect(() => {
    if (!joined) return;

    const handleUserJoined = async (userId) => {
      console.log("🟢 New user joined:", userId);
      targetUserRef.current = userId;

      // Only the one with lower socket ID sends offer
      if (socket.id < userId) {
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);

        socket.emit("offer", {
          target: userId,
          sdp: offer,
        });
      }
    };

    const handleOffer = async ({ sdp, caller }) => {
      console.log("📥 Received offer from:", caller);
      targetUserRef.current = caller;

      if (!peerRef.current) await setupConnection();
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socket.emit("answer", {
        target: caller,
        sdp: answer,
      });
    };

    const handleAnswer = async ({ sdp }) => {
      console.log("✅ Received answer");
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (candidate) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.disconnect();
    };
  }, [joined]);

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
                      >
                        {t('startCall') || 'Start Call'}
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
                    style={{ width: '100%', maxWidth: '320px', borderRadius: '12px' }}
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
                    style={{ width: '100%', maxWidth: '320px', borderRadius: '12px' }}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
