import { Client } from "@notionhq/client";

export type ItineraryEvent = {
  id: string;
  date: Date | null;
  name: string;
  location: string;
  blurb: string;
  website: string;
  type: string;
  hostingClubs: string[];
  status: string | null;
  showOnHomepage: boolean;
};

function plainTextFromTitle(prop: any): string {
  const arr = prop?.title;
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return arr.map((t: any) => t.plain_text).join("");
}

function plainTextFromRichText(prop: any): string {
  const arr = prop?.rich_text;
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return arr.map((t: any) => t.plain_text).join("");
}

function multiSelectNames(prop: any): string[] {
  const arr = prop?.multi_select;
  if (!Array.isArray(arr)) return [];
  return arr.map((x: any) => x.name).filter(Boolean);
}

function selectName(prop: any): string | null {
  return prop?.select?.name ?? null;
}

function safeUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

export async function getEvents(filterHomepage: boolean): Promise<ItineraryEvent[]> {
  const notion = new Client({ auth: import.meta.env.NOTION_TOKEN });

  try {
    const nowIso = new Date().toISOString();

    const pages = await notion.databases.query({
      database_id: import.meta.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          // keep this if you still want "Private" to hide events
          { property: "Private", checkbox: { equals: false } },

          // new: only show published events
          { property: "Status", select: { equals: "Published" } },

          // new: only upcoming events
          { property: "Date", date: { on_or_after: nowIso } },

          // optional: if you want a homepage-only mode
          ...(filterHomepage
            ? [{ property: "Show on Homepage", checkbox: { equals: true } }]
            : []),
        ],
      },
      sorts: [{ property: "Date", direction: "ascending" }],
      page_size: 50,
    });

    const events: ItineraryEvent[] = pages.results
      .map((page: any) => {
        const p = page.properties ?? {};

        const startIso: string | null = p?.Date?.date?.start ?? null;

        return {
          id: page.id,
          date: startIso ? new Date(startIso) : null,
          name: plainTextFromTitle(p?.Name),
          location: plainTextFromRichText(p?.Location) || "Location TBA",
          blurb: plainTextFromRichText(p?.Blurb) || "Details TBA",
          website: safeUrl(p?.Website?.url ?? null),
          type: selectName(p?.Type) ?? "Event",
          hostingClubs: multiSelectNames(p?.["Hosting Clubs"]),
          status: selectName(p?.Status),
          showOnHomepage: Boolean(p?.["Show on Homepage"]?.checkbox),
        };
      })
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.getTime() - b.date.getTime();
      });

    return events;
  } catch {
    // don't return null; keep the site from breaking
    return [];
  }
}
