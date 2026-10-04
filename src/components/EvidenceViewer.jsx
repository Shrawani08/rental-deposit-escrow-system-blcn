import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { computeFileHash, shortenHash } from '../utils/hashUtils';
import { ShieldCheck, Upload, FileText, Camera, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EvidenceViewer({ agreement, mode = 'view' }) {
  const { confirmMoveIn, confirmMoveOut } = useWeb3();
  const [photoName, setPhotoName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoNote, setPhotoNote] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pre-fill sample photos for fast demo submission
  const handleAddSamplePhoto = () => {
    const samples = [
      { name: "Living Room Wall Inspection", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop", note: "Inspect wall coating and plaster condition" },
      { name: "Kitchen Plumbing", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop", note: "Under-sink drainage check" },
      { name: "Main Entry Flooring", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop", note: "Tile finish inspection" }
    ];
    const picked = samples[uploadedPhotos.length % samples.length];
    setUploadedPhotos([...uploadedPhotos, picked]);
  };

  const handleCustomUpload = (e) => {
    e.preventDefault();
    if (!photoName || !photoUrl) return;
    setUploadedPhotos([...uploadedPhotos, { name: photoName, url: photoUrl, note: photoNote }]);
    setPhotoName('');
    setPhotoUrl('');
    setPhotoNote('');
  };

  const handleSubmitEvidence = async (stage) => {
    if (uploadedPhotos.length === 0) {
      alert("Please add at least 1 photo evidence item.");
      return;
    }
    setLoading(true);
    try {
      if (stage === 'moveIn') {
        await confirmMoveIn(agreement.id, uploadedPhotos, "Move-in physical condition verified");
      } else {
        await confirmMoveOut(agreement.id, uploadedPhotos, "Move-out inspection logged");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Immutable Move-In / Move-Out Evidence Ledger</h4>
            <p className="text-xs text-slate-400">Photos stored off-chain; SHA-256 cryptographic hashes pinned on-chain</p>
          </div>
        </div>
      </div>

      {/* Side by Side Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* MOVE-IN SECTION */}
        <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Move-In Condition Record
            </span>
            {agreement.moveInEvidenceHash ? (
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Verified On-Chain
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-700 text-slate-400">
                Pending Submission
              </span>
            )}
          </div>

          {agreement.moveInEvidenceHash && (
            <div className="mb-4 p-2.5 bg-slate-900 rounded-xl border border-slate-700/60 font-mono text-[11px] text-slate-300 break-all">
              <span className="text-slate-500 text-[10px] block uppercase font-sans font-semibold mb-0.5">SHA-256 Hash:</span>
              {agreement.moveInEvidenceHash}
            </div>
          )}

          {agreement.moveInPhotos && agreement.moveInPhotos.length > 0 ? (
            <div className="space-y-3">
              {agreement.moveInPhotos.map((img, i) => (
                <div key={i} className="flex gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 items-center">
                  <img src={img.url} alt={img.name} className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-700" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{img.name}</p>
                    <p className="text-[11px] text-slate-400">{img.note || "No specific note"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              No Move-In evidence submitted yet.
            </div>
          )}

          {/* If Move-In evidence needs to be uploaded */}
          {!agreement.moveInEvidenceHash && agreement.status === 1 && (
            <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-3">
              <button
                onClick={handleAddSamplePhoto}
                className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" /> + Quick Add Sample Inspection Photo
              </button>

              {uploadedPhotos.length > 0 && (
                <div className="text-xs text-emerald-400 font-semibold text-center">
                  {uploadedPhotos.length} item(s) staged for Move-In Hash calculation
                </div>
              )}

              <button
                onClick={() => handleSubmitEvidence('moveIn')}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
              >
                {loading ? "Generating SHA-256 & Signing..." : "Confirm Move-In & Hash on Smart Contract"}
              </button>
            </div>
          )}
        </div>

        {/* MOVE-OUT SECTION */}
        <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Move-Out Condition Record
            </span>
            {agreement.moveOutEvidenceHash ? (
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Verified On-Chain
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-700 text-slate-400">
                Pending Inspection
              </span>
            )}
          </div>

          {agreement.moveOutEvidenceHash && (
            <div className="mb-4 p-2.5 bg-slate-900 rounded-xl border border-slate-700/60 font-mono text-[11px] text-slate-300 break-all">
              <span className="text-slate-500 text-[10px] block uppercase font-sans font-semibold mb-0.5">SHA-256 Hash:</span>
              {agreement.moveOutEvidenceHash}
            </div>
          )}

          {agreement.moveOutPhotos && agreement.moveOutPhotos.length > 0 ? (
            <div className="space-y-3">
              {agreement.moveOutPhotos.map((img, i) => (
                <div key={i} className="flex gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 items-center">
                  <img src={img.url} alt={img.name} className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-700" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{img.name}</p>
                    <p className="text-[11px] text-slate-400">{img.note || "No specific note"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              No Move-Out evidence submitted yet.
            </div>
          )}

          {/* Move Out Upload Trigger */}
          {!agreement.moveOutEvidenceHash && agreement.status === 2 && (
            <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-3">
              <button
                onClick={handleAddSamplePhoto}
                className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" /> + Quick Add Move-Out Inspection Photo
              </button>

              {uploadedPhotos.length > 0 && (
                <div className="text-xs text-purple-400 font-semibold text-center">
                  {uploadedPhotos.length} item(s) staged for Move-Out Hash calculation
                </div>
              )}

              <button
                onClick={() => handleSubmitEvidence('moveOut')}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition"
              >
                {loading ? "Generating SHA-256 & Signing..." : "Submit Move-Out Inspection & Record Hash"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
