'use client'

import React, { useState, useEffect, useRef } from "react";
import { apiService } from "../../service/api";
import { authService } from "../../service/auth";

interface Prompt {
  topic: string;
  name: string;
  category: string;
  author: string
}

interface Response {
  success: boolean;
  data: string;
}

interface Library {
  _id: string;
  name: string;
  address: string;
  category?: string;
  Created_By?: { username: string; _id?: string; id?: string };
}

interface ChatMessage {
  name?: string;
  category?: string;
  library?: string;
  disciption?: string
  [key: string]: any;
}

interface ApiData {
  name?: string;
  category?: string;
  library?: string;
}

const Loading = () => {
  return (
    <div className="dashboard-loading">
      <div className="spinner"></div>
      <style jsx>{`
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 5px;
          color: #fff;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: #000000;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Prompt>({
    topic: '',
    name: '',
    category: '',
    author: ''
  });

  const [user, setUser] = useState<any>(null);
  const [userLibraries, setUserLibraries] = useState<Library[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [uploadingIndices, setUploadingIndices] = useState<Set<number>>(new Set());
  const [uploadedIndices, setUploadedIndices] = useState<Set<number>>(new Set());
  let parsedData: any;

  useEffect(() => {
    const fetchedUser = authService.getCurrentUser();
    if (fetchedUser) {
      setUser(fetchedUser);
      fetchUserLibraries(fetchedUser._id, fetchedUser);
    }
  }, []);

  useEffect(() => {
    if (resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchUserLibraries = async (userId: string, userObject: any) => {
    try {
      const res = await apiService.getLibraries();
      const libraries = Array.isArray(res) ? res : (res.result || []);

      const userLibs = userId
        ? libraries.filter((lib: Library) => {
          const createdBy = lib.Created_By as any;
          if (!createdBy) return false;
          const createdById = createdBy.id || createdBy._id;
          const createdByUsername = createdBy.username || createdBy.Username;

          return (
            String(createdById) === String(userId) ||
            createdByUsername === userObject.username
          );
        })
        : libraries;

      setUserLibraries(userLibs);
    } catch (error) {
      console.error(error);
    }
  };

  const getRes = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSendLoading(true);
      const res = await apiService.getRes(formData);
      // console.log(res);
      
      if (res && res.data) {
        const lastLibrary = userLibraries.length > 0
          ? userLibraries[userLibraries.length - 1]
          : { _id: "Default Library" };

        const dataChunks = res.data.split('{}');

        dataChunks.forEach((chunk: string) => {
          try {
            const listData = chunk.split('\n');
            if (listData.length >= 6) {
              const jsonString = `${listData[1]} ${listData[2]} ${listData[3]} ${listData[4]} "library": "${lastLibrary._id}"}`;

              parsedData = JSON.parse(jsonString);
              console.log(parsedData);

              setMessages((prev) => [...prev, parsedData]);
            }
          } catch (parseError) {
            console.error("Error parsing chunk", parseError);
          }
        });
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setSendLoading(false);
    }
  };

  const uploadSugestion = async (data: ApiData, index: number) => {
    setUploadingIndices(prev => new Set(prev).add(index));
    try {
      const uploadedBook = await apiService.createBook(data);
      if (uploadedBook) {
        setUploadedIndices(prev => new Set(prev).add(index));
      }
      console.log(uploadedBook);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingIndices(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  return (
    <>
      <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
        <div className="chat-header" onClick={() => setIsOpen(!isOpen)}>
          <h3>Assistant</h3>
          <button type="button" className="toggle-btn">
            {isOpen ? '−' : '+'}
          </button>
        </div>

        {isOpen && (
          <div className="chat-body">
            <div className="messages-area">
              {messages.length === 0 && (
                <div className="empty-state">
                  <p>Ask a question to generate a response.</p>
                </div>
              )}

              {messages.map((msg, index) => {
                const isUploading = uploadingIndices.has(index);
                const isUploaded = uploadedIndices.has(index);

                return (
                  <div key={index} className="message-card">
                    <div className="message-title">{msg.name || "Result"}</div>
                    <div className="message-desc">{msg.category || "No details provided"}</div>
                    <div className="message-desc">{ msg.author || "no" }</div>
                    <button
                      className={`cta-btn ${isUploaded ? 'uploaded' : ''}`}
                      onClick={() => uploadSugestion(msg, index)}
                      disabled={isUploading || isUploaded}
                    >
                      {isUploading ? <Loading /> : isUploaded ? '✓ Uploaded' : 'Upload'}
                    </button>
                  </div>
                );
              })}
              <div ref={resultsEndRef} />
            </div>

            <form onSubmit={getRes} className="chat-form">
              <div className="input-row">
                <input
                  className="chat-input half"
                  placeholder="Name"
                  value={formData.name}
                  name="name"
                  onChange={handleChange}
                />
                <input
                  className="chat-input half"
                  placeholder="Category"
                  value={formData.category}
                  name="category"
                  onChange={handleChange}
                />
              </div>
              <input
                  className="chat-input medium"
                  placeholder="Author"
                  value={formData.author}
                  name="author"
                  onChange={handleChange}
                />
              <textarea
                className="chat-input full"
                name="topic"
                required
                placeholder="What would you like to discuss?"
                value={formData.topic}
                onChange={handleChange}
                rows={2}
              />

              <button
                type="submit"
                className="submit-btn"
                disabled={sendLoading || !formData.topic.trim()}
              >
                {sendLoading ? <Loading /> : 'Send'}
              </button>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        .chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          background: #0d1117;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          z-index: 9999;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .chat-widget:not(.open) {
          width: 60px;
          height: 60px;
          border-radius: 30px;
          cursor: pointer;
        }

        .chat-header {
          background: #161b22;
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .cta-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #58a6ff, #238636);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          margin: 0 auto;
          transition: all 0.2s;
        }

        .cta-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-2px);
        }

        .cta-btn:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .cta-btn.uploaded {
          background: linear-gradient(90deg, #22c55e, #16a34a);
          opacity: 1;
        }

        .chat-widget:not(.open) .chat-header {
          padding: 0;
          width: 100%;
          height: 100%;
          justify-content: center;
        }

        .chat-widget:not(.open) .chat-header h3 {
          display: none;
        }

        .chat-widget:not(.open) .toggle-btn {
          font-size: 24px;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .chat-body {
          display: flex;
          flex-direction: column;
          height: 500px;
          max-height: 70vh;
        }

        .messages-area {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          background: #0d1117;
        }

        .empty-state {
          text-align: center;
          color: #94a3b8;
          margin-top: 40px;
          font-size: 14px;
        }

        .message-card {
          background: #161b22;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 10px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          display:flex;
          align-item:center;
          justify-content:center;
          flex-direction:column;
          gap:5px
        }

        .message-title {
          font-weight: 600;
          color: #d3d3d3;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .message-desc {
          color: #64748b;
          font-size: 13px;
        }

        .chat-form {
          padding: 15px;
          border-top: 1px solid #2563eb;
          background: #0d1117;
        }

        .input-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .chat-input {
          padding: 10px;
          border: 1px solid #2563eb;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }

        .chat-input:focus {
          border-color: #2563eb;
        }

        .half {
          width: 50%;
          color: #a0a0a0;
          background-color: #0d1117;
        }

        .full {
          width: 100%;
          resize: none;
          margin-bottom: 10px;
          color: #a0a0a0;
          background-color: #0d1117;
        }

        .chat-widget {
          flex: 1;
          padding: 24px 0;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }

        .chat-widget::-webkit-scrollbar { width: 6px; }
        .chat-widget::-webkit-scrollbar-track { background: transparent; }
        .chat-widget::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .chat-widget::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .medium {
          width: 100%;
          resize: none;
          margin-bottom: 10px;
          color: #a0a0a0;
          background-color: #0d1117;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #58a6ff, #238636);
          color: white;
          text-shadow: 1px 1px 1px #58a6ff;
          border: none;
          padding: 10px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 1rem
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #58a6ff, #238636);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}