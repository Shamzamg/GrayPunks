export const RPC_URL = 'https://rpc-mainnet.matic.network/';
export const CHAIN_ID = 137;
export const NETWORK_INFOS = {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "wallet_addEthereumChain",
    "params": [
      {
        "chainId": "0x89",
        "chainName": "Matic Mainnet",
        "rpcUrls": [
          "https://rpc-mainnet.matic.network/"
        ],
        "nativeCurrency": {
          "name": "MATIC",
          "symbol": "MATIC",
          "decimals": 18
        },
        "blockExplorerUrls": [
          "https://polygonscan.com/"
        ]
      }
    ]
};