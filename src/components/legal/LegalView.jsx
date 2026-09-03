import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Logo from "../brand/Logo";
import { UI } from "../../theme";

const mono = { fontFamily: UI.mono };

// ─────────────────────────────────────────────────────────────
// 사업자·서비스 정보 (단일 소스). 값이 비어 있으면 "—"(확인 필요)로 노출된다.
// ─────────────────────────────────────────────────────────────
export const BUSINESS = {
  serviceName: "CellLearn",
  companyName: "셀런",          // 상호 (사업자등록증상 명칭)
  ceo: "심영혁",                // 대표자 성명
  bizNo: "189-56-01110",        // 사업자등록번호
  taxType: "간이과세자",         // 과세유형
  mailOrderNo: "",              // 통신판매업 신고번호 (간이과세자 → 신고 면제 대상, 요건 벗어나면 신고 후 입력)
  address: "대구광역시 달서구 구마로 230, 105동 2304호", // 사업장 소재지
  tel: "",                      // 고객센터 전화 (온라인 고객센터로 대체)
  email: "support@cellearn.kr", // 고객센터 이메일
  domain: "cellearn.kr",
  host: "Vercel Inc.",          // 호스팅 제공자
  pg: "㈜코리아포트원(PortOne)", // 결제대행(PG)
  privacyOfficer: "",           // 개인정보 보호책임자 (미입력 시 대표자)
};

const EFFECTIVE_DATE = "2026년 9월 2일";

// 비어 있는 필수 정보는 확인 필요 표시
const val = (v) => (v && String(v).trim() ? v : "—");

const TABS = [
  { key: "terms", label: "이용약관" },
  { key: "privacy", label: "개인정보처리방침" },
  { key: "refund", label: "환불정책" },
  { key: "business", label: "사업자정보" },
];

export default function LegalView({ initial = "terms", onBack }) {
  const [tab, setTab] = useState(TABS.some((t) => t.key === initial) ? initial : "terms");

  return (
    <div style={{ minHeight: "100vh", background: UI.bg, color: UI.ink, fontFamily: UI.font }}>
      {/* 상단바 */}
      <div style={{ borderBottom: `1px solid ${UI.line}`, background: UI.surface }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={onBack}
            style={{ background: UI.surface, border: `1px solid ${UI.line}`, color: UI.mut, padding: "8px 14px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI.font }}
          >
            <ArrowLeft size={15} strokeWidth={2} /> 홈
          </button>
          <Logo size={26} />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 72px" }}>
        {/* 탭 */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28, borderBottom: `1px solid ${UI.line}` }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  padding: "10px 14px", fontSize: 14.5, fontWeight: active ? 700 : 500,
                  color: active ? UI.teal : UI.mut, fontFamily: UI.font,
                  borderBottom: `2px solid ${active ? UI.teal : "transparent"}`, marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="cl-fade-up">
          {tab === "terms" && <Terms />}
          {tab === "privacy" && <Privacy />}
          {tab === "refund" && <Refund />}
          {tab === "business" && <BusinessInfo />}
        </div>
      </div>
    </div>
  );
}

// ── 공통 조판 요소 ───────────────────────────────────────────
function DocTitle({ children }) {
  return <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 6px" }}>{children}</h1>;
}
function Meta({ children }) {
  return <p style={{ fontSize: 13, color: UI.faint, margin: "0 0 28px" }}>{children}</p>;
}
function Article({ title, children }) {
  return (
    <section style={{ marginBottom: 26 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: UI.ink, margin: "0 0 10px" }}>{title}</h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.8, color: UI.inkSoft }}>{children}</div>
    </section>
  );
}
function OL({ children }) {
  return <ol style={{ margin: "0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>{children}</ol>;
}
function UL({ children }) {
  return <ul style={{ margin: "0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>{children}</ul>;
}

// ── 이용약관 ─────────────────────────────────────────────────
function Terms() {
  return (
    <>
      <DocTitle>이용약관</DocTitle>
      <Meta>시행일: {EFFECTIVE_DATE}</Meta>

      <Article title="제1조 (목적)">
        본 약관은 {BUSINESS.serviceName}(이하 “회사”)가 제공하는 컴퓨터활용능력·ITQ·실무 엑셀 온라인 학습 서비스(이하 “서비스”)의
        이용과 관련하여 회사와 이용자의 권리·의무 및 책임사항, 이용조건 및 절차를 규정함을 목적으로 합니다.
      </Article>

      <Article title="제2조 (정의)">
        <OL>
          <li>“서비스”란 회사가 웹을 통해 제공하는 개념 학습, 미니 엑셀 실습, 엑셀 파일 다운로드·업로드 채점, 복습 퀴즈, 오답노트, 진도 관리, 실전 모드 등 일체의 학습 기능을 말합니다.</li>
          <li>“이용자”란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
          <li>“회원”이란 회사에 개인정보를 제공하여 계정을 등록하고 서비스를 이용하는 자를 말합니다.</li>
          <li>“수강권”이란 특정 급수(2급 또는 1급) 과정을 정해진 기간 동안 이용할 수 있는 이용권을 말합니다.</li>
        </OL>
      </Article>

      <Article title="제3조 (약관의 효력 및 변경)">
        <OL>
          <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
          <li>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정 시 적용일자 및 개정 사유를 명시하여 적용일 7일 전(이용자에게 불리하거나 중대한 변경은 30일 전)부터 서비스 내에 공지합니다.</li>
          <li>이용자가 개정 약관에 동의하지 않는 경우 이용계약을 해지할 수 있으며, 공지된 적용일 이후에도 서비스를 계속 이용하는 경우 개정 약관에 동의한 것으로 봅니다.</li>
        </OL>
      </Article>

      <Article title="제4조 (이용계약의 성립)">
        <OL>
          <li>이용계약은 이용자가 본 약관에 동의하고 회사가 정한 절차에 따라 회원가입을 신청한 후, 회사가 이를 승낙함으로써 성립합니다.</li>
          <li>회사는 다음 각 호에 해당하는 신청에 대하여 승낙을 거부하거나 사후에 이용계약을 해지할 수 있습니다.
            <UL>
              <li>타인의 명의 또는 정보를 도용한 경우</li>
              <li>허위 정보를 기재하거나 회사가 요구하는 사항을 기재하지 않은 경우</li>
              <li>부정한 용도 또는 영리 목적으로 서비스를 이용하려는 경우</li>
            </UL>
          </li>
        </OL>
      </Article>

      <Article title="제5조 (수강권 및 이용기간)">
        <OL>
          <li>이용자는 결제 시 2급 또는 1급 중 하나의 급수를 선택하며, 결제 완료 후 해당 급수의 커리큘럼이 고정됩니다.</li>
          <li>각 수강권의 이용기간은 결제 화면 및 <b>환불정책</b>에 명시된 기간에 따릅니다.</li>
          <li>수강권은 타인에게 양도·대여·판매할 수 없습니다.</li>
        </OL>
      </Article>

      <Article title="제6조 (서비스의 제공 및 변경)">
        <OL>
          <li>회사는 연중무휴 1일 24시간 서비스를 제공함을 원칙으로 합니다.</li>
          <li>회사는 시스템 점검, 설비의 보수·교체, 통신 두절 등 운영상·기술상 필요한 경우 서비스의 전부 또는 일부를 일시 중단할 수 있으며, 이 경우 사전에 공지합니다. 다만 사전 공지가 불가능한 긴급한 사유가 있는 경우 사후에 공지할 수 있습니다.</li>
          <li>회사는 서비스의 내용, 커리큘럼, 문제 구성 등을 학습 품질 향상을 위해 변경할 수 있습니다.</li>
        </OL>
      </Article>

      <Article title="제7조 (결제 및 청약철회)">
        <OL>
          <li>서비스의 이용요금 및 결제수단은 결제 화면에 표시된 바에 따릅니다.</li>
          <li>이용자의 청약철회 및 환불에 관한 사항은 본 약관과 별도로 게시된 <b>환불정책</b>에 따릅니다.</li>
        </OL>
      </Article>

      <Article title="제8조 (이용자의 의무)">
        <UL>
          <li>이용자는 서비스 이용 시 관련 법령, 본 약관, 이용안내 및 회사가 공지하는 사항을 준수하여야 합니다.</li>
          <li>이용자는 계정 정보를 스스로 관리할 책임이 있으며, 이를 제3자에게 이용하게 하여서는 안 됩니다.</li>
          <li>이용자는 서비스에서 제공하는 학습 콘텐츠(개념·문제·해설·엑셀 파일 등)를 무단으로 복제·배포·전송·판매하거나 영리 목적으로 이용해서는 안 됩니다.</li>
        </UL>
      </Article>

      <Article title="제9조 (콘텐츠의 저작권)">
        <OL>
          <li>서비스에 포함된 학습 콘텐츠 및 이에 관한 저작권 기타 지식재산권은 회사에 귀속됩니다.</li>
          <li>이용자는 회사가 제공하는 콘텐츠를 개인적·비상업적 학습 목적으로만 이용할 수 있습니다.</li>
        </OL>
      </Article>

      <Article title="제10조 (책임의 제한)">
        <OL>
          <li>회사는 천재지변, 이용자의 귀책사유, 제3자의 서비스(결제대행·호스팅·인증 등) 장애 등 회사의 합리적 통제를 벗어난 사유로 인한 손해에 대하여 책임을 지지 않습니다.</li>
          <li>회사는 학습 서비스를 제공하며, 이용자의 자격시험 합격 등 특정 결과를 보장하지 않습니다.</li>
        </OL>
      </Article>

      <Article title="제11조 (분쟁 해결 및 준거법)">
        <OL>
          <li>본 약관은 대한민국 법령에 따라 규율되고 해석됩니다.</li>
          <li>서비스 이용과 관련하여 회사와 이용자 사이에 분쟁이 발생한 경우, 양 당사자는 신의성실의 원칙에 따라 원만히 해결하도록 노력하며, 협의가 이루어지지 않을 경우 관할법원은 민사소송법에 따라 정합니다.</li>
        </OL>
      </Article>
    </>
  );
}

// ── 개인정보처리방침 ─────────────────────────────────────────
function Privacy() {
  return (
    <>
      <DocTitle>개인정보처리방침</DocTitle>
      <Meta>시행일: {EFFECTIVE_DATE}</Meta>

      <Article title="1. 수집하는 개인정보 항목 및 방법">
        <p style={{ margin: "0 0 8px" }}>회사는 서비스 제공을 위해 아래의 최소한의 개인정보를 수집합니다.</p>
        <UL>
          <li><b>회원가입·인증</b>: 이메일 주소, 비밀번호(암호화 저장)</li>
          <li><b>결제</b>: 결제수단 정보 및 거래내역(결제 처리는 결제대행사를 통해 이루어지며, 카드번호 등 민감한 결제정보는 회사가 직접 저장하지 않습니다)</li>
          <li><b>서비스 이용 과정에서 자동 생성</b>: 학습 진도, 퀴즈·실습 채점 결과, 오답노트, 접속 로그</li>
        </UL>
        <p style={{ margin: "8px 0 0" }}>수집 방법: 회원가입 및 서비스 이용 과정에서 이용자가 직접 입력하거나, 서비스 이용 중 자동으로 생성·수집됩니다.</p>
      </Article>

      <Article title="2. 개인정보의 수집·이용 목적">
        <UL>
          <li>회원 식별 및 로그인, 계정 관리</li>
          <li>수강권 결제 및 이용기간 관리, 서비스 제공</li>
          <li>학습 진도·오답 저장 및 맞춤 복습 제공</li>
          <li>고객 문의 응대 및 공지사항 전달</li>
          <li>부정 이용 방지 및 서비스 개선</li>
        </UL>
      </Article>

      <Article title="3. 개인정보의 보유 및 이용기간">
        <OL>
          <li>회사는 원칙적으로 개인정보 수집·이용 목적이 달성되면 지체 없이 파기합니다. 다만 회원 탈퇴 시까지 계정 정보를 보유합니다.</li>
          <li>관계 법령에 따라 보존이 필요한 경우 아래 기간 동안 보관합니다.
            <UL>
              <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
              <li>접속에 관한 기록(로그인 기록): 3개월 (통신비밀보호법)</li>
            </UL>
          </li>
        </OL>
      </Article>

      <Article title="4. 개인정보의 제3자 제공">
        회사는 이용자의 개인정보를 본 방침에서 고지한 범위를 넘어 제3자에게 제공하지 않습니다. 다만 법령에 근거하거나 수사기관의 적법한 요청이 있는 경우는 예외로 합니다.
      </Article>

      <Article title="5. 개인정보 처리의 위탁">
        <p style={{ margin: "0 0 8px" }}>회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
        <UL>
          <li><b>Supabase</b> — 회원 인증 및 데이터베이스(진도·학습기록) 저장·관리</li>
          <li><b>{val(BUSINESS.pg)}</b> — 결제 처리 및 결제내역 관리</li>
          <li><b>{val(BUSINESS.host)}</b> — 서비스 호스팅 및 인프라 운영</li>
        </UL>
      </Article>

      <Article title="6. 정보주체의 권리와 행사 방법">
        <OL>
          <li>이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요구할 수 있습니다.</li>
          <li>권리 행사는 고객센터 이메일(<span style={mono}>{BUSINESS.email}</span>)을 통해 요청할 수 있으며, 회사는 지체 없이 필요한 조치를 취합니다.</li>
        </OL>
      </Article>

      <Article title="7. 개인정보의 파기">
        보유기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일 형태의 정보는 복구·재생이 불가능한 방법으로 삭제하며, 종이 문서는 분쇄하거나 소각합니다.
      </Article>

      <Article title="8. 쿠키의 사용">
        회사는 로그인 상태 유지 등 서비스 제공에 필요한 최소한의 범위에서 쿠키 및 브라우저 저장소를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 저장을 거부할 수 있으나, 이 경우 로그인 등 일부 기능이 제한될 수 있습니다.
      </Article>

      <Article title="9. 개인정보 보호책임자">
        <UL>
          <li>보호책임자: {BUSINESS.privacyOfficer ? BUSINESS.privacyOfficer : val(BUSINESS.ceo)}</li>
          <li>연락처: <span style={mono}>{BUSINESS.email}</span></li>
        </UL>
        <p style={{ margin: "8px 0 0" }}>이용자는 개인정보 침해로 인한 상담·신고를 개인정보분쟁조정위원회(1833-6972), 개인정보침해신고센터(118) 등에 문의할 수 있습니다.</p>
      </Article>

      <Article title="10. 처리방침의 변경">
        본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가·삭제·정정이 있는 경우 변경사항을 시행 7일 전부터 서비스 내 공지를 통해 고지합니다.
      </Article>
    </>
  );
}

// ── 환불정책 ─────────────────────────────────────────────────
function Refund() {
  return (
    <>
      <DocTitle>환불정책</DocTitle>
      <Meta>시행일: {EFFECTIVE_DATE}</Meta>

      <Article title="1. 기본 원칙">
        본 환불정책은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「콘텐츠산업 진흥법」 등 관계 법령에 따릅니다.
        본 서비스는 온라인으로 즉시 이용 가능한 디지털 콘텐츠(온라인 강의·학습 콘텐츠)를 제공합니다.
      </Article>

      <Article title="2. 청약철회 (전액 환불)">
        <OL>
          <li>이용자는 결제일로부터 <b>7일 이내</b>이며, 서비스(학습 콘텐츠)를 <b>이용하지 않은 경우</b> 청약을 철회하고 전액 환불을 받을 수 있습니다.</li>
          <li>다만 디지털 콘텐츠의 특성상 콘텐츠 이용(개념 학습·실습·퀴즈·파일 다운로드 등)이 개시된 경우, 관계 법령에 따라 청약철회가 제한될 수 있습니다. 이 경우 아래 “3. 이용 개시 후 환불” 기준을 적용합니다.</li>
        </OL>
      </Article>

      <Article title="3. 이용 개시 후 환불 (기간제 상품)">
        <OL>
          <li>수강권은 정해진 이용기간 동안 콘텐츠 전체를 반복 이용할 수 있는 기간제 상품입니다.</li>
          <li>콘텐츠 이용을 개시한 후 환불을 요청하는 경우, 이미 경과한 이용기간에 해당하는 금액 및 회사가 부담한 결제수수료 등을 공제한 후 환불합니다.</li>
          <li>이용기간의 <b>2분의 1</b>이 경과한 경우, 디지털 콘텐츠의 특성상 환불이 제한될 수 있습니다.</li>
        </OL>
      </Article>

      <Article title="4. 환불이 제한되는 경우">
        <UL>
          <li>이용자의 귀책사유로 이용약관을 위반하여 이용계약이 해지된 경우</li>
          <li>학습 콘텐츠를 무단으로 복제·배포하는 등 부정 이용이 확인된 경우</li>
          <li>관계 법령상 청약철회가 제한되는 디지털 콘텐츠를 이미 이용한 경우</li>
        </UL>
      </Article>

      <Article title="5. 환불 절차">
        <OL>
          <li>환불은 고객센터 이메일(<span style={mono}>{BUSINESS.email}</span>)로 신청하실 수 있습니다.</li>
          <li>회사는 환불 요청을 확인한 날로부터 <b>3영업일 이내</b>에 환불을 처리하며, 결제수단·결제대행사의 사정에 따라 실제 환급까지 추가 기간이 소요될 수 있습니다.</li>
          <li>환불은 원칙적으로 결제 시 사용한 수단으로 이루어집니다.</li>
        </OL>
      </Article>

      <Article title="6. 회사의 귀책에 의한 환불">
        회사의 귀책사유로 서비스를 정상적으로 제공하지 못한 경우, 이용자는 이용기간 잔여분에 대한 환불을 요청할 수 있으며 회사는 이용자에게 손해가 없도록 전액 또는 잔여분을 환불합니다.
      </Article>
    </>
  );
}

// ── 사업자정보 ───────────────────────────────────────────────
function BusinessInfo() {
  const rows = [
    ["상호", val(BUSINESS.companyName)],
    ["대표자", val(BUSINESS.ceo)],
    ["사업자등록번호", BUSINESS.bizNo],
    ["통신판매업 신고", BUSINESS.mailOrderNo ? BUSINESS.mailOrderNo : "간이과세자 · 통신판매업 신고 면제 대상 (전자상거래법 시행령 제13조)"],
    ["사업장 소재지", val(BUSINESS.address)],
    ["고객센터", BUSINESS.tel ? BUSINESS.tel : "온라인 문의 (화면 우측 하단 고객센터 버튼)"],
    ["고객센터 이메일", BUSINESS.email],
    ["호스팅 제공자", val(BUSINESS.host)],
    ["결제대행사(PG)", val(BUSINESS.pg)],
  ];
  return (
    <>
      <DocTitle>사업자정보</DocTitle>
      <Meta>「전자상거래 등에서의 소비자보호에 관한 법률」에 따른 사업자 정보입니다.</Meta>

      <div style={{ border: `1px solid ${UI.line}`, borderRadius: UI.rLg, overflow: "hidden", background: UI.surface }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", borderTop: i ? `1px solid ${UI.line}` : "none" }}>
            <div style={{ flex: "0 0 180px", padding: "14px 18px", background: UI.panelAlt, fontSize: 14, fontWeight: 700, color: UI.ink }}>{k}</div>
            <div style={{ flex: 1, padding: "14px 18px", fontSize: 14.5, color: UI.inkSoft, wordBreak: "break-all" }}>
              {k.includes("번호") || k.includes("이메일") ? <span style={mono}>{v}</span> : v}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: UI.faint, margin: "18px 0 0", lineHeight: 1.7 }}>
        고객센터 이메일(<span style={mono}>{BUSINESS.email}</span>)로 문의 주시면 신속히 답변드리겠습니다.
      </p>
    </>
  );
}
