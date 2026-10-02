import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaHouse, FaPaperPlane, FaRotateRight, FaUser, FaXmark } from 'react-icons/fa6';
import { io } from 'socket.io-client';
import "../styles/Chat.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

const getRoomId = (room) => room?.chatRoom || room?.roomId || room?._id || room?.id;

const checkIsAdmin = (msg) => {
  if (!msg) return false;
  const sender = String(msg.sender || '').toLowerCase();
  const senderName = String(msg.senderName || '').toLowerCase();
  return (
    sender === 'admin' ||
    sender === 'support' ||
    senderName.includes('admin') ||
    senderName.includes('support')
  );
};

function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [socket, setSocket] = useState(null);
  const chatBottomRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/chat/rooms`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    setSocket(newSocket);

    newSocket.on('receive_message', (incomingMsg) => {
      fetchConversations();
      const msgRoomId = getRoomId(incomingMsg);
      setMessages((prev) => {
        if (msgRoomId === selectedRoom) {
          const isDup = prev.some((m) => m._id === incomingMsg._id);
          if (isDup) return prev;
          return [...prev, incomingMsg];
        }
        return prev;
      });
    });

    return () => newSocket.disconnect();
  }, [selectedRoom]);

  const handleSelectRoom = async (room) => {
    const roomId = getRoomId(room);
    if (!roomId) return;

    setSelectedRoom(roomId);
    try {
      const res = await fetch(`${API_URL}/chat/history/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching room history:', err);
    }

    if (socket) {
      socket.emit('join_room', roomId);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedRoom) return;

    const text = replyText.trim();
    setReplyText('');

    const tempMsg = {
      _id: `temp_${Date.now()}`,
      chatRoom: selectedRoom,
      sender: 'admin',
      senderName: 'Admin Support',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    if (socket) {
      socket.emit('send_message', {
        chatRoom: selectedRoom,
        sender: 'admin',
        senderName: 'Admin Support',
        text,
      });
    }
  };

  const selectedRoomDetails = conversations.find((c) => getRoomId(c) === selectedRoom);

  return (
    <div className="admin-chat-page">
      {/* Top Header Bar */}
      <div className="admin-chat-header">
        <div className="admin-chat-title">
          <h2>💬 Customer Live Chat</h2>
        </div>
        <div className="admin-chat-actions">
          <button onClick={fetchConversations} className="btn-refresh" title="Refresh Conversations">
            <FaRotateRight /> <span>Refresh</span>
          </button>
          <Link to="/" className="btn-home" title="Go to Homepage">
            <FaHouse /> <span>Home</span>
          </Link>
        </div>
      </div>

      <div className={`admin-chat-container ${selectedRoom ? 'has-selected' : ''}`}>
        {/* Sidebar Conversation List */}
        <div className="admin-chat-sidebar">
          <div className="sidebar-header">
            <h3>Active Conversations ({conversations.length})</h3>
          </div>
          <div className="conversation-list">
            {conversations.length === 0 ? (
              <div className="empty-rooms">No active customer chats yet.</div>
            ) : (
              conversations.map((room, index) => {
                const roomId = getRoomId(room);
                const isActive = Boolean(selectedRoom && selectedRoom === roomId);
                return (
                  <div
                    key={roomId || `room-${index}`}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectRoom(room)}
                  >
                    <div className="user-avatar">
                      <FaUser />
                    </div>
                    <div className="user-info">
                      <h4>{room.senderName || room.userName || 'Customer'}</h4>
                      <p className="last-msg">{room.lastMessage || 'Click to view messages'}</p>
                    </div>
                    {room.updatedAt && (
                      <span className="msg-time">
                        {new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Message Panel */}
        <div className="admin-chat-main">
          {selectedRoom ? (
            <>
              <div className="chat-main-header">
                <div className="chat-user-details">
                  <h3>{selectedRoomDetails?.senderName || selectedRoomDetails?.userName || 'Customer'}</h3>
                  <span className="room-id">{selectedRoom}</span>
                </div>
                <button
                  className="btn-close-chat"
                  onClick={() => setSelectedRoom(null)}
                  title="Close conversation"
                  aria-label="Close conversation"
                >
                  <FaXmark />
                </button>
              </div>

              <div className="admin-chat-messages">
                {messages.map((msg, index) => {
                  const isAdmin = checkIsAdmin(msg);
                  return (
                    <div
                      key={msg._id || msg.id || `msg-${index}`}
                      className={`chat-bubble ${isAdmin ? 'admin' : 'customer'}`}
                    >
                      <span className="sender-label">
                        {isAdmin ? 'You (Support)' : msg.senderName || 'Customer'}
                      </span>
                      <p className="chat-text">{msg.text}</p>
                      <span className="chat-time">
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              <form className="admin-chat-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" disabled={!replyText.trim()}>
                  <FaPaperPlane /> <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="no-room-selected">
              <p>👈 Select a customer conversation from the list to reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminChat;