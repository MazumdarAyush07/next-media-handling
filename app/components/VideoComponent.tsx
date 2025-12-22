import { IKVideo } from "imagekitio-react";
import Link from "next/link";
import { IVideo } from "@/models/Video";

export default function VideoComponent({ video }: { video: IVideo }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200
                 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Video Preview */}
      <div className="p-4">
        <Link href={`/videos/${video._id}`} className="block group">
          <div
            className="relative w-full overflow-hidden rounded-xl bg-black"
            style={{ aspectRatio: "9 / 16" }}
          >
            <IKVideo
              path={video.videoUrl}
              transformation={[
                {
                  height: "1920",
                  width: "1080",
                },
              ]}
              controls={video.controls}
              className="w-full h-full object-cover
                         group-hover:scale-[1.02]
                         transition-transform duration-300"
            />
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <Link
          href={`/videos/${video._id}`}
          className="block hover:text-blue-600 transition-colors"
        >
          <h2 className="text-base font-semibold text-gray-800 line-clamp-2">
            {video.title}
          </h2>
        </Link>

        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {video.description}
        </p>
      </div>
    </div>
  );
}
