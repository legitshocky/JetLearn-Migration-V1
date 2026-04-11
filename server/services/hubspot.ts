import axios from "axios";

const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects";
const PORTAL_ID = "7729491";
const MIGRATION_PIPELINE_ID = "66161281";

const EXCLUDED_STAGE_IDS = ["133821818", "153457301"];
const INBOUND_REASONS = [
  "Slot change - Learner request",
  "Slot change -Learner request",
  "Teacher Affinity",
  "Pause Request",
  "Special Learning Needs",
  "Course Change",
];
const IGNORE_KEYWORDS = ["PRM", "Renewal", "Feedback", "Review", "Kit", "Laptop", "Device", "Tab"];
const STAGE_LABELS: Record<string, string> = {
  "128913747": "Migration Triggered",
  "128913748": "WIP",
  "128913750": "WIP - TP Approval Pending",
  "128913752": "WIP - CLS Approval Pending",
  "1030980247": "WIP - Rejected by CLS",
  "133755411": "WIP - Approved by CLS",
  "1065336836": "Execution Pending",
  "128913749": "WIP - PR Approval Pending",
  "128913753": "Migration Completed",
};

function safeParseNumber(value: any, defaultValue = 0): number {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getHeaders() {
  const token = process.env.HUBSPOT_API_KEY;
  if (!token) throw new Error("HUBSPOT_API_KEY is not configured");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ── Deal property list (matches GAS exactly) ──────────────────────────────────
const DEAL_PROPERTIES = [
  "dealname", "jetlearner_id", "amount", "deal_currency_code", "hs_object_id", "age", "learner_status",
  "module_start_date", "module_end_date", "total_classes_committed_through_learner_s_journey",
  "current_teacher", "current_course", "time_zone", "regular_class_day", "frequency_of_classes",
  "payment_type", "subscription", "subscription_tenure", "payment_term", "class_timings",
  "learner_practice_document_link", "installment_type", "installment_terms_final",
  "installment_months", "installment_received_months__cloned_", "payment_due_date",
  "full_payment_received__y_n_", "jet_guide", "cls_manager", "teacher_manager",
  "parent_email", "parent_name", "phone_number_deal_",
  "stage____payment_trigger_date", "zoom_masked_link", "urge_on_pause_date",
  "current_subscription_taken_classes", "learner_health", "learner_health_reason_code",
];

const TICKET_PROPERTIES = [
  "current_teacher__t_", "new_teacher", "reason_of_migration__t_", "current_course__t_",
  "current_course", "future_course_1", "future_course_2", "future_course_3",
  "regular_class_day__t_", "regular_class_time__in_cet_", "subject", "createdate",
  "hs_pipeline_stage", "migration_completed_date", "hs_ticket_id",
  "migration_intervened_by", "learner_full_name", "learner_uid",
];

export class HubSpotService {

  // ── Fetch deal by JLID ─────────────────────────────────────────────────────
  static async fetchByJlid(jlid: string) {
    const response = await axios.post(
      `${HUBSPOT_API_URL}/deals/search`,
      {
        filterGroups: [{ filters: [{ propertyName: "jetlearner_id", operator: "EQ", value: jlid }] }],
        properties: DEAL_PROPERTIES,
        limit: 1,
      },
      { headers: getHeaders() }
    );

    const results = response.data.results;
    if (!results || results.length === 0) return null;

    const p = results[0].properties;
    const dealId = p.hs_object_id;

    // Phone number lookup
    let finalParentPhone = p.phone_number_deal_ || "";
    try {
      const smartPhone = await this.getBestPhoneNumberForDeal(dealId);
      if (smartPhone) finalParentPhone = smartPhone;
    } catch (_) {}

    // Churn alert from migration history
    let churnAlert = null;
    try {
      const stats = await this.getMigrationHistoryStats(jlid);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const recentMigrations = stats.events.filter((t: any) => new Date(t.date) >= threeMonthsAgo);
      if (recentMigrations.length >= 2) {
        churnAlert = {
          level: "Critical",
          count: recentMigrations.length,
          message: `\u26a0\ufe0f HIGH RISK: This learner has moved ${recentMigrations.length} times in the last 3 months!`,
        };
      } else if (recentMigrations.length === 1) {
        churnAlert = { level: "Warning", count: 1, message: "Note: Learner moved 1 time recently." };
      }
    } catch (_) {}

    const tenure = safeParseNumber(p.subscription_tenure);
    const dealAmount = safeParseNumber(p.amount);

    // Parse class timings
    const parseClassTimings = (t: string) => {
      if (!t) return [];
      if (t.includes(" at ")) {
        return t.split(";").map((s: string) => {
          const match = s.trim().match(/(\w+)\s+at\s+(\d{1,2}:\d{2}\s(?:AM|PM))/i);
          return match ? { day: match[1], time: match[2] } : null;
        }).filter(Boolean);
      }
      return t.split(/[,;]/).map((d: string) => d.trim() ? { day: d.trim(), time: "" } : null).filter(Boolean);
    };

    // Parse payment plan
    const parsePaymentPlan = (h: string) => {
      if (!h) return { paymentPlanType: "Upfront", installmentFrequency: "", customPlanDetails: "" };
      const hl = h.toLowerCase();
      if (hl.includes("installment")) {
        return { paymentPlanType: "Installment", installmentFrequency: hl.includes("quarterly") ? "Quarterly" : "Monthly", customPlanDetails: "" };
      }
      return { paymentPlanType: "Upfront", installmentFrequency: "", customPlanDetails: "" };
    };

    const paymentPlan = parsePaymentPlan(p.payment_type);

    return {
      success: true,
      data: {
        dealId,
        jlid: p.jetlearner_id || jlid,
        learnerName: (p.dealname || "").trim(),
        parentName: p.parent_name || "",
        parentEmail: p.parent_email || "",
        parentContact: finalParentPhone,
        course: p.current_course || "",
        subscriptionTenureMonths: tenure,
        dealAmount,
        age: p.age || "",
        currentTeacher: p.current_teacher || "",
        newTeacher: "",
        startingDate: p.module_start_date || "",
        endDate: p.module_end_date || "",
        subscriptionStartDate: p.current_subscription_start_date || "",
        planName: p.subscription || "",
        learnerStatus: p.learner_status || "Unknown",
        pauseDate: p.urge_on_pause_date || null,
        classSessions: parseClassTimings(p.class_timings || p.regular_class_day || ""),
        paymentType: paymentPlan.paymentPlanType,
        installmentFrequency: paymentPlan.installmentFrequency,
        customPlanDetails: paymentPlan.customPlanDetails,
        zoomLink: p.zoom_masked_link || "",
        practiceDocumentLink: p.learner_practice_document_link || "",
        jetGuideName: p.jet_guide || "",
        clsManagerName: p.cls_manager || "",
        tpManagerName: p.teacher_manager || "",
        tpManagerHsId: p.teacher_manager || "",
        currency: p.deal_currency_code || "EUR",
        sessionsPerWeek: p.frequency_of_classes || "",
        timezone: p.time_zone || "",
        paymentReceivedDate: p.stage____payment_trigger_date || null,
        installmentTerms: p.installment_terms_final || "",
        churnAlert,
        learnerHealth: p.learner_health || "",
        learnerHealthReasonCode: p.learner_health_reason_code || "",
        currentSubscriptionTakenClasses: p.current_subscription_taken_classes || "",
        moduleStartDate: p.module_start_date || "",
        totalClassesJourney: p.total_classes_committed_through_learner_s_journey || "",
        hubspotLink: dealId ? `https://app.hubspot.com/contacts/${PORTAL_ID}/deal/${dealId}` : null,
      },
    };
  }

  // ── Fetch latest migration ticket for a JLID ──────────────────────────────
  static async fetchLatestMigrationTicket(jlid: string) {
    const response = await axios.post(
      `${HUBSPOT_API_URL}/tickets/search`,
      {
        filterGroups: [{
          filters: [
            { propertyName: "hs_pipeline", operator: "EQ", value: MIGRATION_PIPELINE_ID },
            { propertyName: "learner_uid", operator: "EQ", value: jlid },
          ],
        }],
        properties: TICKET_PROPERTIES,
        limit: 10,
      },
      { headers: getHeaders() }
    );

    const results = response.data.results;
    if (!results || results.length === 0) return { found: false };

    // Sort by createdAt descending (matches GAS — uses root createdAt not properties.createdate)
    const sorted = results.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = sorted[0];
    const props = latest.properties;

    return {
      found: true,
      ticketId: latest.id,
      oldTeacher: props.current_teacher__t_ || "",
      newTeacher: props.new_teacher || "",
      reason: props.reason_of_migration__t_ || "",
      ticketCourse: props.current_course__t_ || props.current_course || "",
      classDay: props.regular_class_day__t_ || "",
      classTime: props.regular_class_time__in_cet_ || "",
      rawProperties: props,
    };
  }

  // ── Hybrid data (deal + ticket merged) ───────────────────────────────────
  static async fetchHybridData(jlid: string) {
    const dealResult = await this.fetchByJlid(jlid);
    if (!dealResult || !dealResult.success) return dealResult;

    const finalData: any = { ...dealResult.data };
    const ticketResult = await this.fetchLatestMigrationTicket(jlid);

    if (ticketResult.found) {
      if (ticketResult.oldTeacher) finalData.currentTeacher = ticketResult.oldTeacher;
      if (ticketResult.newTeacher) finalData.newTeacher = ticketResult.newTeacher;
      if (ticketResult.reason) finalData.migrationReason = ticketResult.reason;
      if (ticketResult.ticketCourse) finalData.course = ticketResult.ticketCourse;
      if (ticketResult.classDay || ticketResult.classTime) {
        finalData.ticketSchedule = { day: ticketResult.classDay, time: ticketResult.classTime };
      }
      finalData.source = "Hybrid (Deal + Ticket)";
    } else {
      finalData.source = "Deal Only";
    }

    return { success: true, data: finalData };
  }

  // ── Persona smart data (onboarding vs migration mode) ────────────────────
  static async fetchPersonaSmartData(jlid: string) {
    if (!jlid) return { success: false, message: "JLID is required." };

    const ticketResult = await this.fetchLatestMigrationTicket(jlid);
    const dealResult = await this.fetchByJlid(jlid);
    if (!dealResult || !dealResult.success) return dealResult;

    const d = dealResult.data;
    let mode = "Onboarding";

    const contextData: any = {
      learnerName: d.learnerName || "",
      jlid: d.jlid || jlid,
      currentTeacher: d.currentTeacher || "",
      age: d.age || "",
      currentCourse: d.course || "",
      futureCourse1: "",
      futureCourse2: "",
      futureCourse3: "",
      sessionsPerWeek: d.sessionsPerWeek || "1 Session/week",
    };

    if (ticketResult.found) {
      mode = "Migration";
      contextData.currentCourse = ticketResult.ticketCourse || d.course;
      contextData.currentTeacher = ticketResult.oldTeacher || d.currentTeacher;
      const rp = ticketResult.rawProperties || {};
      contextData.futureCourse1 = rp.future_course_1 || "";
      contextData.futureCourse2 = rp.future_course_2 || "";
      contextData.futureCourse3 = rp.future_course_3 || "";
    }

    return { success: true, mode, data: contextData };
  }

  // ── Renewal data (deal + line items) ─────────────────────────────────────
  static async fetchRenewalData(jlid: string) {
    const searchResponse = await axios.post(
      `${HUBSPOT_API_URL}/deals/search`,
      {
        filterGroups: [{ filters: [{ propertyName: "jetlearner_id", operator: "EQ", value: jlid }] }],
        sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
        properties: ["dealname", "amount", "deal_currency_code", "parent_name", "parent_email", "jetlearner_id"],
        limit: 5,
      },
      { headers: getHeaders() }
    );

    const deals = searchResponse.data.results;
    if (!deals || deals.length === 0) return { success: false, message: "No deal found for this JLID." };

    // Find the deal with line items
    let targetDeal = null;
    let lineItemIds: any[] = [];

    for (const deal of deals) {
      try {
        const assocResponse = await axios.get(
          `https://api.hubapi.com/crm/v4/objects/deals/${deal.id}/associations/line_items`,
          { headers: getHeaders() }
        );
        const assocResults = assocResponse.data.results;
        if (assocResults && assocResults.length > 0) {
          targetDeal = deal;
          lineItemIds = assocResults.map((r: any) => ({ id: r.toObjectId }));
          break;
        }
      } catch (_) {}
    }

    if (!targetDeal) return { success: false, message: "Deal found, but 0 line items attached." };

    const batchResponse = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/line_items/batch/read",
      {
        properties: [
          "name", "price", "discount", "hs_total_discount", "net_price", "currency",
          "quantity", "hs_createdate", "payment_received_date___cloned_",
          "renewal__payment_type__cloned_", "renewal__payment_term__cloned_",
          "full_payment_received__y_n___cloned_", "hs_recurring_billing_number_of_payments",
        ],
        inputs: lineItemIds,
      },
      { headers: getHeaders() }
    );

    const batchResults = batchResponse.data.results || [];
    const sortedResults = batchResults.sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id));

    const processedItems = sortedResults.map((item: any) => {
      const p = item.properties;
      const qty = parseFloat(p.quantity) || 1;
      const price = parseFloat(p.price) || 0;
      const discount = parseFloat(p.hs_total_discount) || parseFloat(p.discount) || 0;
      const net = p.net_price ? parseFloat(p.net_price) : price * qty - discount;

      let finalDate = "";
      const rawDate = p.payment_received_date___cloned_;
      if (rawDate) {
        if (rawDate.includes("-")) finalDate = rawDate;
        else if (!isNaN(rawDate)) finalDate = new Date(parseInt(rawDate)).toISOString().split("T")[0];
      }

      return {
        id: item.id,
        name: p.name || "Unknown Item",
        createdDate: p.hs_createdate || "N/A",
        unitPrice: (price * qty).toFixed(2),
        discount: discount.toFixed(2),
        netPrice: net.toFixed(2),
        currency: p.currency,
        paymentDate: finalDate,
        paymentType: p.renewal__payment_type__cloned_ || "Upfront",
        frequency: p.renewal__payment_term__cloned_ || "Monthly",
        installments: p.hs_recurring_billing_number_of_payments || "1",
        isFullPayment: p.full_payment_received__y_n___cloned_,
      };
    });

    return {
      success: true,
      data: {
        deal: {
          dealId: targetDeal.id,
          learnerName: targetDeal.properties.dealname || "",
          parentName: targetDeal.properties.parent_name || "",
          parentEmail: targetDeal.properties.parent_email || "",
          currency: targetDeal.properties.deal_currency_code || "EUR",
        },
        lineItems: processedItems,
      },
    };
  }

  // ── Deals by onboarding completion date ──────────────────────────────────
  static async fetchDealsByOnboardingDate(fromDate: string, toDate: string) {
    const response = await axios.post(
      `${HUBSPOT_API_URL}/deals/search`,
      {
        filterGroups: [{
          filters: [{
            propertyName: "onboarding_completion_date",
            operator: "BETWEEN",
            highValue: new Date(`${toDate}T23:59:59Z`).getTime(),
            value: new Date(`${fromDate}T00:00:00Z`).getTime(),
          }],
        }],
        properties: [
          "dealname", "jetlearner_id", "amount", "deal_currency_code", "hs_object_id",
          "age", "learner_status", "module_start_date", "module_end_date",
          "total_classes_committed_through_learner_s_journey", "current_teacher",
          "current_course", "time_zone", "regular_class_day", "frequency_of_classes",
          "payment_type", "subscription", "subscription_tenure", "payment_term",
          "learner_practice_document_link", "onboarding_completion_date",
        ],
        limit: 100,
      },
      { headers: getHeaders() }
    );
    return response.data.results || [];
  }

  // ── HubSpot notes: fetch latest sales note for a deal ────────────────────
  static async fetchLatestSalesNoteForDeal(dealId: string) {
    // 1. Get note associations
    const assocResponse = await axios.get(
      `https://api.hubapi.com/crm/v4/objects/deal/${dealId}/associations/note?limit=5`,
      { headers: getHeaders() }
    );
    const assocResults = assocResponse.data.results;
    if (!assocResults || assocResults.length === 0) return null;

    const noteIds = assocResults.map((r: any) => r.toObjectId);

    // 2. Fetch note content
    const notesResponse = await axios.post(
      `${HUBSPOT_API_URL}/notes/batch/read`,
      {
        properties: ["hs_note_body", "hs_createdate"],
        inputs: noteIds.map((id: string) => ({ id })),
      },
      { headers: getHeaders() }
    );

    const notesResults = notesResponse.data.results || [];
    if (notesResults.length === 0) return null;

    const sorted = notesResults.sort((a: any, b: any) =>
      new Date(b.properties.hs_createdate).getTime() - new Date(a.properties.hs_createdate).getTime()
    );
    const noteBodies = sorted.map((n: any) => n.properties.hs_note_body).filter(Boolean);

    // Priority 1: 15-point sales note
    const salesNote = noteBodies.find((note: string) =>
      /^\s*1:\s*Learner Name/im.test(note.replace(/<[^>]*>/g, ""))
    );
    if (salesNote) return salesNote;

    // Priority 2: Onboarding note
    const onboardingNote = noteBodies.find((note: string) =>
      /payment received/i.test(note) && /athena checked/i.test(note)
    );
    if (onboardingNote) return onboardingNote;

    // Priority 3: Most recent
    return noteBodies[0] || null;
  }

  // ── Log email engagement to HubSpot deal ──────────────────────────────────
  static async logEmailToHubspot(dealId: string, subject: string, htmlBody: string) {
    if (!dealId) return;
    await axios.post(
      `${HUBSPOT_API_URL}/emails`,
      {
        properties: {
          hs_timestamp: new Date().toISOString(),
          hs_email_subject: subject,
          hs_email_html_body: htmlBody,
          hs_email_direction: "EMAIL",
          hs_email_status: "SENT",
        },
        associations: [{
          to: { id: dealId },
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 214 }],
        }],
      },
      { headers: getHeaders() }
    );
  }

  // ── Add note to HubSpot ticket ────────────────────────────────────────────
  static async addNoteToTicket(ticketId: string, noteBody: string) {
    if (!ticketId || !noteBody) return;
    await axios.post(
      "https://api.hubapi.com/engagements/v1/engagements",
      {
        engagement: { active: true, type: "NOTE", timestamp: Date.now() },
        associations: { ticketIds: [parseInt(ticketId, 10)] },
        metadata: { body: noteBody },
      },
      { headers: getHeaders() }
    );
  }

  // ── Create HubSpot task (upskilling) ──────────────────────────────────────
  static async createUpskillTask(
    jlid: string,
    teacherName: string,
    learnerName: string,
    tpManagerHsId: string,
    gapCourses: string[],
    dealId: string
  ) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const subject = `Upskilling Required: ${teacherName} \u2192 ${gapCourses.join(", ")}`;
    const body =
      `Teacher ${teacherName} has been assigned learner ${learnerName} (${jlid}).\n\n` +
      `Upskilling needed before learner reaches the following courses:\n` +
      gapCourses.map((c, i) => `\u2022 Future ${i + 1}: ${c}`).join("\n") +
      `\n\nPlease arrange upskilling sessions promptly.`;

    const properties: any = {
      hs_task_subject: subject,
      hs_task_body: body,
      hs_task_status: "NOT_STARTED",
      hs_task_priority: "HIGH",
      hs_task_type: "TODO",
      hs_timestamp: dueDate.getTime(),
    };
    if (tpManagerHsId) properties.hubspot_owner_id = tpManagerHsId;

    const payload: any = { properties };
    if (dealId) {
      payload.associations = [{
        to: { id: String(dealId) },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 216 }],
      }];
    }

    await axios.post(`${HUBSPOT_API_URL}/tasks`, payload, { headers: getHeaders() });
  }

  // ── Get best phone number for a deal (via contact associations) ───────────
  static async getBestPhoneNumberForDeal(dealId: string): Promise<string | null> {
    if (!dealId) return null;
    try {
      const assocResponse = await axios.get(
        `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/contacts`,
        { headers: getHeaders() }
      );
      const assocResults = assocResponse.data.results;
      if (!assocResults || assocResults.length === 0) return null;

      const contactIds = assocResults.map((r: any) => ({ id: r.toObjectId }));
      const contactsResponse = await axios.post(
        `${HUBSPOT_API_URL}/contacts/batch/read`,
        { properties: ["mobilephone", "phone", "hs_whatsapp_phone_number"], inputs: contactIds },
        { headers: getHeaders() }
      );

      let bestNumber: string | null = null;
      for (const contact of contactsResponse.data.results || []) {
        const p = contact.properties;
        if (p.hs_whatsapp_phone_number) return p.hs_whatsapp_phone_number;
        if (p.mobilephone && !bestNumber) bestNumber = p.mobilephone;
        if (p.phone && !bestNumber) bestNumber = p.phone;
      }
      return bestNumber;
    } catch (_) {
      return null;
    }
  }

  // ── Get all phone numbers for a deal ──────────────────────────────────────
  static async getPhoneNumbersForDeal(dealId: string) {
    if (!dealId) return { best: null, all: [] };
    try {
      const assocResponse = await axios.get(
        `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/contacts`,
        { headers: getHeaders() }
      );
      const assocResults = assocResponse.data.results;
      if (!assocResults || assocResults.length === 0) return { best: null, all: [] };

      const contactIds = assocResults.map((r: any) => ({ id: r.toObjectId }));
      const contactsResponse = await axios.post(
        `${HUBSPOT_API_URL}/contacts/batch/read`,
        { properties: ["mobilephone", "phone", "hs_whatsapp_phone_number"], inputs: contactIds },
        { headers: getHeaders() }
      );

      let bestNumber: string | null = null;
      const allNumbers = new Set<string>();

      for (const contact of contactsResponse.data.results || []) {
        const p = contact.properties;
        if (p.hs_whatsapp_phone_number) {
          if (!bestNumber) bestNumber = p.hs_whatsapp_phone_number;
          allNumbers.add(p.hs_whatsapp_phone_number + " (WhatsApp)");
        }
        if (p.mobilephone) {
          if (!bestNumber) bestNumber = p.mobilephone;
          allNumbers.add(p.mobilephone + " (Mobile)");
        }
        if (p.phone) {
          if (!bestNumber) bestNumber = p.phone;
          allNumbers.add(p.phone + " (Phone)");
        }
      }
      return { best: bestNumber, all: Array.from(allNumbers) };
    } catch (_) {
      return { best: null, all: [] };
    }
  }

  // ── Migration history stats for a JLID ───────────────────────────────────
  static async getMigrationHistoryStats(jlid: string) {
    const response = await axios.post(
      `${HUBSPOT_API_URL}/tickets/search`,
      {
        filterGroups: [{
          filters: [
            { propertyName: "learner_uid", operator: "EQ", value: jlid },
            { propertyName: "hs_pipeline", operator: "EQ", value: MIGRATION_PIPELINE_ID },
          ],
        }],
        limit: 100,
        sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
        properties: [
          "subject", "createdate", "reason_of_migration__t_",
          "new_teacher", "current_teacher__t_", "hs_pipeline_stage",
        ],
      },
      { headers: getHeaders() }
    );

    const results = response.data.results || [];
    const events: any[] = [];
    let inboundCount = 0;
    let outboundCount = 0;

    for (const t of results) {
      const subject = t.properties.subject || "";
      const reason = t.properties.reason_of_migration__t_ || "";
      const stage = t.properties.hs_pipeline_stage;

      if (EXCLUDED_STAGE_IDS.includes(stage)) continue;
      if (IGNORE_KEYWORDS.some((kw) => subject.includes(kw))) continue;
      if (!reason && !subject.includes("Migration")) continue;

      const isInbound = INBOUND_REASONS.includes(reason);
      if (isInbound) inboundCount++; else outboundCount++;

      events.push({
        id: t.id,
        date: t.properties.createdate,
        reason: reason || "Unspecified Migration",
        type: isInbound ? "Inbound (Parent)" : "Outbound (JetLearn)",
        from: t.properties.current_teacher__t_,
        to: t.properties.new_teacher,
      });
    }

    return { total: events.length, inbound: inboundCount, outbound: outboundCount, events };
  }

  // ── Comprehensive learner history (powers Migration Timeline page) ────────
  static async getComprehensiveLearnerHistory(jlid: string) {
    if (!jlid) return { success: false, message: "JLID is required." };

    // 1. Learner profile from deal
    let learnerProfile: any = { learnerName: jlid, jlid };
    let dealId: string | null = null;

    try {
      const dealResult = await this.fetchByJlid(jlid);
      if (dealResult && dealResult.success && dealResult.data) {
        const d = dealResult.data;
        dealId = d.dealId || null;
        learnerProfile = {
          learnerName: d.learnerName || jlid,
          jlid: d.jlid || jlid,
          age: d.age || "N/A",
          course: d.course || "N/A",
          currentTeacher: d.currentTeacher || "N/A",
          currentSubscriptionType: d.paymentType || "N/A",
          startingDate: d.startingDate || null,
          subscriptionStartDate: d.subscriptionStartDate || null,
          dealAmount: d.dealAmount || 0,
          currency: d.currency || "EUR",
          tenure: d.subscriptionTenureMonths || 0,
          jetGuide: d.jetGuideName || "N/A",
          hubspotLink: dealId
            ? `https://app.hubspot.com/contacts/${PORTAL_ID}/deal/${dealId}`
            : null,
        };
      }
    } catch (_) {}

    // 2. Migration tickets
    const migrationTimeline: any[] = [];
    let inboundCount = 0;
    let outboundCount = 0;

    try {
      const ticketResponse = await axios.post(
        `${HUBSPOT_API_URL}/tickets/search`,
        {
          filterGroups: [{
            filters: [
              { propertyName: "learner_uid", operator: "EQ", value: jlid },
              { propertyName: "hs_pipeline", operator: "EQ", value: MIGRATION_PIPELINE_ID },
            ],
          }],
          properties: [
            "subject", "createdate", "reason_of_migration__t_", "new_teacher",
            "current_teacher__t_", "hs_pipeline_stage", "migration_completed_date",
            "hs_ticket_id", "migration_intervened_by",
          ],
          sorts: [{ propertyName: "createdate", direction: "ASCENDING" }],
          limit: 100,
        },
        { headers: getHeaders() }
      );

      for (const t of ticketResponse.data.results || []) {
        const props = t.properties || {};
        const subject = String(props.subject || "").trim();
        const reason = String(props.reason_of_migration__t_ || "").trim();
        const stage = String(props.hs_pipeline_stage || "").trim();

        if (EXCLUDED_STAGE_IDS.includes(stage)) continue;
        if (IGNORE_KEYWORDS.some((kw) => subject.includes(kw))) continue;
        if (!reason && !subject.includes("Migration")) continue;

        const isInbound = INBOUND_REASONS.includes(reason);
        const stageLabel = STAGE_LABELS[stage] || (stage ? `Stage ${stage}` : "Unknown");
        const isCompleted = stageLabel === "Migration Completed";
        const triggeredDate = t.createdAt ? new Date(t.createdAt) : props.createdate ? new Date(props.createdate) : null;
        const completedDate = props.migration_completed_date ? new Date(props.migration_completed_date) : null;
        const daysToResolve =
          triggeredDate && completedDate && isCompleted
            ? Math.round((completedDate.getTime() - triggeredDate.getTime()) / 86400000)
            : null;

        if (isInbound) inboundCount++; else outboundCount++;

        migrationTimeline.push({
          id: t.id,
          ticketId: props.hs_ticket_id || t.id,
          hubspotLink: `https://app.hubspot.com/contacts/${PORTAL_ID}/ticket/${t.id}`,
          date: triggeredDate ? triggeredDate.toISOString() : null,
          completedDate: completedDate ? completedDate.toISOString() : null,
          daysToResolve,
          subject: subject || "Migration",
          reason: reason || "Unspecified",
          fromTeacher: props.current_teacher__t_ || "Unknown",
          toTeacher: props.new_teacher || "Not assigned",
          stage: stageLabel,
          isCompleted,
          type: isInbound ? "inbound" : "outbound",
          intervenedBy: props.migration_intervened_by || "",
        });
      }
    } catch (_) {}

    // 3. Journey analysis
    const total = migrationTimeline.length;
    let riskLevel: string;
    let riskMessage: string;

    if (outboundCount >= 3) {
      riskLevel = "Critical";
      riskMessage = "Learner has been moved 3+ times by JetLearn. High churn risk \u2014 CLS review recommended immediately.";
    } else if (outboundCount === 2) {
      riskLevel = "High";
      riskMessage = "Two JetLearn-initiated moves on record. Monitor closely and ensure the current teacher is a strong fit.";
    } else if (outboundCount === 1) {
      riskLevel = "Medium";
      riskMessage = "One JetLearn-initiated move on record. Journey is mostly stable.";
    } else if (inboundCount >= 2) {
      riskLevel = "Watch";
      riskMessage = "Parent has requested schedule or teacher changes more than once. Check if the current slot is working well.";
    } else {
      riskLevel = "Stable";
      riskMessage = "No major disruptions detected. Learner journey looks healthy.";
    }

    // 4. Plain-English summary
    let aiSummary = `${learnerProfile.learnerName} has no migration history on record.`;
    if (total > 0) {
      const first = migrationTimeline[0];
      const last = migrationTimeline[total - 1];
      const fd = first.date
        ? new Date(first.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "unknown";
      const ld = last.date
        ? new Date(last.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "unknown";
      aiSummary =
        `${learnerProfile.learnerName} has had ${total} migration event${total > 1 ? "s" : ""} ` +
        `(${inboundCount} parent-requested, ${outboundCount} JetLearn-initiated), ` +
        `first recorded on ${fd} and most recently on ${ld}. ` +
        `Current teacher: ${learnerProfile.currentTeacher}. ` +
        `Overall journey stability: ${riskLevel}.`;
    }

    return {
      success: true,
      learnerProfile,
      migrationTimeline,
      journeyAnalysis: {
        totalMigrations: total,
        inbound: inboundCount,
        outbound: outboundCount,
        riskLevel,
        riskMessage,
        ticketDetails: migrationTimeline,
      },
      aiSummary,
    };
  }

  // ── Active learners per teacher (paginated HubSpot scan) ─────────────────
  static async getActiveLearnersPerTeacher() {
    const activeStatuses = ["Active Learner", "Friendly Learner", "VIP", "Break & Return"];
    const counts: Record<string, { total: number; coding: number; math: number }> = {};
    let after: string | undefined;
    let page = 0;
    const MAX_PAGES = 30;

    do {
      const body: any = {
        filterGroups: [{
          filters: [{ propertyName: "learner_status", operator: "IN", values: activeStatuses }],
        }],
        properties: ["current_teacher", "current_course"],
        limit: 100,
      };
      if (after) body.after = after;

      const response = await axios.post(`${HUBSPOT_API_URL}/deals/search`, body, { headers: getHeaders() });
      const data = response.data;
      if (!data.results) break;

      for (const deal of data.results) {
        const rawTeacher = deal.properties.current_teacher || "";
        const course = String(deal.properties.current_course || "").toLowerCase();
        if (!rawTeacher) continue;

        if (!counts[rawTeacher]) counts[rawTeacher] = { total: 0, coding: 0, math: 0 };
        counts[rawTeacher].total++;
        if (course.includes("math")) counts[rawTeacher].math++;
        else counts[rawTeacher].coding++;
      }

      after = data.paging?.next?.after;
      page++;
    } while (after && page < MAX_PAGES);

    return counts;
  }

  // ── Total active learner count (single fast request) ─────────────────────
  static async getTotalActiveLearnerCount() {
    const activeStatuses = ["Active Learner", "Friendly Learner", "VIP", "Break & Return"];
    try {
      const response = await axios.post(
        `${HUBSPOT_API_URL}/deals/search`,
        {
          filterGroups: [{ filters: [{ propertyName: "learner_status", operator: "IN", values: activeStatuses }] }],
          properties: ["hs_object_id"],
          limit: 1,
        },
        { headers: getHeaders() }
      );
      const total = response.data.total || 0;
      return { success: true, total };
    } catch (e: any) {
      return { success: false, total: 0 };
    }
  }

  // ── Teacher attrition report (active learners under a teacher) ────────────
  static async getTeacherAttritionReport(teacherHsId: string, teacherName: string) {
    const activeStatuses = ["Active Learner", "Friendly Learner", "VIP", "Break & Return"];

    const filter = teacherHsId
      ? { propertyName: "current_teacher", operator: "EQ", value: teacherHsId }
      : { propertyName: "current_teacher", operator: "CONTAINS_TOKEN", value: teacherName };

    const response = await axios.post(
      `${HUBSPOT_API_URL}/deals/search`,
      {
        filterGroups: [{
          filters: [
            filter,
            { propertyName: "learner_status", operator: "IN", values: activeStatuses },
          ],
        }],
        limit: 100,
        properties: [
          "dealname", "jetlearner_id", "current_course", "module_start_date",
          "learner_status", "dealstage", "amount", "subscription_tenure",
          "deal_currency_code", "payment_type", "installment_type", "subscription",
        ],
      },
      { headers: getHeaders() }
    );

    const results = response.data.results || [];
    const students = results.map((deal: any) => {
      const p = deal.properties;
      const amount = safeParseNumber(p.amount);
      const currency = p.deal_currency_code || "EUR";
      const isInstallment =
        (p.payment_type || "").toLowerCase().includes("installment") ||
        (p.installment_type || "").toLowerCase().includes("installment");

      return {
        name: p.dealname,
        jlid: p.jetlearner_id,
        course: p.current_course,
        status: p.learner_status,
        hubspotLink: `https://app.hubspot.com/contacts/${PORTAL_ID}/deal/${deal.id}`,
        dealAmountLocal: amount,
        dealCurrency: currency,
        dealTenureMonths: safeParseNumber(p.subscription_tenure),
        paymentTag: isInstallment ? "Installment" : "Upfront",
      };
    });

    return { success: true, students, teacher: teacherName };
  }

  // ── Escalation history for a teacher ─────────────────────────────────────
  static async getTeacherEscalationHistory(teacherHsId: string, teacherName: string) {
    const ESCALATION_REASONS = [
      "Escalation on Teacher", "Escalation On Teacher",
      "Teacher Performance Issue", "Escalation on Teacher Post Migration",
    ];

    const teacherFilter = teacherHsId
      ? { propertyName: "current_teacher__t_", operator: "EQ", value: teacherHsId }
      : { propertyName: "current_teacher__t_", operator: "EQ", value: teacherName };

    const response = await axios.post(
      `${HUBSPOT_API_URL}/tickets/search`,
      {
        filterGroups: [{
          filters: [
            { propertyName: "hs_pipeline", operator: "EQ", value: MIGRATION_PIPELINE_ID },
            teacherFilter,
          ],
        }],
        properties: [
          "subject", "current_teacher__t_", "reason_of_migration__t_", "createdate",
          "migration_completed_date", "hs_pipeline_stage", "learner_full_name",
          "learner_uid", "hs_ticket_id",
        ],
        limit: 200,
        sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
      },
      { headers: getHeaders() }
    );

    const results = response.data.results || [];
    const escalationTickets = results.filter((t: any) =>
      ESCALATION_REASONS.some(
        (r) => r.toLowerCase() === String(t.properties.reason_of_migration__t_ || "").trim().toLowerCase()
      )
    );

    const byReason: Record<string, number> = {};
    const tickets: any[] = [];
    let lastEscalationDate: Date | null = null;

    for (const ticket of escalationTickets) {
      const props = ticket.properties;
      const reason = String(props.reason_of_migration__t_ || "").trim();
      const triggeredDate = ticket.createdAt ? new Date(ticket.createdAt) : props.createdate ? new Date(props.createdate) : null;
      const completedDate = props.migration_completed_date ? new Date(props.migration_completed_date) : null;
      const stageLabel = STAGE_LABELS[props.hs_pipeline_stage] || `Stage ${props.hs_pipeline_stage}`;
      const isCompleted = stageLabel === "Migration Completed";
      const daysToResolve =
        triggeredDate && completedDate && isCompleted
          ? Math.round((completedDate.getTime() - triggeredDate.getTime()) / 86400000)
          : null;

      if (triggeredDate && (!lastEscalationDate || triggeredDate > lastEscalationDate)) {
        lastEscalationDate = triggeredDate;
      }

      byReason[reason] = (byReason[reason] || 0) + 1;
      tickets.push({
        ticketId: ticket.id || props.hs_ticket_id || "N/A",
        ticketName: props.subject || "N/A",
        learnerName: props.learner_full_name || "N/A",
        learnerUid: props.learner_uid || "N/A",
        reason,
        status: stageLabel,
        isCompleted,
        triggeredDate: triggeredDate ? triggeredDate.toLocaleDateString("en-GB") : "N/A",
        completedDate: completedDate ? completedDate.toLocaleDateString("en-GB") : "N/A",
        daysToResolve: daysToResolve !== null ? daysToResolve : "N/A",
      });
    }

    return {
      success: true,
      totalCount: escalationTickets.length,
      byReason,
      tickets,
      lastEscalationDate: lastEscalationDate ? lastEscalationDate.toLocaleDateString("en-GB") : null,
    };
  }

  // ── HubSpot deal tickets (for learner history panel) ──────────────────────
  static async fetchHubspotHistory(dealId: string) {
    if (!dealId) return [];

    try {
      const ticketAssocResponse = await axios.get(
        `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/tickets`,
        { headers: getHeaders() }
      );
      const ticketAssoc = ticketAssocResponse.data.results || [];
      if (ticketAssoc.length === 0) return [];

      const detailsResponse = await axios.post(
        `${HUBSPOT_API_URL}/tickets/batch/read`,
        {
          properties: ["subject", "content", "createdate", "hs_pipeline_stage"],
          inputs: ticketAssoc.map((t: any) => ({ id: t.toObjectId })),
        },
        { headers: getHeaders() }
      );

      const ignoreKeywords = ["PRM", "Renewal", "Kit", "Device", "Laptop", "Feedback"];
      const historyEvents: any[] = [];

      for (const t of detailsResponse.data.results || []) {
        const subject = t.properties.subject || "";
        if (ignoreKeywords.some((kw) => subject.includes(kw))) continue;
        historyEvents.push({
          timestamp: t.properties.createdate,
          type: "hubspot-ticket",
          description: `[HubSpot Ticket] ${subject}`,
          source: "HubSpot",
        });
      }

      return historyEvents;
    } catch (_) {
      return [];
    }
  }

  // ── Escalated teachers in last 90 days ────────────────────────────────────
  static async getEscalatedTeachersLast90Days() {
    const ESCALATION_REASONS = [
      "Teacher Performance Issue", "Escalation On Teacher",
      "Escalation on Teacher", "Escalation on Teacher Post Migration",
    ];
    const escalationMap: Record<string, number> = {};
    let after: string | undefined;
    let page = 0;

    do {
      const body: any = {
        filterGroups: [{
          filters: [
            { propertyName: "hs_pipeline", operator: "EQ", value: MIGRATION_PIPELINE_ID },
            { propertyName: "reason_of_migration__t_", operator: "IN", values: ESCALATION_REASONS },
          ],
        }],
        properties: ["current_teacher__t_", "reason_of_migration__t_", "createdate"],
        limit: 200,
        sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
      };
      if (after) body.after = after;

      const response = await axios.post(`${HUBSPOT_API_URL}/tickets/search`, body, { headers: getHeaders() });
      const data = response.data;
      if (!data.results) break;

      for (const ticket of data.results) {
        const rawTeacher = ticket.properties.current_teacher__t_ || "";
        if (!rawTeacher) continue;
        escalationMap[rawTeacher] = (escalationMap[rawTeacher] || 0) + 1;
      }

      after = data.paging?.next?.after;
      page++;
    } while (after && page < 10);

    return escalationMap;
  }
}