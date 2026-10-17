import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { BlogPost, BLOG_POSTS } from "@/lib/blog";
import { createClient } from "@/utils/supabase/server";
import { isUserAdmin } from "@/lib/auth-admin";

const DATA_DIR = path.join(process.cwd(), "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(BLOG_POSTS, null, 2), "utf-8");
  }
}

function readPosts(): BlogPost[] {
  try {
    ensureFileExists();
    const data = fs.readFileSync(POSTS_FILE, "utf-8");
    return JSON.parse(data) as BlogPost[];
  } catch (error) {
    console.error("Error reading posts:", error);
    return BLOG_POSTS;
  }
}

function writePosts(posts: BlogPost[]) {
  ensureFileExists();
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

export async function GET() {
  const posts = readPosts();
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!isUserAdmin(user)) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required" },
        { status: 403 }
      );
    }

    const post: BlogPost = await req.json();
    if (!post.slug || !post.title) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const posts = readPosts();
    const existingIndex = posts.findIndex((p) => p.slug === post.slug);

    if (existingIndex >= 0) {
      posts[existingIndex] = post;
    } else {
      posts.unshift(post);
    }

    writePosts(posts);
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Error saving post:", error);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!isUserAdmin(user)) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const posts = readPosts();
    const filtered = posts.filter((p) => p.slug !== slug);
    writePosts(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
