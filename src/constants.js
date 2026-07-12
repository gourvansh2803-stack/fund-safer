export const CONTRACT_ADDRESS = "0x4580C05147b8fF82e4F55194c8baE93c9D24DC54";
export const USDT_ADDRESS = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";

export const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

export const CONTRACT_ABI = [
  "function register() external",
  "function setDestination(address _destination) public",
  "function getUserDashboardData(address _user) external view returns (bool isReg, address dest, uint256 totalFwd)",
  "function getUserTransferHistory(address _user) external view returns (tuple(uint256 amount, uint256 timestamp, address destination)[])",
  "function signupFee() view returns (uint256)" 
];