// JNJ SCORE 채점 앱 — 화면들

const { useState } = React;

// =============== 0. 로그인 ===============
function LoginScreen({ onLogin }) {
  const [selected, setSelected] = useState(null);
  const judges = [
    { name: '김채점', role: '예선 · 본선' },
    { name: '박심사', role: '예선 · 결승' },
    { name: '이공정', role: '본선 · 결승' },
    { name: '최평가', role: '예선' },
    { name: '정심판', role: '결승' },
    { name: '한채점', role: '본선' },
  ];

  const submit = () => {
    if (selected !== null) onLogin({ name: judges[selected].name });
  };

  return (
    <div style={{ padding: '12px 24px 32px', color: '#fff', fontFamily: 'inherit', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ height: 40 }} />

      {/* 로고 / 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#FF8044,#FF5000)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
        </div>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 36, fontWeight: 600, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: -0.5 }}>
          JNJ SCORE
        </div>
        <div style={{ fontSize: 14, color: '#9E9EA0', marginTop: 8, lineHeight: 1.5 }}>
          본인 이름을 선택하고<br/>로그인 버튼을 눌러주세요.
        </div>
      </div>

      {/* 채점자 목록 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#9E9EA0', marginBottom: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>채점자 선택</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {judges.map((j, i) => {
            const active = selected === i;
            return (
              <button key={j.name} onClick={() => setSelected(i)} style={{
                background: active ? 'rgba(255,128,68,0.12)' : '#1A1A1D',
                border: active ? '1.5px solid #FF8044' : '1.5px solid #2C2C30',
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                transition: 'all 0.15s',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: active ? 'linear-gradient(135deg,#FF8044,#FF5000)' : '#2C2C30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {j.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{j.name}</div>
                  <div style={{ fontSize: 11, color: '#9E9EA0', marginTop: 2 }}>{j.role}</div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: active ? 'none' : '1.5px solid #2C2C30',
                  background: active ? '#FF8044' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {active && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 'auto' }} />

      {/* 로그인 버튼 */}
      <button
        onClick={submit}
        disabled={selected === null}
        style={{
          marginTop: 16,
          width: '100%', background: selected !== null ? '#fff' : '#2C2C30',
          color: selected !== null ? '#0E0E10' : '#6B6B6E',
          border: 'none', borderRadius: 999, padding: '16px',
          fontSize: 15, fontWeight: 700, cursor: selected !== null ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
        }}>
        로그인
      </button>

      <div style={{ fontSize: 11, color: '#6B6B6E', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
        로그인 시 구글 시트와 자동 동기화됩니다.<br/>본인 담당 라운드만 표시돼요.
      </div>
    </div>
  );
}

// 공용 컴포넌트
function StatusPill({ status }) {
  const map = {
    pending: { bg: '#2C2C30', color: '#9E9EA0', label: '대기' },
    pass:    { bg: 'rgba(30,170,82,0.15)', color: '#1EAA52', label: '통과' },
    fail:    { bg: 'rgba(238,0,5,0.15)', color: '#EE0005', label: '탈락' },
    scored:  { bg: 'rgba(255,80,0,0.15)', color: '#FF8044', label: '채점완료' },
  };
  const s = map[status] || map.pending;
  return <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>{s.label}</span>;
}

function RoundChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
      background: active ? '#fff' : 'transparent',
      color: active ? '#0E0E10' : '#9E9EA0',
      fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
    }}>{label}</button>
  );
}

function ScreenHeader({ title, onBack, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 20px' }}>
      {onBack ? (
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A1A1D', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      ) : <div style={{ width: 36 }} />}
      <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{title}</div>
      <div style={{ width: 36, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

// =============== 1. 홈 / 대회 선택 ===============
function HomeScreen({ onSelectContest }) {
  const contests = [
    { id: 1, name: '2026 잭앤질 댄스 챔피언십', round: '예선', date: '4월 30일', total: 48, done: 12, accent: true },
    { id: 2, name: '잭앤질 오픈 배틀', round: '본선', date: '5월 2일', total: 24, done: 0 },
    { id: 3, name: '잭앤질 마스터즈', round: '결승', date: '5월 5일', total: 8, done: 0 },
  ];
  return (
    <div style={{ padding: '12px 20px 100px', color: '#fff', fontFamily: 'inherit' }}>
      {/* 상단 인사 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#FF8044,#FF5000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>JK</div>
          <div>
            <div style={{ fontSize: 12, color: '#9E9EA0' }}>안녕하세요,</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>김채점 심사위원</div>
          </div>
        </div>
        <button style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A1A1D', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
      </div>

      {/* 진행 카드 */}
      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 28, background: 'linear-gradient(135deg,#FF8044 0%,#FF5000 50%,#B23900 100%)', padding: '20px 22px' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>오늘 진행 중</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 14px' }}>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 56, fontWeight: 600, lineHeight: 0.9, letterSpacing: -1 }}>12</div>
          <div style={{ fontSize: 22, opacity: 0.7 }}>/ 48 명</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px 12px', flex: 1 }}>
            <div style={{ fontSize: 10, opacity: 0.8 }}>평균 점수</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>82.4</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px 12px', flex: 1 }}>
            <div style={{ fontSize: 10, opacity: 0.8 }}>통과율</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>83%</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px 12px', flex: 1 }}>
            <div style={{ fontSize: 10, opacity: 0.8 }}>남은 시간</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>2시간</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>내 담당 대회</div>
        <div style={{ fontSize: 12, color: '#9E9EA0' }}>전체 보기</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {contests.map((c) => (
          <button key={c.id} onClick={() => onSelectContest(c)} style={{ background: '#1A1A1D', border: 'none', borderRadius: 20, padding: '16px', color: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'inherit' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: c.accent ? 'linear-gradient(135deg,#FF8044,#FF5000)' : '#232327', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#9E9EA0' }}>
                <span style={{ color: '#FF8044' }}>{c.round}</span>
                <span>·</span>
                <span>{c.date}</span>
                <span>·</span>
                <span>{c.done}/{c.total}명</span>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9E9EA0" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============== 2. 참가자 리스트 ===============
function ContestantListScreen({ contest, onBack, onSelectContestant }) {
  const [round, setRound] = useState('예선');
  const [search, setSearch] = useState('');
  const contestants = [
    { id: 'A001', name: '이서연', team: '서울 A팀', status: 'scored', score: 88 },
    { id: 'A002', name: '박지훈', team: '부산 B팀', status: 'pass', score: 75 },
    { id: 'A003', name: '최유나', team: '대전 C팀', status: 'fail', score: 42 },
    { id: 'A004', name: '정민호', team: '서울 D팀', status: 'pending', score: null },
    { id: 'A005', name: '강하늘', team: '인천 E팀', status: 'pending', score: null },
    { id: 'A006', name: '윤서아', team: '광주 F팀', status: 'pending', score: null },
  ];
  const filtered = contestants.filter(c => !search || c.name.includes(search) || c.id.includes(search));

  return (
    <div style={{ padding: '12px 20px 100px', color: '#fff', fontFamily: 'inherit' }}>
      <ScreenHeader title="참가자" onBack={onBack} right={
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A1A1D', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        </button>
      }/>
      <div style={{ fontSize: 12, color: '#9E9EA0', marginBottom: 4 }}>{contest?.name}</div>
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 32, fontWeight: 500, lineHeight: 1, marginBottom: 18, textTransform: 'uppercase' }}>채점 진행</div>

      {/* 라운드 탭 */}
      <div style={{ background: '#1A1A1D', borderRadius: 14, padding: 4, display: 'flex', gap: 4, marginBottom: 16 }}>
        {['예선', '본선', '결승'].map(r => (
          <RoundChip key={r} label={r} active={round === r} onClick={() => setRound(r)} />
        ))}
      </div>

      {/* 검색 */}
      <div style={{ background: '#1A1A1D', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E9EA0" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름 또는 번호로 검색" style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, flex: 1, fontFamily: 'inherit' }}/>
      </div>

      {/* 진행도 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, background: '#1A1A1D', borderRadius: 14, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: '#9E9EA0' }}>완료</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>3 / 6</div>
        </div>
        <div style={{ flex: 1, background: '#1A1A1D', borderRadius: 14, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: '#9E9EA0' }}>통과</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1EAA52' }}>2명</div>
        </div>
        <div style={{ flex: 1, background: '#1A1A1D', borderRadius: 14, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: '#9E9EA0' }}>탈락</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#EE0005' }}>1명</div>
        </div>
      </div>

      {/* 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((c) => (
          <button key={c.id} onClick={() => onSelectContestant(c)} style={{ background: '#1A1A1D', border: 'none', borderRadius: 16, padding: '14px', color: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#232327', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#9E9EA0' }}>{c.id}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: '#9E9EA0' }}>{c.team}</div>
            </div>
            {c.score !== null && (
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, fontWeight: 500 }}>{c.score}</div>
            )}
            <StatusPill status={c.status} />
          </button>
        ))}
      </div>
    </div>
  );
}

// =============== 3. 채점 화면 (점수 입력) ===============
function ScoringScreen({ contestant, onBack, onSubmit }) {
  const [decision, setDecision] = useState(null); // 'pass' | 'fail'

  return (
    <div style={{ padding: '12px 20px 24px', color: '#fff', fontFamily: 'inherit', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="채점" onBack={onBack} />

      {/* 참가자 카드 */}
      <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', background: 'linear-gradient(135deg,#FF8044,#FF5000)', padding: '20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 600, letterSpacing: 0.5 }}>참가자</div>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 32, fontWeight: 600, marginTop: 6, lineHeight: 1 }}>{contestant?.name || '이서연'}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>{contestant?.team || '서울 A팀'} · #{contestant?.id || 'A001'}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>예선</div>
        </div>
      </div>

      {/* 안내 */}
      <div style={{ fontSize: 13, color: '#9E9EA0', marginBottom: 12, lineHeight: 1.5 }}>
        이 참가자가 다음 라운드로 진출할지 결정해 주세요.
      </div>

      {/* 통과/탈락 큰 버튼 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
        <button onClick={() => setDecision('pass')} style={{
          padding: '24px 20px', borderRadius: 18, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left',
          background: decision === 'pass' ? 'rgba(30,170,82,0.18)' : '#1A1A1D',
          color: decision === 'pass' ? '#1EAA52' : '#fff',
          border: decision === 'pass' ? '1.5px solid #1EAA52' : '1.5px solid #2C2C30',
          transition: 'all 0.15s',
        }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: decision === 'pass' ? '#1EAA52' : '#2C2C30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>통과</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>다음 라운드 진출</div>
          </div>
          {decision === 'pass' && <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', background: '#1EAA52', color: '#fff', borderRadius: 999 }}>선택됨</div>}
        </button>

        <button onClick={() => setDecision('fail')} style={{
          padding: '24px 20px', borderRadius: 18, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left',
          background: decision === 'fail' ? 'rgba(238,0,5,0.18)' : '#1A1A1D',
          color: decision === 'fail' ? '#EE0005' : '#fff',
          border: decision === 'fail' ? '1.5px solid #EE0005' : '1.5px solid #2C2C30',
          transition: 'all 0.15s',
        }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: decision === 'fail' ? '#EE0005' : '#2C2C30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>탈락</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>이번 라운드에서 제외</div>
          </div>
          {decision === 'fail' && <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', background: '#EE0005', color: '#fff', borderRadius: 999 }}>선택됨</div>}
        </button>
      </div>

      <div style={{ marginBottom: 'auto' }} />

      {/* 제출 */}
      <button
        onClick={() => onSubmit({ decision })}
        disabled={!decision}
        style={{
          marginTop: 16,
          background: decision ? '#fff' : '#2C2C30',
          color: decision ? '#0E0E10' : '#6B6B6E',
          border: 'none', borderRadius: 999, padding: '16px',
          fontSize: 15, fontWeight: 700,
          cursor: decision ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
        }}>
        제출 후 다음 참가자
      </button>
    </div>
  );
}

// =============== 4. 결승 — 항목별 채점 ===============
function FinalScoringScreen({ contestant, onBack, onSubmit }) {
  const items = [
    { key: 'fundamentals', label: '기본기', max: 30 },
    { key: 'connection',  label: '연결성', max: 30 },
    { key: 'musicality', label: '음악성', max: 20 },
    { key: 'judgement', label: '심사', max: 20 },
  ];
  const [scores, setScores] = useState({ fundamentals: 24, connection: 22, musicality: 16, judgement: 14 });
  const total = Object.values(scores).reduce((a,b) => a + b, 0);
  const set = (k, v) => setScores(s => ({ ...s, [k]: Math.max(0, Math.min(items.find(i => i.key === k).max, v)) }));

  return (
    <div style={{ padding: '12px 20px 24px', color: '#fff', fontFamily: 'inherit' }}>
      <ScreenHeader title="결승 채점" onBack={onBack} />

      <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', background: 'linear-gradient(135deg,#FF8044,#FF5000)', padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{contestant?.name || '이서연'} · #{contestant?.id || 'A001'}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 56, fontWeight: 600, lineHeight: 0.9 }}>{total}</div>
              <div style={{ fontSize: 20, opacity: 0.7 }}>/ 100</div>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>결승</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it) => {
          const v = scores[it.key];
          const pct = (v / it.max) * 100;
          return (
            <div key={it.key} style={{ background: '#1A1A1D', borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{it.label}</div>
                <div style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, fontWeight: 500 }}>{v}</span>
                  <span style={{ fontSize: 12, color: '#6B6B6E' }}>/ {it.max}</span>
                </div>
              </div>
              <div style={{ height: 6, background: '#232327', borderRadius: 999, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#FF8044,#FF5000)' }}/>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => set(it.key, v - 1)} style={{ flex: 1, background: '#232327', border: 'none', borderRadius: 10, padding: '8px', color: '#fff', fontSize: 16, cursor: 'pointer' }}>−</button>
                <button onClick={() => set(it.key, v + 1)} style={{ flex: 1, background: '#232327', border: 'none', borderRadius: 10, padding: '8px', color: '#fff', fontSize: 16, cursor: 'pointer' }}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => onSubmit({ scores, total })} style={{ width: '100%', background: '#fff', color: '#0E0E10', border: 'none', borderRadius: 999, padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 20, fontFamily: 'inherit' }}>
        제출하기
      </button>
    </div>
  );
}

// =============== 5. 분석 / 진행 현황 ===============
function AnalyticsScreen({ onBack }) {
  const days = [
    { d: '월', v: 60 }, { d: '화', v: 80 }, { d: '수', v: 50 },
    { d: '목', v: 92, peak: true }, { d: '금', v: 70 }, { d: '토', v: 30 }, { d: '일', v: 0 },
  ];
  return (
    <div style={{ padding: '12px 20px 100px', color: '#fff', fontFamily: 'inherit' }}>
      <ScreenHeader title="분석" onBack={onBack} right={
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A1A1D', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        </button>
      }/>

      {/* 탭 */}
      <div style={{ background: '#1A1A1D', borderRadius: 14, padding: 4, display: 'flex', gap: 4, marginBottom: 20 }}>
        <RoundChip label="채점 수" active={true}/>
        <RoundChip label="평균 점수" active={false}/>
      </div>

      <div style={{ fontSize: 12, color: '#9E9EA0' }}>이번 주 채점</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4, marginBottom: 18 }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 48, fontWeight: 500, lineHeight: 1 }}>148</div>
        <div style={{ fontSize: 14, color: '#9E9EA0' }}>건</div>
        <div style={{ marginLeft: 'auto', background: '#1A1A1D', padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>주간
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>

      <div style={{ fontSize: 13, color: '#9E9EA0', marginBottom: 8 }}>채점 추이</div>

      {/* 차트 */}
      <div style={{ position: 'relative', height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
            {d.peak && (
              <div style={{ position: 'absolute', top: 0, background: '#fff', color: '#0E0E10', padding: '4px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', zIndex: 2 }}>
                4월 13일<br/><span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13 }}>32건</span>
              </div>
            )}
            <div style={{ width: '100%', height: `${d.v * 1.6}px`, background: d.peak ? 'linear-gradient(180deg,#FF8044,#B23900)' : '#2C2C30', borderRadius: 10, minHeight: 4 }}/>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, color: '#9E9EA0' }}>
        {days.map((d, i) => <div key={i} style={{ flex: 1, textAlign: 'center' }}>{d.d}</div>)}
      </div>

      <div style={{ fontSize: 16, fontWeight: 600, margin: '24px 0 12px' }}>최근 채점 활동</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: '이서연', team: '서울 A팀', time: '오늘 10:32', score: 88 },
          { name: '박지훈', team: '부산 B팀', time: '오늘 10:18', score: 75 },
          { name: '최유나', team: '대전 C팀', time: '오늘 09:55', score: 42 },
        ].map((r, i) => (
          <div key={i} style={{ background: '#1A1A1D', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#232327', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF8044" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: '#9E9EA0' }}>{r.team} · {r.time}</div>
            </div>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, fontWeight: 500 }}>{r.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== 하단 탭바 ===============
function TabBar({ tab, setTab }) {
  const tabs = [
    { id: 'home', icon: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/> },
    { id: 'list', icon: <><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></> },
    { id: 'analytics', icon: <><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></> },
    { id: 'settings', icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></> },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 24, left: 20, right: 20, background: 'rgba(26,26,29,0.95)', backdropFilter: 'blur(20px)', borderRadius: 999, padding: '6px', display: 'flex', gap: 4, border: '1px solid #2C2C30' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          flex: 1, padding: '12px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: tab === t.id ? '#fff' : 'transparent',
          color: tab === t.id ? '#0E0E10' : '#9E9EA0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{t.icon}</svg>
        </button>
      ))}
    </div>
  );
}

// =============== 메인 앱 (라우터) ===============
function ScoringApp() {
  const [tab, setTab] = useState('home');
  const [stack, setStack] = useState([{ screen: 'home' }]);
  const top = stack[stack.length - 1];

  const push = (s) => setStack([...stack, s]);
  const pop = () => setStack(stack.length > 1 ? stack.slice(0, -1) : stack);
  const reset = (s) => setStack([{ screen: s }]);

  React.useEffect(() => {
    if (tab === 'home') reset('home');
    if (tab === 'list') reset('list');
    if (tab === 'analytics') reset('analytics');
    if (tab === 'settings') reset('settings');
  }, [tab]);

  let content;
  if (top.screen === 'home')
    content = <HomeScreen onSelectContest={(c) => { push({ screen: 'list', contest: c }); setTab('list'); }} />;
  else if (top.screen === 'list')
    content = <ContestantListScreen contest={top.contest} onBack={() => { setTab('home'); }} onSelectContestant={(c) => push({ screen: top.contest?.round === '결승' ? 'final' : 'scoring', contestant: c, round: top.contest?.round })} />;
  else if (top.screen === 'scoring')
    content = <ScoringScreen contestant={top.contestant} onBack={pop} onSubmit={pop} />;
  else if (top.screen === 'final')
    content = <FinalScoringScreen contestant={top.contestant} onBack={pop} onSubmit={pop} />;
  else if (top.screen === 'analytics')
    content = <AnalyticsScreen />;
  else if (top.screen === 'settings')
    content = <div style={{ padding: 20, color: '#fff' }}><ScreenHeader title="설정"/><div style={{ color: '#9E9EA0', fontSize: 13 }}>구글 시트 연동, 알림, 계정 설정 (와이어프레임)</div></div>;

  const showTabBar = ['home','list','analytics','settings'].includes(top.screen);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0E0E10', overflowY: 'auto' }}>
      {content}
      {showTabBar && <TabBar tab={tab} setTab={setTab} />}
    </div>
  );
}

Object.assign(window, { ScoringApp, LoginScreen });
