import Header from "./components/Header";
import VideoFeed from "./components/VideoFeed";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  const rawVideos = await Video.find({}).sort({ createdAt: -1 }).lean();
  const videos: IVideo[] = rawVideos.map((video) => ({
    ...video,
    _id: video._id.toString(),
    createdAt: video.createdAt?.toISOString(),
    updatedAt: video.updatedAt?.toISOString(),
  }));

  return (
    <>
      <Header />

      {/* Page Background – SAME AS LOGIN */}
      <main className="min-h-screen overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Latest Reels
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Explore AI-powered short videos from the community
              </p>
            </div>

            {session ? (
              <Link
                href="/upload"
                className="inline-flex items-center justify-center
                           bg-blue-600 hover:bg-blue-700
                           text-white font-semibold
                           px-5 py-2 rounded-lg
                           transition"
              >
                Upload Video
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center
                           bg-white hover:bg-gray-50
                           border border-gray-300
                           text-gray-700 font-medium
                           px-5 py-2 rounded-lg
                           transition"
              >
                Sign in to upload
              </Link>
            )}
          </div>

          {/* Video Feed */}
          <VideoFeed videos={videos} />
        </div>
      </main>
    </>
  );
}
