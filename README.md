# 💰 Hisobchi — Shaxsiy moliya boshqaruvi

Daromad va xarajatlarni yuritish, qarzlar, maqsadlar va byudjetni nazorat qilish uchun zamonaviy veb-dastur. To'liq o'zbek tilida.

**🌐 Jonli sayt:** [hisobchim.vercel.app](https://hisobchim.vercel.app)

## Imkoniyatlar

- 📊 **Boshqaruv paneli** — umumiy balans, oylik daromad/xarajat statistikasi va grafiklar
- 💵 **Tranzaksiyalar** — daromad va xarajatlarni toifalar bo'yicha yuritish
- 🗂️ **Toifalar** — o'z toifalaringizni yaratish va tahrirlash
- 💳 **Qarzlar** — bergan va olgan qarzlaringizni muddati bilan kuzatish
- 🎯 **Maqsadlar** — jamg'arma maqsadlarini belgilash va jarayonni kuzatish
- 📅 **Byudjet** — oylik byudjet rejalashtirish va nazorat
- 📈 **Hisobotlar** — davr bo'yicha tahlil va grafiklar
- 🔗 **InvestHub bilan ulanish** — InvestHub'dagi o'zingizga tegishli investorni
  ulanish kodi orqali Investitsiya bo'limiga tortish; kapital va oylik foydalar
  avtomatik yozilib, yangilanib boradi
- 👤 **Ko'p foydalanuvchi** — har bir foydalanuvchi uchun alohida parolli hisob
- 🔐 **Xavfsizlik** — parollar PBKDF2 bilan xeshlanadi, ma'lumotlar AES-GCM bilan shifrlanadi

## Texnologiyalar

Sof HTML, CSS va JavaScript — hech qanday framework yo'q. Ma'lumotlar brauzerning `localStorage` xotirasida saqlanadi va Vercel'da Upstash Redis ulangan bo'lsa, bulutga ham sinxronlanadi (qurilmalar orasida). Dizayn — glassmorphism uslubida, telefon va planshetlarga to'liq moslashgan.

## Bulut sinxronlash (Upstash Redis)

Vercel'da joylashtirilganda `api/` papkadagi serverless funksiyalar foydalanuvchi
ma'lumotini Upstash Redis'da `hisobchi:user:<parol-xeshi>` kalitida saqlaydi.
Yangi qurilmada xuddi shu parol bilan kirsangiz, ma'lumotlaringiz bulutdan yuklanadi.

Sozlash:

1. Vercel loyihasida **Storage → Upstash Redis** bazasini ulang (Savob app bilan
   bitta bazani ishlatsa ham bo'ladi — kalitlar prefiks bilan ajratilgan), yoki
   `KV_REST_API_URL` / `KV_REST_API_TOKEN` (yoki `UPSTASH_REDIS_REST_URL` /
   `UPSTASH_REDIS_REST_TOKEN`) muhit o'zgaruvchilarini qo'lda kiriting.
2. Loyihani qayta deploy qiling.
3. Holatni tekshirish: `https://<sayt>/api/health`

Server sozlanmagan bo'lsa (masalan, faylni to'g'ridan-to'g'ri ochganda) dastur
avvalgidek faqat `localStorage` bilan ishlayveradi.

## InvestHub investitsiyasini ulash

Agar siz InvestHub platformasida boshqarilayotgan fondda investor bo'lsangiz,
o'sha investordagi kapital va oylik foydangizni shu ilovaga tortishingiz mumkin:

1. InvestHub'da o'z investoringizni oching → **Hisobchiga ulash** → kodni nusxalang.
2. Bu ilovada **Investitsiya → InvestHub'dan ulash** → kodni joylashtiring.

Ma'lumot faqat-o'qish rejimida tortiladi (`share:investor:<kod>` kaliti orqali,
Savob app / InvestHub bilan bir xil Upstash bazasidan) va InvestHub'da yangi foyda
kiritilganda avtomatik yangilanib boradi. Faqat o'sha bitta investor ma'lumoti
ko'chiriladi — fonddagi boshqa investorlar ko'rinmaydi.

## Ishga tushirish

Hech qanday o'rnatish shart emas — `index.html` faylini brauzerda oching, yoki istalgan statik server bilan:

```bash
npx serve .
```

## Litsenziya

MIT
