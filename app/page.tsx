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

  const videos: IVideo[] = await Video.find({})
    .sort({ createdAt: -1 })
    .lean();

  return (
    <>
      {/* Global Header */}
      <Header />

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero / Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Latest Reels
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Explore AI-powered short videos from the community
            </p>
          </div>

          {/* Primary CTA */}
          {session ? (
            <Link
              href="/upload"
              className="inline-flex items-center justify-center
                         bg-blue-600 hover:bg-blue-700
                         text-white font-medium
                         px-5 py-2 rounded-lg
                         transition"
            >
              Upload Video
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center
                         border border-gray-300
                         hover:border-blue-500
                         text-gray-700 hover:text-blue-600
                         font-medium
                         px-5 py-2 rounded-lg
                         transition"
            >
              Sign in to upload
            </Link>
          )}
        </div>

        {/* Video Feed */}
        <VideoFeed videos={videos} />
      </main>
    </>
  );
}
