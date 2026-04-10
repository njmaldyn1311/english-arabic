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

  // 🔥 user_id
  let user_id = localStorage.getItem("user_id");
  if(!user_id){
    user_id = "user_" + Math.random().toString(36).substr(2,9);
    localStorage.setItem("user_id", user_id);
  }

  // 🔐 session
  if(!localStorage.getItem("session_id")){
    localStorage.setItem("session_id", Date.now());
  }

  // 🚫 طرد كل التبويبات
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

  // 🔍 التحقق
  async function checkAccess(){

    const localSession = localStorage.getItem("session_id");

    const { data } = await client
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    if(!data){
      logout("❌ الحساب غير موجود");
      return;
    }

    if(data.status === "banned"){
      logout("🚫 تم حظرك");
      return;
    }

    if(data.session_id !== localSession){
      logout("🚫 تم تسجيل الدخول من جهاز آخر");
      return;
    }

    if(data.plan === "free"){
      let created = new Date(data.created_at);
      let now = new Date();
      let days = Math.floor((now - created)/(1000*60*60*24));

      if(days >= 3){
        logout("⏳ انتهت الفترة التجريبية");
      }
    }
  }

  // 🔁 كل 5 ثواني
  setInterval(checkAccess, 5000);

  // 🚀 أول دخول
  checkAccess();

},1000);
