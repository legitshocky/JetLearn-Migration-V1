import { google } from "googleapis";
import { getServiceAccount } from "../lib/serviceAccount.js";

export class CalendarService {
  private static async getCalendarClient() {
    const auth = new google.auth.GoogleAuth({
      credentials: getServiceAccount(),
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });
    return google.calendar({ version: "v3", auth });
  }

  private static getCalendarId() {
    const id = process.env.CLASS_SCHEDULE_CALENDAR_ID;
    if (!id) throw new Error("CLASS_SCHEDULE_CALENDAR_ID is not configured");
    return id;
  }

  static async listEvents(timeMin: string, timeMax: string, query?: string) {
    try {
      const calendar = await this.getCalendarClient();
      const calendarId = this.getCalendarId();

      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        q: query,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items || [];
    } catch (error: any) {
      console.error("[CalendarService.listEvents] Error:", error.message);
      throw error;
    }
  }

  static async listAllEvents(timeMin: string, timeMax: string) {
    try {
      const calendar = await this.getCalendarClient();
      const calendarId = this.getCalendarId();

      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items || [];
    } catch (error: any) {
      console.error("[CalendarService.listAllEvents] Error:", error.message);
      throw error;
    }
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

  static async checkTeacherAvailability(teacherName: string, slotStart: string, slotEnd: string) {
    try {
      const events = await this.listEvents(slotStart, slotEnd, teacherName);
      
      const availabilityEvents = events.filter((e: any) => {
        const summary = (e.summary || "").toLowerCase();
        return summary.includes("availability") || summary.includes("teacher hours") || summary.includes("available");
      });

      const classEvents = events.filter((e: any) => {
        const summary = (e.summary || "").toLowerCase();
        return !summary.includes("availability") && !summary.includes("teacher hours") && !summary.includes("available");
      });

      // A teacher is available if they have an availability block AND no conflicting class
      const hasAvailability = availabilityEvents.length > 0;
      const hasConflict = classEvents.length > 0;

      return {
        available: hasAvailability && !hasConflict,
        hasAvailability,
        hasConflict,
        details: hasConflict ? `Conflict: ${classEvents[0].summary}` : hasAvailability ? "Available" : "No availability block"
      };
    } catch (error) {
      return { available: false, error: "Calendar check failed" };
    }
  }
}
