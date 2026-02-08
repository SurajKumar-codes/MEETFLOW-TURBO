"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, MoreHorizontal, Send, Smile, Paperclip, Mic, Check, CheckCheck, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
  isOnline?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  time: string;
  isMe: boolean;
  status?: "sent" | "delivered" | "read";
}

// Sample contacts data
const sampleContacts: Contact[] = [
  {
    id: "1",
    name: "Calvin Verdonk",
    username: "@calvin",
    avatar: "https://i.pravatar.cc/150?img=11",
    lastMessage: "Thankyou 😊",
    time: "09:00",
    unread: 2,
    isOnline: true,
  },
  {
    id: "2",
    name: "Van Der Sar",
    username: "@vandersar",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Hi madonna, can i invite you?",
    time: "09:00",
    unread: 1,
  },
  {
    id: "3",
    name: "Windu Bakhtiar",
    username: "@windu",
    avatar: "https://i.pravatar.cc/150?img=13",
    lastMessage: "wkwkwk",
    time: "09:00",
    unread: 2,
    isOnline: true,
  },
  {
    id: "4",
    name: "Sofa Marwa",
    username: "@sofa",
    avatar: "https://i.pravatar.cc/150?img=14",
    lastMessage: "You: Ok, you're welcome",
    time: "09:00",
  },
  {
    id: "5",
    name: "Aisyiyah",
    username: "@aisyiyah",
    avatar: "https://i.pravatar.cc/150?img=15",
    lastMessage: "Hahaha",
    time: "09:00",
  },
  {
    id: "6",
    name: "Nicky Milanisty",
    username: "@nicky",
    avatar: "https://i.pravatar.cc/150?img=16",
    lastMessage: "What?",
    time: "09:00",
    unread: 2,
  },
  {
    id: "7",
    name: "Bruce Banner",
    username: "@brucebanner",
    avatar: "https://i.pravatar.cc/150?img=17",
    lastMessage: "Ya, im understand",
    time: "09:00",
    isOnline: true,
  },
  {
    id: "8",
    name: "Nita Kelly",
    username: "@nita",
    avatar: "https://i.pravatar.cc/150?img=18",
    lastMessage: "You: Yes, am in",
    time: "09:00",
  },
  {
    id: "9",
    name: "Harry Potter",
    username: "@harry",
    avatar: "https://i.pravatar.cc/150?img=19",
    lastMessage: "Wingardium Leviosa",
    time: "09:00",
  },
  {
    id: "10",
    name: "Hermione Granger",
    username: "@hermione",
    avatar: "https://i.pravatar.cc/150?img=20",
    lastMessage: "You have a choice madonna",
    time: "09:00",
  },
];

// Sample messages for selected chat
const sampleMessages: Message[] = [
  {
    id: "1",
    senderId: "me",
    content: "Hi Bruce, are you understand what bastian said?",
    time: "09:00",
    isMe: true,
    status: "read",
  },
  {
    id: "2",
    senderId: "7",
    content: "Ya, im understand",
    time: "09:01",
    isMe: false,
  },
  {
    id: "3",
    senderId: "me",
    content: "Can you tell me what a meaning component at design system?",
    time: "09:02",
    isMe: true,
    status: "read",
  },
  {
    id: "4",
    senderId: "7",
    content:
      "component is a reusable element that you create once and can use multiple times across your design. Components help maintain consistency and efficiency by allowing you to make changes in one place that automatically update all instances where the component is used.",
    time: "09:03",
    isMe: false,
  },
  {
    id: "5",
    senderId: "me",
    content: "Aaa,,, i see, thankyou bruce 👍",
    time: "09:05",
    isMe: true,
    status: "delivered",
  },
];

function ContactItem({
  contact,
  isSelected,
  onClick,
}: {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
        isSelected 
          ? "bg-zinc-800" 
          : "hover:bg-zinc-800/50"
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {contact.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
        )}
      </div>
      <div className="flex-1 min-w-0 border-b border-zinc-800/50 pb-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-white text-[15px] truncate">{contact.name}</h3>
          <span className={`text-xs flex-shrink-0 ${contact.unread ? "text-primary" : "text-zinc-500"}`}>
            {contact.time}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-sm text-zinc-400 truncate">
            {contact.lastMessage}
          </p>
          {contact.unread && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] text-white font-medium">{contact.unread}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.isMe ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`relative max-w-[65%] ${
          message.isMe
            ? "bg-primary text-white rounded-lg rounded-tr-none"
            : "bg-zinc-800 text-white rounded-lg rounded-tl-none"
        } px-3 py-2 shadow-sm`}
      >
        {/* WhatsApp-style tail */}
        {message.isMe ? (
          <div className="absolute top-0 -right-2 w-0 h-0 border-t-[8px] border-t-primary border-l-[8px] border-l-transparent" />
        ) : (
          <div className="absolute top-0 -left-2 w-0 h-0 border-t-[8px] border-t-zinc-800 border-r-[8px] border-r-transparent" />
        )}
        
        <p className="text-[14.5px] leading-[19px] pr-14">{message.content}</p>
        
        {/* Time and status */}
        <div className={`absolute bottom-1.5 right-2 flex items-center gap-1`}>
          <span className={`text-[11px] ${message.isMe ? "text-white/70" : "text-zinc-500"}`}>
            {message.time}
          </span>
          {message.isMe && (
            <span className="text-white/70">
              {message.status === "read" ? (
                <CheckCheck className="h-4 w-4 text-blue-400" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(
    sampleContacts.find((c) => c.id === "7") || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredContacts = sampleContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sampleMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh)] flex overflow-hidden">
      {/* Left - Contacts List */}
      <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] flex-shrink-0 bg-zinc-900 flex-col border-r border-zinc-800`}>
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between bg-zinc-800/50">
          <h1 className="text-lg font-semibold text-white">Chats</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-700">
              <Plus className="h-5 w-5" />
            </button>
            <button className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-700">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-zinc-900">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-zinc-800 border-0 text-white placeholder:text-zinc-500 text-sm rounded-lg focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredContacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              isSelected={selectedContact?.id === contact.id}
              onClick={() => setSelectedContact(contact)}
            />
          ))}
        </div>
      </div>

      {/* Right - Chat Area */}
      <div className={`${selectedContact ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-zinc-950 overflow-hidden`}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="h-14 px-2 md:px-4 bg-zinc-800/50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="relative">
                  <img
                    src={selectedContact.avatar}
                    alt={selectedContact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedContact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-zinc-800" />
                  )}
                </div>
                <div>
                  <h2 className="font-medium text-white text-[15px]">{selectedContact.name}</h2>
                  <p className="text-xs text-zinc-400">
                    {selectedContact.isOnline ? "online" : "last seen today at 09:00"}
                  </p>
                </div>
              </div>
              <button className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-700">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area - WhatsApp style background */}
            <div 
              className="flex-1 overflow-y-auto px-4 md:px-16 py-4 scrollbar-hide"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23262626' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#0a0a0a',
              }}
            >
              {/* Date Separator */}
              <div className="flex items-center justify-center mb-4">
                <span className="text-xs text-zinc-400 bg-zinc-800 px-3 py-1 rounded-md shadow-sm">
                  TODAY
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-1">
                {sampleMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input - WhatsApp style */}
            <div className="px-2 md:px-4 py-2 md:py-3 bg-zinc-800/50 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-1 md:gap-2">
                <button
                  type="button"
                  className="hidden sm:block p-2.5 text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  <Smile className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  className="p-2 md:p-2.5 text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  <Paperclip className="h-5 w-5 md:h-6 md:w-6" />
                </button>
                <div className="flex-1">
                  <Input
                    placeholder="Type a message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="h-10 bg-zinc-700 border-0 text-white placeholder:text-zinc-400 text-[15px] rounded-lg focus-visible:ring-0"
                  />
                </div>
                {newMessage.trim() ? (
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-primary hover:bg-primary/90 rounded-full h-10 w-10"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                ) : (
                  <button
                    type="button"
                    className="p-2.5 text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    <Mic className="h-6 w-6" />
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-zinc-900">
            <div className="text-center px-4">
              <div className="w-48 h-48 md:w-72 md:h-72 mx-auto mb-4 md:mb-6 opacity-20">
                <svg viewBox="0 0 303 172" fill="currentColor" className="text-zinc-500">
                  <path d="M229.565 160.229c32.647-25.56 50.025-61.024 50.025-97.046 0-34.357-18.998-68.266-52.167-93.183l-.363.303c32.475 24.507 51.03 57.708 51.03 91.38 0 35.48-17.1 70.424-49.525 95.546z" />
                  <path d="M201.244 65.163c-8.42-3.836-18.196-5.927-28.39-5.927-13.316 0-26.09 3.343-36.792 9.672-10.703 6.328-19.024 15.318-24.024 25.967-4.999 10.65-6.524 22.234-4.405 33.468 2.12 11.234 7.76 21.714 16.289 30.276 8.529 8.562 19.36 14.869 31.265 18.216 11.904 3.347 24.661 3.602 36.832.737 12.17-2.865 23.401-8.722 32.412-16.912 9.01-8.19 15.466-18.428 18.637-29.58l-34.494-9.918c-2.21 7.775-6.716 14.915-13.012 20.596-6.296 5.681-14.105 9.766-22.526 11.79-8.42 2.024-17.29 1.918-25.597-.305-8.307-2.224-15.898-6.538-21.913-12.449-6.014-5.911-10.269-13.226-12.278-21.118-2.009-7.892-1.708-16.2.87-23.99 2.577-7.79 7.297-14.871 13.623-20.429 6.326-5.558 14.046-9.416 22.27-11.135 8.224-1.718 16.82-1.241 24.803 1.378l27.43-10.837z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-zinc-300 mb-2">
                MeetFlow Web
              </h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                Send and receive messages without keeping your phone online.
                <br />
                Use MeetFlow on up to 4 linked devices and 1 phone at the same time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
