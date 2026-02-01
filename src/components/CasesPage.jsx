import { useState } from 'react'
import './CasesPage.css'

import Header from './Header'
import Navigation from './Navigation'
import CaseModal from './CaseModal'

import { useCurrency } from '../context/CurrencyContext'
import { useLanguage } from '../context/LanguageContext'
import { useAppData } from '../context/AppDataContext'
import { Player } from '@lottiefiles/react-lottie-player'

import { useLiveFeed } from '../context/LiveFeedContext'


import AsyncImage from './AsyncImage'

/* ===== LIVE DROPS (пока мок, можно позже заменить WS) ===== */



function CasesPage() {
  const { selectedCurrency, formatAmount } = useCurrency()
  const { t } = useLanguage()
  const { cases } = useAppData()

  /* ===== STATE ===== */
  const [activeTab, setActiveTab] = useState('paid')
  const [selectedCase, setSelectedCase] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { liveDrops } = useLiveFeed()
  
  const [isFaqOpen, setIsFaqOpen] = useState(false)
  
  

  /* ===== SPLIT PAID / FREE ===== */
  const sortByPosition = (a, b) =>
    (a.position ?? 0) - (b.position ?? 0)
  
  const paidCases = cases
    .filter((c) => Number(c.price) > 0)
    .sort(sortByPosition)
  
  const freeCases = cases
    .filter((c) => Number(c.price) === 0)
    .sort(sortByPosition)
  

  const visibleCases = activeTab === 'paid' ? paidCases : freeCases



  
  /* ===== HANDLERS ===== */
  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCase(null)
  }

  return (
    <div className="cases-page">
      <Header />

      <main className="cases-main">
        {/* ===== LIVE FEED ===== */}
        <div className="live-feed-bar">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">{t('cases.live')}</span>
          </div>
          <div className="live-items-wrapper">
            <div className="live-items-track">
              {/* Элементы появляются справа и движутся влево */}
              {liveDrops.map((drop, idx) => (
                <div key={`${drop.id}-${idx}`} className="live-item">
                  {drop.type === 'animation' && drop.animation ? (
                    <Player
                      autoplay
                      loop
                      src={drop.animation}
                      className="live-item-animation"
                    />
                  ) : (
                    <img
                      src={drop.image || '/image/mdi_gift.svg'}
                      alt={drop.name}
                      className="live-item-image"
                      onError={(e) => { e.target.src = '/image/mdi_gift.svg' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== FAQ SECTION ===== */}
        <div className="cases-faq-container">
          <div 
            className="cases-faq-header" 
            onClick={() => setIsFaqOpen(!isFaqOpen)}
            role="button"
            tabIndex={0}
          >
            <div className="faq-header-left">
              <div className="faq-icon-wrapper">
                <span className="faq-icon">!</span>
              </div>
              <h2 className="faq-title">{t('cases.howItWorks')}</h2>
            </div>
            <div className={`faq-arrow ${isFaqOpen ? 'open' : ''}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className={`cases-faq-content ${isFaqOpen ? 'open' : ''}`}>
            {/* Steps Grid */}
            <div className="faq-steps-grid">
              {/* Step 1 */}
              <div className="faq-step-card">
                <div className="step-number-badge">1</div>
                <div className="step-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <h3 className="step-title">{t('cases.step1Title')}</h3>
                <p className="step-desc">{t('cases.step1Desc')}</p>
              </div>

              {/* Step 2 */}
              <div className="faq-step-card">
                <div className="step-number-badge">2</div>
                <div className="step-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <h3 className="step-title">{t('cases.step2Title')}</h3>
                <p className="step-desc">{t('cases.step2Desc')}</p>
              </div>

              {/* Step 3 */}
              <div className="faq-step-card">
                <div className="step-number-badge">3</div>
                <div className="step-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <h3 className="step-title">{t('cases.step3Title')}</h3>
                <p className="step-desc">{t('cases.step3Desc')}</p>
              </div>

              {/* Step 4 */}
              <div className="faq-step-card">
                <div className="step-number-badge">4</div>
                <div className="step-icon">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <h3 className="step-title">{t('cases.step4Title')}</h3>
                <p className="step-desc">{t('cases.step4Desc')}</p>
              </div>
            </div>

            {/* Tips Section */}
            <div className="faq-tips-section">
              <div className="tips-header">
                <span className="tips-icon">⚡</span>
                <h3 className="tips-title">{t('cases.tipsTitle')}</h3>
              </div>
              <ul className="tips-list">
                <li>{t('cases.tip1')}</li>
                <li>{t('cases.tip2')}</li>
                <li>{t('cases.tip3')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="cases-tabs">
          <button
            className={`cases-tab ${activeTab === 'paid' ? 'active' : ''}`}
            onClick={() => setActiveTab('paid')}
          >
            {t('cases.paid')}
          </button>
          <button
            className={`cases-tab ${activeTab === 'free' ? 'active' : ''}`}
            onClick={() => setActiveTab('free')}
          >
            {t('cases.free')}
          </button>
        </div>

        {/* ===== CASES GRID ===== */}
        <div className="cases-grid">
          {visibleCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="case-card-wrapper"
              onClick={() => handleCaseClick(caseItem)}
            >
              <div className="case-card">
                {/* Free badge remains top-left if free, but price moves down */}
                {Number(caseItem.price) === 0 && (
                  <div className="case-price-badge case-price-badge--free">
                    {t('common.free')}
                  </div>
                )}

                {/* IMAGE */}
                <AsyncImage
                  src={caseItem.main_image}
                  alt={caseItem.name}
                  className="case-item-image"
                />
              </div>

              {/* PRICE / FREE BADGE */}
              {Number(caseItem.price) > 0 && (
                <div className="case-price-below">
                  <img
                    src={selectedCurrency.icon}
                    alt={selectedCurrency.id}
                    className="price-diamond"
                  />
                  <span>{formatAmount(caseItem.price)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Navigation activePage="cases" />

      <CaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caseData={selectedCase}
        isPaid={Number(selectedCase?.price) > 0}
      />
    </div>
  )
}

export default CasesPage
