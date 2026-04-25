import { google } from "googleapis";
import nodemailer from "nodemailer";
import { getServiceAccount } from "../lib/serviceAccount.js";

const CERT_TEMPLATE_ID = "1QWy_mlcsF6K56I357rwyLDEUVzfcYTLH0TyP_gs83VI";
const CERT_SAVE_FOLDER = "1Eaub-wn5J7yMhYrHeQCiHKOXJEKR6vFX";
const SHEET_ID_APP_DATA = process.env.SHEET_ID_APP_DATA || "1XxC8Y0sWkBqoOa0Ntw6zhd5EYXTvaTAN4XhIH1hOwDE";

const FOUNDATION_COURSES = [
  "introduction to coding (code.org)",
  "animation with scratch jr",
  "introduction to coding ii (code.org)",
  "science adventures with sprite lab",
  "robotics with microbit (jr)",
  "building blocks of ai with google",
  "tynker ai animation lab",
  "learn with minecraft",
];

function getCertSlideIndex(courseName: string): number {
  if (!courseName) return 2;
  const low = courseName.toLowerCase().trim();
  if (/\bmath/i.test(low)) return 1;
  for (const fc of FOUNDATION_COURSES) {
    if (low.includes(fc) || fc.includes(low)) return 0;
  }
  return 2;
}

async function getAuthClient() {
  const sa = getServiceAccount();
  return new google.auth.GoogleAuth({
    credentials: sa,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/presentations",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

async function generateCertificatePDF(
  learnerName: string,
  courseName: string,
  yearOverride?: string
): Promise<{ pdfBuffer: Buffer; driveUrl: string | null; fileName: string }> {
  const auth = await getAuthClient();
  const drive = google.drive({ version: "v3", auth });
  const slidesApi = google.slides({ version: "v1", auth });
  const year = yearOverride || String(new Date().getFullYear());
  const slideIndex = getCertSlideIndex(courseName);
  let tempPresId: string | null = null;

  try {
    // 1. Copy template
    const copyRes = await drive.files.copy({
      fileId: CERT_TEMPLATE_ID,
      requestBody: { name: `_cert_temp_${Date.now()}` },
    });
    tempPresId = copyRes.data.id!;

    // 2. Get all slides
    const presRes = await slidesApi.presentations.get({ presentationId: tempPresId });
    const allSlides = presRes.data.slides || [];

    // 3. Delete every slide except target index
    const deleteRequests: any[] = [];
    for (let i = allSlides.length - 1; i >= 0; i--) {
      if (i !== slideIndex && allSlides[i].objectId) {
        deleteRequests.push({ deleteObject: { objectId: allSlides[i].objectId } });
      }
    }
    if (deleteRequests.length > 0) {
      await slidesApi.presentations.batchUpdate({
        presentationId: tempPresId,
        requestBody: { requests: deleteRequests },
      });
    }

    // 4. Replace placeholders
    await slidesApi.presentations.batchUpdate({
      presentationId: tempPresId,
      requestBody: {
        requests: [
          { replaceAllText: { containsText: { text: "{{learnerName}}", matchCase: false }, replaceText: learnerName } },
          { replaceAllText: { containsText: { text: "{{courseName}}", matchCase: false }, replaceText: courseName } },
          { replaceAllText: { containsText: { text: "{{year}}", matchCase: false }, replaceText: year } },
        ],
      },
    });

    // 5. Export as PDF using Drive export API
    const client = await auth.getClient();
    const tokenRes = await (client as any).getAccessToken();
    const token = tokenRes.token as string;
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${tempPresId}/export?mimeType=application/pdf`;
    const exportRes = await fetch(exportUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!exportRes.ok) throw new Error(`PDF export failed: HTTP ${exportRes.status}`);
    const pdfBuffer = Buffer.from(await exportRes.arrayBuffer());

    // 6. Save PDF to Drive folder
    let driveUrl: string | null = null;
    const fileName = `${learnerName.replace(/\s+/g, "_")}_${courseName.replace(/\s+/g, "_")}_Certificate.pdf`;
    try {
      const { Readable } = await import("stream");
      const saveRes = await drive.files.create({
        requestBody: { name: fileName, parents: [CERT_SAVE_FOLDER] },
        media: { mimeType: "application/pdf", body: Readable.from(pdfBuffer) },
        fields: "webViewLink",
      });
      driveUrl = saveRes.data.webViewLink || null;
    } catch (e: any) {
      console.warn("[Cert] Drive save warning (non-fatal):", e.message);
    }

    return { pdfBuffer, driveUrl, fileName };
  } finally {
    if (tempPresId) {
      try { await drive.files.delete({ fileId: tempPresId }); } catch (_) {}
    }
  }
}

async function logCertificate(
  jlid: string, learnerName: string, courseName: string, year: string,
  parentEmail: string, sentBy: string, driveUrl: string | null, status: string, notes: string
) {
  try {
    const auth = await getAuthClient();
    const sheetsApi = google.sheets({ version: "v4", auth });
    const HEADERS = ["Timestamp","JLID","Learner Name","Course","Year","Parent Email","Sent By","Status","Drive URL","Notes"];

    const meta = await sheetsApi.spreadsheets.get({ spreadsheetId: SHEET_ID_APP_DATA });
    const exists = meta.data.sheets?.some((s) => s.properties?.title === "Certificate Log");
    if (!exists) {
      await sheetsApi.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID_APP_DATA,
        requestBody: { requests: [{ addSheet: { properties: { title: "Certificate Log" } } }] },
      });
      await sheetsApi.spreadsheets.values.update({
        spreadsheetId: SHEET_ID_APP_DATA,
        range: "'Certificate Log'!A1",
        valueInputOption: "RAW",
        requestBody: { values: [HEADERS] },
      });
    }

    await sheetsApi.spreadsheets.values.append({
      spreadsheetId: SHEET_ID_APP_DATA,
      range: "'Certificate Log'!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[new Date().toISOString(), jlid||"", learnerName||"", courseName||"", year||"",
                   parentEmail||"", sentBy||"", status||"Sent", driveUrl||"", notes||""]],
      },
    });
  } catch (e: any) {
    console.error("[Cert] logCertificate error:", e.message);
  }
}

function buildCertEmailHtml(learnerName: string, courseName: string, year: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#eeeef6;padding:24px 0;">
<tr><td align="center" style="padding:0 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:580px;background:#fff;border-radius:16px;border:1px solid #ddd9f5;">
<tr><td align="center" style="background:#1a1560;border-radius:16px 16px 0 0;padding:36px 40px 32px;">
  <img src="https://cdn.jsdelivr.net/gh/legitshocky/Jet-learn-Images@main/Logo.png" alt="JetLearn" width="140" style="display:block;margin:0 auto 20px;max-width:140px;">
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
    <tr><td style="background:#f97316;border-radius:100px;padding:5px 16px;">
      <span style="color:#fff;font-size:11px;font-weight:700;font-family:Arial;letter-spacing:0.8px;text-transform:uppercase;">🎉 Certificate of Achievement</span>
    </td></tr>
  </table>
  <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;text-align:center;">${learnerName} Did It!</h1>
  <p style="color:#c7d2fe;font-size:13px;margin:0;font-family:Arial;text-align:center;">World's Top Rated AI, Coding &amp; STEM Academy for Kids</p>
</td></tr>
<tr><td style="padding:32px 40px 24px;">
  <p style="color:#374151;font-size:15px;font-weight:600;margin:0 0 8px;font-family:Arial;">Dear Parent,</p>
  <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;font-family:Arial;">
    We are thrilled to share that <strong style="color:#1a1560;">${learnerName}</strong> has successfully completed their JetLearn course.
    Please find the certificate attached to this email.
  </p>
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8f7ff;border-radius:10px;border:1px solid #e0dff5;margin-bottom:24px;">
    <tr style="background:#1a1560;"><td style="padding:10px 20px;color:#fff;font-size:11px;font-weight:700;font-family:Arial;text-transform:uppercase;border-radius:10px 0 0 0;">Course Completed</td>
    <td style="padding:10px 20px;color:#c7d2fe;font-size:11px;font-weight:700;font-family:Arial;text-transform:uppercase;border-radius:0 10px 0 0;width:60px;">Year</td></tr>
    <tr>
      <td style="padding:13px 10px 13px 20px;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="24" valign="middle" style="padding-right:10px;">
            <span style="display:block;width:22px;height:22px;background:#ecfdf5;border:1.5px solid #6ee7b7;border-radius:6px;text-align:center;font-size:12px;line-height:20px;color:#059669;font-family:Arial;">&#10003;</span>
          </td>
          <td valign="middle" style="color:#1a1560;font-size:13.5px;font-weight:700;font-family:Arial;">${courseName}</td>
        </tr></table>
      </td>
      <td style="padding:13px 20px 13px 10px;color:#f97316;font-size:13px;font-weight:800;font-family:Arial;white-space:nowrap;">${year}</td>
    </tr>
  </table>
  <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 24px;font-family:Arial;">
    We look forward to continuing this incredible learning journey with ${learnerName}. Keep coding, keep creating, keep growing! 🚀
  </p>
  <p style="color:#374151;font-size:13px;margin:0;font-family:Arial;">Warm regards,<br/><strong style="color:#1a1560;">Team JetLearn</strong></p>
</td></tr>
<tr><td align="center" style="background:#f8f7ff;border-radius:0 0 16px 16px;padding:20px 40px;border-top:1px solid #e0dff5;">
  <p style="color:#9ca3af;font-size:11px;margin:0;font-family:Arial;">© ${year} JetLearn · World's Top Rated AI, Coding &amp; STEM Academy</p>
</td></tr>
</table></td></tr></table>`;
}

export class CertificateService {
  static async sendCertificateEmail(
    jlid: string, learnerName: string, courseName: string,
    parentEmail: string, parentName: string, sentBy: string
  ): Promise<{ success: boolean; driveUrl: string | null; message: string }> {
    if (!parentEmail) return { success: false, driveUrl: null, message: "No parent email provided." };
    const year = String(new Date().getFullYear());
    try {
      const { pdfBuffer, driveUrl, fileName } = await generateCertificatePDF(learnerName, courseName, year);
      const subject = `JetLearn — ${learnerName} has completed ${courseName} — Certificate Enclosed`;
      const html = buildCertEmailHtml(learnerName, courseName, year);

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({
          from: `"JetLearn" <${process.env.SMTP_USER}>`,
          to: parentEmail,
          subject,
          html,
          attachments: [{ filename: fileName, content: pdfBuffer, contentType: "application/pdf" }],
        });
      } else {
        console.log(`[Cert] SMTP not configured — skipping email send to ${parentEmail}. PDF generated OK.`);
      }

      await logCertificate(jlid, learnerName, courseName, year, parentEmail, sentBy, driveUrl, "Sent", "");
      return { success: true, driveUrl, message: "Certificate generated and sent successfully." };
    } catch (e: any) {
      console.error("[Cert] sendCertificateEmail error:", e.message);
      const year = String(new Date().getFullYear());
      await logCertificate(jlid, learnerName, courseName, year, parentEmail, sentBy, null, "Failed", e.message);
      return { success: false, driveUrl: null, message: e.message };
    }
  }

  static async sendBulkCertificates(
    jlid: string, learnerName: string, courses: string[],
    parentEmail: string, parentName: string, sentBy: string
  ): Promise<{ success: boolean; results: { course: string; success: boolean; driveUrl: string | null; message: string }[] }> {
    const results = [];
    for (const course of courses) {
      const r = await CertificateService.sendCertificateEmail(jlid, learnerName, course, parentEmail, parentName, sentBy);
      results.push({ course, ...r });
    }
    return { success: results.every((r) => r.success), results };
  }

  static async getCertificateLog(limit = 50): Promise<any[]> {
    try {
      const auth = await getAuthClient();
      const sheetsApi = google.sheets({ version: "v4", auth });
      const res = await sheetsApi.spreadsheets.values.get({
        spreadsheetId: SHEET_ID_APP_DATA,
        range: "'Certificate Log'!A2:J",
      });
      const rows = res.data.values || [];
      return rows.slice(-limit).reverse().map((r) => ({
        timestamp: r[0] || "", jlid: r[1] || "", learnerName: r[2] || "",
        course: r[3] || "", year: r[4] || "", parentEmail: r[5] || "",
        sentBy: r[6] || "", status: r[7] || "", driveUrl: r[8] || "", notes: r[9] || "",
      }));
    } catch (e: any) {
      console.error("[Cert] getCertificateLog error:", e.message);
      return [];
    }
  }
}
