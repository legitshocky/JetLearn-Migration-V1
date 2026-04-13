import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export class EmailService {
  private static transporter = nodemailer.createTransport({
    // This is a placeholder. In a real app, you'd use environment variables for SMTP config.
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "user@example.com",
      pass: process.env.SMTP_PASS || "password",
    },
  });

  private static getTemplate(templateName: string): string {
    try {
      const templatePath = path.join(process.cwd(), "server", "templates", `${templateName}.html`);
      if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, "utf-8");
      }
    } catch (error) {
      console.error(`Error reading template ${templateName}:`, error);
    }
    return "";
  }

  static async sendEmail(to: string, subject: string, html: string) {
    console.log(`[EmailService] Simulating email to: ${to}`);
    console.log(`[EmailService] Subject: ${subject}`);
    
    // In a real environment with valid SMTP, you'd do:
    // await this.transporter.sendMail({ from: '"JetLearn" <no-reply@jetlearn.com>', to, subject, html });
    
    return { success: true, message: "Email sent successfully (simulated)" };
  }

  static generateOnboardingEmail(data: any) {
    let html = this.getTemplate("new_learner_onboarding");
    if (!html) {
      // Fallback to basic template if file not found
      return `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Welcome to JetLearn, ${data.dealname}!</h2>
          <p>We are excited to have you on board for the <strong>${data.current_course}</strong> course.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3>Class Details:</h3>
          <ul>
            <li><strong>Teacher:</strong> ${data.teacher}</li>
            <li><strong>Start Date:</strong> ${data.startDate}</li>
            <li><strong>Timezone:</strong> ${data.timezone}</li>
            <li><strong>Zoom Link:</strong> <a href="${data.zoomLink}">${data.zoomLink}</a></li>
          </ul>
          <h3>Schedule:</h3>
          <ul>
            ${data.sessions.map((s: any) => `<li>${s.day} at ${s.hr}:${s.min} ${s.ampm}</li>`).join("")}
          </ul>
          <p>If you have any questions, please contact your JetGuide: <strong>${data.jetGuide}</strong>.</p>
          <p>Happy Learning!<br/>Team JetLearn</p>
        </div>
      `;
    }

    // Replace placeholders
    const replacements: any = {
      learnerName: data.dealname,
      current_course: data.current_course,
      teacher: data.teacher,
      startDate: data.startDate,
      timezone: data.timezone,
      zoomLink: data.zoomLink,
      jetGuide: data.jetGuide,
      parentName: data.parentName
    };

    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, replacements[key] || "");
    });

    return html;
  }

  static generateMigrationEmail(data: any) {
    let html = this.getTemplate("migration_notice");
    if (!html) {
      return `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Teacher Migration Update</h2>
          <p>Dear Parent, we are updating the teacher for <strong>${data.dealname}</strong>'s classes.</p>
          <p><strong>New Teacher:</strong> ${data.newTeacher}</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
          <p>The schedule remains the same. Your new Zoom link is: <a href="${data.zoomLink}">${data.zoomLink}</a></p>
          <p>Best regards,<br/>Team JetLearn</p>
        </div>
      `;
    }

    const replacements: any = {
      learnerName: data.dealname,
      parentName: data.parentName,
      teacherName: data.newTeacher,
      teacherInitial: data.newTeacher ? data.newTeacher.charAt(0) : "T",
      courseName: data.current_course,
      timezone: data.timezone,
      zoomLink: data.zoomLink,
      clsManager: data.clsManager
    };

    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, replacements[key] || "");
    });

    return html;
  }

  static generateInvoiceHtml(data: any) {
    let html = this.getTemplate("invoice");
    if (!html) return "<p>Invoice template not found</p>";

    const currencySymbol = data.currency === 'GBP' ? '£' : data.currency === 'USD' ? '$' : '€';
    
    const replacements: any = {
      parentName: data.parentName,
      parentEmail: data.parentEmail,
      whatsappNumber: data.whatsappNumber,
      jlid: data.jlid,
      timestamp: Date.now().toString().slice(-6),
      date: new Date().toLocaleDateString(),
      planName: data.planName,
      current_course: data.current_course,
      sessionsPerWeek: data.sessionsPerWeek,
      tenure: data.tenure,
      dealAmount: data.dealAmount,
      currencySymbol: currencySymbol,
      amountPaid: data.amountPaid.replace(/[^0-9.]/g, ''),
      balanceDue: data.balanceDue.replace(/[^0-9.]/g, '')
    };

    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, replacements[key] || "");
    });

    return html;
  }

  static generateMinecraftGuide(data: any) {
    return this.getTemplate("minecraft_guide");
  }

  static generateRobloxGuide(data: any) {
    return this.getTemplate("roblox_guide");
  }
}
