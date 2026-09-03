import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { krAuthError } from "../../lib/authErrors";
import { UI } from "../../theme";
import { S } from "./authStyles";
import MonthYearPicker from "./MonthYearPicker";
import PasswordInput from "./PasswordInput";

// 학습 과정(카테고리) 정의 — 라벨 + 응시예정일 수집 여부.
// 컴활 급수·ITQ는 시험 응시일이 있어 응시예정일을 받고, 실무 엑셀은 시험이 없어 제외.
export const COURSE = {
  "2급": { label: "컴퓨터활용능력 2급 실기", needsExam: true },
  "1급": { label: "컴퓨터활용능력 1급 실기", needsExam: true },
  "ITQ": { label: "ITQ 엑셀", needsExam: true },
  "실무엑셀": { label: "실무 엑셀", needsExam: false },
};

export default function SignupView({ onSwitch, presetGrade = "2급" }) {
  const { signUp } = useAuth();
  const course = COURSE[presetGrade] || COURSE["2급"];
  const [f, setF] = useState({
    name: "", email: "", password: "", phone: "",
    examDate: "",
    marketingAgree: false, termsAgree: false,
  });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!f.termsAgree) { setErr("이용약관 및 개인정보 처리방침에 동의해 주세요."); return; }
    if (f.password.length < 6) { setErr("비밀번호는 6자 이상이어야 합니다."); return; }
    setBusy(true);
    // 학습 과정은 눌러 들어온 CTA에 따라 자동 지정된다(폼에서 재선택하지 않음)
    const { error } = await signUp({ ...f, targetGrade: presetGrade });
    setBusy(false);
    if (error) { setErr(krAuthError(error, "가입에 실패했습니다.")); return; }
    setDone(true);
  }

  if (done) return (
    <div>
      <div style={S.title}>가입 신청 완료 🎉</div>
      <div style={S.ok}>
        입력하신 이메일로 인증 메일을 보냈습니다. 메일의 링크를 눌러 인증을 마친 뒤 로그인하면
        <b> {course.label}</b> 결제 화면으로 이어집니다.
      </div>
      <button style={S.primary} onClick={onSwitch}>로그인 화면으로</button>
    </div>
  );

  return (
    <form onSubmit={submit}>
      <div style={S.title}>수강 신청 · 계정 만들기</div>
      <div style={S.sub}>가입 후 결제하면 선택한 학습 과정의 학습·실습이 열립니다.</div>

      {/* 학습 과정 — CTA로 자동 지정(읽기 전용) */}
      <label style={S.label}>학습 과정</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: UI.tealSoft, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "12px 14px" }}>
        <span style={{ background: UI.teal, color: "#fff", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: UI.rSm }}>선택됨</span>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: UI.ink }}>{course.label}</span>
      </div>

      <label style={S.label}>이름</label>
      <input style={S.input} required value={f.name} onChange={set("name")} />

      <label style={S.label}>이메일</label>
      <input style={S.input} type="email" required value={f.email} onChange={set("email")} />

      <label style={S.label}>비밀번호 (6자 이상)</label>
      <PasswordInput style={S.input} required value={f.password} onChange={set("password")} />

      <label style={S.label}>휴대전화번호</label>
      <input style={S.input} type="tel" placeholder="010-0000-0000" required value={f.phone} onChange={set("phone")} />

      {course.needsExam && (
        <>
          <label style={S.label}>응시 예정 시기 <span style={{ color: UI.faint, fontWeight: 500 }}>(선택)</span></label>
          <MonthYearPicker value={f.examDate} onChange={(v) => setF((p) => ({ ...p, examDate: v }))} />
        </>
      )}

      <label style={S.checkRow}>
        <input type="checkbox" checked={f.termsAgree} onChange={set("termsAgree")} />
        <span>[필수] 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
      </label>
      <label style={S.checkRow}>
        <input type="checkbox" checked={f.marketingAgree} onChange={set("marketingAgree")} />
        <span>[선택] 마케팅 정보 수신에 동의합니다.</span>
      </label>

      {err && <div style={S.error}>{err}</div>}
      <button style={S.primary} disabled={busy}>{busy ? "처리 중…" : "가입하고 결제 진행"}</button>

      <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
        이미 계정이 있으신가요?{" "}
        <button type="button" style={S.ghost} onClick={onSwitch}>로그인</button>
      </div>
    </form>
  );
}
