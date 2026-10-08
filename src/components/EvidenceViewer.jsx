import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { computeFileHash } from '../utils/hashUtils';
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, X } from 'lucide-react';

function EvidenceList({ photos, emptyText }) {
  if (!photos?.length) return <div className="text-center py-6 text-slate-500 text-xs">{emptyText}</div>;
  return (
    <div className="space-y-3">
      {photos.map((photo, index) => (
        <div key={`${photo.hash}-${index}`} className="flex gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 items-center">
          <img src={photo.url} alt={photo.name} className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-700" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{photo.name}</p>
            <p className="text-[10px] text-slate-500 font-mono truncate">{photo.hash}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EvidenceViewer({ agreement }) {
  const { confirmMoveIn, confirmMoveOut, transactionState, accountRole } = useWeb3();
  const [stage, setStage] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => () => photos.forEach(photo => URL.revokeObjectURL(photo.url)), [photos]);

  const handleFiles = async event => {
    setError('');
    const files = [...event.target.files];
    if (!files.length) return;
    try {
      const selected = await Promise.all(files.map(async file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        hash: await computeFileHash(file),
        url: URL.createObjectURL(file)
      })));
      setPhotos(previous => [...previous, ...selected]);
    } catch {
      setError('Unable to read one or more image files.');
    }
    event.target.value = '';
  };

  const submit = async () => {
    if (!stage) return;
    if (!photos.length) {
      setError('Select at least one image before submitting evidence.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (stage === 'moveIn') await confirmMoveIn(agreement.id, photos, notes);
      else await confirmMoveOut(agreement.id, photos, notes);
      setStage(null);
      setPhotos([]);
      setNotes('');
    } catch (err) {
      setError(err.message || 'Evidence transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderEvidence = (title, hash, storedPhotos, color, emptyText) => (
    <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold ${color === 'emerald' ? 'text-emerald-400' : 'text-purple-400'} uppercase tracking-wider flex items-center gap-1.5`}>
          <CheckCircle2 className="w-4 h-4" /> {title}
        </span>
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${hash
          ? color === 'emerald'
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
          : 'bg-slate-700 text-slate-400'}`}>
          {hash ? 'Hash confirmed on-chain' : 'Pending submission'}
        </span>
      </div>
      {hash && <div className="mb-4 p-2.5 bg-slate-900 rounded-xl border border-slate-700/60 font-mono text-[10px] text-slate-300 break-all"><span className="text-slate-500 block uppercase font-sans font-semibold mb-0.5">SHA-256 evidence hash</span>{hash}</div>}
      <EvidenceList photos={storedPhotos} emptyText={emptyText} />
      {!hash && (accountRole === 'landlord' || accountRole === 'tenant') && ((title.startsWith('Move-In') && agreement.status === 1) || (title.startsWith('Move-Out') && agreement.status === 2)) && (
        <button onClick={() => { setStage(title.startsWith('Move-In') ? 'moveIn' : 'moveOut'); setError(''); }} className="w-full mt-4 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" /> Upload {title.startsWith('Move-In') ? 'Move-In' : 'Move-Out'} Photos
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20"><ShieldCheck className="w-5 h-5" /></div>
        <div><h4 className="text-base font-bold text-white">Move-In / Move-Out Evidence</h4><p className="text-xs text-slate-400">Images remain available in this browser session; only the SHA-256 evidence hash is stored on Sepolia.</p></div>
      </div>
      {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
      {stage && (
        <div className="p-4 rounded-2xl bg-slate-800 border border-purple-500/30 space-y-3">
          <div className="flex justify-between items-center"><h5 className="text-sm font-bold text-white">Prepare {stage === 'moveIn' ? 'move-in' : 'move-out'} evidence</h5><button onClick={() => setStage(null)}><X className="w-4 h-4 text-slate-400" /></button></div>
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-500 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{photos.map(photo => <img key={photo.hash} src={photo.url} alt={photo.name} className="w-full h-20 object-cover rounded-lg" />)}</div>
          <textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Inspection notes (optional)" rows="2" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
          <button onClick={submit} disabled={loading || transactionState.status === 'pending'} className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">{loading ? 'Hashing and waiting for confirmation...' : 'Hash Evidence & Sign on Sepolia'}</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderEvidence('Move-In Condition Record', agreement.moveInEvidenceHash, agreement.moveInPhotos, 'emerald', 'No move-in evidence submitted in this browser session.')}
        {renderEvidence('Move-Out Condition Record', agreement.moveOutEvidenceHash, agreement.moveOutPhotos, 'purple', 'No move-out evidence submitted in this browser session.')}
      </div>
      <p className="text-[11px] text-slate-500">Persistent photo storage through IPFS or another external storage provider is a future enhancement.</p>
    </div>
  );
}
