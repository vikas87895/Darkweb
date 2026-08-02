let CURRENT_USER = null;
let CURRENT_DATA = null;

// ---------- tab switching ----------
document.querySelectorAll(".tab-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".tab-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const tab = link.dataset.tab;
    ["home","courses","library"].forEach(t => {
      document.getElementById("tab-"+t).style.display = (t === tab) ? "block" : "none";
    });
  });
});

document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut().then(() => window.location.href = "login.html");
});

// ---------- boot ----------
requireAuth((user, data) => {
  CURRENT_USER = user;
  CURRENT_DATA = data;

  document.getElementById("profilePic").src = data.profilePhotoURL || data.photoURL;
  document.getElementById("pName").textContent = data.name;
  document.getElementById("pUser").textContent = data.username;
  document.getElementById("pClass").textContent = data.class;
  document.getElementById("pMobile").textContent = data.mobile;
  document.getElementById("pSince").textContent = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : "—";

  lockDownContent(document.body);
  loadCourses();
  loadLibrary();
});

// ---------- profile photo update ----------
document.getElementById("profilePhotoInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const url = await uploadToCloudinary(file, `students/${CURRENT_USER.uid}`);
  await db.collection("students").doc(CURRENT_USER.uid).update({profilePhotoURL: url});
  document.getElementById("profilePic").src = url;
});

// ---------- courses ----------
async function loadCourses(){
  const grid = document.getElementById("coursesGrid");
  const snap = await db.collection("courses").orderBy("createdAt","desc").get();
  if(snap.empty){
    grid.innerHTML = `<p class="small">Abhi koi course list nahi hai — jald aa raha hai.</p>`;
    return;
  }
  grid.innerHTML = "";
  snap.forEach(doc => {
    const c = doc.data();
    const text = encodeURIComponent(`Hi, mujhe "${c.title}" course join karna hai. Mera username: ${CURRENT_DATA.username}`);
    grid.innerHTML += `
      <div class="card">
        <div class="media">${c.imageURL ? `<img src="${c.imageURL}">` : `<span class="small">MASTI BATCH</span>`}</div>
        <div class="body">
          <div class="title">${c.title}</div>
          <div class="meta">${c.price ? "₹"+c.price : "Contact for price"}</div>
          <p class="small mt" style="margin-top:8px;">${c.description || ""}</p>
          <a class="btn small block mt" target="_blank" href="https://wa.me/${WHATSAPP_NUMBER}?text=${text}">Enroll on WhatsApp</a>
        </div>
      </div>`;
  });
}

// ---------- library ----------
async function loadLibrary(){
  const grid = document.getElementById("libraryGrid");
  const snap = await db.collection("content").orderBy("date","desc").get();
  if(snap.empty){
    grid.innerHTML = `<p class="small">Abhi koi file upload nahi hui.</p>`;
    return;
  }
  grid.innerHTML = "";
  for(const doc of snap.docs){
    const item = doc.data();
    const id = doc.id;
    const likesSnap = await db.collection("content").doc(id).collection("likes").get();
    const likedByMe = likesSnap.docs.some(d => d.id === CURRENT_USER.uid);
    const commentsCountSnap = await db.collection("content").doc(id).collection("comments").get();

    let mediaHTML = "";
    if(item.type === "image") mediaHTML = `<img src="${item.fileURL}">`;
    else if(item.type === "video") mediaHTML = `<video src="${item.fileURL}" controls controlsList="nodownload noremoteplayback" disablePictureInPicture></video>`;
    else mediaHTML = `<span class="small">${item.type.toUpperCase()} · TAP TO VIEW</span>`;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="media" data-id="${id}">
        ${mediaHTML}
        <div class="watermark">${CURRENT_DATA.username}\n${CURRENT_DATA.mobile}</div>
        <div class="locked-badge">VIEW ONLY</div>
      </div>
      <div class="body">
        <div class="title">${item.title}</div>
        <div class="meta">${item.date || ""} · ${item.type.toUpperCase()}</div>
      </div>
      <div class="actions">
        <button class="likeBtn ${likedByMe?'liked':''}" data-id="${id}">♥ <span class="likeCount">${likesSnap.size}</span></button>
        <button class="openBtn" data-id="${id}">💬 <span>${commentsCountSnap.size} comments</span></button>
      </div>`;
    grid.appendChild(card);
  }

  lockDownContent(grid);

  grid.querySelectorAll(".likeBtn").forEach(btn => {
    btn.addEventListener("click", () => toggleLike(btn));
  });
  grid.querySelectorAll(".openBtn, .media").forEach(el => {
    el.addEventListener("click", () => openViewer(el.dataset.id));
  });
}

async function toggleLike(btn){
  const id = btn.dataset.id;
  const likeRef = db.collection("content").doc(id).collection("likes").doc(CURRENT_USER.uid);
  const existing = await likeRef.get();
  const countEl = btn.querySelector(".likeCount");
  if(existing.exists){
    await likeRef.delete();
    btn.classList.remove("liked");
    countEl.textContent = parseInt(countEl.textContent) - 1;
  }else{
    await likeRef.set({username: CURRENT_DATA.username, ts: firebase.firestore.FieldValue.serverTimestamp()});
    btn.classList.add("liked");
    countEl.textContent = parseInt(countEl.textContent) + 1;
  }
}

// ---------- viewer modal ----------
const overlay = document.getElementById("viewerOverlay");
const viewerBody = document.getElementById("viewerBody");
document.getElementById("closeViewer").addEventListener("click", () => overlay.classList.remove("show"));

async function openViewer(id){
  const doc = await db.collection("content").doc(id).get();
  const item = doc.data();

  let embedHTML = "";
  if(item.type === "image"){
    embedHTML = `<img src="${item.fileURL}" style="width:100%;border-radius:4px;" draggable="false">`;
  }else if(item.type === "video"){
    embedHTML = `<video src="${item.fileURL}" controls controlsList="nodownload" style="width:100%;border-radius:4px;"></video>`;
  }else if(item.type === "pdf"){
    embedHTML = `<iframe src="https://docs.google.com/gview?url=${encodeURIComponent(item.fileURL)}&embedded=true" style="width:100%;height:60vh;border:0;"></iframe>`;
  }else if(item.type === "ppt"){
    embedHTML = `<iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.fileURL)}" style="width:100%;height:60vh;border:0;"></iframe>`;
  }

  viewerBody.innerHTML = `
    <div style="position:relative;">
      ${embedHTML}
      <div class="watermark" style="position:absolute;">${CURRENT_DATA.username}\n${CURRENT_DATA.mobile}</div>
    </div>
    <h3 class="mt">${item.title}</h3>
    <p class="small">${item.date || ""} · ${item.type.toUpperCase()}</p>
    <div class="comments" id="commentsBox">
      <p class="small">Loading comments...</p>
    </div>
    <form class="comment-form" id="commentForm">
      <input type="text" id="commentInput" placeholder="Comment likho..." required>
      <button type="submit" class="btn small">Post</button>
    </form>
  `;
  lockDownContent(viewerBody);
  overlay.classList.add("show");

  loadComments(id);

  document.getElementById("commentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("commentInput");
    const text = input.value.trim();
    if(!text) return;
    await db.collection("content").doc(id).collection("comments").add({
      uid: CURRENT_USER.uid,
      username: CURRENT_DATA.username,
      text,
      ts: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = "";
    loadComments(id);
  });
}

async function loadComments(id){
  const box = document.getElementById("commentsBox");
  const snap = await db.collection("content").doc(id).collection("comments").orderBy("ts","desc").get();
  if(snap.empty){
    box.innerHTML = `<p class="small">Pehla comment tum karo.</p>`;
    return;
  }
  box.innerHTML = "";
  snap.forEach(doc => {
    const c = doc.data();
    box.innerHTML += `<div class="comment"><span class="who">${c.username}</span><span class="when">${timeAgo(c.ts)}</span><div>${c.text}</div></div>`;
  });
}
