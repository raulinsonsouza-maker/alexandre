import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const type = String(form.get("type") || "lesson");
  const uploadRoot = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadRoot, { recursive: true });

  // Capa do módulo
  if (type === "cover") {
    const moduleId = String(form.get("moduleId") || "");
    const mod = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!mod) return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 });

    const cover = form.get("cover");
    if (!(cover instanceof File) || cover.size === 0) {
      return NextResponse.json({ error: "Arquivo de capa obrigatório" }, { status: 400 });
    }

    const ext = path.extname(cover.name) || ".jpg";
    const filename = `cover_${moduleId}_${nanoid(6)}${ext}`;
    const buf = Buffer.from(await cover.arrayBuffer());
    await writeFile(path.join(uploadRoot, filename), buf);
    const coverPath = `/uploads/${filename}`;

    await prisma.module.update({
      where: { id: moduleId },
      data: { coverPath },
    });
    await writeAudit({
      actorId: session.user.id,
      action: "module.cover_upload",
      entityType: "Module",
      entityId: moduleId,
      meta: { coverPath },
    });

    return NextResponse.json({ ok: true, coverPath });
  }

  // Upload de aula (vídeo / material)
  const lessonId = String(form.get("lessonId") || "");
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });

  const video = form.get("video");
  const material = form.get("material");
  const videoUrl = String(form.get("videoUrl") || "").trim();
  let videoPath: string | undefined;

  const lessonUpdate: { videoPath?: string; videoUrl?: string | null } = {};

  if (videoUrl) {
    lessonUpdate.videoUrl = videoUrl;
  }

  if (video && video instanceof File && video.size > 0) {
    const ext = path.extname(video.name) || ".mp4";
    const filename = `video_${lessonId}_${nanoid(6)}${ext}`;
    const buf = Buffer.from(await video.arrayBuffer());
    await writeFile(path.join(uploadRoot, filename), buf);
    videoPath = filename;
    lessonUpdate.videoPath = filename;
  }

  if (Object.keys(lessonUpdate).length) {
    await prisma.lesson.update({
      where: { id: lessonId },
      data: lessonUpdate,
    });
  }

  if (material && material instanceof File && material.size > 0) {
    const ext = path.extname(material.name) || ".pdf";
    const filename = `mat_${lessonId}_${nanoid(6)}${ext}`;
    const buf = Buffer.from(await material.arrayBuffer());
    await writeFile(path.join(uploadRoot, filename), buf);
    await prisma.material.create({
      data: {
        lessonId,
        title: String(form.get("materialTitle") || material.name),
        filePath: filename,
        mimeType: material.type || null,
      },
    });
  }

  await writeAudit({
    actorId: session.user.id,
    action: "lesson.upload",
    entityType: "Lesson",
    entityId: lessonId,
    meta: { videoPath, videoUrl: videoUrl || undefined },
  });

  return NextResponse.json({ ok: true, videoPath, videoUrl: videoUrl || undefined });
}
