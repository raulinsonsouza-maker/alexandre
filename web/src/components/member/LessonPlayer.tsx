"use client";

import { resolveLessonMedia } from "@/lib/media-player";

export function LessonPlayer({
  videoUrl,
  videoPath,
}: {
  videoUrl?: string | null;
  videoPath?: string | null;
}) {
  const media = resolveLessonMedia(videoUrl, videoPath);

  if (!media) {
    return (
      <div className="flex aspect-video items-center justify-center bg-[#0f0e12] px-6 text-center text-[#A8A8AF]">
        Vídeo ainda não vinculado. Quando o link Mux estiver pronto, cole em Administração → Conteúdo → aula.
      </div>
    );
  }

  if (media.kind === "mux-embed") {
    return (
      <iframe
        className="aspect-video w-full bg-black"
        src={`https://player.mux.com/${media.playbackId}`}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title="Vídeo da aula"
      />
    );
  }

  if (media.kind === "youtube") {
    return (
      <iframe
        className="aspect-video w-full bg-black"
        src={`https://www.youtube.com/embed/${media.id}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Vídeo da aula"
      />
    );
  }

  if (media.kind === "vimeo") {
    return (
      <iframe
        className="aspect-video w-full bg-black"
        src={`https://player.vimeo.com/video/${media.id}`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vídeo da aula"
      />
    );
  }

  // HLS (Mux stream) and file/mp4 — native video; browsers with HLS support or progressive
  return <video className="aspect-video w-full bg-black" controls src={media.src} playsInline />;
}
