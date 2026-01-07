import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Like from "@/models/Like";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    const hasUserLiked = await Like.exists({
      video: videoId,
      user: session?.user?.id,
    });

    return NextResponse.json({ liked: Boolean(hasUserLiked) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch like status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const existingLike = await Like.findOne({
      user: session.user.id,
      video: videoId,
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "You have already liked this video" },
        { status: 400 }
      );
    }

    await Like.create({
      user: session.user.id,
      video: videoId,
    });

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Like registered successfully",
        likesCount: updatedVideo?.likesCount ?? 0,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You have already liked this video" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to register like" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    await Like.findOneAndDelete({
      user: session.user.id,
      video: videoId,
    });

    await Video.updateOne(
      { _id: videoId },
      [
        {
          $set: {
            likesCount: {
              $max: [{ $subtract: ["$likesCount", 1] }, 0],
            },
          },
        },
      ],
      { updatePipeline: true } 
    );

    return NextResponse.json(
      { message: "Like removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE LIKE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to remove like" },
      { status: 500 }
    );
  }
}
