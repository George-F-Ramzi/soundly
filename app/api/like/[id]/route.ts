import prisma from "@/utils/db";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function POST(req: Request) {
  let token = req.headers.get("x-auth-token");
  let { id } = jwt.verify(token!, process.env.JWT_PASS!) as JwtPayload;
  let url = req.url;
  let index = url.indexOf("like");
  let song_id = url.slice(index + 5);

  let song_row = await prisma.song.findUnique({
    where: { id: Number(song_id) },
    select: { artist_id: true },
  });

  if (song_row === null)
    return new Response("You Allready Likes This Song", { status: 400 });

  await prisma.like.create({
    data: { fan_id: Number(id), song_id: Number(song_id) },
  });

  await prisma.song.update({
    where: { id: Number(song_id) },
    data: { likes: { increment: 1 } },
  });

  await prisma.notification.create({
    data: {
      message_detail: "Likes Your Song",
      nottifer_id: song_row.artist_id,
      trigger_id: Number(id),
      song_id: Number(song_id),
    },
  });

  return new Response("Done", { status: 200 });
}