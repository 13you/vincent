'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Repair {
  id: string;
  brand: string;
  brandName: string;
  shopName: string;
  shopManager: string;
  shopContact: string;
  customerName: string;
  modelName: string;
  description: string;
  status: string;
  cost: number | null;
  comment: string | null;
  photo: string | null;
  createdAt: string;
}

const SEED_DATA: Repair[] = [
  {
    id: "LXR-2281",
    brand: "SONGZIO",
    brandName: "송지오 (SONGZIO)",
    shopName: "가로수길점",
    shopManager: "홍길동",
    shopContact: "010-1234-5678",
    customerName: "김철수",
    modelName: "LJK-992",
    description: "오른쪽 소매 뒤쪽에 약 3cm 가량 찢김이 있습니다. 티 나지 않게 복원 수선 부탁드립니다.",
    status: "사전판정 중",
    cost: null,
    comment: null,
    photo: null,
    createdAt: "2026-07-12"
  },
  {
    id: "LXR-4019",
    brand: "ZIOSONGZIO",
    brandName: "지오송지오 (ZIOSONGZIO)",
    shopName: "홍대점",
    shopManager: "김태희",
    shopContact: "010-9876-5432",
    customerName: "이영희",
    modelName: "BOMBER-77",
    description: "전체적으로 가죽이 많이 건조하고 우측 소매 단추가 하나 유실되었습니다. 단추 교체와 가죽 케어 원합니다.",
    status: "사전판정 완료",
    cost: 45000,
    comment: "우측 소매 스냅 단추 교체 1.5만, 전체 가죽 오일 영양 공급 및 드라이클리닝 3만. 총 4.5만 원 소요 예정.",
    photo: null,
    createdAt: "2026-07-13"
  },
  {
    id: "LXR-1092",
    brand: "SONGZIO",
    brandName: "송지오 (SONGZIO)",
    shopName: "가로수길점",
    shopManager: "박보검",
    shopContact: "010-1234-5678",
    customerName: "박민수",
    modelName: "VINTAGE-G1",
    description: "목 부분 양털 칼라 깃 복원 및 오래된 안감 교체 요청합니다.",
    status: "수선 진행 중",
    cost: 80000,
    comment: "칼라 양털 부분 복원 작업 및 고급 실크 혼방 안감 교체 공임 포함 8만 원 확정되었습니다.",
    photo: null,
    createdAt: "2026-07-10"
  }
];

export default function AdminPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // Modal Fields State
  const [editStatus, setEditStatus] = useState('사전판정 중');
  const [editCost, setEditCost] = useState('');
  const [editComment, setEditComment] = useState('');

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Initialize
  useEffect(() => {
    // Check session auth
    const isAuth = sessionStorage.getItem('admin_authenticated');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    const localRepairs = localStorage.getItem('leather_repairs');
    if (!localRepairs) {
      localStorage.setItem('leather_repairs', JSON.stringify(SEED_DATA));
      setRepairs(SEED_DATA);
    } else {
      setRepairs(JSON.parse(localRepairs));
    }

    // Sync across windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'leather_repairs' && e.newValue) {
        setRepairs(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const openModal = (repair: Repair) => {
    setEditingRepair(repair);
    setEditStatus(repair.status);
    setEditCost(repair.cost !== null ? String(repair.cost) : '');
    setEditComment(repair.comment || '');
  };

  const closeModal = () => {
    setEditingRepair(null);
  };

  const saveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRepair) return;

    // Validation: Cost is required for '사전판정 완료'
    if (editStatus === '사전판정 완료' && editCost === '') {
      triggerToast("사전판정 완료 시 예상 비용 입력은 필수입니다.");
      return;
    }

    const updated = repairs.map(r => {
      if (r.id === editingRepair.id) {
        return {
          ...r,
          status: editStatus,
          cost: editCost !== '' ? Number(editCost) : null,
          comment: editComment.trim() !== '' ? editComment.trim() : null
        };
      }
      return r;
    });

    setRepairs(updated);
    localStorage.setItem('leather_repairs', JSON.stringify(updated));
    closeModal();
    triggerToast(`접수번호 [${editingRepair.id}]의 판정 결과가 저장되었습니다.`);
    
    // Broadcast storage event to sync other tabs
    window.dispatchEvent(new Event('storage'));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setLoginError(false);
      triggerToast('관리자 인증에 성공하였습니다.');
    } else {
      setLoginError(true);
      triggerToast('잘못된 암호입니다.');
    }
  };

  // Stats calculation
  const totalCount = repairs.length;
  const pendingCount = repairs.filter(r => r.status === '사전판정 중').length;
  const completedCount = repairs.filter(r => r.status === '사전판정 완료' || r.status === '수선 완료').length;
  const inProgressCount = repairs.filter(r => r.status === '실물 입고' || r.status === '수선 진행 중' || r.status === '진행 확정').length;

  if (!isAuthenticated) {
    return (
      <>
        {/* Decorative Glow Backgrounds */}
        <div className="glow-bg glow-bg-1"></div>
        <div className="glow-bg glow-bg-2"></div>

        {/* Navigation Header */}
        <header className="navbar">
          <div className="container nav-container">
            <div className="logo">
              <i className="fa-solid fa-scissors brand-icon"></i>
              <span className="brand-text">LuxeLeather <span className="sub-brand">FACTORY</span></span>
            </div>
            <nav className="nav-links">
              <Link href="/" className="btn btn-secondary-outline">
                <i className="fa-solid fa-arrow-left"></i> 거래처 포털로 돌아가기
              </Link>
            </nav>
          </div>
        </header>

        {/* Login Form Container */}
        <section className="portal-section" style={{ paddingTop: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <div className="portal-card" style={{ maxWidth: '450px', width: '100%', padding: '40px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--accent)', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '24px' }}>
              <i className="fa-solid fa-lock"></i>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>공장 관리자 인증</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px' }}>
              시스템 조작을 위해 관리자 비밀번호를 입력해주세요.
            </p>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px' }}>
                <label htmlFor="admin-password">비밀번호</label>
                <input 
                  type="password" 
                  id="admin-password" 
                  placeholder="비밀번호를 입력하세요" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-input)', border: `1px solid ${loginError ? '#ef4444' : 'var(--bg-input-border)'}`, borderRadius: 'var(--border-radius-sm)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                  required
                />
                {loginError && (
                  <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px', display: 'block' }}>
                    비밀번호가 올바르지 않습니다. 다시 시도해주세요.
                  </span>
                )}
                <small className="helper-text" style={{ marginTop: '12px', display: 'block', color: 'var(--text-muted)' }}>
                  * 데모용 테스트 암호: <code style={{ color: 'var(--accent)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>admin123</code>
                </small>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 'var(--border-radius-sm)' }}>
                <i className="fa-solid fa-key"></i> 인증 및 로그인
              </button>
            </form>
          </div>
        </section>

        {/* Toast Notification */}
        <div className={`toast ${showToast ? 'show' : ''}`}>
          <i className="fa-solid fa-circle-info toast-icon"></i>
          <span className="toast-message">{toastMsg}</span>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Decorative Glow Backgrounds */}
      <div className="glow-bg glow-bg-1"></div>
      <div className="glow-bg glow-bg-2"></div>

      {/* Navigation Header */}
      <header className="navbar">
        <div className="container nav-container">
          <div className="logo">
            <i className="fa-solid fa-scissors brand-icon"></i>
            <span className="brand-text">LuxeLeather <span className="sub-brand">FACTORY</span></span>
          </div>
          <nav className="nav-links">
            <Link href="/" className="btn btn-secondary-outline">
              <i className="fa-solid fa-arrow-left"></i> 거래처 포털로 돌아가기
            </Link>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                sessionStorage.removeItem('admin_authenticated');
                setIsAuthenticated(false);
                setPasswordInput('');
                triggerToast('로그아웃되었습니다.');
              }}
            >
              <i className="fa-solid fa-right-from-bracket"></i> 로그아웃
            </button>
          </nav>
        </div>
      </header>

      {/* Admin Dashboard */}
      <section className="portal-section" style={{ paddingTop: '140px' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
            <h2><i className="fa-solid fa-gears" style={{ color: 'var(--accent)' }}></i> 공장 수선 관리 시스템</h2>
            <p>거래처 매장에서 실시간 접수한 가죽 아우터 수선 건들의 비용을 책정하고 판정 상태를 등록합니다.</p>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
            <div className="step-card" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>총 접수 현황</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px', fontFamily: 'var(--font-heading)' }}>{totalCount}건</div>
            </div>
            <div className="step-card" style={{ padding: '24px', borderLeft: '3px solid var(--accent)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>사전판정 중</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)', marginTop: '8px', fontFamily: 'var(--font-heading)' }}>{pendingCount}건</div>
            </div>
            <div className="step-card" style={{ padding: '24px', borderLeft: '3px solid #3b82f6' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>진행 및 입고 건</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3b82f6', marginTop: '8px', fontFamily: 'var(--font-heading)' }}>{inProgressCount}건</div>
            </div>
            <div className="step-card" style={{ padding: '24px', borderLeft: '3px solid #10b981' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>판정/수선 완료</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginTop: '8px', fontFamily: 'var(--font-heading)' }}>{completedCount}건</div>
            </div>
          </div>

          {/* Dashboard Table/List */}
          <div className="portal-card" style={{ padding: '30px' }}>
            <div className="results-header" style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}><i className="fa-solid fa-list" style={{ color: 'var(--accent)', marginRight: '8px' }}></i> 사전 접수 목록</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {repairs.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>접수 내역이 없습니다.</p>
              ) : (
                repairs.map(repair => {
                  let badgeClass = 'status-pending';
                  if (repair.status === '사전판정 완료' || repair.status === '수선 완료') {
                    badgeClass = 'status-completed';
                  } else if (repair.status === '실물 입고' || repair.status === '수선 진행 중' || repair.status === '진행 확정') {
                    badgeClass = 'status-progress';
                  } else if (repair.status === '수선 취소') {
                    badgeClass = 'status-canceled';
                  }

                  return (
                    <div className="repair-result-card" key={repair.id} style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                      <div className="result-card-header" style={{ paddingBottom: '12px' }}>
                        <div className="result-header-left">
                          <div className="result-id-date">
                            <span className="result-id">{repair.id}</span>
                            <span>|</span>
                            <span>접수일자: {repair.createdAt}</span>
                          </div>
                          <div className="result-model-title" style={{ fontSize: '1.1rem' }}>
                            {repair.brandName} | {repair.modelName}
                          </div>
                          <div className="result-customer-info" style={{ fontSize: '0.85rem' }}>
                            매장명: {repair.shopName} | 담당자: {repair.shopManager || '미입력'} ({repair.shopContact || '연락처 미입력'}) | 고객명: {repair.customerName}
                          </div>
                        </div>
                        <span className={`status-badge ${badgeClass}`}>{repair.status}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <div className="result-section-label" style={{ fontSize: '0.75rem' }}>수선 요청 사항</div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{repair.description}</p>
                          </div>
                          {(repair.cost !== null || repair.comment) && (
                            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                              <div className="result-section-label" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>공장 등록 판정 결과</div>
                              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                예상 비용: {repair.cost !== null ? `${Number(repair.cost).toLocaleString()}원` : '0원'}
                              </div>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{repair.comment || '상세 사유 미등록'}</p>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          {repair.photo ? (
                            <img src={repair.photo} className="result-photo-preview" style={{ width: '120px', height: '120px', margin: '0 0 10px 0' }} alt="의류" />
                          ) : (
                            <div style={{ width: '120px', height: '120px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--border-radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              이미지 없음
                            </div>
                          )}
                          <button className="btn btn-secondary-outline btn-sm" onClick={() => openModal(repair)}>
                            <i className="fa-solid fa-pen-to-square"></i> 판정 등록 및 상태 수정
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Admin Edit Modal Overlay */}
      {editingRepair && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>수선 판정 결과 입력</h3>
              <button className="btn-close-modal" onClick={closeModal}><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <form onSubmit={saveChanges}>
              <div className="modal-body">
                <div className="modal-info-bar">
                  <div><strong>접수번호:</strong> <span>{editingRepair.id}</span></div>
                  <div><strong>고객/브랜드:</strong> <span>{editingRepair.customerName}</span> ({editingRepair.brandName})</div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-status">수선 진행 상태</label>
                  <select 
                    id="edit-status" 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="사전판정 중">사전판정 중</option>
                    <option value="사전판정 완료">사전판정 완료</option>
                    <option value="실물 입고">실물 입고</option>
                    <option value="수선 진행 중">수선 진행 중</option>
                    <option value="진행 확정">진행 확정 (택배 발송)</option>
                    <option value="수선 완료">수선 완료</option>
                    <option value="수선 취소">수선 취소</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-cost">
                    예상 수선비 (KRW) {editStatus === '사전판정 완료' && <span className="required">*</span>}
                  </label>
                  <div className="cost-input-wrapper">
                    <input 
                      type="number" 
                      id="edit-cost" 
                      placeholder="예: 30000" 
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      required={editStatus === '사전판정 완료'}
                      min={0}
                    />
                    <span className="currency-unit">원</span>
                  </div>
                  <small className="helper-text">무상 수선인 경우 0원을 기입해 주세요.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-comments">수선비 상세 내역 및 코멘트</label>
                  <textarea 
                    id="edit-comments" 
                    rows={4} 
                    placeholder="예: 지퍼 교체 1.5만, 가죽 복원 1.5만 / 송아지 가죽 원단 수급으로 2주 소요 예상"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary-outline" onClick={closeModal}>취소</button>
                <button type="submit" className="btn btn-primary">판정 결과 저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer" style={{ marginTop: '60px' }}>
        <div className="container footer-content">
          <p>&copy; 2026 LuxeLeather Repair. Factory Admin Console. v1.2</p>
        </div>
      </footer>

      {/* Toast Notification */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <i className="fa-solid fa-circle-info toast-icon"></i>
        <span className="toast-message">{toastMsg}</span>
      </div>
    </>
  );
}
