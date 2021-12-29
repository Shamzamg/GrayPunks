import React, { useEffect, useState, useRef } from "react";
import Confetti from 'react-confetti';
import { useDispatch, useSelector } from "react-redux";
import { isMobile } from "react-device-detect";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import { Container, Row, Col } from 'react-bootstrap';
import Typewriter from './components/Typewriter';
import * as s from "./styles/globalStyles";
import styled from "styled-components";

import graypunk263 from "./assets/263.png";
import graypunk278 from "./assets/278.png";
import graypunk354 from "./assets/354.png";

import NFTCalendar from "./assets/NFTcalendar.svg";

import roadmap from "./assets/roadmap.svg";

import './styles/App.css';

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 2px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: 3E3E3E;
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: black;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: #61C4EA;
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.SYMBOL}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `${CONFIG.SYMBOL} is yours! Visit Opensea.io to view it.`
        );
        setIsConfettiRunning(true);
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  const [width, setWidth] = useState(window.innerWidth);

  const handleResize = () => {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  const [isConfettiRunning, setIsConfettiRunning] = useState(false); 

  const sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  window.addEventListener('resize', handleResize);

  return (
      <Container fluid style={{ display: "flex", justifyContent: "center", flexDirection: "column", height: "100%", paddingRight: "15%", paddingLeft: "15%", paddingTop: "5%", paddingBottom: "5%"}}>
        <Confetti run={isConfettiRunning} numberOfPieces={100}/>
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginBottom: "50px"}}>
          <Col style={{ display: "flex", justifyContent: "center", textAlign: "center"}}>
            <Typewriter />
          </Col>
        </Row>
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "center"}}>
          <Col className="d-flex punkGif">
            <StyledLogo alt={"logo"} src={"/config/images/main.gif"} />
          </Col>
          <Col className="d-flex mintDiv">
              <div style={{ backgroundColor: "gray", padding: "20px", borderRadius: '5px', border: '4px solid', borderColor: 'black'}}>
                <s.TextTitle
                  style={{
                    textAlign: "center",
                    fontSize: 50,
                    fontWeight: "bold",
                    color: "var(--accent-text)",
                  }}
                >
                  {data.totalSupply} / {CONFIG.MAX_SUPPLY}
                </s.TextTitle>
                <s.TextDescription
                  style={{
                    textAlign: "center",
                    color: "var(--primary-text)",
                  }}
                >
                  <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                    {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
                  </StyledLink>
                </s.TextDescription>
                <s.SpacerSmall />
                {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                  <>
                    <s.TextTitle
                      style={{ textAlign: "center", color: "var(--accent-text)" }}
                    >
                      The sale has ended.
                    </s.TextTitle>
                    <s.TextDescription
                      style={{ textAlign: "center", color: "var(--accent-text)" }}
                    >
                      You can still find {CONFIG.NFT_NAME} on
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                      {CONFIG.MARKETPLACE}
                    </StyledLink>
                  </>
                ) : (
                  <>
                    <s.TextTitle
                      style={{ textAlign: "center", color: "var(--accent-text)" }}
                    >
                      1 {CONFIG.SYMBOL} = {CONFIG.DISPLAY_COST}{" "}
                      {CONFIG.NETWORK.SYMBOL}.
                    </s.TextTitle>
                    <s.SpacerXSmall />
                    <s.SpacerSmall />
                    {isMobile ? (<span style={{ textAlign: "center"}}>Mint is only available on Desktop.</span>) : (blockchain.account === "" ||
                    blockchain.smartContract === null ? (
                      <s.Container ai={"center"} jc={"center"}>
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          Connect to the {CONFIG.NETWORK.NAME} network
                        </s.TextDescription>
                        <s.SpacerSmall />
                        <StyledButton
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch(connect());
                            getData();
                          }}
                        >
                          CONNECT
                        </StyledButton>
                        {blockchain.errorMsg !== "" ? (
                          <>
                            <s.SpacerSmall />
                            <s.TextDescription
                              style={{
                                textAlign: "center",
                                color: "var(--accent-text)",
                              }}
                            >
                              {blockchain.errorMsg}
                            </s.TextDescription>
                          </>
                        ) : null}
                      </s.Container>
                    ) : (
                      <>
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {feedback}
                        </s.TextDescription>
                        <s.SpacerMedium />
                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                          <StyledRoundButton
                            style={{ lineHeight: 0.4 }}
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              decrementMintAmount();
                            }}
                          >
                            -
                          </StyledRoundButton>
                          <s.SpacerMedium />
                          <s.TextDescription
                            style={{
                              textAlign: "center",
                              color: "var(--accent-text)",
                            }}
                          >
                            {mintAmount}
                          </s.TextDescription>
                          <s.SpacerMedium />
                          <StyledRoundButton
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              incrementMintAmount();
                            }}
                          >
                            +
                          </StyledRoundButton>
                        </s.Container>
                        <s.SpacerSmall />
                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                          <StyledButton
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              claimNFTs();
                              getData();
                            }}
                          >
                            {claimingNft ? "IN PROGRESS" : "MINT"}
                          </StyledButton>
                        </s.Container>
                      </>
                    ))}
                  </>
                )}
                <s.SpacerMedium />
              </div>
          </Col>
        </Row>
        
        <s.SpacerMedium />

        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", marginBottom: '20px'}}>
          <Col>
          {isMobile ? (<></>) : (<>
            <p>Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address.</p> 
            <p>Please note: Once you make the purchase, you cannot undo this action.</p>
          </>)}
          </Col>
        </Row>

        <Row style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: '20px'}}>
              <Col style={{ display: "flex", justifyContent: "center" }}>
              <a href="https://nftcalendar.io/event/graypunks" target="_blank" rel="noreferrer" title="NFTcalendar">
                <img src={NFTCalendar} width="100" />
               </a>
              </Col>
        </Row>

        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginBottom: '30px'}}>
          <Col style={{display: "flex", justifyContent: "space-around"}} md={4}>
            <a href="https://twitter.com/gray_punks" target="_blank" rel="noreferrer" title="Twitter"><svg className="media twitter" viewBox="0 0 26 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.7326 4.96747C21.6196 4.31687 22.418 3.53614 23.0389 2.6253C22.2406 2.97229 21.3092 3.23253 20.3778 3.31928C21.3535 2.75542 22.0632 1.88795 22.418 0.803614C21.5309 1.3241 20.5108 1.71446 19.4907 1.93133C18.6037 1.02048 17.4062 0.5 16.0756 0.5C13.5032 0.5 11.4187 2.53855 11.4187 5.05422C11.4187 5.4012 11.463 5.74819 11.5517 6.09518C7.69309 5.87831 4.23363 4.05663 1.92732 1.3241C1.52815 1.9747 1.30639 2.75542 1.30639 3.62289C1.30639 5.18434 2.10473 6.57229 3.39094 7.39639C2.63696 7.35301 1.88297 7.17952 1.26204 6.83253V6.8759C1.26204 9.08795 2.85872 10.9096 4.98762 11.3434C4.6328 11.4301 4.18928 11.5169 3.79011 11.5169C3.47965 11.5169 3.21353 11.4735 2.90307 11.4301C3.47965 13.2518 5.20938 14.553 7.24957 14.5964C5.6529 15.8108 3.65705 16.5482 1.4838 16.5482C1.08463 16.5482 0.729817 16.5048 0.375 16.4614C2.4152 17.7626 4.85456 18.5 7.51568 18.5C16.0756 18.5 20.7326 11.6036 20.7326 5.5747C20.7326 5.35783 20.7326 5.18434 20.7326 4.96747Z"></path></svg>
            </a>

            <a className="media" href="https://discord.gg/TE4sHCybED" target="_blank" rel="noreferrer" title="Discord"><svg className="media discord" viewBox="0 0 26 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.3466 1.9921C19.8075 1.30147 18.1571 0.792648 16.4314 0.501222C16.4 0.495598 16.3686 0.509654 16.3524 0.537766C16.1401 0.906965 15.905 1.38862 15.7403 1.76719C13.8843 1.49545 12.0377 1.49545 10.2197 1.76719C10.055 1.3802 9.81139 0.906965 9.59817 0.537766C9.58198 0.510592 9.55059 0.496536 9.51916 0.501222C7.79445 0.791716 6.14398 1.30054 4.60391 1.9921C4.59058 1.99772 4.57915 2.0071 4.57157 2.01928C1.44098 6.59311 0.583379 11.0545 1.00409 15.4606C1.00599 15.4822 1.01837 15.5028 1.0355 15.5159C3.10097 16.9993 5.10174 17.8998 7.06535 18.4967C7.09677 18.5061 7.13007 18.4949 7.15007 18.4695C7.61456 17.8492 8.02862 17.1952 8.38363 16.5073C8.40458 16.467 8.38458 16.4192 8.34176 16.4033C7.685 16.1597 7.05963 15.8626 6.45807 15.5253C6.41049 15.4981 6.40668 15.4316 6.45046 15.3997C6.57705 15.3069 6.70367 15.2104 6.82455 15.113C6.84642 15.0952 6.87689 15.0914 6.9026 15.1026C10.8546 16.8672 15.1331 16.8672 19.0384 15.1026C19.0641 15.0905 19.0946 15.0942 19.1174 15.112C19.2383 15.2095 19.3649 15.3069 19.4925 15.3997C19.5362 15.4316 19.5334 15.4981 19.4858 15.5253C18.8842 15.8692 18.2589 16.1597 17.6012 16.4024C17.5583 16.4183 17.5393 16.467 17.5603 16.5073C17.9229 17.1942 18.3369 17.8483 18.7929 18.4686C18.8119 18.4949 18.8462 18.5061 18.8776 18.4967C20.8507 17.8998 22.8515 16.9993 24.9169 15.5159C24.935 15.5028 24.9465 15.4831 24.9484 15.4616C25.4519 10.3676 24.105 5.9428 21.378 2.02021C21.3714 2.0071 21.36 1.99772 21.3466 1.9921ZM8.97379 12.7778C7.78397 12.7778 6.8036 11.7095 6.8036 10.3976C6.8036 9.08572 7.76496 8.01748 8.97379 8.01748C10.1921 8.01748 11.163 9.0951 11.144 10.3976C11.144 11.7095 10.1826 12.7778 8.97379 12.7778ZM16.9977 12.7778C15.8079 12.7778 14.8275 11.7095 14.8275 10.3976C14.8275 9.08572 15.7889 8.01748 16.9977 8.01748C18.2161 8.01748 19.1869 9.0951 19.1679 10.3976C19.1679 11.7095 18.2161 12.7778 16.9977 12.7778Z"></path></svg>
            </a>

            <a href="https://opensea.io/collection/graypunks" target="_blank" rel="noreferrer" title="Opensea"><svg className="media opensea" viewBox="0 0 90 90"  xmlns="http://www.w3.org/2000/svg">
              <path d="M90 45C90 69.8514 69.8514 90 45 90C20.1486 90 0 69.8514 0 45C0 20.1486 20.1486 0 45 0C69.8566 0 90 20.1486 90 45Z"/>             
              <path d="M22.2011 46.512L22.3952 46.2069L34.1015 27.8939C34.2726 27.6257 34.6748 27.6535 34.8043 27.9447C36.7599 32.3277 38.4475 37.7786 37.6569 41.1721C37.3194 42.5683 36.3947 44.4593 35.3544 46.2069C35.2204 46.4612 35.0724 46.7109 34.9152 46.9513C34.8413 47.0622 34.7164 47.127 34.5823 47.127H22.5432C22.2195 47.127 22.03 46.7756 22.2011 46.512Z" fill="white"/>
              <path d="M74.38 49.9149V52.8137C74.38 52.9801 74.2783 53.1281 74.1304 53.1928C73.2242 53.5812 70.1219 55.0052 68.832 56.799C65.5402 61.3807 63.0251 67.932 57.4031 67.932H33.949C25.6362 67.932 18.9 61.1727 18.9 52.8322V52.564C18.9 52.3421 19.0803 52.1618 19.3023 52.1618H32.377C32.6359 52.1618 32.8255 52.4022 32.8024 52.6565C32.7099 53.5072 32.8671 54.3764 33.2693 55.167C34.0461 56.7435 35.655 57.7283 37.3934 57.7283H43.866V52.675H37.4673C37.1391 52.675 36.9449 52.2959 37.1345 52.0277C37.2038 51.9214 37.2824 51.8104 37.3656 51.6856C37.9713 50.8257 38.8358 49.4895 39.6958 47.9684C40.2829 46.9421 40.8516 45.8463 41.3093 44.746C41.4018 44.5472 41.4758 44.3438 41.5497 44.1449C41.6746 43.7936 41.804 43.4653 41.8965 43.1371C41.9889 42.8597 42.0629 42.5684 42.1369 42.2956C42.3542 41.3617 42.4467 40.3723 42.4467 39.3459C42.4467 38.9437 42.4282 38.523 42.3912 38.1207C42.3727 37.6815 42.3172 37.2423 42.2617 36.8031C42.2247 36.4147 42.1554 36.031 42.0814 35.6288C41.9889 35.0416 41.8595 34.4591 41.7115 33.8719L41.6607 33.65C41.5497 33.2478 41.4573 32.864 41.3278 32.4618C40.9626 31.1996 40.5418 29.9698 40.098 28.8186C39.9362 28.3609 39.7512 27.9217 39.5663 27.4825C39.2935 26.8213 39.0161 26.2203 38.7619 25.6516C38.6324 25.3927 38.5214 25.1569 38.4105 24.9165C38.2857 24.6437 38.1562 24.371 38.0268 24.112C37.9343 23.9132 37.8279 23.7283 37.754 23.5434L36.9634 22.0824C36.8524 21.8836 37.0374 21.6478 37.2546 21.7079L42.2016 23.0487H42.2155C42.2247 23.0487 42.2294 23.0533 42.234 23.0533L42.8859 23.2336L43.6025 23.437L43.866 23.511V20.5706C43.866 19.1512 45.0034 18 46.4089 18C47.1116 18 47.7496 18.2866 48.2073 18.7536C48.665 19.2206 48.9517 19.8586 48.9517 20.5706V24.935L49.4787 25.0829C49.5204 25.0968 49.562 25.1153 49.599 25.143C49.7284 25.2401 49.9133 25.3835 50.1491 25.5591C50.3341 25.7071 50.5329 25.8874 50.7733 26.0723C51.2495 26.4561 51.8181 26.9508 52.4423 27.5194C52.6087 27.6628 52.7706 27.8107 52.9185 27.9587C53.723 28.7076 54.6245 29.5861 55.4845 30.557C55.7249 30.8297 55.9607 31.1071 56.2011 31.3984C56.4415 31.6943 56.6958 31.9856 56.9177 32.2769C57.209 32.6652 57.5233 33.0674 57.7961 33.4882C57.9256 33.687 58.0735 33.8904 58.1984 34.0892C58.5497 34.6209 58.8595 35.1711 59.1554 35.7212C59.2802 35.9755 59.4097 36.2529 59.5206 36.5257C59.8489 37.2608 60.1078 38.0098 60.2742 38.7588C60.3251 38.9206 60.3621 39.0963 60.3806 39.2535V39.2904C60.436 39.5124 60.4545 39.7482 60.473 39.9886C60.547 40.756 60.51 41.5235 60.3436 42.2956C60.2742 42.6239 60.1818 42.9336 60.0708 43.2619C59.9598 43.5763 59.8489 43.9045 59.7056 44.2143C59.4282 44.8569 59.0999 45.4996 58.7115 46.1006C58.5867 46.3225 58.4388 46.5583 58.2908 46.7802C58.129 47.016 57.9626 47.238 57.8146 47.4553C57.6112 47.7327 57.3939 48.0239 57.172 48.2828C56.9732 48.5556 56.7697 48.8284 56.5478 49.0688C56.2381 49.434 55.9422 49.7808 55.6324 50.1137C55.4475 50.331 55.2487 50.5529 55.0452 50.7517C54.8464 50.9736 54.643 51.1724 54.4581 51.3573C54.1483 51.6671 53.8894 51.9075 53.6721 52.1063L53.1635 52.5733C53.0896 52.638 52.9925 52.675 52.8908 52.675H48.9517V57.7283H53.9079C55.0175 57.7283 56.0716 57.3353 56.9223 56.6141C57.2136 56.3598 58.485 55.2594 59.9876 53.5997C60.0384 53.5442 60.1032 53.5026 60.1771 53.4841L73.8668 49.5265C74.1211 49.4525 74.38 49.6467 74.38 49.9149Z" fill="white"/>
            </svg>
            </a>
          </Col>
        </Row>

        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "center", backgroundColor: '#7F7F7F', color: 'white'}}>
          <Col style={{ padding: "15px", textAlign: "right"}}>
              <p style={{ fontSize: '100px'}}>9999</p>
              <p>Generated collectibles</p>
          </Col>
          <Col style={{ padding: "15px", paddingTop: "90px"}}>
              <p><span style={{ fontSize: '24px'}}>W</span>elcome,</p><br />
              <p>
                There are 9,999 GrayPunks. <br />
                All of them are unique and live in a lost grayscale world. <br/>
                They are damned from coloured life and wander in a parallel dimension as CryptoPunks cousins. <br style={{ lineHeight: '150%' }}/>
                In this realm, fees are low and the kingdom is called Polygon. <br />
                The ownership of a GrayPunk will grant you access to exclusive drops and surprising content.
              </p>
          </Col>
        </Row>

        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "center", paddingLeft: '40px', paddingRight: '40px', marginBottom: '40px'}}>
          <Col sm={12} md={6} lg={4}>
            <img src={graypunk263}></img>
          </Col>
          {width > 767 ? (<Col sm={12} md={6} lg={4}>
            <img src={graypunk278}></img>
          </Col>): (<></>)}
          {width > 991 ? (<Col sm={12} md={5} lg={4}>
            <img src={graypunk354}></img>
          </Col>) : (<></>)}
        </Row>

        <Row style={{ backgroundColor: 'black', color: 'white', marginBottom: '20px'}}>
          <Col style={{ padding: '20px'}}>
             <p>A bit of history ...</p><br /><br />
             <p style={{fontSize: '24px'}}>The main idea is to create a synthetic project keeping the best of multiple worlds.</p><br style={{lineHeight: '80%'}} />
             <p style={{fontSize: '20px'}}>GrayPunks has almost every specificity of their Crypto cousins, except their colors. <br />
             The population is the same: <span style={{color: '#E3BA7E'}} >Male</span>, <span style={{color: 'pink'}} >Female</span>, <span style={{color: '#008212'}} >Zombies</span>, <span style={{color: '#4D3320'}} >Ape</span>, <span style={{color: '#67DAC3'}} >Alien</span>. 
             </p>

          </Col>
        </Row>
        
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "center", paddingTop: '10px', borderTop: 'solid 1px', marginBottom: '20px'}}>
          <Col>
            <img src={roadmap} style={{maxWidth: "100%", maxHeight: "100%"}}></img>
          </Col>
        </Row>

        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "center", paddingTop: '10px', borderTop: 'solid 1px'}}>
          <Col style={{ display: "flex", justifyContent: "left"}}>
            2021 GrayPunks
          </Col>
          <Col style={{ display: "flex", justifyContent: "right"}}>
            Not affiliated with Larva Labs
          </Col>
        </Row>

      </Container>
  );
}

export default App;
