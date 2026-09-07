'use client';

import React, { useState, useEffect, useRef } from 'react';
import Shell from '@/components/Shell';
import { useCrm } from '@/context/CrmContext';
import {
  MessageSquare,
  Send,
  User,
  Users,
  Search,
  CheckCheck,
  Clock,
  Plus,
  X,
  Check,
  Hash,
  Sparkles,
  ShieldCheck,
  Info,
  Paperclip,
  FileText,
  Download,
} from 'lucide-react';

export default function MessagesPage() {
  const {
    currentUser,
    employees,
    messages,
    groups = [],
    sendMessage,
    getMessageAttachmentSignedUrl,
    createGroup,
    fetchConversationMessages,
    markConversationRead,
    markGroupRead,
    t,
  } = useCrm();

  // Active chat selection: { type: 'direct' | 'group', id: string }
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabFilter, setTabFilter] = useState('all'); // 'all' | 'direct' | 'groups'
  const fileInputRef = useRef(null);

  // Modals
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  // New Message Form State
  const [newMsgRecipientId, setNewMsgRecipientId] = useState('');
  const [newMsgContent, setNewMsgContent] = useState('');

  // Create Group Form State
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  const messagesEndRef = useRef(null);

  // Active team members (excluding current user for direct chat recipient choices)
  const activeEmployees = employees.filter((e) => e.status === 'Active');
  const otherActiveEmployees = activeEmployees.filter((e) => e.id !== currentUser?.id);

  // Default selection on initial load if none selected
  useEffect(() => {
    if (!selectedChat) {
      if (otherActiveEmployees.length > 0) {
        setSelectedChat({ type: 'direct', id: otherActiveEmployees[0].id });
      } else if (groups.length > 0) {
        setSelectedChat({ type: 'group', id: groups[0].id });
      }
    }
  }, [employees, groups]);

  // Fetch full conversation messages when selected chat changes
  useEffect(() => {
    if (selectedChat?.id && fetchConversationMessages) {
      fetchConversationMessages(selectedChat.id, selectedChat.type === 'group');
    }
  }, [selectedChat]);

  // Scroll to bottom of message thread on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat]);

  // Mark read when selecting chat
  const handleSelectChat = (type, id) => {
    setSelectedChat({ type, id });
    if (type === 'direct') {
      markConversationRead?.(id);
    } else if (type === 'group') {
      markGroupRead?.(id);
    }
  };

  // Get active chat messages
  const currentMessages = messages.filter((m) => {
    if (!selectedChat) return false;
    if (selectedChat.type === 'direct') {
      return (
        (m.senderId === currentUser?.id && m.recipientId === selectedChat.id) ||
        (m.senderId === selectedChat.id && (m.recipientId === currentUser?.id || !m.recipientId)) ||
        (m.conversationId && m.conversationId === selectedChat.id)
      );
    } else if (selectedChat.type === 'group') {
      return m.groupId === selectedChat.id || m.conversationId === selectedChat.id;
    }
    return false;
  });

  // Handle send message in active thread
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !attachmentFile) || !selectedChat) return;

    if (selectedChat.type === 'direct') {
      await sendMessage(selectedChat.id, messageText.trim(), false, attachmentFile);
    } else if (selectedChat.type === 'group') {
      await sendMessage(selectedChat.id, messageText.trim(), true, attachmentFile);
    }

    setMessageText('');
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle New Message Modal submission
  const handleCreateNewMessage = (e) => {
    e.preventDefault();
    if (!newMsgRecipientId || !newMsgContent.trim()) return;

    sendMessage(newMsgRecipientId, newMsgContent.trim(), false);
    setSelectedChat({ type: 'direct', id: newMsgRecipientId });
    setNewMsgContent('');
    setIsNewMessageModalOpen(false);
  };

  // Handle Create Group Modal submission
  const handleCreateNewGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMemberIds.length === 0) return;

    const newGrp = await createGroup(groupName.trim(), selectedMemberIds, groupDescription.trim());
    setGroupName('');
    setGroupDescription('');
    setSelectedMemberIds([]);
    setIsCreateGroupModalOpen(false);
    if (newGrp) {
      setSelectedChat({ type: 'group', id: newGrp.id });
    }
  };

  const toggleMemberSelection = (empId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  // Build unified conversation list items
  const directConversations = otherActiveEmployees.map((emp) => {
    const thread = messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.recipientId === emp.id) ||
        (m.senderId === emp.id && m.recipientId === currentUser.id)
    );
    const lastMsg = thread[thread.length - 1];
    const unreadCount = thread.filter(
      (m) => m.senderId === emp.id && m.recipientId === currentUser.id && !m.isRead
    ).length;

    return {
      type: 'direct',
      id: emp.id,
      name: emp.name,
      designation: emp.designation,
      department: emp.department,
      avatar: emp.avatar || emp.name.slice(0, 2).toUpperCase(),
      lastMessage: lastMsg?.text || 'No messages yet',
      lastTime: lastMsg?.time || '',
      unreadCount,
      timestamp: lastMsg?.timestamp || '1970-01-01',
    };
  });

  const groupConversations = groups.map((grp) => {
    const thread = messages.filter((m) => m.groupId === grp.id);
    const lastMsg = thread[thread.length - 1];
    const unreadCount = thread.filter(
      (m) => m.senderId !== currentUser.id && !m.isRead
    ).length;

    return {
      type: 'group',
      id: grp.id,
      name: grp.name,
      description: grp.description,
      memberCount: grp.memberIds?.length || 0,
      avatar: grp.avatar || 'GP',
      lastMessage: lastMsg ? `${lastMsg.senderName?.split(' ')[0]}: ${lastMsg.text}` : 'Group created',
      lastTime: lastMsg?.time || '',
      unreadCount,
      timestamp: lastMsg?.timestamp || grp.createdAt || '1970-01-01',
    };
  });

  // Filter conversations
  let allConversations = [];
  if (tabFilter === 'all') {
    allConversations = [...groupConversations, ...directConversations];
  } else if (tabFilter === 'direct') {
    allConversations = directConversations;
  } else if (tabFilter === 'groups') {
    allConversations = groupConversations;
  }

  if (searchTerm.trim()) {
    const query = searchTerm.toLowerCase();
    allConversations = allConversations.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.designation && c.designation.toLowerCase().includes(query)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(query))
    );
  }

  // Active chat metadata
  const activeRecipient =
    selectedChat?.type === 'direct'
      ? employees.find((e) => e.id === selectedChat.id)
      : null;

  const activeGroup =
    selectedChat?.type === 'group'
      ? groups.find((g) => g.id === selectedChat.id)
      : null;

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span>Internal Team Communication</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Direct 1-on-1 and group messaging across engineering, site operations, and management.
          </p>
        </div>

        {/* Action Buttons: New Message & Create Group */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setNewMsgRecipientId(otherActiveEmployees[0]?.id || '');
              setNewMsgContent('');
              setIsNewMessageModalOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Message</span>
          </button>

          <button
            onClick={() => {
              setGroupName('');
              setGroupDescription('');
              setSelectedMemberIds([]);
              setIsCreateGroupModalOpen(true);
            }}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* Two-Panel Chat Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs h-[calc(100vh-210px)] min-h-[580px] flex overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT PANEL: CONVERSATION LIST */}
        {/* ========================================================= */}
        <div className="w-full sm:w-80 md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/40 shrink-0">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-200 bg-white space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search team members or groups..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px] font-bold">
              <button
                onClick={() => setTabFilter('all')}
                className={`flex-1 py-1 text-center rounded-md transition-all ${
                  tabFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTabFilter('direct')}
                className={`flex-1 py-1 text-center rounded-md transition-all ${
                  tabFilter === 'direct' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Direct ({directConversations.length})
              </button>
              <button
                onClick={() => setTabFilter('groups')}
                className={`flex-1 py-1 text-center rounded-md transition-all ${
                  tabFilter === 'groups' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Groups ({groupConversations.length})
              </button>
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {allConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No conversations found.
              </div>
            ) : (
              allConversations.map((item) => {
                const isSelected =
                  selectedChat?.type === item.type && selectedChat?.id === item.id;

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelectChat(item.type, item.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-blue-50/90 border-l-4 border-blue-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    {/* Avatar / Group Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                        item.type === 'group'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {item.type === 'group' ? (
                        <Users className="w-4 h-4" />
                      ) : (
                        item.avatar
                      )}
                    </div>

                    {/* Metadata & Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                          {item.lastTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-[11px] text-slate-500 truncate font-medium">
                          {item.lastMessage}
                        </p>
                        {item.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {item.unreadCount}
                          </span>
                        )}
                      </div>

                      {item.type === 'group' && (
                        <span className="inline-block mt-1 px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold">
                          Group • {item.memberCount} members
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: ACTIVE CHAT VIEW */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChat ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-3.5 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${
                      selectedChat.type === 'group'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {selectedChat.type === 'group' ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      activeRecipient?.avatar || activeRecipient?.name.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedChat.type === 'group'
                          ? activeGroup?.name
                          : activeRecipient?.name}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online / Active"></span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {selectedChat.type === 'group'
                        ? `${activeGroup?.memberIds?.length || 0} Team Members • ${activeGroup?.description || 'Team Group'}`
                        : `${activeRecipient?.designation || 'Team Member'} • ${activeRecipient?.department || 'Operations'}`}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-medium hidden md:block">
                  Swaati Internal Secure Channel
                </div>
              </div>

              {/* Message History Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {currentMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                    <div className="font-bold text-slate-600">No messages in this conversation yet.</div>
                    <p className="text-slate-400">Say hello to start the discussion!</p>
                  </div>
                ) : (
                  currentMessages.map((m) => {
                    const isMe = m.senderId === currentUser.id;

                    return (
                      <div
                        key={m.id}
                        className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Received message avatar */}
                        {!isMe && (
                          <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mb-0.5">
                            {m.senderAvatar || m.senderName?.slice(0, 2).toUpperCase() || 'TM'}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                          }`}
                        >
                          {/* Group sender name tag on received messages */}
                          {!isMe && selectedChat.type === 'group' && (
                            <div className="text-[10px] font-bold text-indigo-600 pb-0.5">
                              {m.senderName}
                            </div>
                          )}

                          <div className="leading-relaxed font-medium whitespace-pre-wrap break-words">
                            {m.text}
                          </div>

                          {m.attachmentPath && (
                            <button
                              type="button"
                              onClick={async () => {
                                const signedUrl = await getMessageAttachmentSignedUrl(m.id);
                                if (signedUrl) {
                                  window.open(signedUrl, '_blank', 'noopener,noreferrer');
                                } else {
                                  alert('Attachment link could not be generated.');
                                }
                              }}
                              className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                                isMe
                                  ? 'bg-blue-700/80 hover:bg-blue-700 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                              }`}
                            >
                              <Paperclip className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[160px]">View Attachment</span>
                              <Download className="w-3 h-3 ml-1 opacity-70 shrink-0" />
                            </button>
                          )}

                          <div
                            className={`text-[10px] flex items-center justify-end gap-1 ${
                              isMe ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          >
                            <span>{m.time}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 px-6 border-t border-slate-200 bg-white flex flex-col gap-2"
              >
                {attachmentFile && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <span className="flex items-center gap-1.5 truncate">
                      <Paperclip className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{attachmentFile.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setAttachmentFile(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0 cursor-pointer"
                    title="Attach File (PDF, Image)"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={
                      selectedChat.type === 'group'
                        ? `Message ${activeGroup?.name || 'group'}...`
                        : `Message ${activeRecipient?.name || 'team member'}...`
                    }
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() && !attachmentFile}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Select a Team Member or Group
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-5">
                Choose a conversation from the left to start messaging, or click "New Message" above to initiate a new thread.
              </p>
              <button
                onClick={() => {
                  setNewMsgRecipientId(otherActiveEmployees[0]?.id || '');
                  setNewMsgContent('');
                  setIsNewMessageModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start New Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: NEW MESSAGE MODAL */}
      {/* ========================================================= */}
      {isNewMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Send New Message</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Initiate an internal chat with any team member.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewMessageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewMessage} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Select Team Member *</label>
                <select
                  value={newMsgRecipientId}
                  onChange={(e) => setNewMsgRecipientId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {otherActiveEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation} • {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Message Content *</label>
                <textarea
                  rows={4}
                  required
                  value={newMsgContent}
                  onChange={(e) => setNewMsgContent(e.target.value)}
                  placeholder="Type your message details here..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewMessageModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CREATE GROUP MODAL */}
      {/* ========================================================= */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Create Team Group</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Create a shared workspace channel for project teams or departments.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewGroup} className="p-6 space-y-4 text-xs flex-1 overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Group Name *</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Pune Metro Site Team or Waterproofing Sales"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Purpose / Description</label>
                <input
                  type="text"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Short description of this group's objective"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700">
                    Select Team Members * ({selectedMemberIds.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMemberIds.length === otherActiveEmployees.length) {
                        setSelectedMemberIds([]);
                      } else {
                        setSelectedMemberIds(otherActiveEmployees.map((e) => e.id));
                      }
                    }}
                    className="text-[11px] text-indigo-600 font-bold hover:underline"
                  >
                    {selectedMemberIds.length === otherActiveEmployees.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-52 overflow-y-auto bg-slate-50/50">
                  {otherActiveEmployees.map((emp) => {
                    const isChecked = selectedMemberIds.includes(emp.id);

                    return (
                      <div
                        key={emp.id}
                        onClick={() => toggleMemberSelection(emp.id)}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50/70' : 'hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                            {emp.avatar || emp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{emp.name}</div>
                            <div className="text-[10px] text-slate-500">{emp.designation} • {emp.department}</div>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Controlled by container onClick
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!groupName.trim() || selectedMemberIds.length === 0}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Create Group</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
