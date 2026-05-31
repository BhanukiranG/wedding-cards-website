"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useWeddingStore } from "@/lib/store";
import { FileUp, FileDown, UploadCloud, Download, CheckSquare } from "lucide-react";
import { guestSchema } from "@/lib/validation";

export default function Exchange() {
  const { guests, addGuest } = useWeddingStore();
  const [importMsg, setImportMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  const triggerInput = () => {
    const el = document.getElementById("file-input-exchange");
    if (el) el.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        let newCount = 0;
        let failCount = 0;

        for (const row of rows) {
          const name = row.Name || row["Guest Name"];
          const phone = String(row.Mobile || row.Phone || row["Phone Number"] || "");
          const village = row.Village || row.Area || row["Village / Area"] || "General";
          const city = row.City || row.Town || "Hyderabad";
          const address = row.Address || row["Full Address"] || "Andhra Pradesh";
          const pincode = String(row.Pincode || row["Pin Code"] || "500001");
          const notes = row.Notes || "";

          // Run Zod validation schema checks
          const parseResult = guestSchema.safeParse({
            name,
            phone,
            address,
            village,
            city,
            pincode,
            status: "Pending",
            notes,
            latitude: 16.5062 + (Math.random() - 0.5) * 0.1,
            longitude: 80.6480 + (Math.random() - 0.5) * 0.1
          });

          if (parseResult.success) {
            // Check duplicates locally first
            const exists = guests.find(g => g.phone === phone);
            if (!exists) {
              await addGuest(parseResult.data as any);
              newCount++;
            }
          } else {
            failCount++;
          }
        }

        if (newCount > 0) {
          setImportMsg(`✓ Successfully imported ${newCount} guests! (${failCount} rows failed validation)`);
          setIsSuccess(true);
        } else {
          setImportMsg(`No new unique guests logged. (${failCount} rows failed validations)`);
          setIsSuccess(false);
        }

      } catch (err) {
        setImportMsg("Error parsing spreadsheet file. Please check column headings.");
        setIsSuccess(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = (statusFilter: string) => {
    const exportData = guests
      .filter(g => statusFilter === "ALL" || g.status === statusFilter)
      .map(g => ({
        "Guest Name": g.name,
        "Phone Number": g.phone,
        "Village / Area": g.village,
        "City": g.city,
        "State": g.state,
        "Pincode": g.pincode,
        "Full Address": g.address,
        "Invitation Status": g.status,
        "Notes": g.notes || ""
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
      
      {/* Import */}
      <div className="bg-cream-light border border-gold-foil/30 p-6 rounded-lg shadow-md flex flex-col justify-between h-[300px]">
        <div>
          <div className="flex items-center space-x-2 text-maroon-dark border-b border-gold-dark/20 pb-2 mb-4">
            <FileUp className="w-5 h-5 text-gold-dark" />
            <h4 className="font-cinzel text-xs font-semibold tracking-wider">Import Guest List (Excel/CSV)</h4>
          </div>
          <p className="text-xs text-gray-600 mb-4">
            Import guests in bulk. File headers must contain: 
            <code className="bg-cream px-1 py-0.5 rounded font-mono text-[10px] text-maroon">Guest Name, Mobile, Village, City, Full Address, Pincode</code>.
          </p>
          <div 
            onClick={triggerInput}
            className="border-2 border-dashed border-gold-dark/30 rounded-lg p-6 bg-cream/20 flex flex-col items-center justify-center cursor-pointer hover:bg-cream/40 transition-colors"
          >
            <UploadCloud className="w-8 h-8 text-gold-dark mb-2" />
            <span className="text-xs font-semibold text-maroon">Select Excel Spreadsheet (.xlsx)</span>
            <input 
              type="file" 
              id="file-input-exchange" 
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

      {/* Export */}
      <div className="bg-cream-light border border-gold-foil/30 p-6 rounded-lg shadow-md flex flex-col justify-between h-[300px]">
        <div>
          <div className="flex items-center space-x-2 text-maroon-dark border-b border-gold-dark/20 pb-2 mb-4">
            <FileDown className="w-5 h-5 text-gold-dark" />
            <h4 className="font-cinzel text-xs font-semibold tracking-wider">Export Guest Registry</h4>
          </div>
          <p className="text-xs text-gray-600 mb-6">
            Download your database of guests, states, pincodes, and status fields as a formatted spreadsheet file.
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
