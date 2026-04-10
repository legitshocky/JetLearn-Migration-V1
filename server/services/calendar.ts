import axios from "axios";

export class CalendarService {
  private static getApiKey() {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("GOOGLE_API_KEY is not configured");
    return key;
  }

  private static getCalendarId() {
    const id = process.env.CLASS_SCHEDULE_CALENDAR_ID;
    if (!id) throw new Error("CLASS_SCHEDULE_CALENDAR_ID is not configured");
    return id;
  }

  static async listEvents(timeMin: string, timeMax: string, query?: string) {
    const apiKey = this.getApiKey();
    const calendarId = this.getCalendarId();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;

    const response = await axios.get(url, {
      params: {
        key: apiKey,
        timeMin,
        timeMax,
        q: query,
        singleEvents: true,
        orderBy: "startTime",
      },
    });

    return response.data.items;
  }

  static async verifySchedule(jlid: string, expectedStartDate: string, expectedEndDate: string) {
    try {
      const events = await this.listEvents(
        new Date(expectedStartDate).toISOString(),
        new Date(expectedEndDate).toISOString(),
        jlid
      );

      if (!events || events.length === 0) {
        return {
          status: "Warning",
          message: "No classes found in the calendar for this JLID.",
          count: 0
        };
      }

      return {
        status: "Match",
        message: `Found ${events.length} scheduled classes.`,
        count: events.length,
        events: events.map((e: any) => ({
          start: e.start.dateTime || e.start.date,
          end: e.end.dateTime || e.end.date,
          summary: e.summary
        }))
      };
    } catch (error: any) {
      return {
        status: "Error",
        message: error.message
      };
    }
  }
}
