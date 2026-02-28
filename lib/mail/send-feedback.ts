import resend from '@/lib/mail/client';
import { FeedbackReport } from '../feedback/generate-feedback';

export async function sendFeedbackEmail(
    toEmail: string,
    userName: string,
    jobTitle: string,
    companyName: string,
    feedback: FeedbackReport
) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Interview Coach <onboarding@resend.dev>',
            to: [toEmail],
            subject: `Your Interview Feedback: ${jobTitle} at ${companyName}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Interview Feedback Report</h1>
          <p>Hi ${userName},</p>
          <p>Here is the detailed feedback for your mock interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Executive Summary</h3>
            <p>${feedback.summary_text}</p>
          </div>

          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1; text-align: center; background: #e0f2fe; padding: 15px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #0284c7;">${feedback.job_match_score}%</div>
              <div style="font-size: 12px; color: #555;">Job Match</div>
            </div>
            <div style="flex: 1; text-align: center; background: #dcfce7; padding: 15px; border-radius: 8px;">
               <div style="font-size: 24px; font-weight: bold; color: #16a34a;">${feedback.star_methodology_score}%</div>
               <div style="font-size: 12px; color: #555;">STAR Method</div>
            </div>
          </div>

          <h3>Key Strengths</h3>
          <ul>
            ${feedback.strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>

          <h3>Action Plan</h3>
          <ul>
            ${feedback.improvement_actions.map(s => `<li>${s}</li>`).join('')}
          </ul>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888;">
            Sent by LinkedIn Interview Coach via Resend.
          </p>
        </div>
      `
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email send execution error:', error);
        return { success: false, error };
    }
}
