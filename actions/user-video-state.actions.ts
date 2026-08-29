"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_NOTES_LENGTH } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function toggleCompletion(
  videoId: string,
  isCompleted: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    await prisma.userVideoState.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        userId,
        videoId,
        isCompleted,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle completion status";
    return { success: false, error: message };
  }
}

export async function saveNotes(
  videoId: string,
  notes: string
): Promise<{ success: boolean; updatedAt?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (notes.length > MAX_NOTES_LENGTH) {
      return { success: false, error: `Ghi chú vượt quá giới hạn cho phép (${MAX_NOTES_LENGTH} ký tự).` };
    }

    const userId = session.user.id;

    const record = await prisma.userVideoState.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        notes,
      },
      create: {
        userId,
        videoId,
        notes,
      },
    });

    return { success: true, updatedAt: record.updatedAt.toISOString() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save notes";
    return { success: false, error: message };
  }
}

export async function getUserVideoState(videoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  const state = await prisma.userVideoState.findUnique({
    where: {
      userId_videoId: {
        userId,
        videoId,
      },
    },
  });

  return state;
}
