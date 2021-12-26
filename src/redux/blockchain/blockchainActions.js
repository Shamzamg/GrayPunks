// constants
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";
// log
import { fetchData } from "../data/dataActions";
import { CHAIN_ID, NETWORK_INFOS } from "../config/globals";
import { getDocumentTypeNodeName } from "jsdom/lib/jsdom/living/domparsing/parse5-adapter-serialization";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();
    const { ethereum } = window;
    const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    if (metamaskIsInstalled) {
      Web3EthContract.setProvider(ethereum);
      let web3 = new Web3(ethereum);
      try {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        const networkId = await ethereum.request({
          method: "net_version",
        });
        if (networkId == CONFIG.NETWORK.ID) {
          const SmartContractObj = new Web3EthContract(
            abi,
            CONFIG.CONTRACT_ADDRESS
          );
          dispatch(
            connectSuccess({
              account: accounts[0],
              smartContract: SmartContractObj,
              web3: web3,
            })
          );
          // Add listeners start
          ethereum.on("accountsChanged", (accounts) => {
            dispatch(updateAccount(accounts[0]));
          });
          ethereum.on("chainChanged", (chainId) => {
            if(chainId != CHAIN_ID){
              window.location.reload();
            }
          });
          // Add listeners end
        } else {
          let logs = await metamaskSwitchNetwork();
          if(logs.connected){
            dispatch(connect());
          } else{
            dispatch(connectFailed(`Switch to the ${CONFIG.NETWORK.NAME} network.`));
          }
        }
      } catch (err) {
        dispatch(connectFailed("Something went wrong."));
      }
    } else {
      dispatch(connectFailed("Install Metamask."));
    }
  };
};

export const metamaskSwitchNetwork = async () => {
  if(window.ethereum){
      console.log("You have metamask");
      const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
      });
      const chainId = await window.ethereum.request({
          method: "net_version"
      });
      if(chainId === CHAIN_ID){
          return {
              connected: true,
              status: null,
              account: accounts[0],
              chainId: chainId,
              contract: null
          };
      } else{ //there we switch chainId
          console.log("Switching to the Matic mainnet.");
          let transaction = await window.ethereum.request(NETWORK_INFOS);
          const chainId = await window.ethereum.request({
              method: "net_version"
          });
          return ({
              connected: true,
              status: null,
              account: accounts[0],
              chainId: chainId,
              contract: null
          });
      }
      console.log(accounts);
  }else{
      console.log("You need metamask");
      return ({
          connected: false,
          status: null,
          account: null,
          chainId: null,
          contract: null
      });
  }
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};
