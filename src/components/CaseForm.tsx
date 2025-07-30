// src/components/CaseForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Case, Installment, Hearing, CourtVisit } from "@/types/case";
import { COLORS } from '@/styles/colors'; // Import color palette

interface CaseFormProps {
  onAddCase: (newCase: Case) => void;
  onUpdateCase: (updatedCase: Case) => void;
  initialCase?: Case;
  onCancel: () => void;
}

export default function CaseForm({ onAddCase, onUpdateCase, initialCase, onCancel }: CaseFormProps) {
  const [caseTitle, setCaseTitle] = useState(initialCase?.caseTitle || "");
  const [caseNumberType, setCaseNumberType] = useState(
    initialCase?.caseNumber === "Legal Notice" ? "legalNotice" :
    initialCase?.caseNumber === "Affidavit" ? "affidavit" :
    (initialCase?.caseNumber && !["Legal Notice", "Affidavit"].includes(initialCase.caseNumber)) ? "custom" : "blank"
  );
  const [caseNumberCustom, setCaseNumberCustom] = useState(
    (initialCase?.caseNumber && !["Legal Notice", "Affidavit"].includes(initialCase.caseNumber)) ? initialCase.caseNumber : ""
  );
  const [courtType, setCourtType] = useState(
    initialCase?.court === "High Court" ? "highCourt" :
    initialCase?.court === "None" ? "none" :
    initialCase?.court ? "custom" : "blank"
  );
  const [courtCustom, setCourtCustom] = useState(
    (initialCase?.court && !["High Court", "None"].includes(initialCase.court)) ? initialCase.court : ""
  );
  const [appearingForType, setAppearingForType] = useState(
    (initialCase?.appearingFor === (initialCase?.caseTitle?.includes(' vs ') ? initialCase.caseTitle.split(' vs ')[0].trim() : '')) ? "A" :
    (initialCase?.appearingFor === (initialCase?.caseTitle?.includes(' vs ') ? initialCase.caseTitle.split(' vs ')[1].trim() : '')) ? "B" :
    (initialCase?.caseTitle && !initialCase.caseTitle.includes(' vs ') && initialCase.appearingFor === initialCase.caseTitle.trim()) ? "entireTitle" :
    initialCase?.appearingFor ? "custom" : "blank"
  );
  const [appearingForCustom, setAppearingForCustom] = useState(
    (initialCase?.appearingFor && !([
      (initialCase?.caseTitle?.includes(' vs ') ? initialCase.caseTitle.split(' vs ')[0].trim() : ''),
      (initialCase?.caseTitle?.includes(' vs ') ? initialCase.caseTitle.split(' vs ')[1].trim() : ''),
      (initialCase?.caseTitle && !initialCase.caseTitle.includes(' vs ') ? initialCase.caseTitle.trim() : '')
    ].includes(initialCase.appearingFor))) ? initialCase.appearingFor : ""
  );
  const [quotation, setQuotation] = useState(initialCase?.quotation || 0);
  const [perHearingFees, setPerHearingFees] = useState(initialCase?.perHearingFees || 0);
  const [invoiceNumber, setInvoiceNumber] = useState(initialCase?.invoiceNumber || "");
  const [invoiceDate, setInvoiceDate] = useState(initialCase?.invoiceDate || "");
  const [invoiceAmount, setInvoiceAmount] = useState(initialCase?.invoiceAmount || 0);
  const [remark, setRemark] = useState(initialCase?.remark || "");
  const [reference, setReference] = useState(initialCase?.reference || "");
  const [tdsApplicable, setTdsApplicable] = useState(initialCase?.tdsApplicable || false);

  const calculateBalance = (quotationVal: number, initialInvAmt: number, installments: Installment[], hearings: Hearing[]) => {
    const totalInstallments = (installments || []).reduce((sum, inst) => sum + inst.amount, 0) || 0;
    const totalHearingFees = (hearings || []).reduce((sum, hearing) => sum + hearing.feesCharged, 0) || 0;
    return quotationVal - (initialInvAmt + totalInstallments + totalHearingFees);
  };

  useEffect(() => {
    if (initialCase) {
      setCaseTitle(initialCase.caseTitle);
      setCaseNumberType(
        initialCase.caseNumber === "Legal Notice" ? "legalNotice" :
        initialCase.caseNumber === "Affidavit" ? "affidavit" :
        "custom"
      );
      setCaseNumberCustom(initialCase.caseNumber);
      setCourtType(
        initialCase.court === "High Court" ? "highCourt" :
        initialCase.court === "None" ? "none" :
        "custom"
      );
      setCourtCustom(initialCase.court);
      setAppearingForType(
        (initialCase.caseTitle.includes(' vs ') && initialCase.appearingFor === initialCase.caseTitle.split(' vs ')[0].trim()) ? "A" :
        (initialCase.caseTitle.includes(' vs ') && initialCase.appearingFor === initialCase.caseTitle.split(' vs ')[1].trim()) ? "B" :
        (!initialCase.caseTitle.includes(' vs ') && initialCase.appearingFor === initialCase.caseTitle.trim()) ? "entireTitle" :
        "custom"
      );
      setAppearingForCustom(initialCase.appearingFor);
      setQuotation(initialCase.quotation);
      setPerHearingFees(initialCase.perHearingFees || 0);
      setInvoiceNumber(initialCase.invoiceNumber);
      setInvoiceDate(initialCase.invoiceDate);
      setInvoiceAmount(initialCase.invoiceAmount);
      setRemark(initialCase.remark);
      setReference(initialCase.reference);
      setTdsApplicable(initialCase.tdsApplicable);
    } else {
      setCaseTitle("");
      setCaseNumberType("blank");
      setCaseNumberCustom("");
      setCourtType("blank");
      setCourtCustom("");
      setAppearingForType("blank");
      setAppearingForCustom("");
      setQuotation(0);
      setPerHearingFees(0);
      setInvoiceNumber("");
      setInvoiceDate("");
      setInvoiceAmount(0);
      setRemark("");
      setReference("");
      setTdsApplicable(false);
    }
  }, [initialCase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentCaseNumber = caseNumberType === "legalNotice" ? "Legal Notice" :
                              caseNumberType === "affidavit" ? "Affidavit" :
                              caseNumberCustom;
    const currentCourt = courtType === "highCourt" ? "High Court" :
                         courtType === "none" ? "None" :
                         courtCustom;
    const currentAppearingFor = appearingForType === "A" ? getCaseTitlePart('A') :
                                 appearingForType === "B" ? getCaseTitlePart('B') :
                                 appearingForType === "entireTitle" ? caseTitle.trim() :
                                 appearingForCustom;

    const baseCase: Case = {
      id: initialCase?.id || Date.now().toString(),
      caseTitle,
      caseNumber: currentCaseNumber,
      court: currentCourt,
      appearingFor: currentAppearingFor,
      quotation: Number(quotation),
      perHearingFees: perHearingFees > 0 ? Number(perHearingFees) : undefined,
      invoiceNumber,
      invoiceDate,
      invoiceAmount: Number(invoiceAmount),
      installments: initialCase?.installments || [],
      hearings: initialCase?.hearings || [],
      courtVisits: initialCase?.courtVisits || [],
      remark,
      reference,
      tdsApplicable,
      dateCreated: initialCase?.dateCreated || new Date().toISOString().split('T')[0],
      balanceRemaining: 0
    };

    if (initialCase) {
      onUpdateCase(baseCase);
    } else {
      onAddCase(baseCase);
    }
  };

  const getCaseTitlePart = (part: 'A' | 'B') => {
    const parts = caseTitle.split(' vs ');
    if (part === 'A' && parts.length > 0) return parts[0].trim();
    if (part === 'B' && parts.length > 1) return parts[1].trim();
    return '';
  };


  return (
    <form onSubmit={handleSubmit} style={formContainerStyles}>
      <h2 style={{ color: COLORS.PRIMARY_ACCENT, marginBottom: "1.5rem" }}>{initialCase ? "Edit Case Details" : "Add New Case"}</h2>

      <div style={twoColumnLayoutStyles}>

        <div style={{ ...inputGroupStyles, width: '100%', marginBottom: '1.2rem' }}>
          <label style={labelStyles}>Case Title (A vs B or Client Name):</label>
          <input
            type="text"
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
            placeholder="e.g., John Doe vs Jane Smith or Client Name"
            required
            style={inputStyles}
          />
        </div>

        <div style={responsiveInputGroupStyles}>
          <label style={labelStyles}>Case Number:</label>
          <select
            value={caseNumberType}
            onChange={(e) => {
              setCaseNumberType(e.target.value);
              if (e.target.value === 'legalNotice') setCaseNumberCustom('Legal Notice');
              else if (e.target.value === 'affidavit') setCaseNumberCustom('Affidavit');
              else setCaseNumberCustom('');
            }}
            style={selectStyles}
          >
            <option value="blank">Custom Input</option>
            <option value="legalNotice">Legal Notice</option>
            <option value="affidavit">Affidavit</option>
          </select>
          {caseNumberType === "blank" && (
            <input
              type="text"
              value={caseNumberCustom}
              onChange={(e) => setCaseNumberCustom(e.target.value)}
              placeholder="Enter custom case number"
              required
              style={inputStyles}
            />
          )}
        </div>

        <div style={responsiveInputGroupStyles}>
          <label style={labelStyles}>Court:</label>
          <select
            value={courtType}
            onChange={(e) => setCourtType(e.target.value)}
            style={selectStyles}
          >
            <option value="highCourt">High Court</option>
            <option value="none">None</option>
            <option value="custom">Custom Input</option>
          </select>
          {courtType === "custom" && (
            <input
              type="text"
              value={courtCustom}
              onChange={(e) => setCourtCustom(e.target.value)}
              placeholder="Enter custom court name"
              required
              style={inputStyles}
            />
          )}
        </div>

        <div style={responsiveInputGroupStyles}>
          <label style={labelStyles}>Appearing For:</label>
          <select
            value={appearingForType}
            onChange={(e) => {
              setAppearingForType(e.target.value);
              setAppearingForCustom('');
            }}
            style={selectStyles}
          >
            <option value="blank">Custom Input</option>
            {caseTitle.includes(' vs ') ? (
              <>
                <option value="A">{getCaseTitlePart('A') || 'Party A'}</option>
                <option value="B">{getCaseTitlePart('B') || 'Party B'}</option>
              </>
            ) : (
              <option value="entireTitle">{caseTitle.trim() || 'Entire Title'}</option>
            )}
          </select>
          {appearingForType === "blank" && (
            <input
              type="text"
              value={appearingForCustom}
              onChange={(e) => setAppearingForCustom(e.target.value)}
              placeholder="Enter custom party name"
              required
              style={inputStyles}
            />
          )}
        </div>

        <div style={responsiveInputGroupStyles}>
          <label style={labelStyles}>Quotation (₹):</label>
          <input
            type="number"
            value={quotation}
            onChange={(e) => setQuotation(Number(e.target.value))}
            required
            min="0"
            style={inputStyles}
          />
          <label style={{...labelStyles, marginTop: '10px'}}>Per Hearing Fees (Optional ₹):</label>
          <input
            type="number"
            value={perHearingFees}
            onChange={(e) => setPerHearingFees(Number(e.target.value))}
            min="0"
            style={inputStyles}
          />
        </div>

        <div style={responsiveInputGroupStyles}>
          <label style={labelStyles}>Initial Invoice Number:</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
            style={inputStyles}
          />
          <label style={{...labelStyles, marginTop: '10px'}}>Initial Invoice Date:</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            required
            style={inputStyles}
          />
        </div>

        <div style={responsiveInputGroupStyles}>
          <label style={labelStyles}>Initial Invoice Amount (₹):</label>
          <input
            type="number"
            value={invoiceAmount}
            onChange={(e) => setInvoiceAmount(Number(e.target.value))}
            required
            min="0"
            style={inputStyles}
          />
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
            <label style={{...labelStyles, margin: 0}}>TDS Applicable:</label>
            <input
              type="checkbox"
              checked={tdsApplicable}
              onChange={(e) => setTdsApplicable(e.target.checked)}
              style={{ transform: "scale(1.5)", marginLeft: "10px" }}
            />
          </div>
        </div>

      </div>

      <div style={inputGroupStyles}>
        <label style={labelStyles}>Remark (General Case Remark):</label>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          style={{ ...inputStyles, minHeight: "80px" }}
        />
      </div>

      <div style={inputGroupStyles}>
        <label style={labelStyles}>Reference:</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          style={inputStyles}
        />
      </div>

      <div style={formButtonRowStyles}>
        <button type="submit" style={buttonStyles}>
          {initialCase ? "Update Case" : "Add Case"}
        </button>
        <button type="button" onClick={onCancel} style={{ ...buttonStyles, backgroundColor: COLORS.NEUTRAL_LIGHT }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// =======================================================
// Styles (using COLORS)
// =======================================================

const formContainerStyles: React.CSSProperties = {
  backgroundColor: COLORS.LIGHT_BACKGROUND,
  padding: "2rem",
  borderRadius: "8px",
  border: `1px solid ${COLORS.NEUTRAL_DARK}`, // Thin border
  boxShadow: `0 4px 10px ${COLORS.SHADOW_DARK}`, // Added box shadow
  maxWidth: "900px",
  margin: "2rem auto",
  color: COLORS.DARK_TEXT,
  width: "calc(100% - 4rem)",
  boxSizing: 'border-box',
};

const twoColumnLayoutStyles: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  marginBottom: "1.2rem",
};

const responsiveInputGroupStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flex: "1 1 100%", // Default to full width for mobile-first approach
  minWidth: "250px", // Allows items to shrink down to 250px before wrapping
  boxSizing: "border-box",
  marginBottom: '0',
};

const inputGroupStyles: React.CSSProperties = {
  marginBottom: "1.2rem",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyles: React.CSSProperties = {
  fontWeight: "bold",
  color: COLORS.PRIMARY_DARK,
  marginBottom: "5px",
};

const inputStyles: React.CSSProperties = {
  padding: "10px",
  borderRadius: "4px",
  border: `1px solid ${COLORS.NEUTRAL_MEDIUM}`, // Thin border
  backgroundColor: COLORS.LIGHT_BACKGROUND,
  color: COLORS.DARK_TEXT,
  fontSize: "1em",
  width: '100%',
  boxSizing: 'border-box',
};

const selectStyles: React.CSSProperties = {
  padding: "10px",
  borderRadius: "4px",
  border: `1px solid ${COLORS.NEUTRAL_MEDIUM}`, // Thin border
  backgroundColor: COLORS.LIGHT_BACKGROUND,
  color: COLORS.DARK_TEXT,
  fontSize: "1em",
  cursor: "pointer",
  width: '100%',
  boxSizing: 'border-box',
};

const buttonStyles: React.CSSProperties = {
  padding: "12px 25px",
  backgroundColor: COLORS.PRIMARY_ACCENT,
  color: COLORS.LIGHT_TEXT,
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "1.1em",
  boxShadow: `0 2px 5px ${COLORS.SHADOW_COLOR}`, // Added box shadow
};

const formButtonRowStyles: React.CSSProperties = {
  display: 'flex',
  gap: '15px',
  marginTop: '1.5rem',
  justifyContent: 'flex-end',
};