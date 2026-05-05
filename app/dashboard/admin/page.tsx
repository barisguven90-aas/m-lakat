import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Admin Yetkilendirmesi
    // Sadece belirlediğiniz mailler bu sayfaya girebilir. Virgüle ayırarak env'den alabilir veya direkt yazabilirsiniz.
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'barisguven90@gmail.com').split(',');
    
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        redirect('/dashboard'); // Yetkisiz kişiyi ana dashboarda at
    }

    // Maliyet verilerini çek
    const { data: costs } = await supabase.from('interview_costs').select('*');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let todayCost = 0;
    let monthCost = 0;
    let totalCost = 0;

    const userMap = new Set();

    costs?.forEach(cost => {
        const costVal = Number(cost.estimated_cost_usd || 0);
        const date = new Date(cost.created_at);
        
        totalCost += costVal;
        if (date >= today) todayCost += costVal;
        if (date >= firstDayOfMonth) monthCost += costVal;

        if (cost.user_id) userMap.add(cost.user_id);
    });

    const averagePerUser = userMap.size > 0 ? (totalCost / userMap.size) : 0;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard - API Costs</h1>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bugünkü Toplam Maliyet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${todayCost.toFixed(3)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bu Ayki Toplam Maliyet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${monthCost.toFixed(3)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kullanıcı Başına Ort. Maliyet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${averagePerUser.toFixed(3)}</div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Son 10 İşlem</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {costs?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10).map((cost) => (
                            <div key={cost.id} className="flex justify-between items-center border-b border-border/50 pb-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">{new Date(cost.created_at).toLocaleString()}</span>
                                    <span className="ml-4 text-xs">Groq: {cost.groq_tokens_used} / GPT-4o: {cost.gpt4o_tokens_used} / Ses: {cost.speech_minutes_used}dk</span>
                                </div>
                                <div className="font-bold">${Number(cost.estimated_cost_usd).toFixed(3)}</div>
                            </div>
                        ))}
                        {(!costs || costs.length === 0) && <p className="text-muted-foreground text-sm">Henüz kayıt yok.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
