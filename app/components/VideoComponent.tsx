"use client";

import { IKVideo } from "imagekitio-react";
import { IVideo } from "@/models/Video";
import { useEffect, useRef, useState } from "react";
import CommentSheet from "./CommentSheet";

export default function VideoComponent({
  video,
  isActive,
  onVideoReady,
}: {
  video: IVideo;
  isActive: boolean;
  onVideoReady: (el: HTMLVideoElement) => void;
}) {
  const videoId = String(video._id);

  function getImageKitPath(url: string) {
    const pathname = new URL(url).pathname;
    return pathname.replace(/^\/[^/]+/, "");
  }

  const videoPath = getImageKitPath(video.videoUrl);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showHeart, setShowHeart] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likesCount ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(video.commentsCount ?? 0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const videoEl = containerRef.current?.querySelector("video");
    if (videoEl) {
      onVideoReady(videoEl);
    }
  }, []);

  useEffect(() => {
    const videoEl = containerRef.current?.querySelector("video");
    if (!videoEl) return;

    if (isActive) {
      videoEl.play().catch(() => {});
      setPaused(false);
    } else {
      videoEl.pause();
      setPaused(true);
    }
  }, [isActive]);

  // fetch like status
  useEffect(() => {
    fetch(`/api/like?videoId=${videoId}`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.liked !== undefined) {
          setLiked(data.liked);
        }
      });
  }, [videoId]);

  async function toggleLike() {
    if (loading) return;
    setLoading(true);

    const nextLiked = !liked;

    setLiked(nextLiked);
    setLikesCount((count) => count + (nextLiked ? 1 : -1));

    try {
      const res = await fetch("/api/like", {
        method: nextLiked ? "POST" : "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!res.ok) throw new Error();
    } catch {
      // rollback
      setLiked(liked);
      setLikesCount((count) => count + (liked ? 1 : -1));
    } finally {
      setLoading(false);
    }
  }

  function togglePlayPause() {
    const videoEl = containerRef.current?.querySelector("video");
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play();
      setPaused(false);
    } else {
      videoEl.pause();
      setPaused(true);
    }

    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 700);
  }

  function handleTap() {
    // SECOND TAP (double tap)
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;

      // ❤️ DOUBLE TAP ACTION
      if (!liked) {
        toggleLike();
      }

      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 600);
      return;
    }

    // FIRST TAP — wait to see if another tap comes
    tapTimeoutRef.current = setTimeout(() => {
      togglePlayPause(); // ▶️ / ⏸️ SINGLE TAP ACTION
      tapTimeoutRef.current = null;
    }, 250);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md
                 h-[85vh]
                 bg-black rounded-2xl
                 shadow-xl overflow-hidden"
      onClick={handleTap}
    >
      {/* Video */}
      <IKVideo
        path={videoPath}
        transformation={[{ height: "1920", width: "1080" }]}
        className="w-full h-full object-cover pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
      />

      {/* Like Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleLike();
        }}
        disabled={loading}
        className="absolute right-4 bottom-24 z-30
             flex flex-col items-center gap-1
             text-white"
      >
        <span
          className={`text-3xl transition-transform ${
            liked ? "scale-110" : "scale-100"
          }`}
        >
          {liked ? "❤️" : "🤍"}
        </span>
        <span className="text-xs text-gray-200">{likesCount}</span>
      </button>

      {/* Comment Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowComments(true);
        }}
        className="absolute right-4 bottom-6 z-30
             flex flex-col items-center gap-1
             text-white"
      >
        <span className="text-3xl">💬</span>
        <span className="text-xs text-gray-200">{commentsCount}</span>
      </button>

      {/* Play/Pause Icon */}
      {showPlayIcon && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 rounded-full p-4">
            <span className="text-white text-4xl">{paused ? "▶️" : "⏸️"}</span>
          </div>
        </div>
      )}

      {showHeart && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <span className="text-white text-7xl animate-heart-pop">❤️</span>
        </div>
      )}

      {/* Overlay content */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10
             bg-gradient-to-t from-black/80 via-black/40 to-transparent
             p-4 pointer-events-none"
      >
        <h2 className="text-white font-semibold text-base line-clamp-2">
          {video.title}
        </h2>
        <p className="mt-1 text-sm text-gray-300 line-clamp-2">
          {video.description}
        </p>
      </div>
      {showComments && (
        <CommentSheet
          videoId={videoId}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentsCount((c) => c + 1)}
          onCommentDeleted={() => setCommentsCount((c) => Math.max(c - 1, 0))}
        />
      )}
    </div>
  );
}
