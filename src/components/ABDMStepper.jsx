import React, { useState } from 'react';
import { abdmSteps } from '../data/abdmStepsData';
import '../design-system/styles/index.css';
import './ABDMStepper.css';

// Map step numbers to their illustration
const illustrationMap = {
  1: '/assets/abdm_illustrations/handshake.png',
  5: '/assets/abdm_illustrations/handshake.png',
  3: '/assets/abdm_illustrations/abha_card.png',
  4: '/assets/abdm_illustrations/abha_app.png',
  9: '/assets/abdm_illustrations/search.png',
  6: '/assets/abdm_illustrations/consent.png',
  7: '/assets/abdm_illustrations/easy_access.png',
};

// Steps with text-only layout (forms, terms, OTP)
const FORM_STEPS = [2, 8, 10, 11, 12, 13, 14, 15, 16, 17];

export const ABDMStepper = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [agreed, setAgreed] = useState({});
  const step = abdmSteps[currentStepIndex];
  const totalSteps = abdmSteps.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  if (!isOpen || !step) return null;

  const isFormStep = FORM_STEPS.includes(step.step_number);
  const illustration = illustrationMap[step.step_number];

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  // Inline modal backdrop + container — bypasses FormModal for full design control
  return (
    <div className="abdm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="abdm-modal" role="dialog" aria-modal="true" aria-label="ABDM Access Walkthrough">

        {/* ── TOP HEADER BAR ── */}
        <header className="abdm-modal__header">
          <div className="abdm-modal__header-left">
            <span className="abdm-modal__badge">ABDM Access</span>
            <span className="abdm-modal__step-label">Step {currentStepIndex + 1} of {totalSteps}</span>
          </div>
          <button className="abdm-modal__close btn btn--ghost btn--icon btn--sm" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </header>

        {/* ── PROGRESS BAR ── */}
        <div className="abdm-progress" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div className="abdm-progress__track">
            <div className="abdm-progress__fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="abdm-progress__label">{progressPercent}% complete</span>
        </div>

        {/* ── STEP DOTS ── */}
        <div className="abdm-dots" aria-hidden="true">
          {abdmSteps.map((_, i) => (
            <button
              key={i}
              className={`abdm-dots__dot ${i === currentStepIndex ? 'abdm-dots__dot--active' : i < currentStepIndex ? 'abdm-dots__dot--done' : ''}`}
              onClick={() => setCurrentStepIndex(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* ── BODY ── */}
        <div className={`abdm-modal__body ${isFormStep ? 'abdm-modal__body--form' : 'abdm-modal__body--split'}`}>

          {/* LEFT PANEL — illustration (only on non-form steps) */}
          {!isFormStep && (
            <div className="abdm-panel abdm-panel--illustration">
              <div className="abdm-illustration-bg">
                {illustration ? (
                  <img
                    src={illustration}
                    alt={step.illustration_description || step.header}
                    className="abdm-illustration__img"
                  />
                ) : (
                  <div className="abdm-illustration__placeholder">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="abdm-illustration__svg">
                      <circle cx="40" cy="30" r="16" fill="var(--color-primary-100)" stroke="var(--color-primary)" strokeWidth="2"/>
                      <path d="M20 65c0-11 9-20 20-20s20 9 20 20" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" fill="var(--color-primary-50)"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="abdm-illustration__caption">
                <p>{step.illustration_description}</p>
              </div>
            </div>
          )}

          {/* RIGHT PANEL — content */}
          <div className={`abdm-panel abdm-panel--content ${isFormStep ? 'abdm-panel--content-full' : ''}`}>
            {/* Step heading */}
            <div className="abdm-content__heading-block">
              <div className="abdm-content__step-num">{String(currentStepIndex + 1).padStart(2, '0')}</div>
              <h2 className="abdm-content__title">{step.header}</h2>
            </div>

            {/* Paragraphs */}
            {step.paragraphs.length > 0 && (
              <div className="abdm-content__text-area">
                {step.paragraphs.map((p, idx) => (
                  <div key={idx} className="abdm-content__paragraph">
                    {p.heading && <h4 className="abdm-content__subheading">{p.heading}</h4>}
                    {p.text && <p className="abdm-content__body">{p.text}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Input fields simulation */}
            {step.input_fields && step.input_fields.length > 0 && (
              <div className="abdm-form">
                {step.input_fields.map((field, idx) => {
                  const isCheckbox = field.toLowerCase().includes('checkbox') || field.toLowerCase().includes('i agree');
                  const isRadio = field.toLowerCase().includes('radio');
                  const isOtp = field.toLowerCase().includes('otp');
                  const isTerms = field.toLowerCase().includes('terms');

                  if (isRadio) {
                    const langs = ['English', 'Hindi', 'Telugu', 'Gujarati', 'Bangla', 'Tamil', 'Marathi', 'Assamese', 'Punjabi'];
                    return (
                      <div key={idx} className="abdm-form__radio-group">
                        {langs.map((lang, li) => (
                          <label key={lang} className={`abdm-form__radio-item ${li === 0 ? 'abdm-form__radio-item--selected' : ''}`}>
                            <input type="radio" name="language" defaultChecked={li === 0} readOnly className="abdm-form__radio-input" />
                            <span>{lang}</span>
                          </label>
                        ))}
                      </div>
                    );
                  }

                  if (isOtp) {
                    return (
                      <div key={idx} className="abdm-form__otp-row">
                        {[...Array(6)].map((_, oi) => (
                          <div key={oi} className="abdm-form__otp-box" />
                        ))}
                      </div>
                    );
                  }

                  if (isCheckbox) {
                    const id = `abdm-check-${idx}`;
                    return (
                      <label key={idx} htmlFor={id} className="abdm-form__checkbox-row">
                        <input
                          id={id}
                          type="checkbox"
                          className="abdm-form__checkbox"
                          checked={!!agreed[idx]}
                          onChange={e => setAgreed(prev => ({ ...prev, [idx]: e.target.checked }))}
                        />
                        <span className="abdm-form__checkbox-label">
                          {field.replace(/\(Checkbox\)/gi, '').trim()}
                        </span>
                      </label>
                    );
                  }

                  if (isTerms) return null; // Terms shown as paragraph above

                  return (
                    <div key={idx} className="abdm-form__field">
                      <label className="abdm-form__label">
                        {field.replace(/\*$/, '').replace(/\(.*?\)/g, '').trim()}
                        {field.includes('*') && <span className="abdm-form__required">*</span>}
                      </label>
                      <input type="text" className="abdm-form__input" placeholder={`Enter ${field.replace(/\*$/, '').replace(/\(.*?\)/g, '').trim().toLowerCase()}`} readOnly />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Other UI elements as info chips */}
            {step.other_ui_elements && step.other_ui_elements.filter(el => el.toLowerCase().includes('pagination')).length > 0 && (
              <div className="abdm-content__pagination-hint">
                {step.other_ui_elements.map((el, i) =>
                  el.toLowerCase().includes('pagination') ? (
                    <span key={i} className="abdm-chip">{el}</span>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER NAV ── */}
        <footer className="abdm-modal__footer">
          <button
            className="btn btn--outline btn--md"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>

          <div className="abdm-footer__actions">
            {/* If it's the permissions screen show Decline/Agree, else just Next */}
            {step.buttons.some(b => b === 'Decline') ? (
              <>
                <button className="btn btn--outline btn--md" onClick={handleNext}>Decline</button>
                <button className="btn btn--solid btn--md" onClick={handleNext}>Agree</button>
              </>
            ) : step.buttons.some(b => b.startsWith('Register')) ? (
              <>
                <button className="btn btn--outline btn--md" onClick={handleNext}>Register</button>
                <button className="btn btn--solid btn--md" onClick={handleNext}>Login</button>
              </>
            ) : currentStepIndex === totalSteps - 1 ? (
              <button className="btn btn--solid btn--md" onClick={onClose}>Finish</button>
            ) : (
              <button className="btn btn--solid btn--md" onClick={handleNext}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )}
          </div>
        </footer>

      </div>
    </div>
  );
};
