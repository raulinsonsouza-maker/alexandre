import { prisma } from "@/lib/prisma";

/** Detecta URL de player Mux / stream e monta src seguro. */
export function resolveLessonMedia(videoUrl: string | null | undefined, videoPath: string | null | undefined) {
  if (videoPath) {
    return { kind: "file" as const, src: `/uploads/${videoPath}` };
  }
  if (!videoUrl) return null;

  const url = videoUrl.trim();

  // iframe embed already
  if (url.includes("stream.mux.com") && url.includes(".m3u8")) {
    return { kind: "hls" as const, src: url };
  }
  // player.mux.com/{playbackId} or mux.com
  const muxPlayer = url.match(/player\.mux\.com\/([a-zA-Z0-9]+)/);
  if (muxPlayer) {
    return { kind: "mux-embed" as const, playbackId: muxPlayer[1] };
  }
  const muxStream = url.match(/stream\.mux\.com\/([a-zA-Z0-9]+)/);
  if (muxStream) {
    return { kind: "hls" as const, src: `https://stream.mux.com/${muxStream[1]}.m3u8` };
  }
  // YouTube
  const yt = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{6,})/);
  if (yt) {
    return { kind: "youtube" as const, id: yt[1] };
  }
  // Vimeo
  const vim = url.match(/vimeo\.com\/(\d+)/);
  if (vim) {
    return { kind: "vimeo" as const, id: vim[1] };
  }
  // generic mp4 / direct
  if (/\.(mp4|webm)(\?|$)/i.test(url) || url.startsWith("http")) {
    return { kind: "file" as const, src: url };
  }
  return { kind: "file" as const, src: url };
}
