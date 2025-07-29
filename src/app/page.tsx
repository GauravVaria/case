// src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import CaseForm from "@/components/CaseForm";
import CaseList from "@/components/CaseList";
import { Case, Installment, Hearing, CourtVisit } from "@/types/case"; // Import CourtVisit type
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [cases, setCases] = useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<Case | undefined>(undefined);

  // Helper function to calculate balance for a case
  const calculateBalanceForCase = (quotation: number, initialInvoiceAmount: number, installments: Installment[], hearings: Hearing[]) => {
    const totalPaymentsReceived = (installments || []).reduce((sum, inst) => sum + inst.amount, 0) || 0;
    const totalHearingFees = (hearings || []).reduce((sum, hearing) => sum + hearing.feesCharged, 0) || 0;
    return quotation - (initialInvoiceAmount + totalPaymentsReceived + totalHearingFees);
  };

  // Load cases when session is ready
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
                courtVisits: caseItem.courtVisits || [], // NEW: Ensure courtVisits is an array
                balanceRemaining: calculateBalanceForCase(caseItem.quotation, caseItem.invoiceAmount, caseItem.installments || [], caseItem.hearings || [])
            }));
            setCases(casesWithRecalculatedBalance);
            console.log("Cases loaded:", casesWithRecalculatedBalance);
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
    alert("Case added locally. Remember to save to Google Drive!");
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
      alert(`Case "${updatedCase.caseTitle}" updated locally. Remember to save to Google Drive!`);
      setSaveStatus('idle');
  };

  const handleRemoveCase = (caseId: string) => {
    if (confirm("Are you sure you want to remove this case permanently?")) {
      setCases(prevCases => prevCases.filter(caseItem => caseItem.id !== caseId));
      alert("Case removed locally. Remember to save to Google Drive!");
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
        alert("Cases saved to Google Drive!");
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
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#222", color: "#eee" }}>
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
          backgroundColor: "#222",
          color: "#eee",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <h1 style={{ color: "#61afef", textAlign: "center", marginBottom: "1.5rem" }}>
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
                    style={{ ...buttonStyles, backgroundColor: '#28a745', width: 'auto', marginTop: 0, marginBottom: 0 }}
                >
                    Add New Case
                </button>
                <button
                    onClick={handleSaveCases}
                    disabled={saveStatus === 'saving'}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: saveStatus === 'saved' ? '#28a745' : saveStatus === 'saving' ? '#ffc107' : '#17a2b8',
                        color: "white",
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
                {saveStatus === 'error' && <span style={{color: '#e06c75', marginLeft: '10px'}}>Save Error!</span>}
            </div>


            {showCaseForm && (
                <div style={modalOverlayStyles}>
                    <div style={modalContentStyles}>
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
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <p>Please sign in with your Google account to access the Case Management System.</p>
            <button
              onClick={() => signIn("google")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
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

      <footer style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#333', color: '#888' }}>
        &copy; {new Date().getFullYear()} Casemiro
      </footer>
    </div>
  );
}

// =======================================================
// New and Updated Styles for HomePage
// =======================================================
const topControlsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '20px',
    width: '100%',
    maxWidth: '1200px', // Align with CaseList width
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
  backgroundColor: '#222',
  padding: '0', // Form has its own padding
  borderRadius: '8px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
  width: 'calc(100% - 4rem)',
  maxWidth: '900px', // Match form max-width
};

// Re-using buttonStyles from CaseForm for consistency
const buttonStyles: React.CSSProperties = {
  padding: "12px 25px",
  backgroundColor: "#98c379",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "1.1em",
  marginTop: "1.5rem",
  width: "100%",
};