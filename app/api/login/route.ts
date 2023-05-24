import { NextResponse } from "next/server";
import Joi, { Schema } from "joi";
import hashing from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/utils/db";

export async function POST(req: Request) {
  let data = await req.json();

  const schema: Schema = Joi.object({
    email: Joi.string().email().required().min(8).max(56).label("Email"),
    password: Joi.string().required().min(8).max(56).label("Password"),
  });
  const { error } = schema.validate(data);
  if (error) return new Response(error.message, { status: 400 });

  let artist = await prisma.artist.findFirst({
    where: { email: data.email },
    select: { email: true, password: true, id: true },
  });

  if (artist === null) {
    return new Response("Email Doesn't Exist", { status: 400 });
  }

  let hashed_pass: boolean = await hashing.compare(
    data.password,
    artist.password
  );

  if (!hashed_pass) {
    return new Response("Invalid Password", { status: 400 });
  }

  let token = jwt.sign({ id: artist.id }, process.env.JWT_PASS!);

  return NextResponse.json("Done", {
    headers: { "x-auth-token": token },
    status: 200,
  });
}
