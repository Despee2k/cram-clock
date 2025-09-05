import Papa, { ParseResult } from "papaparse";

export const dynamic = "force-dynamic";

type Raw = {
  id: string;
  title: string;
  course: string;
  dueDate: string; // e.g., 2025-09-04T17:00:00+08:00
  link: string;
};

type Item = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  link?: string;
};

function trimRaw(r: Raw): Raw {
  return {
    id: r.id?.trim() ?? "",
    title: r.title?.trim() ?? "",
    course: r.course?.trim() ?? "",
    dueDate: r.dueDate?.trim() ?? "",
    link: r.link?.trim() ?? "",
  };
}

function toItem(r: Raw): Item | null {
  if (!r.id || !r.title || !r.dueDate) return null;
  const idNum = Number(r.id);
  if (!Number.isFinite(idNum)) return null;
  return {
    id: idNum,
    title: r.title,
    course: r.course,
    dueDate: r.dueDate,
    link: r.link || undefined,
  };
}

function isItem(x: Item | null): x is Item {
  return x !== null;
}

export async function GET() {
  const url = process.env.SHEET_CSV_URL;
  if (!url) return new Response("SHEET_CSV_URL missing", { status: 500 });

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return new Response("Failed to fetch sheet", { status: 502 });

  const csv = await res.text();

  const parsed: ParseResult<Raw> = Papa.parse<Raw>(csv, {
    header: true,
    skipEmptyLines: "greedy",
  });

  const items: Item[] = parsed.data
    .map(trimRaw)
    .map(toItem)
    .filter(isItem)

    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

  return Response.json({ items });
}
