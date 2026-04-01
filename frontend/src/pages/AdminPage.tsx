import { useState } from "react";
import { Upload, FolderArchive } from "lucide-react";
import { AdminUploadForm } from "../components/admin/AdminUploadForm";
import { BulkImportPanel } from "../components/admin/BulkImportPanel";
import { cn } from "../lib/utils";

type Tab = "single" | "bulk";

export function AdminPage() {
  const [tab, setTab] = useState<Tab>("single");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => setRefreshKey((k) => k + 1);

  return (
    <div className="mx-auto max-w-screen-md px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Add cards to the database individually or in bulk.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setTab("single")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "single" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="h-4 w-4" /> Upload Single Card
        </button>
        <button
          onClick={() => setTab("bulk")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "bulk" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FolderArchive className="h-4 w-4" /> Bulk Import
        </button>
      </div>

      {tab === "single" && <AdminUploadForm key={refreshKey} onSuccess={handleSuccess} />}
      {tab === "bulk" && <BulkImportPanel onSuccess={handleSuccess} />}
    </div>
  );
}
