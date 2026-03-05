import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all users with settings
    const { data: users } = await supabaseAdmin
      .from('user_settings')
      .select('user_id, settings');

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users found', sent: 0 });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    let sent = 0;

    for (const userRecord of users) {
      // Get user email
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userRecord.user_id);
      if (!user?.email) continue;

      const settings = userRecord.settings || {};
      const marriageDate = settings.marriageDate || settings.ceremonyDate;

      // Get user's tasks
      const { data: tasks } = await supabaseAdmin
        .from('wedding_tasks')
        .select('*')
        .eq('user_id', userRecord.user_id);

      if (!tasks || tasks.length === 0) continue;

      // Find tasks due this week
      const weekTasks = tasks.filter((t: any) =>
        t.status !== 'completed' &&
        t.status !== 'skipped' &&
        t.calculated_deadline &&
        t.calculated_deadline >= todayStr &&
        t.calculated_deadline <= nextWeekStr
      );

      // Find overdue tasks
      const overdueTasks = tasks.filter((t: any) =>
        t.status !== 'completed' &&
        t.status !== 'skipped' &&
        t.calculated_deadline &&
        t.calculated_deadline < todayStr
      );

      // Find in-progress tasks
      const inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress');

      const totalPending = weekTasks.length + overdueTasks.length + inProgressTasks.length;
      if (totalPending === 0) continue;

      // Calculate countdown
      let countdownHtml = '';
      if (marriageDate) {
        const daysUntil = Math.ceil(
          (new Date(marriageDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntil > 0) {
          countdownHtml = `
            <div style="background:linear-gradient(135deg,#fdf2f8,#fce7f3);border-radius:12px;padding:16px;text-align:center;margin-bottom:20px;">
              <p style="color:#9d174d;font-size:12px;margin:0 0 4px;">結婚式まで</p>
              <p style="color:#9d174d;font-size:28px;font-weight:800;margin:0;">あと${daysUntil}日</p>
            </div>
          `;
        }
      }

      // Build overdue section
      const overdueHtml = overdueTasks.length > 0 ? `
        <div style="background:#fef2f2;border-radius:8px;padding:12px;margin-bottom:16px;">
          <p style="color:#dc2626;font-size:13px;font-weight:600;margin:0 0 8px;">期限超過タスク (${overdueTasks.length}件)</p>
          ${overdueTasks.slice(0, 5).map((t: any) => `
            <div style="padding:4px 0;font-size:12px;color:#991b1b;">
              ・${t.name} (期限: ${t.calculated_deadline})
            </div>
          `).join('')}
          ${overdueTasks.length > 5 ? `<p style="font-size:11px;color:#9ca3af;margin:4px 0 0;">他${overdueTasks.length - 5}件</p>` : ''}
        </div>
      ` : '';

      // Build week tasks
      const weekTasksHtml = weekTasks.length > 0 ? `
        <h3 style="color:#111827;font-size:14px;margin:16px 0 8px;">今週のタスク (${weekTasks.length}件)</h3>
        ${weekTasks.map((t: any) => `
          <div style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;">
            <span style="color:#111827;font-weight:500;">${t.name}</span>
            <span style="color:#9ca3af;margin-left:8px;">期限: ${t.calculated_deadline}</span>
          </div>
        `).join('')}
      ` : '';

      // Build in-progress section
      const inProgressHtml = inProgressTasks.length > 0 ? `
        <h3 style="color:#111827;font-size:14px;margin:16px 0 8px;">進行中 (${inProgressTasks.length}件)</h3>
        ${inProgressTasks.slice(0, 5).map((t: any) => `
          <div style="padding:4px 0;font-size:12px;color:#4b5563;">・${t.name}</div>
        `).join('')}
      ` : '';

      const completedCount = tasks.filter((t: any) => t.status === 'completed').length;
      const totalActive = tasks.filter((t: any) => t.status !== 'skipped').length;
      const progressPercent = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

      const body = `
        <h2 style="color:#111827;font-size:20px;margin:0 0 16px;">今週の結婚準備タスク</h2>
        ${countdownHtml}
        <div style="margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:12px;color:#6b7280;">全体進捗</span>
            <span style="font-size:12px;font-weight:700;color:#e11d48;">${progressPercent}% (${completedCount}/${totalActive})</span>
          </div>
          <div style="background:#e5e7eb;border-radius:99px;height:8px;overflow:hidden;">
            <div style="background:linear-gradient(90deg,#e11d48,#f43f5e);height:100%;border-radius:99px;width:${progressPercent}%;"></div>
          </div>
        </div>
        ${overdueHtml}
        ${weekTasksHtml}
        ${inProgressHtml}
      `;

      await sendEmail({
        to: user.email,
        subject: `今週の結婚準備タスクは${totalPending}件です`,
        body,
      });
      sent++;
    }

    return NextResponse.json({ message: 'Weekly task notifications sent', sent });
  } catch (error) {
    console.error('[notifications]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
