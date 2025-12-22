"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";
import { useRouter } from "next/navigation";
import { useNotification } from "./Notification";

interface UploadResponse {
  url: string;
  name?: string;
}

export default function VideoUploadForm() {
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<UploadResponse | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<UploadResponse | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!videoFile) {
      showNotification("Please upload a video file", "warning");
      return;
    }

    setLoading(true);

    const finalThumbnailUrl =
      thumbnailFile?.url || `${videoFile.url}?tr=f-image`;

    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          videoUrl: videoFile.url,
          thumbnailUrl: finalThumbnailUrl,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Upload failed");
      }

      showNotification("Video published successfully", "success");
      router.replace("/");
    } catch (err: any) {
      showNotification(err.message || "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto bg-white
                 rounded-2xl shadow-lg border border-gray-200
                 p-8 space-y-6"
    >
      <h2 className="text-xl font-bold text-gray-800">
        Upload Video
      </h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Description
        </label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Video Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Video File
        </label>
        <FileUpload
          fileType="video"
          onSuccess={(res) => setVideoFile(res)}
        />
      </div>

      {/* Thumbnail Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Thumbnail (optional)
        </label>
        <FileUpload
          fileType="image"
          onSuccess={(res) => setThumbnailFile(res)}
        />
        {thumbnailFile && (
          <p className="mt-2 text-sm text-gray-500">
            Selected: {thumbnailFile.name || "thumbnail image"}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700
                   disabled:bg-blue-400
                   text-white font-semibold py-2 rounded-lg
                   transition"
      >
        {loading ? "Publishing..." : "Publish Video"}
      </button>
    </form>
  );
}
