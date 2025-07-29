// src/components/CaseList.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Case, Installment, Hearing, CourtVisit } from '@/types/case';

interface CaseListProps {
  cases: Case[];
  onUpdateCase: (updatedCase: Case) => void;
  onEditCase: (caseToEdit: Case) => void;
  onRemoveCase: (caseId: string) => void;
}

export default function CaseList({ cases, onUpdateCase, onEditCase, onRemoveCase }: CaseListProps) {
  const [sortBy, setSortBy] = useState<'balanceRemaining' | 'dateCreated' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Installment States
  const [showInstallmentForm, setShowInstallmentForm] = useState<string | null>(null);
  const [editingInstallmentId, setEditingInstallmentId] = useState<string | null>(null);
  const [currentInstallmentInvoice, setCurrentInstallmentInvoice] = useState('');
  const [currentInstallmentDate, setCurrentInstallmentDate] = useState('');
  const [currentInstallmentAmount, setCurrentInstallmentAmount] = useState(0);
  const [currentInstallmentPaymentMethod, setCurrentInstallmentPaymentMethod] = useState<'cash' | 'upi' | 'other' | string>('cash');
  const [currentInstallmentCustomMethod, setCurrentInstallmentCustomMethod] = useState('');

  // Hearing States
  const [showHearingForm, setShowHearingForm] = useState<string | null>(null);
  const [editingHearingId, setEditingHearingId] = useState<string | null>(null);
  const [currentHearingDate, setCurrentHearingDate] = useState('');
  const [currentHearingRemark, setCurrentHearingRemark] = useState('');

  // Court Visit States
  const [showCourtVisitForm, setShowCourtVisitForm] = useState<string | null>(null);
  const [editingCourtVisitId, setEditingCourtVisitId] = useState<string | null>(null);
  const [currentCourtVisitDate, setCurrentCourtVisitDate] = useState('');
  const [currentCourtVisitRemark, setCurrentCourtVisitRemark] = useState('');


  const handleSort = (column: 'balanceRemaining' | 'dateCreated') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };


  const calculateCaseBalance = (caseItem: Case) => {
    const safeInstallments = caseItem.installments || [];
    const safeHearings = caseItem.hearings || [];
    const totalPaymentsReceived = safeInstallments.reduce((sum, inst) => sum + inst.amount, 0) || 0;
    const totalHearingFees = safeHearings.reduce((sum, hearing) => sum + hearing.feesCharged, 0) || 0;
    return caseItem.quotation - (caseItem.invoiceAmount + totalPaymentsReceived + totalHearingFees);
  };

  // --- Installment Logic ---
  const resetInstallmentForm = () => {
    setEditingInstallmentId(null);
    setCurrentInstallmentInvoice('');
    setCurrentInstallmentDate('');
    setCurrentInstallmentAmount(0);
    setCurrentInstallmentPaymentMethod('cash');
    setCurrentInstallmentCustomMethod('');
  };

  const handleAddOrUpdateInstallment = (caseToUpdate: Case) => {
    if (!currentInstallmentInvoice || !currentInstallmentDate || currentInstallmentAmount <= 0) {
      alert("Please fill all required installment fields (Invoice, Date, Amount) and ensure amount is positive.");
      return;
    }

    const paymentMethod = currentInstallmentPaymentMethod === 'other' ? currentInstallmentCustomMethod : currentInstallmentPaymentMethod;
    if (currentInstallmentPaymentMethod === 'other' && !currentInstallmentCustomMethod) {
      alert("Please enter a custom payment method for 'Other'.");
      return;
    }

    let updatedInstallments: Installment[];

    if (editingInstallmentId) {
      updatedInstallments = (caseToUpdate.installments || []).map(inst =>
        inst.id === editingInstallmentId
          ? { ...inst, invoiceNumber: currentInstallmentInvoice, invoiceDate: currentInstallmentDate, amount: currentInstallmentAmount, paymentMethod: paymentMethod }
          : inst
      );
    } else {
      const newInstallment: Installment = { id: Date.now().toString(), invoiceNumber: currentInstallmentInvoice, invoiceDate: currentInstallmentDate, amount: currentInstallmentAmount, paymentMethod: paymentMethod, dateReceived: new Date().toISOString().split('T')[0] };
      updatedInstallments = [...(caseToUpdate.installments || []), newInstallment];
    }

    const updatedCase: Case = { ...caseToUpdate, installments: updatedInstallments, balanceRemaining: calculateCaseBalance({ ...caseToUpdate, installments: updatedInstallments }) };
    onUpdateCase(updatedCase);
    console.log(`Installment ${editingInstallmentId ? 'updated' : 'added'} for case "${caseToUpdate.caseTitle}".`); // Log success
    setShowInstallmentForm(null);
    resetInstallmentForm();
  };

  const handleEditInstallment = (caseItem: Case, installment: Installment) => {
    setShowInstallmentForm(caseItem.id);
    setEditingInstallmentId(installment.id);
    setCurrentInstallmentInvoice(installment.invoiceNumber);
    setCurrentInstallmentDate(installment.invoiceDate);
    setCurrentInstallmentAmount(installment.amount);
    if (['cash', 'upi'].includes(installment.paymentMethod)) { setCurrentInstallmentPaymentMethod(installment.paymentMethod); setCurrentInstallmentCustomMethod(''); } else { setCurrentInstallmentPaymentMethod('other'); setCurrentInstallmentCustomMethod(installment.paymentMethod); }
  };

  const handleRemoveInstallment = (caseToUpdate: Case, installmentIdToRemove: string) => {
    if (!confirm("Are you sure you want to remove this installment?")) return;
    const updatedInstallments = (caseToUpdate.installments || []).filter(inst => inst.id !== installmentIdToRemove);
    const updatedCase: Case = { ...caseToUpdate, installments: updatedInstallments, balanceRemaining: calculateCaseBalance({ ...caseToUpdate, installments: updatedInstallments }) };
    onUpdateCase(updatedCase);
    console.log(`Installment removed from case "${caseToUpdate.caseTitle}".`); // Log success
    resetInstallmentForm();
    setShowInstallmentForm(null);
  };

  const handleCancelInstallmentForm = () => {
    setShowInstallmentForm(null);
    resetInstallmentForm();
  };

  // --- Hearing Logic ---
  const resetHearingForm = () => {
    setEditingHearingId(null);
    setCurrentHearingDate('');
    setCurrentHearingRemark('');
  };

  const handleAddOrUpdateHearing = (caseToUpdate: Case) => {
    if (!currentHearingDate) { alert("Please provide a date for the hearing."); return; }
    if (!caseToUpdate.perHearingFees || caseToUpdate.perHearingFees <= 0) { alert("Per hearing fees are not set or are zero for this case. Cannot add a hearing."); return; }

    let updatedHearings: Hearing[];
    const feesCharged = caseToUpdate.perHearingFees;

    if (editingHearingId) {
      updatedHearings = (caseToUpdate.hearings || []).map(hearing =>
        hearing.id === editingHearingId
          ? { ...hearing, date: currentHearingDate, remark: currentHearingRemark, feesCharged: feesCharged }
          : hearing
      );
    } else {
      const newHearing: Hearing = { id: Date.now().toString(), date: currentHearingDate, remark: currentHearingRemark, feesCharged: feesCharged };
      updatedHearings = [...(caseToUpdate.hearings || []), newHearing];
    }

    const updatedCase: Case = { ...caseToUpdate, hearings: updatedHearings, balanceRemaining: calculateCaseBalance({ ...caseToUpdate, hearings: updatedHearings }) };
    onUpdateCase(updatedCase);
    console.log(`Hearing ${editingHearingId ? 'updated' : 'added'} for case "${caseToUpdate.caseTitle}".`); // Log success
    setShowHearingForm(null);
    resetHearingForm();
  };

  const handleEditHearing = (caseItem: Case, hearing: Hearing) => {
    setShowHearingForm(caseItem.id);
    setEditingHearingId(hearing.id);
    setCurrentHearingDate(hearing.date);
    setCurrentHearingRemark(hearing.remark);
  };

  const handleRemoveHearing = (caseToUpdate: Case, hearingIdToRemove: string) => {
    if (!confirm("Are you sure you want to remove this hearing? This will affect the balance.")) return;
    const updatedHearings = (caseToUpdate.hearings || []).filter(hearing => hearing.id !== hearingIdToRemove);
    const updatedCase: Case = { ...caseToUpdate, hearings: updatedHearings, balanceRemaining: calculateCaseBalance({ ...caseToUpdate, hearings: updatedHearings }) };
    onUpdateCase(updatedCase);
    console.log(`Hearing removed from case "${caseToUpdate.caseTitle}".`); // Log success
    resetHearingForm();
    setShowHearingForm(null);
  };

  const handleCancelHearingForm = () => {
    setShowHearingForm(null);
    resetHearingForm();
  };

  // --- Court Visit Logic ---
  const resetCourtVisitForm = () => {
    setEditingCourtVisitId(null);
    setCurrentCourtVisitDate('');
    setCurrentCourtVisitRemark('');
  };

  const handleAddOrUpdateCourtVisit = (caseToUpdate: Case) => {
    if (!currentCourtVisitDate) { alert("Please provide a date for the court visit."); return; }

    let updatedCourtVisits: CourtVisit[];

    if (editingCourtVisitId) {
      updatedCourtVisits = (caseToUpdate.courtVisits || []).map(visit =>
        visit.id === editingCourtVisitId
          ? { ...visit, date: currentCourtVisitDate, remark: currentCourtVisitRemark }
          : visit
      );
    } else {
      const newCourtVisit: CourtVisit = { id: Date.now().toString(), date: currentCourtVisitDate, remark: currentCourtVisitRemark };
      updatedCourtVisits = [...(caseToUpdate.courtVisits || []), newCourtVisit];
    }

    const updatedCase: Case = { ...caseToUpdate, courtVisits: updatedCourtVisits };
    onUpdateCase(updatedCase);
    console.log(`Court Visit ${editingCourtVisitId ? 'updated' : 'added'} for case "${caseToUpdate.caseTitle}".`); // Log success
    setShowCourtVisitForm(null);
    resetCourtVisitForm();
  };

  const handleEditCourtVisit = (caseItem: Case, visit: CourtVisit) => {
    setShowCourtVisitForm(caseItem.id);
    setEditingCourtVisitId(visit.id);
    setCurrentCourtVisitDate(visit.date);
    setCurrentCourtVisitRemark(visit.remark);
  };

  const handleRemoveCourtVisit = (caseToUpdate: Case, visitIdToRemove: string) => {
    if (!confirm("Are you sure you want to remove this court visit?")) return;
    const updatedCourtVisits = (caseToUpdate.courtVisits || []).filter(visit => visit.id !== visitIdToRemove);
    const updatedCase: Case = { ...caseToUpdate, courtVisits: updatedCourtVisits };
    onUpdateCase(updatedCase);
    console.log(`Court Visit removed from case "${caseToUpdate.caseTitle}".`); // Log success
    resetCourtVisitForm();
    setShowCourtVisitForm(null);
  };

  const handleCancelCourtVisitForm = () => {
    setShowCourtVisitForm(null);
    resetCourtVisitForm();
  };

  const filteredCases = useMemo(() => {
    if (filterType === 'all') return cases;
    if (filterType === 'paid') return cases.filter(c => c.balanceRemaining <= 0);
    if (filterType === 'unpaid') return cases.filter(c => c.balanceRemaining > 0);
    return cases;
  }, [cases, filterType]);

  const displayedCases = useMemo(() => {
    if (!sortBy) return filteredCases;
    const sorted = [...filteredCases].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'balanceRemaining') { comparison = a.balanceRemaining - b.balanceRemaining; }
      else if (sortBy === 'dateCreated') { comparison = new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime(); }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredCases, sortBy, sortOrder]);


  if (cases.length === 0) {
    return (
      <div style={emptyListStyles}>
        <p>No cases added yet. Click "Add New Case" above to get started.</p>
      </div>
    );
  }

  return (
    <div style={listContainerStyles}>
      <h2 style={{ color: "#c678dd", marginBottom: "1.5rem" }}>All Cases</h2>

      <div style={filterButtonsContainerStyles}>
        <button onClick={() => setFilterType('all')} style={filterButtonStyles(filterType === 'all')}> All Cases ({cases.length}) </button>
        <button onClick={() => setFilterType('paid')} style={filterButtonStyles(filterType === 'paid')}> Paid ({cases.filter(c => c.balanceRemaining <= 0).length}) </button>
        <button onClick={() => setFilterType('unpaid')} style={filterButtonStyles(filterType === 'unpaid')}> Unpaid ({cases.filter(c => c.balanceRemaining > 0).length}) </button>
      </div>

      <div style={sortControlsStyles}>
        <span>Sort By: </span>
        <button onClick={() => handleSort('balanceRemaining')} style={sortButtonStyles}> Balance Remaining {sortBy === 'balanceRemaining' ? (sortOrder === 'asc' ? '▲' : '▼') : ''} </button>
        <button onClick={() => handleSort('dateCreated')} style={sortButtonStyles}> Date Created {sortBy === 'dateCreated' ? (sortOrder === 'asc' ? '▲' : '▼') : ''} </button>
      </div>

      {displayedCases.length === 0 && (filterType !== 'all') ? (
        <p style={{textAlign: 'center', marginTop: '20px', color: '#888'}}>No {filterType} cases found matching your criteria.</p>
      ) : (
        <div style={caseTableStyles}>
          <div style={tableHeaderRowStyles}>
            <div style={tableHeaderCellStyles}>Case Title</div>
            <div style={tableHeaderCellStyles}>Case No.</div>
            <div style={tableHeaderCellStyles}>Court</div>
            <div style={tableHeaderCellStyles}>Appearing For</div>
            <div style={tableHeaderCellStyles}>Quotation</div>
            <div style={tableHeaderCellStyles}>Balance</div>
            <div style={tableHeaderCellStyles}>Actions</div>
          </div>

          {displayedCases.map((caseItem) => (
            <React.Fragment key={caseItem.id}>
              <div style={tableRowStyles}>
                <div style={tableCellStyles}>{caseItem.caseTitle}</div>
                <div style={tableCellStyles}>{caseItem.caseNumber}</div>
                <div style={tableCellStyles}>{caseItem.court}</div>
                <div style={tableCellStyles}>{caseItem.appearingFor}</div>
                <div style={tableCellStyles}>₹{caseItem.quotation.toLocaleString('en-IN')}</div>
                <div style={tableCellStyles}>
                  <span style={{ color: caseItem.balanceRemaining > 0 ? '#e06c75' : '#98c379' }}>
                    ₹{caseItem.balanceRemaining.toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={tableCellStyles}>
                  <button onClick={() => onEditCase(caseItem)} style={{ ...smallButtonStyles, backgroundColor: '#ffc107', marginRight: '5px' }}> Edit </button>
                  <button onClick={() => onRemoveCase(caseItem.id)} style={{ ...smallButtonStyles, backgroundColor: '#dc3545' }}> Remove </button>
                </div>
              </div>

              <div style={caseDetailsCardStyles}>
                  <h3 style={{ color: "#61afef", marginBottom: "0.5rem" }}>{caseItem.caseTitle} Details</h3>
                  <p><strong>Initial Invoice:</strong> {caseItem.invoiceNumber} on {caseItem.invoiceDate} for ₹{caseItem.invoiceAmount.toLocaleString('en-IN')}</p>
                  <p><strong>Remark (General):</strong> {caseItem.remark || 'N/A'}</p>
                  <p><strong>Reference:</strong> {caseItem.reference || 'N/A'}</p>
                  <p><strong>TDS Applicable:</strong> {caseItem.tdsApplicable ? 'Yes' : 'No'}</p>
                  <p><strong>Date Created:</strong> {caseItem.dateCreated}</p>

                  <h4 style={{ color: "#56b6c2", marginTop: "1rem", marginBottom: "0.5rem" }}>Installments Received:</h4>
                  {(caseItem.installments || []).length === 0 ? ( <p>No installments recorded yet.</p> ) : (
                    <ul style={installmentListStyles}>
                      {(caseItem.installments || []).map((inst) => (
                        <li key={inst.id} style={installmentItemStyles}>
                          <div>Invoice: {inst.invoiceNumber} | Date: {inst.invoiceDate} | Amount: ₹{inst.amount.toLocaleString('en-IN')} | Method: {inst.paymentMethod}</div>
                          <div style={{ marginTop: '5px' }}>
                            <button onClick={() => handleEditInstallment(caseItem, inst)} style={{ ...smallButtonStyles, backgroundColor: '#ffc107', marginRight: '5px' }}> Edit </button>
                            <button onClick={() => handleRemoveInstallment(caseItem, inst.id)} style={{ ...smallButtonStyles, backgroundColor: '#dc3545' }}> Remove </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button onClick={() => { if (caseItem.id === showInstallmentForm) { handleCancelInstallmentForm(); } else { setShowInstallmentForm(caseItem.id); resetInstallmentForm(); } }}
                    style={{ ...buttonStyles, backgroundColor: "#6272a4", marginTop: "1rem" }}>
                    {caseItem.id === showInstallmentForm && editingInstallmentId ? 'Cancel Edit' : caseItem.id === showInstallmentForm ? 'Cancel Add Installment' : 'Add Installment'}
                  </button>

                  {showInstallmentForm === caseItem.id && (
                    <div style={installmentFormStyles}>
                      <h5 style={{ color: "#c678dd", marginBottom: "1rem" }}>{editingInstallmentId ? 'Edit Installment' : 'Record New Payment'}</h5>
                      <div style={inputGroupStyles}> <label style={labelStyles}>Invoice Number:</label> <input type="text" value={currentInstallmentInvoice} onChange={(e) => setCurrentInstallmentInvoice(e.target.value)} required style={inputStyles} /> </div>
                      <div style={inputGroupStyles}> <label style={labelStyles}>Invoice Date:</label> <input type="date" value={currentInstallmentDate} onChange={(e) => setCurrentInstallmentDate(e.target.value)} required style={inputStyles} /> </div>
                      <div style={inputGroupStyles}> <label style={labelStyles}>Amount (₹):</label> <input type="number" value={currentInstallmentAmount} onChange={(e) => setCurrentInstallmentAmount(Number(e.target.value))} required min="0" style={inputStyles} /> </div>
                      <div style={inputGroupStyles}>
                        <label style={labelStyles}>Payment Method:</label>
                        <select value={currentInstallmentPaymentMethod} onChange={(e) => setCurrentInstallmentPaymentMethod(e.target.value)} style={selectStyles}>
                          <option value="cash">Cash</option><option value="upi">UPI</option><option value="other">Other (Specify)</option>
                        </select>
                        {currentInstallmentPaymentMethod === 'other' && ( <input type="text" value={currentInstallmentCustomMethod} onChange={(e) => setCurrentInstallmentCustomMethod(e.target.value)} placeholder="Specify method" required style={inputStyles} /> )}
                      </div>
                      <button onClick={() => handleAddOrUpdateInstallment(caseItem)} style={{ ...buttonStyles, backgroundColor: "#98c379", fontSize: "0.9em" }}> {editingInstallmentId ? 'Save Changes' : 'Record Payment'} </button>
                      <button onClick={handleCancelInstallmentForm} style={{ ...buttonStyles, backgroundColor: '#6c757d', fontSize: '0.9em', marginTop: '10px' }}> Cancel </button>
                    </div>
                  )}

                  {caseItem.perHearingFees && caseItem.perHearingFees > 0 ? (
                    // Hearings Section
                    <>
                      <h4 style={{ color: "#56b6c2", marginTop: "1rem", marginBottom: "0.5rem" }}> Hearings ({caseItem.hearings ? caseItem.hearings.length : 0}) </h4>
                      {(caseItem.hearings || []).length === 0 ? ( <p>No hearings recorded yet.</p> ) : (
                        <ul style={installmentListStyles}>
                          {(caseItem.hearings || []).map((hearing) => (
                            <li key={hearing.id} style={installmentItemStyles}>
                              <div>Date: {hearing.date} | Fees: ₹{hearing.feesCharged.toLocaleString('en-IN')} | Remark: {hearing.remark || 'N/A'}</div>
                              <div style={{ marginTop: '5px' }}>
                                <button onClick={() => handleEditHearing(caseItem, hearing)} style={{ ...smallButtonStyles, backgroundColor: '#ffc107', marginRight: '5px' }}> Edit </button>
                                <button onClick={() => handleRemoveHearing(caseItem, hearing.id)} style={{ ...smallButtonStyles, backgroundColor: '#dc3545' }}> Remove </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      <button onClick={() => { if (caseItem.id === showHearingForm) { handleCancelHearingForm(); } else { setShowHearingForm(caseItem.id); resetHearingForm(); setCurrentHearingDate(new Date().toISOString().split('T')[0]); setCurrentHearingRemark(''); } }}
                        style={{ ...buttonStyles, backgroundColor: "#7c56b6c2", marginTop: "1rem" }}>
                        {caseItem.id === showHearingForm && editingHearingId ? 'Cancel Edit' : caseItem.id === showHearingForm ? 'Cancel Add Hearing' : 'Add Hearing'}
                      </button>

                      {showHearingForm === caseItem.id && (
                        <div style={installmentFormStyles}>
                          <h5 style={{ color: "#c678dd", marginBottom: "1rem" }}>{editingHearingId ? 'Edit Hearing' : 'Add New Hearing'}</h5>
                          <div style={inputGroupStyles}> <label style={labelStyles}>Hearing Date:</label> <input type="date" value={currentHearingDate} onChange={(e) => setCurrentHearingDate(e.target.value)} required style={inputStyles} /> </div>
                          <div style={inputGroupStyles}> <label style={labelStyles}>Remark (for this hearing):</label> <textarea value={currentHearingRemark} onChange={(e) => setCurrentHearingRemark(e.target.value)} style={{ ...inputStyles, minHeight: '60px' }} placeholder="e.g., Case adjourned, Next date fixed, Arguments heard etc." /> </div>
                          <button onClick={() => handleAddOrUpdateHearing(caseItem)} style={{ ...buttonStyles, backgroundColor: "#a6e22e", fontSize: "0.9em" }}> {editingHearingId ? 'Save Changes' : 'Record Hearing'} </button>
                          <button onClick={handleCancelHearingForm} style={{ ...buttonStyles, backgroundColor: '#6c757d', fontSize: '0.9em', marginTop: '10px' }}> Cancel </button>
                        </div>
                      )}
                    </>
                  ) : (
                    // Court Visits Section (if perHearingFees is 0 or undefined)
                    <>
                      <h4 style={{ color: "#56b6c2", marginTop: "1rem", marginBottom: "0.5rem" }}> Court Visits ({caseItem.courtVisits ? caseItem.courtVisits.length : 0}) </h4>
                      {(caseItem.courtVisits || []).length === 0 ? ( <p>No court visits recorded yet.</p> ) : (
                        <ul style={installmentListStyles}>
                          {(caseItem.courtVisits || []).map((visit) => (
                            <li key={visit.id} style={installmentItemStyles}>
                              <div>Date: {visit.date} | Remark: {visit.remark || 'N/A'}</div>
                              <div style={{ marginTop: '5px' }}>
                                <button onClick={() => handleEditCourtVisit(caseItem, visit)} style={{ ...smallButtonStyles, backgroundColor: '#ffc107', marginRight: '5px' }}> Edit </button>
                                <button onClick={() => handleRemoveCourtVisit(caseItem, visit.id)} style={{ ...smallButtonStyles, backgroundColor: '#dc3545' }}> Remove </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      <button onClick={() => { if (caseItem.id === showCourtVisitForm) { handleCancelCourtVisitForm(); } else { setShowCourtVisitForm(caseItem.id); resetCourtVisitForm(); setCurrentCourtVisitDate(new Date().toISOString().split('T')[0]); setCurrentCourtVisitRemark(''); } }}
                        style={{ ...buttonStyles, backgroundColor: "#ff8c00", marginTop: "1rem" }}>
                        {caseItem.id === showCourtVisitForm && editingCourtVisitId ? 'Cancel Edit' : caseItem.id === showCourtVisitForm ? 'Cancel Add Visit' : 'Add Court Visit'}
                      </button>

                      {showCourtVisitForm === caseItem.id && (
                        <div style={installmentFormStyles}>
                          <h5 style={{ color: "#c678dd", marginBottom: "1rem" }}>{editingCourtVisitId ? 'Edit Court Visit' : 'Add New Court Visit'}</h5>
                          <div style={inputGroupStyles}> <label style={labelStyles}>Visit Date:</label> <input type="date" value={currentCourtVisitDate} onChange={(e) => setCurrentCourtVisitDate(e.target.value)} required style={inputStyles} /> </div>
                          <div style={inputGroupStyles}> <label style={labelStyles}>Remark (for this visit):</label> <textarea value={currentCourtVisitRemark} onChange={(e) => setCurrentCourtVisitRemark(e.target.value)} style={{ ...inputStyles, minHeight: '60px' }} placeholder="e.g., Filed documents, Case status check, Met with opposing counsel" /> </div>
                          <button onClick={() => handleAddOrUpdateCourtVisit(caseItem)} style={{ ...buttonStyles, backgroundColor: "#a6e22e", fontSize: "0.9em" }}> {editingCourtVisitId ? 'Save Changes' : 'Record Court Visit'} </button>
                          <button onClick={handleCancelCourtVisitForm} style={{ ...buttonStyles, backgroundColor: '#6c757d', fontSize: '0.9em', marginTop: '10px' }}> Cancel </button>
                        </div>
                      )}
                    </>
                  )}

                  {caseItem.balanceRemaining > 0 && (
                    <button onClick={() => alert(`Generate new invoice for remaining balance: ₹${caseItem.balanceRemaining.toLocaleString('en-IN')}`)}
                      style={{ ...buttonStyles, backgroundColor: "#56b6c2", marginTop: "1rem", fontSize: "0.9em" }}>
                      Generate Invoice for Balance
                    </button>
                  )}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

// =======================================================
// Styles (New and Modified)
// =======================================================

const listContainerStyles: React.CSSProperties = {
  backgroundColor: "#282c34",
  padding: "2rem",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  maxWidth: "1200px", // Increased max-width for the main table container
  margin: "2rem auto",
  color: "#abb2bf",
  width: "calc(100% - 4rem)",
};

const filterButtonsContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginBottom: '1.5rem',
  justifyContent: 'center',
};

const filterButtonStyles = (isActive: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  backgroundColor: isActive ? '#61afef' : '#555',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1em',
  fontWeight: isActive ? 'bold' : 'normal',
});

const caseTableStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))', // 7 columns for table headers/cells
  gap: '1px', // Small gap to simulate borders
  backgroundColor: '#444', // Background for simulated borders
  borderRadius: '8px',
  overflow: 'hidden', // Hide overflow for rounded corners
  // Removed borderCollapse, replaced with gap for grid
};

const tableHeaderRowStyles: React.CSSProperties = {
  display: 'contents', // Allows children to be direct grid items
  fontWeight: 'bold',
  backgroundColor: '#4a4f5b',
  color: '#c678dd',
  fontSize: '0.9em',
};

const tableHeaderCellStyles: React.CSSProperties = {
  padding: '12px 10px',
  textAlign: 'left',
  borderBottom: '1px solid #555',
  backgroundColor: '#4a4f5b',
  whiteSpace: 'nowrap', // Prevent text wrap in headers
};

const tableRowStyles: React.CSSProperties = {
  display: 'contents', // Allows children to be direct grid items
  backgroundColor: '#3a3f4b',
  // Removed borderBottom here, as caseDetailsCard will handle bottom separation
};

const tableCellStyles: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #444', // Still apply cell border
  backgroundColor: '#3a3f4b',
  wordBreak: 'break-word',
  fontSize: '0.9em',
  display: 'flex',
  alignItems: 'center',
};

const caseDetailsCardStyles: React.CSSProperties = {
  gridColumn: '1 / -1', // Span across all columns of the grid
  backgroundColor: "#3a3f4b", // Same as table row for continuity
  padding: "1.5rem",
  borderTop: '1px solid #555', // Visual separation from the row above
  marginBottom: "1.5rem", // Space after the detailed section
  borderRadius: "0 0 8px 8px", // Round bottom corners for the entire group
  border: "1px solid #444",
  borderTop: 'none', // Remove top border if it's supposed to be continuous with the row
  boxSizing: 'border-box',
};


const emptyListStyles: React.CSSProperties = {
  backgroundColor: "#282c34",
  padding: "1.5rem",
  borderRadius: "8px",
  textAlign: "center",
  color: "#abb2bf",
  maxWidth: "600px",
  margin: "2rem auto",
};

const sortControlsStyles: React.CSSProperties = {
  marginBottom: "1rem",
  display: "flex",
  gap: "10px",
  alignItems: "center",
  justifyContent: 'center',
};

const sortButtonStyles: React.CSSProperties = {
  padding: "8px 15px",
  backgroundColor: "#555",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "0.9em",
};

const installmentListStyles: React.CSSProperties = {
  listStyleType: "none",
  padding: "0",
  marginTop: "10px",
};

const installmentItemStyles: React.CSSProperties = {
  backgroundColor: "#444957",
  padding: "8px 12px",
  marginBottom: "5px",
  borderRadius: "4px",
  fontSize: "0.9em",
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '10px',
};

const installmentFormStyles: React.CSSProperties = {
  marginTop: "1.5rem",
  padding: "1rem",
  backgroundColor: "#444",
  borderRadius: "8px",
  border: "1px dashed #61afef",
};

const inputGroupStyles: React.CSSProperties = {
  marginBottom: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const labelStyles: React.CSSProperties = {
  fontWeight: "bold",
  color: "#61afef",
  fontSize: "0.9em",
};

const inputStyles: React.CSSProperties = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #555",
  backgroundColor: "#3a3f4b",
  color: "#abb2bf",
  fontSize: "0.9em",
};

const selectStyles: React.CSSProperties = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #555",
  backgroundColor: "#3a3f4b",
  color: "#abb2bf",
  fontSize: "0.9em",
  cursor: "pointer",
};

const buttonStyles: React.CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "#98c379",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "1em",
};

const smallButtonStyles: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: '3px',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: '0.8em',
};