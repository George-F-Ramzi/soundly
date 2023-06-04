"use server";

import Comments from "@/components/comments";
import Like from "@/components/like";
import PlayButton from "@/components/play";
import { db } from "@/db/db";
import { Songs } from "@/db/schema";
import { IComment, ISong } from "@/utils/types";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  //
  let { id } = params;

  const song = await db
    .select({ name: Songs.name })
    .from(Songs)
    .where(eq(Songs.id, Number(id)));

  return {
    title: song[0].name,
  };
}

export default async function SongPage({ params }: { params: { id: string } }) {
  let { id } = params;

  let res = await fetch(`https://soundly-peach.vercel.app/api/song/${id}`, {
    cache: "no-cache",
  });

  let data: { info: ISong; comments: IComment[] } = await res.json();

  return (
    <main className="mt-16 pb-36 text-white">
      <div className="flex flex-col items-center">
        <Image
          height={100}
          width={100}
          alt="song cover"
          className="min-w-[100px]  max-h-[100px] rounded mb-10"
          src={data.info.cover}
        />
        <h1 className="font-bold tablet:text-xl text-5xl mb-7">
          {data.info.name}
        </h1>
        <div className="flex">
          <p className="text-base tablet:text-sm  font-bold text-gray-300">
            {data.info.likes}:Likes
          </p>
        </div>
      </div>
      <div className="mt-14 w-full h-12 grid grid-cols-2 gap-6">
        <PlayButton data={data.info} />
        <Like id={data.info.id} />
      </div>
      <Comments data={data.comments} id={data.info.id} />
    </main>
  );
}
