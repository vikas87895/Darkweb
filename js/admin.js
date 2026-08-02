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
  const type = document.getElementById("cType").value;
  const date = document.getElementById("cDate").value;
  const file = document.getElementById("cFile").files[0];

  if(!file){ showMsg(msgEl, "File choose karo.", "err"); return; }

  btn.disabled = true; btn.textContent = "Uploading...";
  try{
    const fileURL = await uploadToCloudinary(file, "content");

    await db.collection("content").add({
      title, type, date: date || new Date().toISOString().slice(0,10),
      fileURL, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showMsg(msgEl, "Upload ho gaya!", "ok");
    document.getElementById("contentForm").reset();
  }catch(err){
    showMsg(msgEl, "Error: " + err.message, "err");
  }
  btn.disabled = false; btn.textContent = "Upload";
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
