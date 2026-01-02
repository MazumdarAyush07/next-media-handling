import { IVideo } from "@/models/Video";
import VideoComponent from "./VideoComponent";

interface VideoFeedProps {
  videos: IVideo[];
}

export default function VideoFeed({ videos }: VideoFeedProps) {
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500">No videos found</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-16
                 snap-y snap-mandatory
                 overflow-y-auto"
    >
      {videos.map((video) => (
        <div key={String(video._id)} className="snap-start">
          <VideoComponent video={video} />
        </div>
      ))}
    </div>
  );
}
