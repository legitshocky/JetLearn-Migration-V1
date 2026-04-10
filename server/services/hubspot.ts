import axios from "axios";

const HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects";

export class HubSpotService {
  private static getHeaders() {
    const token = process.env.HUBSPOT_API_KEY;
    if (!token) throw new Error("HUBSPOT_API_KEY is not configured");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  static async fetchByJlid(jlid: string) {
    const searchUrl = `${HUBSPOT_API_URL}/deals/search`;
    const properties = [
      "dealname", "jetlearner_id", "amount", "deal_currency_code", "hs_object_id", "age", "learner_status",
      "module_start_date", "module_end_date", "total_classes_committed_through_learner_s_journey",
      "current_teacher", "current_course", "time_zone", "regular_class_day", "frequency_of_classes",
      "payment_type", "subscription", "subscription_tenure", "payment_term", "class_timings",
      "learner_practice_document_link", "installment_type", "installment_terms_final", 
      "installment_months", "installment_received_months__cloned_", "payment_due_date",
      "full_payment_received__y_n_", "jet_guide", "cls_manager", "teacher_manager",
      "parent_email", "parent_name", "phone_number_deal_",
      "stage____payment_trigger_date", "zoom_masked_link", "urge_on_pause_date",
      "current_subscription_taken_classes", "learner_health", "learner_health_reason_code"
    ];

    const response = await axios.post(
      searchUrl,
      {
        filterGroups: [{ filters: [{ propertyName: "jetlearner_id", operator: "EQ", value: jlid }] }],
        properties,
        limit: 1,
      },
      { headers: this.getHeaders() }
    );

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].properties;
    }
    return null;
  }

  static async fetchLatestMigrationTicket(jlid: string) {
    const searchUrl = `${HUBSPOT_API_URL}/tickets/search`;
    const PIPELINE_ID = "66161281";
    const properties = [
      "current_teacher__t_", "new_teacher", "reason_of_migration__t_", "current_course__t_",
      "current_course", "future_course_1", "future_course_2", "future_course_3",
      "regular_class_day__t_", "regular_class_time__in_cet_", "subject", "createdate"
    ];

    const response = await axios.post(
      searchUrl,
      {
        filterGroups: [{
          filters: [
            { propertyName: "hs_pipeline", operator: "EQ", value: PIPELINE_ID },
            { propertyName: "learner_uid", operator: "EQ", value: jlid }
          ]
        }],
        properties,
        limit: 10,
        sorts: [{ propertyName: "createdate", direction: "DESCENDING" }]
      },
      { headers: this.getHeaders() }
    );

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].properties;
    }
    return null;
  }
}
