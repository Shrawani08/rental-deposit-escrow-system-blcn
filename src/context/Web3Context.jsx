import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { INITIAL_USERS, INITIAL_AGREEMENTS } from '../utils/mockData';
import { computeStringHash } from '../utils/hashUtils';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  // Users Directory Database
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('rentsecure_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current Logged In Account ID
  const [currentUserId, setCurrentUserId] = useState('landlord_alex');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Agreements state
  const [agreements, setAgreements] = useState(() => {
    const saved = localStorage.getItem('rentsecure_agreements');
    return saved ? JSON.parse(saved) : INITIAL_AGREEMENTS;
  });

  const [eventLogs, setEventLogs] = useState([]);

  // Active User Object
  const currentUserObj = usersList.find(u => u.id === currentUserId) || usersList[0];
  const accountRole = currentUserObj.role;
  const userAddress = currentUserObj.address;

  useEffect(() => {
    localStorage.setItem('rentsecure_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('rentsecure_agreements', JSON.stringify(agreements));
  }, [agreements]);

  // Log In by User ID Profile
  const loginAsRole = (userId) => {
    const found = usersList.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      setIsLoggedIn(true);
      addLog('info', 'RentSecure Sign In', `Logged in as ${found.name} (${found.roleTitle})`);
    }
  };

  // Secure Password Authentication
  const loginWithPassword = (email, password) => {
    const found = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, message: "User account not found with this email address." };
    }
    if (found.password !== password) {
      return { success: false, message: "Incorrect password. Please verify your credentials." };
    }
    setCurrentUserId(found.id);
    setIsLoggedIn(true);
    addLog('info', 'Password Authenticated', `Successfully authenticated ${found.name}`);
    return { success: true };
  };

  // Register New Custom Landlord / Tenant User
  const registerUser = ({ name, email, role, password, address }) => {
    const newId = `user_${Date.now()}`;
    const newUser = {
      id: newId,
      role,
      name,
      roleTitle: role === 'landlord' ? 'Property Owner / Landlord' : role === 'tenant' ? 'Tenant / Renter' : 'Arbitrator Officer',
      email,
      password,
      address: address || ('0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      badge: role === 'landlord' ? 'Custom Landlord' : 'Custom Tenant',
      balance: "10.0 ETH"
    };

    setUsersList(prev => [...prev, newUser]);
    addLog('success', 'New User Registered', `Registered ${name} as ${role.toUpperCase()}`);
    return newUser;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const addLog = (type, title, details, txHash = null) => {
    const newLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      title,
      details,
      txHash: txHash || '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
    };
    setEventLogs(prev => [newLog, ...prev]);
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          const metamaskUser = {
            id: `mm_${accounts[0]}`,
            role: 'tenant',
            name: `MetaMask (${accounts[0].slice(0, 6)}...)`,
            roleTitle: 'Web3 Wallet Signer',
            email: 'metamask@web3.eth',
            password: '',
            address: accounts[0],
            avatar: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=150&auto=format&fit=crop&q=80',
            badge: 'MetaMask Verified',
            balance: '100.0 ETH'
          };
          setUsersList(prev => [...prev.filter(u => u.id !== metamaskUser.id), metamaskUser]);
          setCurrentUserId(metamaskUser.id);
          setIsLoggedIn(true);
          addLog('info', 'MetaMask Wallet Connected', `Account: ${accounts[0]}`);
        }
      } catch (err) {
        console.error("MetaMask connection failed:", err);
      }
    } else {
      alert("MetaMask extension not detected. Use RentSecure user profiles or password registration.");
    }
  };

  const createAgreement = async ({ tenantAddress, arbitratorAddress, depositAmount, monthlyRent, durationDays, propertyAddress }) => {
    const newId = agreements.length > 0 ? Math.max(...agreements.map(a => a.id)) + 1 : 1;
    
    // Find matching tenant name
    const tenantUser = usersList.find(u => u.address.toLowerCase() === tenantAddress.toLowerCase());

    const newAg = {
      id: newId,
      propertyAddress,
      landlord: userAddress,
      tenant: tenantAddress || usersList.find(u => u.role === 'tenant')?.address,
      tenantName: tenantUser ? tenantUser.name : "Registered Tenant",
      arbitrator: arbitratorAddress || usersList.find(u => u.role === 'arbitrator')?.address,
      depositAmount: depositAmount.toString(),
      monthlyRent: monthlyRent.toString(),
      durationDays: parseInt(durationDays),
      startDate: 0,
      status: 0, // Waiting for deposit
      moveInEvidenceHash: "",
      moveInPhotos: [],
      moveOutEvidenceHash: "",
      moveOutPhotos: [],
      claimAmount: "0",
      claimReason: "",
      claimEvidenceHash: "",
      counterAmount: "0",
      counterReason: "",
      createdAt: Math.floor(Date.now() / 1000)
    };

    setAgreements(prev => [newAg, ...prev]);
    addLog(
      'success',
      'Rental Agreement Created',
      `Landlord created agreement #${newId} for ${propertyAddress} (Deposit: ${depositAmount} ETH)`
    );
    return newId;
  };

  const fundDeposit = async (agreementId) => {
    const ag = agreements.find(a => a.id === agreementId);
    if (!ag) return;

    setAgreements(prev => prev.map(a => {
      if (a.id === agreementId) {
        return { ...a, status: 1 }; // Funded
      }
      return a;
    }));

    addLog(
      'success',
      'Deposit Transferred to Escrow',
      `Tenant deposited ${ag.depositAmount} ETH into RentSecure smart contract vault`
    );
  };

  const confirmMoveIn = async (agreementId, photos, notes) => {
    const evidenceString = JSON.stringify({ photos, notes, timestamp: Date.now() });
    const hash = await computeStringHash(evidenceString);

    setAgreements(prev => prev.map(a => {
      if (a.id === agreementId) {
        return {
          ...a,
          status: 2, // Active
          moveInEvidenceHash: hash,
          moveInPhotos: photos,
          startDate: Math.floor(Date.now() / 1000)
        };
      }
      return a;
    }));

    addLog(
      'success',
      'Move-In SHA-256 Logged',
      `Move-in condition hash recorded on-chain: ${hash}`
    );
  };

  const confirmMoveOut = async (agreementId, photos, notes) => {
    const evidenceString = JSON.stringify({ photos, notes, timestamp: Date.now() });
    const hash = await computeStringHash(evidenceString);

    setAgreements(prev => prev.map(a => {
      if (a.id === agreementId) {
        return {
          ...a,
          status: 3, // MoveOut
          moveOutEvidenceHash: hash,
          moveOutPhotos: photos
        };
      }
      return a;
    }));

    addLog(
      'success',
      'Move-Out SHA-256 Logged',
      `Move-out inspection hash recorded on-chain: ${hash}`
    );
  };

  const submitDamageClaim = async (agreementId, claimAmount, reason, photos = []) => {
    const ag = agreements.find(a => a.id === agreementId);
    if (!ag) return;

    const numClaim = parseFloat(claimAmount);

    if (numClaim === 0) {
      setAgreements(prev => prev.map(a => {
        if (a.id === agreementId) {
          return {
            ...a,
            status: 6, // Closed
            claimAmount: "0",
            claimReason: reason,
            tenantPayout: ag.depositAmount,
            landlordPayout: "0"
          };
        }
        return a;
      }));

      addLog(
        'success',
        '100% Security Deposit Released',
        `No damages reported. 100% deposit (${ag.depositAmount} ETH) returned to tenant.`
      );
    } else {
      const claimHash = await computeStringHash(JSON.stringify({ claimAmount, reason, photos }));
      setAgreements(prev => prev.map(a => {
        if (a.id === agreementId) {
          return {
            ...a,
            status: 4, // Deduction Requested
            claimAmount: claimAmount.toString(),
            claimReason: reason,
            claimEvidenceHash: claimHash
          };
        }
        return a;
      }));

      addLog(
        'warning',
        'Deduction Claim Submitted',
        `Landlord requested ${claimAmount} ETH deposit deduction for agreement #${agreementId}`
      );
    }
  };

  const acceptDamageClaim = async (agreementId) => {
    const ag = agreements.find(a => a.id === agreementId);
    if (!ag) return;

    const claimVal = parseFloat(ag.claimAmount);
    const depositVal = parseFloat(ag.depositAmount);
    const tenantVal = (depositVal - claimVal).toFixed(4);

    setAgreements(prev => prev.map(a => {
      if (a.id === agreementId) {
        return {
          ...a,
          status: 6, // Closed
          tenantPayout: tenantVal,
          landlordPayout: ag.claimAmount
        };
      }
      return a;
    }));

    addLog(
      'success',
      'Deduction Accepted & Escrow Settled',
      `Tenant agreed to deduction. Landlord received ${ag.claimAmount} ETH; Tenant received ${tenantVal} ETH.`
    );
  };

  const rejectDamageClaim = async (agreementId, counterAmount, reason) => {
    setAgreements(prev => prev.map(a => {
      if (a.id === agreementId) {
        return {
          ...a,
          status: 5, // Disputed
          counterAmount: counterAmount.toString(),
          counterReason: reason
        };
      }
      return a;
    }));

    addLog(
      'danger',
      'Claim Rejected — Escalated to Arbitrator',
      `Tenant rejected deduction, counter-offering ${counterAmount} ETH. Escalated to neutral Arbitrator.`
    );
  };

  const acceptCounterOffer = async (agreementId) => {
    const ag = agreements.find(a => a.id === agreementId);
    if (!ag) return;

    const counterVal = parseFloat(ag.counterAmount);
    const depositVal = parseFloat(ag.depositAmount);
    const tenantVal = (depositVal - counterVal).toFixed(4);

    setAgreements(prev => prev.map(a => {
      if (a.id === agreementId) {
        return {
          ...a,
          status: 6, // Closed
          tenantPayout: tenantVal,
          landlordPayout: ag.counterAmount
        };
      }
      return a;
    }));

    addLog(
      'success',
      'Counter Offer Accepted & Escrow Settled',
      `Landlord accepted tenant's counter offer of ${ag.counterAmount} ETH.`
    );
  };

  const resolveDispute = async (agreementId, tenantPayout, landlordPayout) => {
    setAgreements(prev => prev.map(a => {
      if (a.id === agreementId) {
        return {
          ...a,
          status: 6, // Closed
          tenantPayout: tenantPayout.toString(),
          landlordPayout: landlordPayout.toString()
        };
      }
      return a;
    }));

    addLog(
      'success',
      'Arbitrator Verdict Executed',
      `Arbitrator issued binding payout: Tenant = ${tenantPayout} ETH, Landlord = ${landlordPayout} ETH`
    );
  };

  const resetDemo = () => {
    setUsersList(INITIAL_USERS);
    setAgreements(INITIAL_AGREEMENTS);
    setCurrentUserId('landlord_alex');
    localStorage.removeItem('rentsecure_users');
    localStorage.removeItem('rentsecure_agreements');
    addLog('info', 'Demo Baseline Restored', 'Reset multi-tenant accounts & agreements to defaults.');
  };

  return (
    <Web3Context.Provider value={{
      usersList,
      currentUserObj,
      accountRole,
      isLoggedIn,
      userAddress,
      loginAsRole,
      loginWithPassword,
      registerUser,
      logout,
      agreements,
      eventLogs,
      connectMetaMask,
      createAgreement,
      fundDeposit,
      confirmMoveIn,
      confirmMoveOut,
      submitDamageClaim,
      acceptDamageClaim,
      rejectDamageClaim,
      acceptCounterOffer,
      resolveDispute,
      resetDemo
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
