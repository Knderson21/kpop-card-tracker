import { useState, useRef } from "react";
import { Upload, FileArchive, FileJson, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { BulkImportResult } from "../../types";
import { bulkImport } from "../../api/cards";
import { Button } from "../ui/button";

interface BulkImportPanelProps {
  onSuccess: () => void;
}

export function BulkImportPanel({ onSuccess }: BulkImportPanelProps) {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [manifestFile, setManifestFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<BulkImportResult[] | null>(null);
  const [error, setError] = useState("");
  const zipRef = useRef<HTMLInputElement>(null);
  const manifestRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipFile || !manifestFile) { setError("Both zip and manifest files are required."); return; }
    setError("");
    setResults(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("images", zipFile);
    formData.append("manifest", manifestFile);

    try {
      const res = await bulkImport(formData);
      setResults(res);
      const anySuccess = res.some((r) => r.success);
      if (anySuccess) onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ZIP file */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors"
          onClick={() => zipRef.current?.click()}
        >
          <FileArchive className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">{zipFile ? zipFile.name : "Images (.zip)"}</p>
          <p className="text-xs text-muted-foreground">Click to select zip file</p>
          <input ref={zipRef} type="file" accept=".zip" className="hidden" onChange={(e) => setZipFile(e.target.files?.[0] ?? null)} />
        </div>

        {/* Manifest JSON */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors"
          onClick={() => manifestRef.current?.click()}
        >
          <FileJson className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">{manifestFile ? manifestFile.name : "Manifest (.json)"}</p>
          <p className="text-xs text-muted-foreground">Click to select JSON manifest</p>
          <input ref={manifestRef} type="file" accept=".json" className="hidden" onChange={(e) => setManifestFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>

      {/* Manifest format reference */}
      <details className="text-xs text-muted-foreground border rounded-md p-3 bg-muted/30">
        <summary className="cursor-pointer font-medium hover:text-foreground">Manifest format reference</summary>
        <pre className="mt-2 overflow-x-auto text-xs leading-relaxed">{`[
  {
    "imageFileName": "bts_jk_01.jpg",
    "officialCardNumber": "PC-01",
    "notes": "Holo version",
    "tags": [
      { "tagType": "Group", "name": "BTS" },
      { "tagType": "Member", "name": "Jungkook" },
      { "tagType": "Album", "name": "Map of the Soul: 7" },
      { "tagType": "Year", "name": "2020" }
    ]
  }
]`}</pre>
      </details>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={submitting || !zipFile || !manifestFile} className="w-full sm:w-auto">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
        Import Cards
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-2">
          <div className="flex gap-3 text-sm font-medium">
            {successCount > 0 && <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" />{successCount} imported</span>}
            {failCount > 0 && <span className="text-red-500 flex items-center gap-1"><XCircle className="h-4 w-4" />{failCount} failed</span>}
          </div>
          {failCount > 0 && (
            <div className="border rounded-md divide-y text-xs max-h-40 overflow-y-auto">
              {results.filter((r) => !r.success).map((r) => (
                <div key={r.imageFileName} className="px-3 py-1.5 flex gap-2">
                  <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span className="font-mono text-muted-foreground">{r.imageFileName}</span>
                  <span className="text-red-500">{r.error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
