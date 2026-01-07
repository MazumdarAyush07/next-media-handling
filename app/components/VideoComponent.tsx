"use client";

import { IKVideo } from "imagekitio-react";
import { IVideo } from "@/models/Video";
import { useEffect, useState } from "react";

export default function VideoComponent({ video }: { video: IVideo }) {
  const videoId = String(video._id);

  function getImageKitPath(url: string) {
    const pathname = new URL(url).pathname;
    return pathname.replace(/^\/[^/]+/, "");
  }

  const videoPath = getImageKitPath(video.videoUrl);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likesCount ?? 0);
  const [loading, setLoading] = useState(false);

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

  return (
    <div
      className="relative w-full max-w-md
                 h-[85vh]
                 bg-black rounded-2xl
                 shadow-xl overflow-hidden"
    >
      {/* Video */}
      <IKVideo
        path={videoPath}
        transformation={[{ height: "1920", width: "1080" }]}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
      />

      {/* Like Button */}
      <button
        onClick={toggleLike}
        disabled={loading}
        className="absolute right-4 bottom-24
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

      {/* Overlay content */}
      <div
        className="absolute bottom-0 left-0 right-0
                   bg-gradient-to-t from-black/80 via-black/40 to-transparent
                   p-4"
      >
        <h2 className="text-white font-semibold text-base line-clamp-2">
          {video.title}
        </h2>
        <p className="mt-1 text-sm text-gray-300 line-clamp-2">
          {video.description}
        </p>
      </div>
    </div>
  );
}
