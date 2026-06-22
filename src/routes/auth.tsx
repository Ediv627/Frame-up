import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { ArrowUpLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/account" });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast.success("مرحباً بعودتك");
      } else {
        if (!fullName.trim()) throw new Error("الاسم الكامل مطلوب");
        if (password.length < 6) throw new Error("كلمة السر يجب أن تكون 6 أحرف على الأقل");
        await signUp(email, password, fullName, phone);
        toast.success("تم إنشاء الحساب بنجاح");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      toast.error(
        msg.includes("Invalid login credentials")
          ? "البريد أو كلمة السر غير صحيحة"
          : msg.includes("already registered")
            ? "البريد مسجّل بالفعل"
            : msg,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16 md:py-24">
      <div className="mb-10 text-center">
        <p className="text-sm text-muted-foreground mb-2">FRAME UP</p>
        <h1 className="display-ar text-[clamp(2rem,5vw,3rem)] font-black">
          {mode === "signin" ? "أهلاً بعودتك" : "أنشئ حسابك"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === "signin"
            ? "ادخل لمتابعة طلباتك وحفظ مفضلاتك"
            : "احفظ عناوينك وتابع طلباتك بسهولة"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <Field label="الاسم الكامل" value={fullName} onChange={setFullName} required />
            <Field label="رقم الموبايل" type="tel" value={phone} onChange={setPhone} />
          </>
        )}
        <Field label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} required />
        <Field
          label="كلمة السر"
          type="password"
          value={password}
          onChange={setPassword}
          required
          minLength={6}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {submitting ? "..." : mode === "signin" ? "تسجيل الدخول" : "إنشاء الحساب"}
          {!submitting && <ArrowUpLeft className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-foreground font-semibold hover:underline"
        >
          {mode === "signin" ? "إنشاء حساب جديد" : "تسجيل الدخول"}
        </button>
      </p>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          ← العودة للرئيسية
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
  minLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground block mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
      />
    </label>
  );
}
