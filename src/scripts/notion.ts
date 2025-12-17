import { Client } from "@notionhq/client";

export type ItineraryEvent = {
  date: Date;
  name: string;
  location: string;
  website: string;
  type: string;
};

export async function getEvents(filterHomepage: boolean): Promise<ItineraryEvent[]> {
  let signalError = false; /* flag variable to judge whether we abort the mission and return early */

  const notion = new Client({ auth: import.meta.env.NOTION_TOKEN });
  console.log(JSON.stringify(notion));
  let pages = null;
  /* I hate this so very much */  
    pages = await notion.databases.query({
      database_id: import.meta.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          {
            property: "Private",
            checkbox: {
              equals: false,
            }
          }
        ],
      },
    })
    .catch(err => {
      /* Catch errors here so that the entire site doesn't lock up with a "fetch failed" error page */
      signalError = true; /* 'return' won't help us here (promises) -- set a flag */ 
    });

  if (signalError) return null;
  if (pages) {
  const events = pages.results
  .map((page: any) => {
    return {
      id: page,
      date: page.properties.Date.date ? new Date(page.properties.Date.date.start) : new Date("1970-01-01"),
      //date: page.properties.Date.date ? dateObj.toDateString() + ' at ' + dateObj.getHours() + ':00' : "Date and time TBA",
      name: page.properties.Name.title[0] ? page.properties.Name.title[0].text.content : "TBA", /* VSCode complains that page.properties doesn't exist, but empirically it seems to work right */
      /* this is a URL, not a page on our server; make sure links handle that correctly */
      location: page.properties.Location.rich_text[0] ? page.properties.Location.rich_text[0].plain_text : "Location TBA",
      blurb: page.properties.Blurb.rich_text[0] ? page.properties.Blurb.rich_text[0] : "Details TBA",
      website: page.properties.Website.url ? ((page.properties.Website.url.slice(0,3) == 'http') ? page.properties.Website.url : ('http://' + page.properties.Website.url)) : "", 
      type: page.properties.Type.name ? page.properties.Type.name : "Event",
    };
  })
  .sort((a: any, b: any) => {
    try {
    if (a != undefined && b!= undefined) {
      return a.date.getTime() - b.date.getTime()
    }
    }
    catch {
      return -1; /* Events with date/time TBA will always be placed at the END of the list. Return +1 to put them at the start */ 
    }
  });

  //.splice(0, 5);
  
  return events;
}
}