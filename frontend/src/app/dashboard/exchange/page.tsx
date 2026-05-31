"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { FileUp, FileDown, UploadCloud, Download, CheckSquare } from "lucide-react";

interface Guest {
  id: number;
  name: string;
  mobile: string;
  familyMembers: number;
  village: string;
  city: string;
  state: string;
  status: string;
  fullAddress: string;
  latitude: number | null;
  longitude: number | null;
  assignedTo: string | null;
  distributedDate: string | null;
  distributedTime: string | null;
  remarks: string;
  notes: string;
}

export default function Exchange() {
  const [importMsg, setImportMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  const triggerInput = () => {
    const input = document.getElementById("file-input-el");
    if (input) input.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        const savedGuests = localStorage.getItem("wedding_guests");
        const existingGuests: Guest[] = savedGuests ? JSON.parse(savedGuests) : [];

        let newCount = 0;
        const updated = [...existingGuests];

        rows.forEach(row => {
          const name = row.Name || row["Guest Name"] || row.GuestName;
          const mobile = row.Mobile || row["Mobile Number"] || row.Phone;
          const family = parseInt(row.FamilyCount || row.Family || row["Family Members Count"]) || 1;
          const village = row.Village || row.Area || row["Village / Area"] || "General";
          const city = row.City || row.Town || "Hyderabad";
          const address = row.Address || row["Full Address"] || "Andhra Pradesh";
          const notes = row.Notes || row.SpecialNotes || "";

          if (name && mobile) {
            const exists = existingGuests.find(g => g.mobile === String(mobile));
            if (!exists) {
              updated.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: String(name),
                mobile: String(mobile),
                familyMembers: family,
                village: String(village),
                city: String(city),
                state: row.State || "Andhra Pradesh",
                status: "Pending",
                fullAddress: String(address),
                latitude: 16.5062 + (Math.random() - 0.5) * 0.1,
                longitude: 80.6480 + (Math.random() - 0.5) * 0.1,
                notes: String(notes),
                assignedTo: null,
                distributedDate: null,
                distributedTime: null,
                remarks: ""
              });
              newCount++;
            }
          }
        });

        if (newCount > 0) {
          localStorage.setItem("wedding_guests", JSON.stringify(updated));
          setImportMsg(`✓ Successfully imported ${newCount} new guests to registry!`);
          setIsSuccess(true);
        } else {
          setImportMsg("No new unique guest records found (matched by mobile).");
          setIsSuccess(false);
        }
      } catch (err) {
        setImportMsg("Error parsing file. Ensure structure is valid.");
        setIsSuccess(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = (statusFilter: string) => {
    const savedGuests = localStorage.getItem("wedding_guests");
    const list: Guest[] = savedGuests ? JSON.parse(savedGuests) : [];

    const exportData = list
      .filter(g => statusFilter === "ALL" || g.status === statusFilter)
      .map(g => ({
        "Guest Name": g.name,
        "Mobile Number": g.mobile,
        "Family Members": g.familyMembers,
        "Village / Area": g.village,
        "City": g.city,
        "Full Address": g.fullAddress,
        "Invitation Status": g.status,
        "Assigned Distributor": g.assignedTo || "Unassigned",
        "Delivery Date": g.distributedDate || "",
        "Delivery Time": g.distributedTime || "",
        "Remarks / Delivery Notes": g.remarks || "",
        "Special Notes": g.notes || ""
      }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Wedding Guests");

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `Wedding_Guests_${statusFilter === "ALL" ? "Registry" : "Distributed"}_${dateStr}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Import Card */}
      <div className="bg-cream-light border border-gold-foil/30 p-6 rounded-lg shadow-md flex flex-col justify-between h-[300px]">
        <div>
          <div className="flex items-center space-x-2 text-maroon-dark border-b border-gold-dark/20 pb-2 mb-4">
            <FileUp className="w-5 h-5 text-gold-dark" />
            <h4 className="font-cinzel text-xs font-semibold tracking-wider">Import Guest List (Excel/CSV)</h4>
          </div>
          <p className="text-xs text-gray-600 mb-4">
            Import guest records in bulk from an Excel Spreadsheet or CSV. The file must contain headers: 
            <code className="bg-cream px-1 py-0.5 rounded font-mono text-[10px] text-maroon">Name, Mobile, FamilyCount, Village, City, Address</code>.
          </p>
          <div 
            onClick={triggerInput}
            className="border-2 border-dashed border-gold-dark/30 rounded-lg p-6 bg-cream/20 flex flex-col items-center justify-center cursor-pointer hover:bg-cream/40 transition-colors"
          >
            <UploadCloud className="w-8 h-8 text-gold-dark mb-2 animate-bounce" />
            <span className="text-xs font-semibold text-maroon">Select Excel Spreadsheet (.xlsx, .xls)</span>
            <input 
              type="file" 
              id="file-input-el" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              onChange={handleImport}
            />
          </div>
        </div>
        {importMsg && (
          <div className={`text-xs font-semibold text-center italic ${isSuccess ? "text-emerald-600" : "text-amber-600"}`}>
            {importMsg}
          </div>
        )}
      </div>

      {/* Export Card */}
      <div className="bg-cream-light border border-gold-foil/30 p-6 rounded-lg shadow-md flex flex-col justify-between h-[300px]">
        <div>
          <div className="flex items-center space-x-2 text-maroon-dark border-b border-gold-dark/20 pb-2 mb-4">
            <FileDown className="w-5 h-5 text-gold-dark" />
            <h4 className="font-cinzel text-xs font-semibold tracking-wider">Export Guest Registry</h4>
          </div>
          <p className="text-xs text-gray-600 mb-6">
            Download the complete live registry of guests, coordinate delivery status, remarks, and maps coordinates in a fully formatted Excel file.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => handleExport("ALL")}
              className="w-full btn-gold py-2.5 rounded text-xs font-cinzel tracking-wider uppercase flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Entire Guest List</span>
            </button>
            <button 
              onClick={() => handleExport("Distributed")}
              className="w-full border border-gold-dark/60 text-maroon-dark py-2.5 rounded text-xs font-cinzel tracking-wider uppercase hover:bg-cream-dark/20 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Export Distributed Only</span>
            </button>
          </div>
        </div>
        <div className="text-[9px] text-gray-500 text-center">
          Powered by SheetJS • Compatible with Excel, Google Sheets, and Numbers.
        </div>
      </div>

    </div>
  );
}
