import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import escrowArtifact from '../artifacts/contracts/RentalEscrow.sol/RentalEscrow.json';
import { computeStringHash } from '../utils/hashUtils';

const Web3Context = createContext(null);
const SEPOLIA_CHAIN_ID = 11155111;
const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS;
const ESCROW_DEPLOYMENT_BLOCK = Number(import.meta.env.VITE_ESCROW_DEPLOYMENT_BLOCK);
const MAX_LOG_BLOCK_RANGE = 9999;

const emptyWallet = { address: '', chainId: null };

function normalizeAgreement(raw, sessionEvidence) {
  return {
    id: Number(raw.id),
    propertyAddress: raw.propertyAddress,
    landlord: raw.landlord,
    tenant: raw.tenant,
    arbitrator: raw.arbitrator,
    depositAmount: ethers.formatEther(raw.depositAmount),
    monthlyRent: ethers.formatEther(raw.monthlyRent),
    startDate: Number(raw.startDate),
    durationDays: Number(raw.durationDays),
    status: Number(raw.status),
    moveInEvidenceHash: raw.moveInEvidenceHash,
    moveOutEvidenceHash: raw.moveOutEvidenceHash,
    moveInPhotos: sessionEvidence?.moveInPhotos || [],
    moveOutPhotos: sessionEvidence?.moveOutPhotos || [],
    claimAmount: ethers.formatEther(raw.claimAmount),
    claimReason: raw.claimReason,
    claimEvidenceHash: raw.claimEvidenceHash,
    counterAmount: ethers.formatEther(raw.counterAmount),
    counterReason: raw.counterReason,
    tenantPayout: ethers.formatEther(raw.tenantPayout),
    landlordPayout: ethers.formatEther(raw.landlordPayout),
    createdAt: Number(raw.createdAt)
  };
}

export function Web3Provider({ children }) {
  const [walletState, setWalletState] = useState(emptyWallet);
  const [agreements, setAgreements] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [sessionEvidence, setSessionEvidence] = useState({});
  const [appState, setAppState] = useState({
    status: typeof window === 'undefined' || !window.ethereum ? 'metamask-unavailable' : 'wallet-disconnected',
    message: ''
  });
  const [transactionState, setTransactionState] = useState({ status: 'idle', hash: '', message: '' });
  const [defaultArbitrator, setDefaultArbitrator] = useState('');

  const contractConfigured = Boolean(
    ESCROW_ADDRESS
    && ethers.isAddress(ESCROW_ADDRESS)
    && ESCROW_ADDRESS.toLowerCase() !== ethers.ZeroAddress.toLowerCase()
  );

  const getProvider = useCallback(() => {
    if (!window.ethereum) throw new Error('MetaMask is not installed.');
    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  const getContract = useCallback(async (write = false) => {
    if (!contractConfigured) throw new Error('The Sepolia contract address is not configured.');
    const provider = getProvider();
    if (write) return new ethers.Contract(ESCROW_ADDRESS, escrowArtifact.abi, await provider.getSigner());
    return new ethers.Contract(ESCROW_ADDRESS, escrowArtifact.abi, provider);
  }, [contractConfigured, getProvider]);

  const addLog = useCallback((type, title, details, txHash) => {
    if (!txHash) return;
    setEventLogs(previous => [{
      id: `${txHash}-${title}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      title,
      details,
      txHash
    }, ...previous]);
  }, []);

  const refreshAgreement = useCallback(async (id) => {
    const contract = await getContract();
    const raw = await contract.getAgreement(id);
    const normalized = normalizeAgreement(raw, sessionEvidence[id]);
    setAgreements(previous => {
      const found = previous.some(agreement => agreement.id === normalized.id);
      return found
        ? previous.map(agreement => agreement.id === normalized.id ? normalized : agreement)
        : [...previous, normalized].sort((a, b) => a.id - b.id);
    });
    return normalized;
  }, [getContract, sessionEvidence]);

  const loadAgreements = useCallback(async () => {
    const contract = await getContract();
    const provider = contract.runner.provider;
    const latestBlock = await provider.getBlockNumber();
    const configuredStartBlock = Number.isInteger(ESCROW_DEPLOYMENT_BLOCK)
      && ESCROW_DEPLOYMENT_BLOCK >= 0
      ? ESCROW_DEPLOYMENT_BLOCK
      : Math.max(0, latestBlock - MAX_LOG_BLOCK_RANGE);
    const fromBlock = Math.min(configuredStartBlock, latestBlock);
    const toBlock = Math.min(latestBlock, fromBlock + MAX_LOG_BLOCK_RANGE);
    const events = await contract.queryFilter(
      contract.filters.AgreementCreated(),
      fromBlock,
      toBlock
    );
    const ids = [...new Set(events.map(event => Number(event.args.agreementId)))];
    const loaded = await Promise.all(ids.map(async id => normalizeAgreement(
      await contract.getAgreement(id),
      sessionEvidence[id]
    )));
    setAgreements(loaded.sort((a, b) => a.id - b.id));
    setDefaultArbitrator(await contract.defaultArbitrator());
  }, [getContract, sessionEvidence]);

  const refreshConnection = useCallback(async () => {
    if (!window.ethereum) {
      setAppState({ status: 'metamask-unavailable', message: 'Install MetaMask to use RentSecure.' });
      return;
    }
    if (!contractConfigured) {
      setAppState({ status: 'contract-unavailable', message: 'Configure VITE_ESCROW_CONTRACT_ADDRESS with the deployed Sepolia address.' });
      return;
    }

    const provider = getProvider();
    const accounts = await provider.send('eth_accounts', []);
    if (!accounts.length) {
      setWalletState(emptyWallet);
      setAgreements([]);
      setAppState({ status: 'wallet-disconnected', message: 'Connect MetaMask to continue.' });
      return;
    }

    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    setWalletState({ address: accounts[0], chainId });
    if (chainId !== SEPOLIA_CHAIN_ID) {
      setAgreements([]);
      setAppState({ status: 'wrong-network', message: 'Switch MetaMask to Sepolia (chain ID 11155111).' });
      return;
    }

    try {
      await loadAgreements();
      setAppState({ status: 'ready', message: '' });
    } catch (error) {
      setAppState({ status: 'contract-unavailable', message: error.message || 'Unable to read the Sepolia contract.' });
    }
  }, [contractConfigured, getProvider, loadAgreements]);

  useEffect(() => {
    refreshConnection().catch(error => setAppState({ status: 'contract-unavailable', message: error.message }));
    if (!window.ethereum) return undefined;
    const handleAccounts = () => refreshConnection().catch(error => setAppState({ status: 'contract-unavailable', message: error.message }));
    const handleChain = () => refreshConnection().catch(error => setAppState({ status: 'contract-unavailable', message: error.message }));
    window.ethereum.on('accountsChanged', handleAccounts);
    window.ethereum.on('chainChanged', handleChain);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccounts);
      window.ethereum.removeListener('chainChanged', handleChain);
    };
  }, [refreshConnection]);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setAppState({ status: 'metamask-unavailable', message: 'Install MetaMask to use RentSecure.' });
      return;
    }
    try {
      const provider = getProvider();
      await provider.send('eth_requestAccounts', []);
      await refreshConnection();
    } catch (error) {
      setAppState({ status: 'transaction-failed', message: error.message || 'MetaMask connection was rejected.' });
    }
  };

  const requireReady = () => {
    if (appState.status !== 'ready') throw new Error(appState.message || 'Connect MetaMask to Sepolia first.');
  };

  const runTransaction = async (title, action, id) => {
    requireReady();
    setTransactionState({ status: 'pending', hash: '', message: `${title} is waiting for MetaMask confirmation.` });
    try {
      const tx = await action();
      setTransactionState({ status: 'pending', hash: tx.hash, message: `${title} is being confirmed on Sepolia.` });
      await tx.wait();
      if (id !== undefined) await refreshAgreement(id);
      else await loadAgreements();
      addLog('success', `${title} Confirmed`, 'Transaction confirmed on Sepolia.', tx.hash);
      setTransactionState({ status: 'confirmed', hash: tx.hash, message: `${title} confirmed on Sepolia.` });
      return tx.hash;
    } catch (error) {
      const message = error?.shortMessage || error?.reason || error?.message || `${title} failed.`;
      setTransactionState({ status: 'failed', hash: '', message });
      throw new Error(message);
    }
  };

  const rememberEvidence = (agreementId, stage, photos) => {
    setSessionEvidence(previous => ({
      ...previous,
      [agreementId]: {
        ...previous[agreementId],
        [stage === 'moveIn' ? 'moveInPhotos' : 'moveOutPhotos']: photos
      }
    }));
  };

  const createAgreement = async ({ tenantAddress, arbitratorAddress, depositAmount, monthlyRent, durationDays, propertyAddress }) => {
    if (!propertyAddress?.trim()) throw new Error('Property address is required.');
    if (!ethers.isAddress(tenantAddress)) throw new Error('Enter a valid tenant wallet address.');
    if (arbitratorAddress && !ethers.isAddress(arbitratorAddress)) throw new Error('Enter a valid arbitrator wallet address.');
    if (!depositAmount || Number(depositAmount) <= 0) throw new Error('Security deposit must be greater than zero.');
    if (!monthlyRent || Number(monthlyRent) <= 0) throw new Error('Monthly rent must be greater than zero.');
    if (!durationDays || Number(durationDays) < 1) throw new Error('Lease duration must be at least one day.');
    const contract = await getContract(true);
    return runTransaction('Lease creation', () => contract.createAgreement(
      tenantAddress,
      arbitratorAddress || ethers.ZeroAddress,
      ethers.parseEther(String(depositAmount)),
      ethers.parseEther(String(monthlyRent)),
      Number(durationDays),
      propertyAddress.trim()
    ));
  };

  const fundDeposit = async (agreementId) => {
    const agreement = agreements.find(item => item.id === agreementId);
    if (!agreement) throw new Error('Agreement not found on Sepolia.');
    const contract = await getContract(true);
    return runTransaction('Deposit funding', () => contract.fundDeposit(agreementId, {
      value: ethers.parseEther(agreement.depositAmount)
    }), agreementId);
  };

  const confirmEvidence = async (agreementId, photos, notes, stage) => {
    if (!photos?.length) throw new Error('Select at least one image before submitting evidence.');
    const packageData = {
      stage,
      notes: notes || '',
      files: photos.map(photo => ({ name: photo.name, type: photo.type, size: photo.size, hash: photo.hash }))
    };
    const hash = await computeStringHash(JSON.stringify(packageData));
    const contract = await getContract(true);
    const method = stage === 'moveIn' ? 'confirmMoveIn' : 'confirmMoveOut';
    const txHash = await runTransaction(`${stage === 'moveIn' ? 'Move-in' : 'Move-out'} evidence`, () => contract[method](agreementId, hash), agreementId);
    rememberEvidence(agreementId, stage, photos);
    return txHash;
  };

  const submitDamageClaim = async (agreementId, claimAmount, reason, photos = []) => {
    const agreement = agreements.find(item => item.id === agreementId);
    if (!agreement) throw new Error('Agreement not found on Sepolia.');
    const amount = Number(claimAmount);
    if (!Number.isFinite(amount) || amount < 0 || amount > Number(agreement.depositAmount)) {
      throw new Error('Claim amount must be between 0 and the security deposit.');
    }
    if (!reason?.trim()) throw new Error('Please provide a reason for the claim.');
    const hash = await computeStringHash(JSON.stringify({ claimAmount, reason: reason.trim(), photos }));
    const contract = await getContract(true);
    return runTransaction('Damage claim', () => contract.submitDamageClaim(
      agreementId, ethers.parseEther(String(claimAmount)), reason.trim(), hash
    ), agreementId);
  };

  const acceptDamageClaim = async id => runTransaction('Claim acceptance', () => getContract(true).then(contract => contract.acceptDamageClaim(id)), id);

  const rejectDamageClaim = async (id, counterAmount, reason) => {
    const agreement = agreements.find(item => item.id === id);
    if (!agreement || Number(counterAmount) < 0 || Number(counterAmount) >= Number(agreement.claimAmount)) {
      throw new Error('Counter-offer must be lower than the landlord claim.');
    }
    if (!reason?.trim()) throw new Error('Please provide a reason for the counter-offer.');
    return runTransaction('Counter-offer', () => getContract(true).then(contract => contract.rejectClaim(
      id, ethers.parseEther(String(counterAmount)), reason.trim()
    )), id);
  };

  const acceptCounterOffer = async id => runTransaction('Counter-offer acceptance', () => getContract(true).then(contract => contract.acceptCounterOffer(id)), id);

  const resolveDispute = async (id, tenantPayout, landlordPayout) => {
    const agreement = agreements.find(item => item.id === id);
    if (!agreement || Number(tenantPayout) + Number(landlordPayout) !== Number(agreement.depositAmount)) {
      throw new Error('Tenant and landlord payouts must equal the full security deposit.');
    }
    return runTransaction('Dispute resolution', () => getContract(true).then(contract => contract.resolveDispute(
      id, ethers.parseEther(String(tenantPayout)), ethers.parseEther(String(landlordPayout))
    )), id);
  };

  const accountRole = useMemo(() => {
    if (!walletState.address) return 'observer';
    const address = walletState.address.toLowerCase();
    if (agreements.some(agreement => agreement.landlord.toLowerCase() === address)) return 'landlord';
    if (agreements.some(agreement => agreement.tenant.toLowerCase() === address)) return 'tenant';
    if (agreements.some(agreement => agreement.arbitrator.toLowerCase() === address) || defaultArbitrator.toLowerCase() === address) return 'arbitrator';
    return 'observer';
  }, [agreements, defaultArbitrator, walletState.address]);

  const value = {
    agreements,
    eventLogs,
    walletState,
    appState,
    transactionState,
    accountRole,
    userAddress: walletState.address,
    defaultArbitrator,
    contractAddress: ESCROW_ADDRESS,
    liveMode: true,
    connectMetaMask,
    createAgreement,
    fundDeposit,
    confirmMoveIn: (id, photos, notes) => confirmEvidence(id, photos, notes, 'moveIn'),
    confirmMoveOut: (id, photos, notes) => confirmEvidence(id, photos, notes, 'moveOut'),
    submitDamageClaim,
    acceptDamageClaim,
    rejectDamageClaim,
    acceptCounterOffer,
    resolveDispute,
    refreshConnection,
    refreshAgreement
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used inside Web3Provider.');
  return context;
};
