import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { FaPaperPlane, FaUser, FaComments } from 'react-icons/fa6';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

function AdminChat() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);

  // 1. Fetch active rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/rooms`);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        setRooms(data);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 2. Setup socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    setSocket(newSocket);

    newSocket.on('receive_message', (incomingMsg) => {
      if (selectedRoom && incomingMsg.chatRoom === selectedRoom) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === incomingMsg._id);
          return exists ? prev : [...prev, incomingMsg];
        });
      }
      fetchRooms();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [selectedRoom]);

  // 3. Load conversation when room is selected
  const handleSelectRoom = async (roomId) => {
    setSelectedRoom(roomId);
    if (socket) {
      socket.emit('join_room', roomId);
    }

    try {
      const response = await fetch(`${API_URL}/chat/history/${roomId}`);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send reply
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedRoom || !socket) return;

    const msgPayload = {
      chatRoom: selectedRoom,
      sender: 'admin',
      senderName: 'Admin Support',
      senderId: 'admin',
      text: replyText.trim(),
    };

    socket.emit('send_message', msgPayload);
    setReplyText('');
  };

  return (
    <div className="legacy-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#ff5722' }}>
        💬 Customer Live Chat Dashboard
      </h2>

      <div className="admin-chat-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', height: '600px' }}>
        {/* Left Sidebar */}
        <div className="admin-chat-sidebar" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #ddd', overflowY: 'auto' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #eee', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Active Conversations ({rooms.length})</span>
            <button onClick={fetchRooms} style={{ background: 'none', border: 'none', color: '#ff5722', cursor: 'pointer', fontSize: '12px' }}>
              🔄 Refresh
            </button>
          </div>
          {rooms.length === 0 ? (
            <p style={{ padding: '16px', color: '#888', fontSize: '14px' }}>
              No active customer chats yet. Send a message from the user chat widget to test!
            </p>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => handleSelectRoom(room._id)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: selectedRoom === room._id ? '#fff3e0' : 'transparent',
                  borderLeft: selectedRoom === room._id ? '4px solid #ff5722' : 'none',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px' }}>
                  <FaUser style={{ color: '#ff5722' }} />
                  <span>{room.lastSender || 'Customer'}</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {room.lastMessage}
                </p>
                <span style={{ fontSize: '10px', color: '#a1a1a1' }}>
                  {new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Right Area */}
        <div className="admin-chat-main" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedRoom ? (
            <>
              <div style={{ padding: '16px', background: '#ff5722', color: '#fff', fontWeight: 'bold' }}>
                Chatting with: {rooms.find((r) => r._id === selectedRoom)?.lastSender || selectedRoom}
              </div>

              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9' }}>
                {messages.map((msg, idx) => (
                  <div
                    key={msg._id || idx}
                    style={{
                      alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.sender === 'admin' ? '#ff5722' : '#ffffff',
                      color: msg.sender === 'admin' ? '#ffffff' : '#333333',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      maxWidth: '70%',
                      border: msg.sender === 'admin' ? 'none' : '1px solid #e0e0e0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>
                      {msg.senderName}
                    </div>
                    <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
                    <span style={{ fontSize: '10px', opacity: 0.7, display: 'block', textAlign: 'right', marginTop: '4px' }}>
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendReply} style={{ display: 'flex', padding: '12px', borderTop: '1px solid #eee', background: '#fff' }}>
                <input
                  type="text"
                  placeholder="Type your reply to customer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #ccc', borderRadius: '20px', outline: 'none', marginRight: '8px' }}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  style={{ backgroundColor: '#ff5722', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FaPaperPlane /> Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
              <FaComments style={{ fontSize: '48px', color: '#ddd', marginBottom: '12px' }} />
              <p>Select a customer conversation from the left to start replying.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminChat;