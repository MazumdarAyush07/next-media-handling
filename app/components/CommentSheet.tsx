"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    email: string;
  };
  createdAt: string;
}

export default function CommentSheet({
  videoId,
  onClose,
  onCommentAdded,
  onCommentDeleted,
}: {
  videoId: string;
  onClose: () => void;
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const [closing, setClosing] = useState(false);
  const [translateY, setTranslateY] = useState(0);

  const startY = useRef<number | null>(null);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  useEffect(() => {
    fetch(`/api/comment?videoId=${videoId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []));
  }, [videoId]);

  function closeSheet() {
    setClosing(true);
    setTimeout(onClose, 200); // match animation duration
  }

  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startY.current === null) return;

    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setTranslateY(delta);
    }
  }

  function onTouchEnd() {
    if (translateY > 120) {
      closeSheet();
    } else {
      setTranslateY(0);
    }
    startY.current = null;
  }

  async function submitComment() {
    if (!content.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, content }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [data.message, ...prev]);
        onCommentAdded();
        setContent("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteComment(commentId: string) {
    try {
      const res = await fetch(
        `/api/comment?commentId=${commentId}&videoId=${videoId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error();

      setComments((prev) => prev.filter((c) => c._id !== commentId));

      onCommentDeleted();
    } catch {
      alert("Failed to delete comment");
    }
  }

  return (
    <>
      {/* Local backdrop */}
      <div onClick={closeSheet} className="absolute inset-0 bg-black/40 z-30" />

      {/* Sheet */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translateY(${translateY}px)` }}
        className={`
          absolute bottom-0 left-0 right-0 z-40
          bg-white rounded-t-2xl
          max-h-[75%]
          flex flex-col
          transition-transform
          ${closing ? "animate-slide-down" : "animate-slide-up"}
        `}
      >
        {/* Handle */}
        <div className="py-3 flex justify-center cursor-grab">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {comments.map((c) => (
            <div key={c._id}>
              <p className="text-sm font-medium text-gray-800">
                {c.user.email.split("@")[0]}
              </p>
              <p className="text-sm text-gray-700">{c.content}</p>

              {currentUserId === c.user._id && (
                <button
                  onClick={() => deleteComment(c._id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t px-4 py-3 flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border text-gray-800 rounded-full px-4 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            disabled={loading}
            onClick={submitComment}
            className="text-blue-600 font-semibold"
          >
            Post
          </button>
        </div>
      </div>
    </>
  );
}
