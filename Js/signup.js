const form = document.getElementById("signupForm");
const msgEl = document.getElementById("msg");
const submitBtn = document.getElementById("submitBtn");
const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}">`;
    document.getElementById("dropLabel").textContent = file.name;
  };
  reader.readAsDataURL(file);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msgEl.className = "msg";

  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const studentClass = document.getElementById("studentClass").value;
  const photoFile = photoInput.files[0];

  if(!/^[0-9]{10}$/.test(mobile)){
    showMsg(msgEl, "Mobile number 10 digit ka hona chahiye.", "err");
    return;
  }
  if(!photoFile){
    showMsg(msgEl, "Photo upload karna zaroori hai.", "err");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Processing...";

  try{
    // 1. unique username + password generate
    const username = await generateUniqueUsername();
    const password = generatePassword();
    const email = toEmail(username);

    // 2. Firebase Auth account banao
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;

    // 3. photo Cloudinary pe upload karo
    const photoURL = await uploadToCloudinary(photoFile, `students/${uid}`);

    // 4. Firestore mein student record + username reservation ek saath save karo
    const batch = db.batch();
    batch.set(db.collection("students").doc(uid), {
      name, mobile, class: studentClass,
      username, photoURL,
      profilePhotoURL: photoURL,
      isAdmin: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    batch.set(db.collection("usernames").doc(username), {
      uid, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await batch.commit();

    // 5. UI mein credentials dikhao
    document.getElementById("outUser").textContent = username;
    document.getElementById("outPass").textContent = password;
    form.style.display = "none";
    document.getElementById("credBox").style.display = "block";

    // 6. WhatsApp confirmation link taiyar karo
    const text = encodeURIComponent(
      `*Apna Style Study — New Signup*\nName: ${name}\nMobile: ${mobile}\nClass: ${studentClass}\nUsername: ${username}\n\n(Apni photo yahan manually attach karke send karo)`
    );
    document.getElementById("waBtn").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    // Auto sign-out kar dete hain taaki wo pehle credentials note kare, phir consciously login kare
    await auth.signOut();

  }catch(err){
    console.error(err);
    showMsg(msgEl, "Kuch galat ho gaya: " + err.message, "err");
    submitBtn.disabled = false;
    submitBtn.textContent = "Signup & Generate Access ID";
  }
});

document.getElementById("copyBtn")?.addEventListener("click", () => {
  const u = document.getElementById("outUser").textContent;
  const p = document.getElementById("outPass").textContent;
  navigator.clipboard.writeText(`Username: ${u}\nPassword: ${p}`);
  const btn = document.getElementById("copyBtn");
  btn.textContent = "Copied ✓";
  setTimeout(()=>btn.textContent="Copy Credentials", 1500);
});
