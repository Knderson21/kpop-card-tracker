import { useState, useRef, useEffect } from "react";
import { Upload, Plus, X, Loader2, ImageIcon, Crop } from "lucide-react";
import type { Tag, TagType } from "../../types";
import { createCard } from "../../api/cards";
import { getTags, getTagTypes, createTag, createTagType } from "../../api/tags";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ImageCropModal } from "./ImageCropModal";
import { cn } from "../../lib/utils";

interface AdminUploadFormProps {
  onSuccess: () => void;
}

export function AdminUploadForm({ onSuccess }: AdminUploadFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Pending = raw file selected, waiting for crop; null = no file chosen
  const [pendingCropSrc, setPendingCropSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagTypes, setTagTypes] = useState<TagType[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagTypeId, setNewTagTypeId] = useState<number | "">("");
  const [newTagTypeName, setNewTagTypeName] = useState("");
  const [tagError, setTagError] = useState("");
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([getTags(), getTagTypes()]).then(([t, tt]) => { setTags(t); setTagTypes(tt); });
  }, []);

  const openCropFor = (file: File) => {
    const url = URL.createObjectURL(file);
    setPendingFileName(file.name);
    setPendingCropSrc(url);
    // Reset file input so re-selecting the same file triggers onChange again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    openCropFor(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) openCropFor(file);
  };

  const handleCropConfirm = (croppedFile: File) => {
    // Revoke the temp object URL for the uncropped source
    if (pendingCropSrc) URL.revokeObjectURL(pendingCropSrc);
    setPendingCropSrc(null);
    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
  };

  const handleCropCancel = () => {
    if (pendingCropSrc) URL.revokeObjectURL(pendingCropSrc);
    setPendingCropSrc(null);
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      next.has(tagId) ? next.delete(tagId) : next.add(tagId);
      return next;
    });
  };

  const handleAddTag = async () => {
    const typeId = showNewTypeInput ? null : (newTagTypeId === "" ? null : Number(newTagTypeId));
    if (!newTagName.trim()) { setTagError("Tag name is required."); return; }
    if (showNewTypeInput && !newTagTypeName.trim()) { setTagError("Tag type name is required."); return; }
    if (!showNewTypeInput && typeId === null) { setTagError("Select a tag type."); return; }
    setTagError("");
    try {
      let finalTypeId = typeId!;
      if (showNewTypeInput) {
        const newType = await createTagType(newTagTypeName.trim());
        setTagTypes((prev) => [...prev, newType]);
        finalTypeId = newType.id;
        setNewTagTypeName("");
        setShowNewTypeInput(false);
      }
      const tag = await createTag(newTagName.trim(), finalTypeId);
      setTags((prev) => [...prev, tag]);
      setSelectedTagIds((prev) => new Set([...prev, tag.id]));
      setNewTagName("");
      setNewTagTypeId("");
    } catch (e: unknown) {
      setTagError(e instanceof Error ? e.message : "Error creating tag.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) { setError("Please select an image."); return; }
    setError("");
    setSuccess(false);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("image", imageFile);
    if (cardNumber) formData.append("officialCardNumber", cardNumber);
    if (notes) formData.append("notes", notes);
    if (selectedTagIds.size > 0) formData.append("tagIds", [...selectedTagIds].join(","));

    try {
      await createCard(formData);
      setSuccess(true);
      handleRemoveImage();
      setCardNumber("");
      setNotes("");
      setSelectedTagIds(new Set());
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const tagsByType = tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    if (!acc[tag.tagTypeName]) acc[tag.tagTypeName] = [];
    acc[tag.tagTypeName].push(tag);
    return acc;
  }, {});

  return (
    <>
      {/* Crop modal — shown immediately after file selection */}
      {pendingCropSrc && (
        <ImageCropModal
          imageSrc={pendingCropSrc}
          originalFileName={pendingFileName}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center py-8 gap-2"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-h-48 rounded object-contain" />
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag & drop or click to upload image</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </div>

        {imagePreview && (
          <div className="flex gap-3">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={handleRemoveImage}
            >
              <X className="h-3 w-3" /> Remove image
            </button>
            <button
              type="button"
              className="text-xs text-primary hover:underline flex items-center gap-1"
              onClick={() => imageFile && openCropFor(imageFile)}
            >
              <Crop className="h-3 w-3" /> Re-crop
            </button>
          </div>
        )}

        {/* Card metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Official Card Number</label>
            <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="e.g. PC-01" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
          </div>
        </div>

        {/* Tag selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Tags</label>
          <div className="border rounded-md p-3 space-y-2 max-h-52 overflow-y-auto">
            {Object.keys(tagsByType).length === 0 && (
              <p className="text-xs text-muted-foreground">No tags yet. Create one below.</p>
            )}
            {Object.entries(tagsByType).map(([typeName, typeTags]) => (
              <div key={typeName}>
                <p className="text-xs text-muted-foreground mb-1">{typeName}</p>
                <div className="flex flex-wrap gap-1">
                  {typeTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs border transition-colors",
                        selectedTagIds.has(tag.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary"
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add new tag */}
        <div className="space-y-1.5 border rounded-md p-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground">Add new tag</p>
          <div className="flex flex-wrap gap-1.5 items-start">
            {showNewTypeInput ? (
              <>
                <Input className="h-8 text-xs w-36" value={newTagTypeName} onChange={(e) => setNewTagTypeName(e.target.value)} placeholder="New type name" />
                <button type="button" onClick={() => setShowNewTypeInput(false)} className="text-xs text-muted-foreground hover:text-foreground h-8 px-1">cancel</button>
              </>
            ) : (
              <>
                <select
                  value={newTagTypeId}
                  onChange={(e) => setNewTagTypeId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">Select type…</option>
                  {tagTypes.map((tt) => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
                </select>
                <button type="button" onClick={() => setShowNewTypeInput(true)} className="text-xs text-primary hover:underline flex items-center gap-0.5 h-8">
                  <Plus className="h-3 w-3" /> new type
                </button>
              </>
            )}
            <Input className="h-8 text-xs w-32" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Tag name" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} />
            <Button type="button" size="sm" variant="outline" onClick={handleAddTag}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>
          {tagError && <p className="text-xs text-red-500">{tagError}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600 font-medium">Card added successfully!</p>}

        <Button type="submit" disabled={submitting || !imageFile} className="w-full sm:w-auto">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload Card
        </Button>
      </form>
    </>
  );
}
