export const CONTRACT_ADDRESS = "0xE1AE1940b0e435cBb7f3D6F1e3B3C947C17e9b52";
export const USDT_ADDRESS = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";

export const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

export const CONTRACT_ABI = [
  "function register() external",
  "function setDestination(address _destination) public",
  "function getUserDashboardData(address _user) external view returns (bool isReg, address dest, uint256 totalFwd)",
  "function getUserTransferHistory(address _user) external view returns (tuple(uint256 amount, uint256 timestamp, address destination)[])"
];