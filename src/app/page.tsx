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

export default function HomePage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  
  // New Request Form State
  const [receiptDate, setReceiptDate] = useState('');
  const [brand, setBrand] = useState('SONGZIO');
  const [shopName, setShopName] = useState('');
  const [shopManager, setShopManager] = useState('');
  const [shopContact, setShopContact] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [modelName, setModelName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  // Search State
  const [searchBrand, setSearchBrand] = useState('SONGZIO');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchShopName, setSearchShopName] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [searchResults, setSearchResults] = useState<Repair[] | null>(null);

  // Receipt State
  const [submittedReceipt, setSubmittedReceipt] = useState<Repair | null>(null);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Initialize LocalStorage Database
  useEffect(() => {
    const localRepairs = localStorage.getItem('leather_repairs');
    if (!localRepairs) {
      localStorage.setItem('leather_repairs', JSON.stringify(SEED_DATA));
      setRepairs(SEED_DATA);
    } else {
      setRepairs(JSON.parse(localRepairs));
    }

    // Default receipt date to today (YYYY-MM-DD)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setReceiptDate(`${yyyy}-${mm}-${dd}`);

    // Storage change listener to keep tabs synced
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'leather_repairs' && e.newValue) {
        setRepairs(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update search results automatically if database changes and search is active
  useEffect(() => {
    if (searchResults !== null) {
      triggerSearch(searchBrand, searchCustomer, searchShopName, searchContact);
    }
  }, [repairs]);

  // Toast trigger helper
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Hyphenate contact inputs
  const formatContact = (val: string) => {
    let cleaned = val.replace(/[^0-9]/g, '');
    if (cleaned.length > 3 && cleaned.length <= 7) {
      return cleaned.substring(0, 3) + '-' + cleaned.substring(3);
    } else if (cleaned.length > 7) {
      return cleaned.substring(0, 3) + '-' + cleaned.substring(3, 7) + '-' + cleaned.substring(7, 11);
    }
    return cleaned;
  };

  // Handle file upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        triggerToast("파일 크기는 10MB 이하여야 합니다.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhoto(event.target.result as string);
          triggerToast("사진이 성공적으로 업로드되었습니다.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedPhoto(null);
    triggerToast("업로드된 사진을 삭제했습니다.");
  };

  // Handle New Request Submit
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const brandName = brand === 'SONGZIO' ? '송지오 (SONGZIO)' : '지오송지오 (ZIOSONGZIO)';
    const photoToSave = uploadedPhoto || 'leather_jacket_repair.png';
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const id = `LXR-${randomId}`;

    const newRepair: Repair = {
      id,
      brand,
      brandName,
      shopName,
      shopManager,
      shopContact,
      customerName,
      modelName,
      description,
      status: "사전판정 중",
      cost: null,
      comment: null,
      photo: photoToSave,
      createdAt: receiptDate || new Date().toISOString().split('T')[0],
    };

    const updated = [newRepair, ...repairs];
    setRepairs(updated);
    localStorage.setItem('leather_repairs', JSON.stringify(updated));

    setSubmittedReceipt(newRepair);
    triggerToast("수선 사전 접수가 완료되었습니다!");
  };

  const resetForm = () => {
    setShopName('');
    setShopManager('');
    setShopContact('');
    setCustomerName('');
    setModelName('');
    setDescription('');
    setUploadedPhoto(null);
    setSubmittedReceipt(null);
    
    const today = new Date();
    setReceiptDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  };

  // Trigger search logic
  const triggerSearch = (b: string, cust: string, shop: string, contact: string) => {
    const searchCustClean = cust.replace(/\s+/g, '').toLowerCase();
    const searchShopClean = shop.replace(/\s+/g, '').toLowerCase();
    const searchContactClean = contact.replace(/[^0-9]/g, '');

    const filtered = repairs.filter(r => {
      if (r.brand !== b) return false;
      if (searchCustClean && !r.customerName.replace(/\s+/g, '').toLowerCase().includes(searchCustClean)) return false;
      if (searchShopClean && !(r.shopName || '').replace(/\s+/g, '').toLowerCase().includes(searchShopClean)) return false;
      if (searchContactClean) {
        const itemContactClean = (r.shopContact || '').replace(/[^0-9]/g, '');
        if (!itemContactClean.includes(searchContactClean)) return false;
      }
      return true;
    });

    setSearchResults(filtered);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(searchBrand, searchCustomer, searchShopName, searchContact);
  };

  // Quick switch from receipt screen to search screen
  const switchToSearchAndQuery = () => {
    if (submittedReceipt) {
      setSearchBrand(submittedReceipt.brand);
      setSearchCustomer(submittedReceipt.customerName);
      setSearchShopName(submittedReceipt.shopName);
      setSearchContact(submittedReceipt.shopContact);

      // Perform lookup immediately
      triggerSearch(
        submittedReceipt.brand,
        submittedReceipt.customerName,
        submittedReceipt.shopName,
        submittedReceipt.shopContact
      );

      // Switch view
      setActiveTab('history');
      setSubmittedReceipt(null);
    }
  };

  // Client feedback action
  const handleClientAction = (id: string, nextStatus: string) => {
    const updated = repairs.map(r => {
      if (r.id === id) {
        return { ...r, status: nextStatus };
      }
      return r;
    });
    setRepairs(updated);
    localStorage.setItem('leather_repairs', JSON.stringify(updated));

    const message = nextStatus === '진행 확정' 
      ? "진행이 확정되었습니다. 의류를 공장으로 발송해주세요!" 
      : "수선 신청이 취소되었습니다.";
    triggerToast(message);
  };

  const resetSearch = () => {
    setSearchCustomer('');
    setSearchShopName('');
    setSearchContact('');
    setSearchResults(null);
  };

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
            <span className="brand-text">LuxeLeather <span className="sub-brand">REPAIR</span></span>
          </div>
          <nav className="nav-links">
            <a href="#hero">홈</a>
            <a href="#portal-section">수선 접수/조회</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="badge-new">B2B 거래처 전용</div>
            <h1 className="hero-title">가죽 아우터 수선,<br /><span className="accent-text">더 빠르고 정교하게.</span></h1>
            <p className="hero-description">
              매장에서 스마트폰으로 사진을 업로드하고 실시간 사전 판정을 받으세요. 
              공장의 예상 비용 확인부터 수선 확정까지 원스톱으로 관리합니다.
            </p>
            <div className="hero-actions">
              <a href="#portal-section" className="btn btn-primary" onClick={() => setActiveTab('new')}>
                <i className="fa-solid fa-plus-circle"></i> 신규 수선 접수
              </a>
              <a href="#portal-section" className="btn btn-secondary" onClick={() => setActiveTab('history')}>
                <i className="fa-solid fa-magnifying-glass"></i> 접수 내역 조회
              </a>
            </div>

            {/* Process Steps */}
            <div className="process-steps">
              <div className="step-card">
                <div className="step-num">01</div>
                <h3>사진 접수</h3>
                <p>거래처 매장 정보 및 상세 사진 등록</p>
              </div>
              <div className="step-card">
                <div className="step-num">02</div>
                <h3>사전 판정</h3>
                <p>공장 마스터의 검수 및 견적 등록</p>
              </div>
              <div className="step-card">
                <div className="step-num">03</div>
                <h3>진행 확정</h3>
                <p>비용 확인 후 진행 승인 및 택배 발송</p>
              </div>
            </div>
          </div>

          {/* Hero Image Visual */}
          <div className="hero-visual">
            <div className="image-wrapper">
              <img src="/leather_jacket_repair.png" alt="Leather Jacket Restoration" className="hero-img" />
              <div className="floating-badge badge-top">
                <i className="fa-solid fa-shield-halved"></i>
                <span>100% 프리미엄 가죽 전문</span>
              </div>
              <div className="floating-badge badge-bottom">
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span>사전 판정 완료율 99.8%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Portal Section */}
      <section id="portal-section" className="portal-section">
        <div className="container">
          <div className="section-header">
            <h2>수선 사전 접수 포털</h2>
            <p>매장 접수 및 이전 신청 내역을 조회할 수 있습니다.</p>
          </div>

          <div className="portal-card">
            {/* Tab Headers */}
            <div className="tab-headers">
              <button 
                className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
                onClick={() => { setActiveTab('new'); resetSearch(); }}
              >
                <i className="fa-solid fa-pen-to-square"></i> 신규 수선 접수
              </button>
              <button 
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <i className="fa-solid fa-receipt"></i> 접수 내역 조회
              </button>
            </div>

            {/* Tab Contents */}
            <div className="tab-content-container">
              
              {/* TAB 1: NEW REQUEST */}
              {activeTab === 'new' && (
                <div className="tab-pane active">
                  {!submittedReceipt ? (
                    <form onSubmit={handleRequestSubmit}>
                      <div className="form-grid">
                        {/* Section 0: 접수 기본 정보 */}
                        <div className="form-card full-width">
                          <h3 className="form-section-title"><i className="fa-solid fa-calendar-check"></i> 접수 기본 정보</h3>
                          <div className="form-grid-inner">
                            <div className="form-group">
                              <label htmlFor="receipt-date-input">접수일자 <span className="required">*</span></label>
                              <input 
                                type="date" 
                                id="receipt-date-input" 
                                value={receiptDate} 
                                onChange={(e) => setReceiptDate(e.target.value)}
                                required 
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="brand-type">의뢰 브랜드 <span className="required">*</span></label>
                              <select 
                                id="brand-type" 
                                value={brand} 
                                onChange={(e) => setBrand(e.target.value)}
                                required
                              >
                                <option value="SONGZIO">송지오 (SONGZIO)</option>
                                <option value="ZIOSONGZIO">지오송지오 (ZIOSONGZIO)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Section 1: Shop Info */}
                        <div className="form-card">
                          <h3 className="form-section-title"><i className="fa-solid fa-shop"></i> 매장 정보</h3>
                          
                          <div className="form-group">
                            <label htmlFor="shop-name">매장명 <span className="required">*</span></label>
                            <input 
                              type="text" 
                              id="shop-name" 
                              placeholder="예: 백화점 강남점, 홍대 직영점" 
                              value={shopName}
                              onChange={(e) => setShopName(e.target.value)}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="shop-manager">매장 담당자 이름 <span className="helper-text">(선택)</span></label>
                            <input 
                              type="text" 
                              id="shop-manager" 
                              placeholder="예: 이민수" 
                              value={shopManager}
                              onChange={(e) => setShopManager(e.target.value)}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="shop-contact">매장 담당자 연락처 <span className="helper-text">(선택)</span></label>
                            <input 
                              type="tel" 
                              id="shop-contact" 
                              placeholder="예: 010-1234-5678" 
                              value={shopContact}
                              onChange={(e) => setShopContact(formatContact(e.target.value))}
                            />
                            <small className="helper-text">숫자만 입력하셔도 자동으로 하이픈(-)이 적용됩니다.</small>
                          </div>
                        </div>

                        {/* Section 2: Clothing & Customer Info */}
                        <div className="form-card">
                          <h3 className="form-section-title"><i className="fa-solid fa-vest"></i> 의류 및 고객 정보</h3>
                          
                          <div className="form-group">
                            <label htmlFor="customer-name">고객명 <span className="required">*</span></label>
                            <input 
                              type="text" 
                              id="customer-name" 
                              placeholder="예: 김철수" 
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              required 
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="model-name">모델명 / 스타일번호 <span className="required">*</span></label>
                            <input 
                              type="text" 
                              id="model-name" 
                              placeholder="예: LJK-902" 
                              value={modelName}
                              onChange={(e) => setModelName(e.target.value)}
                              required 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Repair Details & Photo Upload */}
                      <div className="form-card full-width mt-4">
                        <h3 className="form-section-title"><i className="fa-solid fa-wrench"></i> 수선 요청 사항 & 사진 등록</h3>
                        
                        <div className="form-group">
                          <label htmlFor="repair-description">수선 요청 내용 상세 <span className="required">*</span></label>
                          <textarea 
                            id="repair-description" 
                            rows={4} 
                            placeholder="예: 오른쪽 소매 아래 3cm 찢김 수선 및 지퍼 슬라이더 교환 요청합니다. 벌어짐 현상 있음." 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>아우터 상태 사진 등록 <span className="helper-text">(선택)</span></label>
                          <div className="upload-dropzone" onClick={() => document.getElementById('photo-upload')?.click()}>
                            <input 
                              type="file" 
                              id="photo-upload" 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={handlePhotoSelect}
                            />
                            <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                            <p className="upload-text">수선할 부위의 상세 사진을 드래그하거나 클릭하여 업로드하세요.</p>
                            <p className="upload-subtext">JPG, PNG 파일 (최대 10MB)</p>
                            {uploadedPhoto && (
                              <div className="upload-preview-container" onClick={(e) => e.stopPropagation()}>
                                <img src={uploadedPhoto} alt="Preview" />
                                <button type="button" className="btn-remove-photo" onClick={removePhoto}>
                                  <i className="fa-solid fa-xmark"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-actions-submit">
                        <button type="submit" className="btn btn-primary btn-submit-large">
                          <i className="fa-solid fa-paper-plane"></i> 사전 수선 접수 완료
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Success Message Screen */
                    <div className="success-screen">
                      <div className="success-icon-wrapper">
                        <i className="fa-solid fa-circle-check success-icon-main"></i>
                      </div>
                      <h2>사전 접수가 성공적으로 완료되었습니다!</h2>
                      <p className="success-desc">공장에서 사진 판정 및 예상 수선비 심사를 거쳐 사전판정이 완료될 예정입니다.</p>
                      
                      <div className="receipt-card">
                        <h3>수선 접수 확인표</h3>
                        <table className="receipt-table">
                          <tbody>
                            <tr>
                              <th>접수 번호</th>
                              <td className="receipt-highlight">{submittedReceipt.id}</td>
                            </tr>
                            <tr>
                              <th>접수일자</th>
                              <td>{submittedReceipt.createdAt}</td>
                            </tr>
                            <tr>
                              <th>의뢰 브랜드</th>
                              <td>{submittedReceipt.brandName}</td>
                            </tr>
                            <tr>
                              <th>매장명</th>
                              <td>{submittedReceipt.shopName || "(미입력)"}</td>
                            </tr>
                            <tr>
                              <th>매장 담당자</th>
                              <td>{submittedReceipt.shopManager || "(미입력)"}</td>
                            </tr>
                            <tr>
                              <th>고객명 / 모델명</th>
                              <td>{submittedReceipt.customerName} / {submittedReceipt.modelName}</td>
                            </tr>
                            <tr>
                              <th>처리 상태</th>
                              <td><span className="status-badge status-pending">{submittedReceipt.status}</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="success-actions">
                        <button className="btn btn-secondary-outline" onClick={resetForm}>
                          <i className="fa-solid fa-plus"></i> 추가 수선 접수하기
                        </button>
                        <button className="btn btn-primary" onClick={switchToSearchAndQuery}>
                          <i className="fa-solid fa-magnifying-glass"></i> 내 접수 내역 조회하기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CHECK HISTORY */}
              {activeTab === 'history' && (
                <div className="tab-pane active">
                  {searchResults === null ? (
                    /* Inquiry Form */
                    <div className="inquiry-form-card">
                      <h3 className="form-section-title"><i className="fa-solid fa-user-shield"></i> 접수 내역 조회</h3>
                      <p className="inquiry-subtitle">의뢰 브랜드를 필수 선택하고 접수하신 고객명을 입력하여 조회합니다.</p>
                      
                      <form onSubmit={handleSearchSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                          <div className="form-group">
                            <label htmlFor="search-brand">의뢰 브랜드 <span className="required">*</span></label>
                            <select 
                              id="search-brand" 
                              value={searchBrand}
                              onChange={(e) => setSearchBrand(e.target.value)}
                              required
                            >
                              <option value="SONGZIO">송지오 (SONGZIO)</option>
                              <option value="ZIOSONGZIO">지오송지오 (ZIOSONGZIO)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label htmlFor="search-customer-name">고객명</label>
                            <input 
                              type="text" 
                              id="search-customer-name" 
                              placeholder="예: 김철수" 
                              value={searchCustomer}
                              onChange={(e) => setSearchCustomer(e.target.value)}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <button type="submit" className="btn btn-primary" style={{ padding: '12px 48px', height: '48px', borderRadius: 'var(--border-radius-sm)' }}>
                            <i className="fa-solid fa-magnifying-glass"></i> 내역 조회
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* Inquiry Results */
                    <div className="inquiry-results-container">
                      <div className="results-header">
                        <h3>조회 결과 ({searchResults.length}건)</h3>
                        <button className="btn btn-secondary-outline btn-sm" onClick={resetSearch}>
                          <i className="fa-solid fa-arrow-left"></i> 다른 정보로 검색
                        </button>
                      </div>

                      <div className="results-list">
                        {searchResults.length === 0 ? (
                          <div className="no-results-box" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '16px' }}></i>
                            <p>일치하는 접수 내역이 존재하지 않습니다.</p>
                            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>선택한 의뢰 브랜드와 고객명이 정확히 일치하는지 확인해 주세요.</p>
                          </div>
                        ) : (
                          searchResults.map((repair) => {
                            let badgeClass = 'status-pending';
                            if (repair.status === '사전판정 완료' || repair.status === '수선 완료') {
                              badgeClass = 'status-completed';
                            } else if (repair.status === '실물 입고' || repair.status === '수선 진행 중' || repair.status === '진행 확정') {
                              badgeClass = 'status-progress';
                            } else if (repair.status === '수선 취소') {
                              badgeClass = 'status-canceled';
                            }

                            return (
                              <div className="repair-result-card" key={repair.id}>
                                <div className="result-card-header">
                                  <div className="result-header-left">
                                    <div className="result-id-date">
                                      <span className="result-id">{repair.id}</span>
                                      <span>|</span>
                                      <span>접수일자: {repair.createdAt}</span>
                                    </div>
                                    <div className="result-model-title">{repair.brandName} | {repair.modelName}</div>
                                    <div className="result-customer-info">
                                      매장: {repair.shopName || '미입력'} (담당: {repair.shopManager || '미입력'}) | 고객명: {repair.customerName}
                                    </div>
                                  </div>
                                  <span className={`status-badge ${badgeClass}`}>{repair.status}</span>
                                </div>
                                
                                <div className="result-card-body">
                                  <div>
                                    <div className="result-section-label">수선 요청 사항</div>
                                    <p className="result-desc-text">{repair.description}</p>
                                  </div>
                                  <div>
                                    <div className="result-section-label">의류 상태 첨부</div>
                                    {repair.photo ? (
                                      <img src={repair.photo} className="result-photo-preview" alt="의류 상태" />
                                    ) : (
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                        <i className="fa-regular fa-image"></i> 첨부 사진 없음
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Pricing/Comments Section */}
                                  {(repair.status === '사전판정 완료' || repair.cost !== null) ? (
                                    <div className="result-judgment-section">
                                      <div className="judgment-details">
                                        <div className="result-section-label"><i className="fa-solid fa-receipt"></i> 판정 결과 & 예상 수선비</div>
                                        <div className="judgment-cost">
                                          예상 비용: {repair.cost !== null ? `${Number(repair.cost).toLocaleString()}원` : '판정 대기'}
                                        </div>
                                        <div className="judgment-comment">{repair.comment || '상세 코멘트 없음'}</div>
                                      </div>
                                      
                                      {repair.status === '사전판정 완료' && (
                                        <div className="result-actions">
                                          <button 
                                            className="btn btn-primary btn-sm" 
                                            onClick={() => handleClientAction(repair.id, '진행 확정')}
                                          >
                                            <i className="fa-solid fa-truck-fast"></i> 이 비용으로 진행 확정 (택배 발송)
                                          </button>
                                          <button 
                                            className="btn btn-secondary-outline btn-sm" 
                                            onClick={() => handleClientAction(repair.id, '수선 취소')}
                                          >
                                            <i className="fa-solid fa-ban"></i> 수선 취소
                                          </button>
                                        </div>
                                      )}

                                      {repair.status === '진행 확정' && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
                                          <i className="fa-solid fa-circle-info"></i> 진행 확정 완료. 의류를 공장으로 발송해 주세요. (착불/선불 택배 가능)
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="result-judgment-section" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                      <div className="judgment-details">
                                        <div className="result-section-label" style={{ color: 'var(--text-secondary)' }}><i className="fa-solid fa-hourglass-half"></i> 수선 판정 대기 중</div>
                                        <div className="judgment-comment" style={{ color: 'var(--text-muted)' }}>공장에서 사진 판정이 진행 중입니다. 잠시만 대기해 주세요.</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <p>
            &copy; 2026 LuxeLeather Repair. All rights reserved. 거래처 전용 가죽 아우터 사전 판정 솔루션 v1.2 (Next.js) | 
            <Link href="/admin" target="_blank" style={{ color: 'var(--text-muted)', textDecoration: 'none', marginLeft: '8px', fontSize: '0.85rem', transition: 'var(--transition-smooth)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
              공장 관리자 로그인
            </Link>
          </p>
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
