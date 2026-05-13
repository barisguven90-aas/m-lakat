import resend from './client';

const SENDER = 'Intervio Team <no-reply@intervioai.com>';
// If domain is not verified on resend, it has to be onboarding@resend.dev, but we'll try the proper one or fall back.
const FROM_EMAIL = process.env.NODE_ENV === 'production' ? SENDER : 'onboarding@resend.dev';

export async function sendWelcomeEmail(to: string, name: string, language: string = 'en') {
    const firstName = name ? name.split(' ')[0] : 'there';
    
    const content = language === 'tr' ? {
        subject: 'Intervio\'ya hoş geldin 👋',
        text: `Merhaba ${firstName},

İlk yapay zeka mülakatını yapmaya hazırsın.

Herhangi bir iş ilanı linkini yapıştır,
CV'ni yükle ve başla.

15 dakika içinde işe alınma olasılığını öğren.

→ Mülakatına başla
https://intervioai.com/dashboard/applications/new

— Intervio Ekibi`
    } : {
        subject: 'Welcome to Intervio 👋',
        text: `Hi ${firstName},

You're now ready to practice your first AI interview.

Paste any job link and upload your CV to get started.

Get your hire probability score in the next 15 minutes.

→ Start your interview
https://intervioai.com/dashboard/applications/new

— Intervio Team`
    };

    return await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: content.subject,
        text: content.text
    });
}

export async function sendActivationEmail(to: string, name: string, language: string = 'en') {
    const firstName = name ? name.split(' ')[0] : 'there';

    const content = language === 'tr' ? {
        subject: 'İlk mülakatın seni bekliyor',
        text: `Merhaba ${firstName},

Dün kaydoldun ama henüz mülakatına başlamadın.

Kurulum 2 dakikadan az süruyor.

Bir iş ilanı linki yapıştır.
CV'ni yükle.
Pratik yapmaya başla.

→ Şimdi başla
https://intervioai.com/dashboard/applications/new

— Intervio Ekibi`
    } : {
        subject: 'Your first interview is waiting',
        text: `Hi ${firstName},

You signed up yesterday but haven't started your interview yet.

It takes less than 2 minutes to set up.

Paste a job link.
Upload your CV.
Start practicing.

→ Start now
https://intervioai.com/dashboard/applications/new

— Intervio Team`
    };

    return await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: content.subject,
        text: content.text
    });
}

export async function sendReengagementEmail(to: string, name: string, language: string = 'en') {
    const firstName = name ? name.split(' ')[0] : 'there';

    const content = language === 'tr' ? {
        subject: 'Bu ay 1 ücretsiz mülakatın daha var',
        text: `Merhaba ${firstName},

Bu ay hâlâ 1 ücretsiz mülakat hakkın var.

Boşa harcamadan önce kullan.

→ Mülakatına başla
https://intervioai.com/dashboard/applications/new

— Intervio Ekibi`
    } : {
        subject: 'You have 1 free interview left',
        text: `Hi ${firstName},

You still have 1 free interview remaining this month.

Use it before it goes to waste.

→ Start your interview
https://intervioai.com/dashboard/applications/new

— Intervio Team`
    };

    return await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: content.subject,
        text: content.text
    });
}

export async function sendWaitlistEmail(to: string, name: string, language: string = 'en') {
    const firstName = name ? name.split(' ')[0] : 'there';

    const content = language === 'tr' ? {
        subject: 'Intervio Pro listesine alındın 🎉',
        text: `Merhaba ${firstName},

Listeye alındın.

Intervio Pro yayınlanır yayınlanmaz seni haberdar edeceğiz.

Herkesten önce erken erişim hakkı kazanacaksın.

— Intervio Ekibi`
    } : {
        subject: "You're on the Intervio Pro waitlist 🎉",
        text: `Hi ${firstName},

You're on the list.

We'll notify you the moment Intervio Pro launches.

You'll get early access before anyone else.

— Intervio Team`
    };

    return await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: content.subject,
        text: content.text
    });
}
