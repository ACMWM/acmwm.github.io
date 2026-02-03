import { Client } from "@notionhq/client";

export type OfficerProfile = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  active: boolean;
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

function selectName(prop: any): string {
  return prop?.select?.name ?? "";
}

function firstFileUrl(prop: any): string {
  const files = prop?.files;
  if (!Array.isArray(files) || files.length === 0) return "";

  const f = files[0];
  if (f?.type === "external") return f.external?.url ?? "";
  if (f?.type === "file") return f.file?.url ?? ""; // note: notion-hosted urls expire
  return "";
}

export async function getActiveOfficerProfiles(): Promise<OfficerProfile[]> {
  const notion = new Client({ auth: import.meta.env.NOTION_TOKEN });

  try {
    const pages = await notion.databases.query({
      database_id: import.meta.env.NOTION_PROFILES_DB_ID,
      filter: { property: "Active", checkbox: { equals: true } },
      sorts: [
        // if you add a "Sort" number property in notion, use it here
        // { property: "Sort", direction: "ascending" },
        { property: "Role", direction: "ascending" },
        { property: "Name", direction: "ascending" },
      ],
      page_size: 100,
    });

    const profiles: OfficerProfile[] = pages.results.map((page: any) => {
      const p = page.properties ?? {};

      const name = plainTextFromTitle(p?.Name);
      const role = selectName(p?.Role) || plainTextFromRichText(p?.Role);
      const bio = plainTextFromRichText(p?.Bio);
      const photoUrl = firstFileUrl(p?.Photo);
      const active = Boolean(p?.Active?.checkbox);

      return {
        id: page.id,
        name,
        role,
        bio,
        photoUrl,
        active,
      };
    });

    return profiles;
  } catch (e) {
    console.error("notion profiles query failed:", e);
    return [];
  }
}
