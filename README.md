# Apna Style Study — Private Portal

Dark/terminal-theme wala student portal. Signup → auto username/password →
WhatsApp confirmation → login → course + file library (view-only) → like/comment.

**Zero cost hai** — Firebase Authentication + Firestore ke free (Spark) plan pe, files Cloudinary ke free plan pe, GitHub Pages pe host hota hai. Kahin bhi card add karne ki zaroorat nahi.

> **Note:** Google ne Feb 2026 se Firebase Storage ko bina Blaze (card-linked) plan ke band kar diya hai, isliye is project mein files (photo/video/pdf/ppt) Firebase Storage ki jagah **Cloudinary** (free, no card) pe upload hoti hain — sirf unka link Firestore mein save hota hai. Baaki sab (Auth, Firestore, likes/comments, view-only lock) waisa hi hai.

---

## Kya kya kaam karta hai vs. nahi karta

✅ **Kaam karta hai:**
- Signup form (naam, mobile, class, photo) → automatic unique username/password
- Real login system (Firebase Authentication)
- File library — image/video/pdf/ppt upload aur view-only display
- Like + comment, sabko dikhta hai, real-time
- Masti Batch course listing + WhatsApp enroll button
- Profile photo change
- Documentation page

⚠️ **Limitations (ye technically kisi ke liye bhi possible nahi hai, mera limitation nahi):**
- WhatsApp pe **photo automatically attach nahi hoti** — sirf text pre-filled hota hai, user ko photo manually attach karke Send dabana padega.
- "WhatsApp Business automatically reply karke username-password bheje" — ye Meta ke bina approved paid WhatsApp API ke free mein possible nahi. Isliye credentials seedha **website pe hi** turant dikhte hain signup ke baad (zyada reliable bhi hai).
- Download **100% block nahi ho sakta** — koi bhi screenshot ya screen-record kar sakta hai. Humne jo kiya hai: right-click disabled, direct download button nahi, drag disabled, aur har file pe tumhara username/mobile ka **watermark** overlay hai (taaki leak trace ho sake).
- PPT files browser mein directly nahi khulti — Microsoft ke free Office Online viewer se embed kiya hai (internet chahiye, ye third-party service hai).

---

## STEP 1 — Firebase Project Banao (5 min, free)

1. https://console.firebase.google.com par jao, Google account se login karo.
2. **"Add project"** → naam do (jaise `apna-style-study`) → continue → project bana lo.
3. Left menu se **Build → Authentication** → "Get Started" → **Email/Password** provider ON karo.
4. Left menu se **Build → Firestore Database** → "Create Database" → **Production mode** select karo → koi bhi region choose karo (asia-south1 India ke liye best hai).

(Storage step yahan se hata di gayi hai — files ab Cloudinary pe upload hoti hain, STEP 2.5 dekho neeche.)

## STEP 2 — Config Copy Karo

1. Project ke top-left gear icon (⚙️) → **Project settings**.
2. Neeche scroll karo "Your apps" section tak → **`</>`  (Web) icon** pe click karo.
3. App nickname do (jaise `portal`) → Register app.
4. Jo `firebaseConfig = {...}` object dikhega, use copy karo.
5. Is project ki `js/firebase-config.js` file kholo aur `PASTE_YOUR_...` wali saari values apni actual values se replace karo.

## STEP 2.5 — Cloudinary Account Banao (5 min, free, no card)

1. https://cloudinary.com/users/register/free par free account banao (Google se bhi ho jayega).
2. Login karne ke baad **Dashboard** pe tumhara **Cloud name** dikhega — usko copy karo.
3. Left menu se **Settings (⚙️) → Upload** tab kholo → neeche **"Upload presets"** section mein **"Add upload preset"** click karo.
4. **Signing Mode** ko **"Unsigned"** kar do (bahut zaroori — isi se browser se seedha upload ho payega bina backend ke) → naam de do (jaise `apna_style_uploads`) → Save.
5. Us preset ka naam aur apna Cloud name, `js/firebase-config.js` file mein `CLOUDINARY_CLOUD_NAME` aur `CLOUDINARY_UPLOAD_PRESET` mein paste kar do.

Free plan mein 25GB storage + 25GB/month bandwidth milta hai, bina kisi card ke — ek chhote portal ke liye kaafi zyada hai.

## STEP 3 — Security Rules Lagao

1. Firebase console → **Firestore Database → Rules** tab → is project ki `firestore.rules` file ka poora content paste karo → **Publish**.

## STEP 4 — Apna Admin Account Banao

1. Pehle website (locally ya GitHub Pages pe) se normal signup karo (khud ka naam/mobile/photo dalke).
2. Firebase console → **Firestore Database → Data** tab → `students` collection kholo → apna record dhundo (naam se pehchano).
3. Us document mein `isAdmin` field ko `true` set kar do (click on field → edit → boolean → true).
4. Ab tum `admin.html` pe login karke files aur courses upload kar sakte ho.

## STEP 5 — GitHub Pages pe Live Karo

1. GitHub pe naya repository banao (jaise `apna-style-portal`).
2. Is zip ke saare files/folders us repo mein upload karo (drag & drop se ya git push se).
3. Repo → **Settings → Pages** → Source: "Deploy from a branch" → Branch: `main` / folder `/root` → Save.
4. 1-2 min baad tumhari site live hogi: `https://<tumhara-username>.github.io/apna-style-portal/`

---

## WhatsApp Number

Abhi code mein `js/firebase-config.js` ke andar `WHATSAPP_NUMBER = "919263430050"` set hai (91 = India code). Change karna ho to bas ye value badal dena.

## 100k Username-Password Wale Idea Ke Baare Mein

Maine fixed 100,000 pre-saved pairs banane ke bajaye **har signup pe live unique username+password generate** hone wala system banaya hai (jaise `AS-7X92K4`). Fayda ye hai:
- Kabhi bhi khatam nahi hoga (100k se zyada students aa jayein tab bhi chalega)
- Har ek genuinely random/unique hai, koi pehle se guess nahi kar sakta
- Firestore automatically duplicate check karta hai

Agar tumhe strictly fixed 100k list hi chahiye thi kisi specific reason se (jaise offline pehle se print karke batana), bata dena — wo bhi bana sakta hoon, bas sochna padega store kaise karein securely.

## Files Kya Kya Hain

```
index.html        → signup page
login.html        → login page
dashboard.html     → main portal (home/courses/library tabs)
admin.html         → sirf tumhare liye — upload panel
docs.html          → documentation/trust page
css/style.css       → dark terminal theme
js/firebase-config.js → yahan apni Firebase keys + Cloudinary cloud name/preset daalni hain
js/util.js          → helper functions (Cloudinary upload helper bhi yahin hai)
js/signup.js, dashboard.js, admin.js → har page ki logic
firestore.rules     → Firebase console mein paste karne wali security rules
```
