"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Intercept credentials submit from the iframe form
      if (event.data && event.data.type === "LOGIN_SUBMIT") {
        const { email, password } = event.data;

        try {
          const res = await signIn("credentials", {
            email,
            password,
            callbackUrl: "/dashboard",
            redirect: false,
          });

          if (res?.error) {
            // Send error callback back to iframe
            iframeRef.current?.contentWindow?.postMessage(
              {
                type: "LOGIN_ERROR",
                error: "بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.",
              },
              "*"
            );
          } else if (res?.url) {
            window.location.href = "/curriculum"; // Refresh session and redirect cleanly
          }
        } catch (err) {
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: "LOGIN_ERROR",
              error: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.",
            },
            "*"
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-[#eff3f4] py-12 px-6" dir="rtl">
      <div className="w-full max-w-[450px] bg-white border border-[#DDD] rounded-2xl p-2 shadow-md flex flex-col font-sans overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/login-avatar/index.html"
          className="w-full h-[620px] border-0"
          scrolling="no"
          title="Interactive Login Form"
        />
        <div className="border-t border-slate-100 pb-6 pt-3 text-center">
          <p className="text-xs text-slate-400">الحسابات التجريبية:</p>
          <div className="mt-2 text-xs text-slate-500 space-y-1 font-sans">
            <div>hanigomaa137@gmail.com</div>
            <div>abdalrahmanhani29@gmail.com</div>
            <div className="text-[11px] text-[#217093] font-bold">كلمة المرور: 12345678</div>
          </div>
        </div>
      </div>
    </div>
  );
}
