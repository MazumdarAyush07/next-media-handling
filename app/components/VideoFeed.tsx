import { IVideo } from "@/models/Video";
import VideoComponent from "./VideoComponent";

interface VideoFeedProps {
  videos: IVideo[];
}

export default function VideoFeed({ videos }: VideoFeedProps) {
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500">
          No videos found
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-6
                 grid-cols-1
                 sm:grid-cols-2
                 md:grid-cols-3
                 lg:grid-cols-4"
    >
      {videos.map((video) => (
        <VideoComponent
          key={video._id?.toString()}
          video={video}
        />
      ))}
    </div>
  );
}
