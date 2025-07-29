// src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import CaseForm from "@/components/CaseForm";
import CaseList from "@/components/CaseList";
import { Case, Installment, Hearing } from "@/types/case";
import { useSession, signIn } from "next-auth/react";
import { COLORS } from '@/styles/colors'; // Import color palette

export default function HomePage() {
  const { data: session, status } = useSession();
  const [cases, setCases] = useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<Case | undefined>(undefined);

  const calculateBalanceForCase = (quotation: number, initialInvoiceAmount: number, installments: Installment[], hearings: Hearing[]) => {
    const totalPaymentsReceived = (installments || []).reduce((sum, inst) => sum + inst.amount, 0) || 0;
    const totalHearingFees = (hearings || []).reduce((sum, hearing) => sum + hearing.feesCharged, 0) || 0;
    return quotation - (initialInvoiceAmount + totalPaymentsReceived + totalHearingFees);
  };

  useEffect(() => {
    const loadCases = async () => {
      if (status === "authenticated") {
        setLoadingCases(true);
        try {
          const response = await fetch("/api/cases/load");
          if (response.ok) {
            const loadedCases: Case[] = await response.json();
            const casesWithRecalculatedBalance = loadedCases.map(caseItem => ({
                ...caseItem,
                hearings: caseItem.hearings || [],
                installments: caseItem.installments || [],
                courtVisits: caseItem.courtVisits || [],
                balanceRemaining: calculateBalanceForCase(caseItem.quotation, caseItem.invoiceAmount, caseItem.installments || [], caseItem.hearings || [])
            }));
            setCases(casesWithRecalculatedBalance);
            console.log("Cases loaded successfully.");
          } else {
            console.error("Failed to load cases:", response.statusText);
            alert("Failed to load cases from Google Drive. Please check console.");
          }
        } catch (error) {
          console.error("Error loading cases:", error);
          alert("Error loading cases from Google Drive. Please check console.");
        } finally {
          setLoadingCases(false);
        }
      } else if (status === "unauthenticated") {
        setCases([]);
        setLoadingCases(false);
      }
    };

    loadCases();
  }, [status]);

  const handleAddCase = (newCase: Case) => {
    setCases((prevCases) => {
      const caseWithCalculatedBalance = {
          ...newCase,
          balanceRemaining: calculateBalanceForCase(newCase.quotation, newCase.invoiceAmount, newCase.installments, newCase.hearings)
      };
      return [...prevCases, caseWithCalculatedBalance];
    });
    setShowCaseForm(false);
    setCaseToEdit(undefined);
    console.log("Case added locally.");
    setSaveStatus('idle');
  };

  const handleUpdateCase = (updatedCase: Case) => {
      setCases(prevCases => {
          const caseWithRecalculatedBalance = {
              ...updatedCase,
              balanceRemaining: calculateBalanceForCase(updatedCase.quotation, updatedCase.invoiceAmount, updatedCase.installments, updatedCase.hearings)
          };
          return prevCases.map(caseItem =>
              caseItem.id === caseWithRecalculatedBalance.id ? caseWithRecalculatedBalance : caseItem
          );
      });
      setShowCaseForm(false);
      setCaseToEdit(undefined);
      console.log(`Case "${updatedCase.caseTitle}" updated locally.`);
      setSaveStatus('idle');
  };

  const handleRemoveCase = (caseId: string) => {
    if (confirm("Are you sure you want to remove this case permanently?")) {
      setCases(prevCases => prevCases.filter(caseItem => caseItem.id !== caseId));
      console.log("Case removed locally.");
      setSaveStatus('idle');
    }
  };

  const handleEditCase = (caseToEdit: Case) => {
    setCaseToEdit(caseToEdit);
    setShowCaseForm(true);
  };

  const handleCancelForm = () => {
    setShowCaseForm(false);
    setCaseToEdit(undefined);
  };

  const handleSaveCases = async () => {
    setSaveStatus('saving');
    try {
      const response = await fetch("/api/cases/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cases),
      });

      if (response.ok) {
        setSaveStatus('saved');
        console.log("Cases saved to Google Drive!");
      } else if (response.status === 401) {
        setSaveStatus('error');
        alert("Unauthorized to save. Please sign in again.");
      } else {
        setSaveStatus('error');
        const errorData = await response.json();
        alert(`Failed to save cases to Google Drive: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error("Error saving cases:", error);
      alert("Error saving cases to Google Drive. Check console for details.");
    } finally {
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (status === "loading" || loadingCases) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.LIGHT_BACKGROUND, color: COLORS.DARK_TEXT }}>
        <p>Loading application data...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main
        style={{
          flexGrow: 1,
          padding: "20px",
          backgroundColor: COLORS.LIGHT_BACKGROUND, // Main content background is already this color
          color: COLORS.DARK_TEXT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
          border: '1px solid black',
          borderRadius: '8px',
          margin: '20px auto',
          maxWidth: '1200px',
          width: 'calc(100% - 40px)',
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ color: COLORS.PRIMARY_DARK, textAlign: "center", marginBottom: "1.5rem" }}>
          Case Management Dashboard
        </h1>

        {status === "authenticated" ? (
          <>
            <div style={topControlsContainerStyles}>
                <button
                    onClick={() => {
                        setShowCaseForm(true);
                        setCaseToEdit(undefined);
                    }}
                    style={{ ...buttonStyles, backgroundColor: COLORS.SUCCESS, width: 'auto', marginTop: 0, marginBottom: 0 }}
                >
                    Add New Case
                </button>
                <button
                    onClick={handleSaveCases}
                    disabled={saveStatus === 'saving'}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: saveStatus === 'saved' ? COLORS.SUCCESS : saveStatus === 'saving' ? COLORS.WARNING : COLORS.SECONDARY_ACCENT,
                        color: COLORS.LIGHT_TEXT,
                        border: "none",
                        borderRadius: "5px",
                        cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                        fontSize: "1em",
                        width: 'auto',
                        marginTop: 0,
                        marginBottom: 0,
                    }}
                >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Cases to Drive'}
                </button>
                {saveStatus === 'error' && <span style={{color: COLORS.DANGER, marginLeft: '10px'}}>Save Error!</span>}

            </div>


            {showCaseForm && (
                <div style={modalOverlayStyles}>
                    <div style={{ ...modalContentStyles, border: '1px solid black' }}>
                        <CaseForm
                            onAddCase={handleAddCase}
                            onUpdateCase={handleUpdateCase}
                            initialCase={caseToEdit}
                            onCancel={handleCancelForm}
                        />
                    </div>
                </div>
            )}

            {!showCaseForm && (
                <CaseList
                    cases={cases}
                    onUpdateCase={handleUpdateCase}
                    onEditCase={handleEditCase}
                    onRemoveCase={handleRemoveCase}
                />
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", marginTop: "50px", border: '1px solid black', padding: '20px', borderRadius: '8px', backgroundColor: COLORS.LIGHT_BACKGROUND, maxWidth: '600px' }}>
            <p style={{ color: COLORS.DARK_TEXT }}>Please sign in with your Google account to access the Case Management System.</p>
            <button
              onClick={() => signIn("google")}
              style={{
                padding: "10px 20px",
                backgroundColor: COLORS.PRIMARY_ACCENT,
                color: COLORS.LIGHT_TEXT,
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1em",
                marginTop: "20px",
              }}
            >
              Sign In with Google
            </button>
          </div>
        )}
      </main>

      <footer style={{ padding: '1rem', textAlign: 'center', backgroundColor: COLORS.LIGHT_BACKGROUND, color: COLORS.DARK_TEXT, borderTop: '1px solid black' }}> {/* Changed to LIGHT_BACKGROUND and DARK_TEXT */}
        &copy; {new Date().getFullYear()} Case Management System
      </footer>
    </div>
  );
}

const topControlsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '1200px',
    flexWrap: 'wrap',
};

const modalOverlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyles: React.CSSProperties = {
  backgroundColor: COLORS.LIGHT_BACKGROUND,
  padding: '0',
  borderRadius: '8px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
  width: 'calc(100% - 4rem)',
  maxWidth: '900px',
};

const buttonStyles: React.CSSProperties = {
  padding: "12px 25px",
  backgroundColor: COLORS.PRIMARY_ACCENT,
  color: COLORS.LIGHT_TEXT,
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "1.1em",
};