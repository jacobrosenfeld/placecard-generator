import { NextRequest, NextResponse } from "next/server";
import { extractGoogleFontUrl, GOOGLE_FONTS_PDF_HEADERS, googleFontsHref } from "@/lib/typography";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const font = request.nextUrl.searchParams.get("font") || "";
  if (!font.trim()) {
    return NextResponse.json({ error: "Missing font query parameter." }, { status: 400 });
  }

  const cssResponse = await fetch(googleFontsHref(font), {
    headers: GOOGLE_FONTS_PDF_HEADERS,
    next: { revalidate: 60 * 60 * 24 * 30 }
  });

  if (!cssResponse.ok) {
    return NextResponse.json({ error: "Google Fonts CSS request failed." }, { status: 502 });
  }

  const css = await cssResponse.text();
  const fontUrl = extractGoogleFontUrl(css);
  if (!fontUrl) {
    return NextResponse.json({ error: "No embeddable Google font URL found." }, { status: 502 });
  }

  const fontResponse = await fetch(fontUrl, {
    next: { revalidate: 60 * 60 * 24 * 30 }
  });

  if (!fontResponse.ok) {
    return NextResponse.json({ error: "Google font file request failed." }, { status: 502 });
  }

  return new NextResponse(await fontResponse.arrayBuffer(), {
    headers: {
      "Cache-Control": "public, max-age=2592000, immutable",
      "Content-Type": fontResponse.headers.get("content-type") || "font/ttf"
    }
  });
}
