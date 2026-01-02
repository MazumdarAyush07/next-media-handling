"use client";

import { IKVideo } from "imagekitio-react";
import { IVideo } from "@/models/Video";

export default function VideoComponent({ video }: { video: IVideo }) {
  function getImageKitPath(url: string) {
    const pathname = new URL(url).pathname;
    return pathname.replace(/^\/[^/]+/, "");
  }

  const videoPath = getImageKitPath(video.videoUrl);

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
