// Random username jaise AS7X92K4
function generateUsername(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing 0/O/1/I
  let code = "";
  for(let i=0;i<6;i++) code += chars[Math.floor(Math.random()*chars.length)];
  return "AS-" + code;
}

// Strong random password, 10 characters
function generatePassword(){
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  let pass = "";
  for(let i=0;i<10;i++) pass += chars[Math.floor(Math.random()*chars.length)];
  return pass;
}

// Username ko "usernames" collection mein unique verify karke deta hai
// (collision hone par retry). Ye collection isliye alag hai kyunki isko
// login se pehle bhi (public) check karna padta hai, aur ismein koi
// private data (naam/mobile/photo) nahi hota, sirf reservation hoti hai.
async function generateUniqueUsername(){
  let username, exists = true, tries = 0;
  while(exists && tries < 8){
    username = generateUsername();
    const doc = await db.collection("usernames").doc(username).get();
    exists = doc.exists;
    tries++;
  }
  return username;
}

function showMsg(el, text, type){
  el.textContent = text;
  el.className = "msg show " + (type || "err");
}

function toEmail(username){
  return username.trim().toUpperCase() + AUTH_DOMAIN_SUFFIX;
}

function timeAgo(ts){
  if(!ts) return "";
  const seconds = Math.floor((Date.now() - ts.toMillis())/1000);
  if(seconds < 60) return "abhi";
  const mins = Math.floor(seconds/60);
  if(mins < 60) return mins+"m pehle";
  const hrs = Math.floor(mins/60);
  if(hrs < 24) return hrs+"h pehle";
  const days = Math.floor(hrs/24);
  return days+"d pehle";
}

// File (photo/video/pdf/ppt) ko Cloudinary pe upload karta hai aur uska
// public URL return karta hai. "auto" endpoint image/video/raw sabko
// khud detect kar leta hai, isliye ek hi function sab file-types ke liye kaam karta hai.
async function uploadToCloudinary(file, folder){
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  if(folder) formData.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
  const res = await fetch(url, { method: "POST", body: formData });

  if(!res.ok){
    let message = "Upload failed";
    try{
      const err = await res.json();
      message = err.error?.message || message;
    }catch(_){}
    throw new Error(message);
  }

  const data = await res.json();
  return data.secure_url;
}

// Har protected page ke top pe call karo - agar login nahi hai to login.html bhej dega
function requireAuth(callback){
  auth.onAuthStateChanged(async (user) => {
    if(!user){
      window.location.href = "login.html";
      return;
    }
    const doc = await db.collection("students").doc(user.uid).get();
    if(!doc.exists){
      auth.signOut();
      window.location.href = "login.html";
      return;
    }
    callback(user, doc.data());
  });
}

// Disable right-click + drag on content areas (deterrent only, not foolproof)
function lockDownContent(root){
  root.addEventListener("contextmenu", e => e.preventDefault());
  root.querySelectorAll("img,video").forEach(el => {
    el.setAttribute("draggable","false");
    el.addEventListener("dragstart", e => e.preventDefault());
  });
}

document.addEventListener("keydown", function(e){
  // deter common save/devtools shortcuts (deterrent only — see README limitations)
  if(e.key === "F12") e.preventDefault();
  if((e.ctrlKey||e.metaKey) && ["s","S","u","U"].includes(e.key)) e.preventDefault();
  if((e.ctrlKey||e.metaKey) && e.shiftKey && ["i","I","j","J","c","C"].includes(e.key)) e.preventDefault();
});
