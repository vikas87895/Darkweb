document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut().then(() => window.location.href = "login.html");
});

requireAuth((user, data) => {
  if(!data.isAdmin){
    document.getElementById("deniedBox").style.display = "block";
    return;
  }
  document.getElementById("adminBox").style.display = "block";
});

document.getElementById("contentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("msg1");
  const btn = document.getElementById("uploadBtn");
  const title = document.getElementById("cTitle").value.trim();
  const date = document.getElementById("cDate").value;
  const files = Array.from(document.getElementById("cFile").files);

  if(files.length === 0){ showMsg(msgEl, "Kam se kam ek file choose karo.", "err"); return; }

  btn.disabled = true;
  try{
    for(let i = 0; i < files.length; i++){
      btn.textContent = `Uploading ${i+1}/${files.length}...`;
      const file = files[i];
      const fileURL = await uploadToCloudinary(file, "content");
      await db.collection("content").add({
        title, type: detectFileType(file),
        date: date || new Date().toISOString().slice(0,10),
        fileURL, createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    showMsg(msgEl, `${files.length} file(s) upload ho gayi!`, "ok");
    document.getElementById("contentForm").reset();
  }catch(err){
    showMsg(msgEl, "Error: " + err.message, "err");
  }
  btn.disabled = false; btn.textContent = "Upload";
});

// ---------- course material (separate credential-gated course.html page) ----------
const cmNameEl = document.getElementById("cmName");
const cmUsernameEl = document.getElementById("cmUsername");
const cmPasswordEl = document.getElementById("cmPassword");

function randomCourseMaterialPassword(){
  return `MASTI-${Math.floor(1000 + Math.random() * 9000)}`;
}
cmPasswordEl.value = randomCourseMaterialPassword();

// Username naam se auto-generate hota hai jab tak admin khud usko edit na kare
cmUsernameEl.addEventListener("input", () => { cmUsernameEl.dataset.touched = "1"; });
cmNameEl.addEventListener("input", () => {
  if(cmUsernameEl.dataset.touched) return;
  const slug = cmNameEl.value.trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  cmUsernameEl.value = slug ? `AS-${slug}` : "";
});

function detectFileType(file){
  const mime = file.type || "";
  if(mime.startsWith("image/")) return "image";
  if(mime.startsWith("video/")) return "video";
  if(mime === "application/pdf") return "pdf";
  return "ppt";
}

document.getElementById("courseMaterialForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("msg3");
  const btn = document.getElementById("cmBtn");
  const courseName = cmNameEl.value.trim();
  const username = cmUsernameEl.value.trim().toUpperCase();
  const password = cmPasswordEl.value.trim();
  const files = Array.from(document.getElementById("cmFiles").files);

  if(files.length === 0){ showMsg(msgEl, "Kam se kam ek file choose karo.", "err"); return; }

  btn.disabled = true; btn.textContent = "Uploading...";
  try{
    const uploaded = [];
    for(const file of files){
      const fileURL = await uploadToCloudinary(file, `courseMaterials/${username}`);
      uploaded.push({ title: file.name, type: detectFileType(file), fileURL });
    }

    await db.collection("courseMaterials").add({
      courseName, username, password,
      files: uploaded,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showMsg(msgEl, "Course material add ho gaya!", "ok");
    document.getElementById("courseMaterialForm").reset();
    cmPasswordEl.value = randomCourseMaterialPassword();
    delete cmUsernameEl.dataset.touched;

    document.getElementById("cmCredCard").style.display = "block";
    document.getElementById("cmLink").textContent = location.origin + location.pathname.replace("admin.html", "course.html");
    document.getElementById("cmOutUser").textContent = username;
    document.getElementById("cmOutPass").textContent = password;
  }catch(err){
    showMsg(msgEl, "Error: " + err.message, "err");
  }
  btn.disabled = false; btn.textContent = "Course Material Add Karo";
});

document.getElementById("courseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("msg2");
  const btn = document.getElementById("courseBtn");
  const title = document.getElementById("crTitle").value.trim();
  const description = document.getElementById("crDesc").value.trim();
  const price = document.getElementById("crPrice").value.trim();
  const imgFile = document.getElementById("crImage").files[0];

  btn.disabled = true; btn.textContent = "Adding...";
  try{
    let imageURL = "";
    if(imgFile){
      imageURL = await uploadToCloudinary(imgFile, "courses");
    }
    await db.collection("courses").add({
      title, description, price, imageURL,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showMsg(msgEl, "Course add ho gaya!", "ok");
    document.getElementById("courseForm").reset();
  }catch(err){
    showMsg(msgEl, "Error: " + err.message, "err");
  }
  btn.disabled = false; btn.textContent = "Add Course";
});
