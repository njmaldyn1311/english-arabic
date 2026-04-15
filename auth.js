// 🔐 تحميل Supabase إذا غير موجود
if(typeof supabase === "undefined"){
  let s = document.createElement("script");
  s.src = "https://unpkg.com/@supabase/supabase-js@2";
  document.head.appendChild(s);
}

// ⏳ انتظار تحميل Supabase
setTimeout(()=>{

  // 🔥 إعدادات
  const SUPABASE_URL="https://ofyugbhplaynjeafdrgx.supabase.co";
  const SUPABASE_KEY="sb_publishable_DH6LH89gqOx_-ovHZP5tTg_SNDHluJO";

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // 👤 user_id
  let user_id = localStorage.getItem("user_id");
  if(!user_id){
    user_id = "user_" + Math.random().toString(36).substr(2,9);
    localStorage.setItem("user_id", user_id);
  }

  // 🔐 session_id
  if(!localStorage.getItem("session_id")){
    localStorage.setItem("session_id", "session_" + Math.random().toString(36).substr(2,9));
  }

  let session_id = localStorage.getItem("session_id");

  // 🔥 حفظ الجلسة في Supabase
  async function saveSession(){
    await client
.from("user_session")
.upsert(
  {
    user_id: user_id,
    session_id: session_id
  },
  {
    onConflict: "user_id"
  }
);

  saveSession();

  // 🚫 طرد كل التبويبات داخل نفس الجهاز
  window.addEventListener("storage",(e)=>{
    if(e.key === "force_logout"){
      localStorage.clear();
      location="login.html";
    }
  });

  // 🚪 تسجيل خروج عام
  window.logout = function(msg){

    localStorage.setItem("force_logout", Date.now());

    localStorage.clear();

    if(msg){
      alert(msg);
    }

    setTimeout(()=>{
      location="login.html";
    },800);
  }

  // 🔍 التحقق من الجلسة (إذا جهاز ثاني دخل)
  async function checkSession(){

    const localSession = localStorage.getItem("session_id");

    const { data, error } = await client
      .from("user_session")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if(error){
      console.log("Session error:", error);
      return;
    }

    if(!data){
      // أول مرة → خزّن
      saveSession();
      return;
    }

    if(data.session_id !== localSession){
      logout("🚫 تم تسجيل الدخول من جهاز آخر");
    }

  }

  // 🔁 كل 3 ثواني
  setInterval(checkSession, 3000);

  // 🚀 أول تشغيل
  checkSession();

},1000);
