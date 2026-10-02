import { useState, useEffect, useRef } from 'react';
import { FaHeadset, FaXmark, FaPaperPlane } from 'react-icons/fa6';
import { io } from 'socket.io-client';
import "../styles/Chat.css";

function getChatRoomId(user) {
  if (user?._id) return `user_${user._id}`;
  if (user?.id) return `user_${user.id}`;

  let guestId = localStorage.getItem('comeagain_guest_chat_id');
  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    localStorage.setItem('comeagain_guest_chat_id', guestId);
  }
  return guestId;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

function ChatWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const chatBottomRef = useRef(null);

  const chatRoom = getChatRoomId(user);
  const senderName = user?.username || 'Guest';
  const senderId = user?._id || user?.id || chatRoom;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/chat/history/${chatRoom}`);
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    loadHistory();
  }, [chatRoom]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', chatRoom);
    });

    newSocket.on('receive_message', (incomingMsg) => {
      if (incomingMsg.chatRoom === chatRoom) {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              m._id === incomingMsg._id ||
              (m.text === incomingMsg.text &&
                m.sender === incomingMsg.sender &&
                Math.abs(new Date(m.createdAt) - new Date(incomingMsg.createdAt)) < 3000)
          );
          if (isDuplicate) return prev;
          return [...prev, incomingMsg];
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [chatRoom]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msgText = message.trim();
    setMessage('');

    const tempMessage = {
      _id: `temp_${Date.now()}`,
      chatRoom,
      sender: 'user',
      senderName,
      senderId,
      text: msgText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    if (socket) {
      socket.emit('send_message', {
        chatRoom,
        sender: 'user',
        senderName,
        senderId,
        text: msgText,
      });
    }
  };

  return (
    <div className="chat-widget-container">
      <button
        className="chat-widget-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Customer Support"
      >
        {isOpen ? <FaXmark /> : <FaHeadset />}
        {!isOpen && <span className="online-dot" />}
      </button>

      {isOpen && (
        <div className="chat-widget-box">
          <div className="chat-widget-header">
            <div className="chat-widget-header-info">
              <div>
                <h3>💬 Customer Support</h3>
                <span>We typically reply in a few minutes</span>
              </div>
            </div>
            <button
              className="chat-widget-close"
              onClick={() => setIsOpen(false)}
              title="Close Chat"
            >
              <FaXmark />
            </button>
          </div>

          <div className="chat-widget-messages">
            {messages.length === 0 ? (
              <div className="empty-rooms">
                👋 Hi {senderName}! How can we help you today?
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`chat-widget-bubble ${
                    msg.sender === 'user' ? 'user' : 'support'
                  }`}
                >
                  <p className="chat-text" style={{ margin: 0 }}>{msg.text}</p>
                  <span className="widget-time">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                      [],
                      { hour: '2-digit', minute: '2-digit' }
                    )}
                  </span>
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          <form className="chat-widget-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" disabled={!message.trim()}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;