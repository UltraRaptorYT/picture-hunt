import React, { useEffect, useState } from "react";
import shuffleArray from "../utils/shuffleArray";
import io from "socket.io-client";
import queryString from "query-string";
import useSound from "use-sound";

import Spinner from "./Spinner";
import conveyor from "../utils/conveyor";
import cardColor from "../utils/cardColor";
import cardLetter from "../utils/cardLetter";
import config from "../config";
import useEventListener from "@use-it/event-listener";

let socket;
// const ENDPOINT = "http://localhost:5000";
const ENDPOINT = "https://picture-hunt.herokuapp.com/";

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => {
    images[item.replace("./", "")] = r(item);
    return item;
  });
  return images;
}

const images = importAll(
  require.context("../assets/cards", false, /\.(png|jpe?g|svg)$/)
);

const Game = (props) => {
  const data = queryString.parse(props.location.search);
  //initialize socket state
  const [room, setRoom] = useState(data.roomCode);
  const [roomFull, setRoomFull] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  // const [message, setMessage] = useState("");
  // const [messages, setMessages] = useState([]);
  useEffect(() => {
    const connectionOptions = {
      forceNew: true,
      reconnectionAttempts: "Infinity",
      timeout: 10000,
      transports: ["websocket"],
    };
    socket = io.connect(ENDPOINT, connectionOptions);

    socket.emit("join", { room: room }, (error) => {
      if (error) setRoomFull(true);
    });

    //cleanup on component unmount
    return function cleanup() {
      socket.emit("disconnect");
      //shut down connection instance
      socket.off();
    };
  }, []);

  //initialize game state
  const [gameOver, setGameOver] = useState(true);
  const [turn, setTurn] = useState("");
  const [player1Conveyor, setPlayer1Conveyor] = useState([]);
  const [player2Conveyor, setPlayer2Conveyor] = useState([]);
  const [shuffle, setShuffle] = useState([]);
  const [shuffleLetter, setShuffleLetter] = useState([]);
  const [player1Position, setPlayer1Position] = useState([]);
  const [player2Position, setPlayer2Position] = useState([]);
  const [cardFlip, setCardFlip] = useState("");

  var isClicked = false;

  useEventListener("keydown", (e) => {
    if (isClicked) {
      return;
    }
    isClicked = true;
    [...document.getElementsByClassName("tile__inner")].map((value, index) => {
      if (
        value
          .getElementsByClassName("tile__face--front")[0]
          .getElementsByTagName("h2")[0].innerHTML == e.key.toUpperCase()
      ) {
        flipCard(document.getElementsByClassName("tile__inner")[index], index);
      }
    });
    setTimeout(function () {
      isClicked = false;
    }, 500);
    return;
  });
  //runs once on component mount
  useEffect(() => {
    const shuffle = shuffleArray(cardColor);
    const shuffleLetter = shuffleArray(cardLetter);
    const player1Conveyor = conveyor.splice(0, config.conveyorLength);
    const player2Conveyor = conveyor;
    const player1Position = config.p1Start;
    const player2Position = config.p2Start;
    //send initial state to server
    socket.emit("initGameState", {
      gameOver: false,
      turn: "Player 1",
      player1Conveyor: [...player1Conveyor],
      player2Conveyor: [...player2Conveyor],
      shuffle: [...shuffle],
      shuffleLetter: [...shuffleLetter],
      player1Position: player1Position,
      player2Position: player2Position,
    });
  }, []);

  useEffect(() => {
    socket.on(
      "initGameState",
      ({
        gameOver,
        turn,
        player1Conveyor,
        player2Conveyor,
        shuffle,
        shuffleLetter,
        player1Position,
        player2Position,
      }) => {
        setGameOver(gameOver);
        setTurn(turn);
        sessionStorage.setItem("turn", turn);
        setPlayer1Conveyor(player1Conveyor);
        setPlayer2Conveyor(player2Conveyor);
        setShuffle(shuffle);
        setShuffleLetter(shuffleLetter);
        setPlayer1Position(player1Position);
        setPlayer2Position(player2Position);
        sessionStorage.getItem("user") == "Player 1" &&
          sessionStorage.setItem("position", player1Position);
        sessionStorage.getItem("user") == "Player 1" &&
          sessionStorage.setItem("conveyor", player1Conveyor);
        sessionStorage.getItem("user") == "Player 2" &&
          sessionStorage.setItem("position", player2Position);
        sessionStorage.getItem("user") == "Player 2" &&
          sessionStorage.setItem("conveyor", player2Conveyor);
      }
    );

    socket.on(
      "updateGameState",
      ({
        gameOver,
        turn,
        player1Conveyor,
        player2Conveyor,
        shuffle,
        shuffleLetter,
        player1Position,
        player2Position,
        cardFlip,
      }) => {
        gameOver && setGameOver(gameOver);
        turn && sessionStorage.setItem("turn", turn);
        turn && setTurn(turn);
        player1Conveyor && setPlayer1Conveyor(player1Conveyor);
        player1Conveyor &&
          sessionStorage.getItem("user") == "Player 1" &&
          sessionStorage.setItem("conveyor", player1Conveyor);
        player2Conveyor && setPlayer2Conveyor(player2Conveyor);
        player2Conveyor &&
          sessionStorage.getItem("user") == "Player 2" &&
          sessionStorage.setItem("conveyor", player2Conveyor);
        shuffle && setShuffle(shuffle);
        shuffleLetter && setShuffleLetter(shuffleLetter);
        player1Position &&
          sessionStorage.getItem("user") == "Player 1" &&
          sessionStorage.setItem("position", player1Position);
        player1Position && setPlayer1Position(player1Position);
        player2Position &&
          sessionStorage.getItem("user") == "Player 2" &&
          sessionStorage.setItem("position", player2Position);
        player2Position && setPlayer2Position(player2Position);
        cardFlip && setCardFlip(cardFlip);
        cardFlip !== "" && flipping(cardFlip);
      }
    );

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    socket.on("currentUserData", ({ name }) => {
      setCurrentUser(name);
      sessionStorage.setItem("user", name);
    });

    // socket.on("message", (message) => {
    //   setMessages((messages) => [...messages, message]);
    //   const chatBody = document.querySelector(".chat-body");
    //   chatBody.scrollTop = chatBody.scrollHeight;
    // });
  }, []);

  //some util functions
  const checkWinner = (position, player) => {
    if (position === 0) {
      return player;
    } else if (position >= config.conveyorLength) {
      if (player === "Player 1") {
        return "Player 2";
      } else {
        return "Player 1";
      }
    } else {
      return "";
    }
  };

  // const toggleChatBox = () => {
  //   const chatBody = document.querySelector(".chat-body");
  //   if (isChatBoxHidden) {
  //     chatBody.style.display = "block";
  //     setChatBoxHidden(false);
  //   } else {
  //     chatBody.style.display = "none";
  //     setChatBoxHidden(true);
  //   }
  // };

  // const sendMessage = (event) => {
  //   event.preventDefault();
  //   if (message) {
  //     socket.emit("sendMessage", { message: message }, () => {
  //       setMessage("");
  //     });
  //   }
  // };

  const flipping = (cardIndex) => {
    if (gameOver === true) {
      [
        ...document
          .getElementById("grid")
          .getElementsByClassName("tile__inner"),
      ].map((card, index) => {
        if (card.classList.contains("is-flipped")) {
          card.classList.remove("is-flipped");
        }
        if (index === cardIndex) {
          card.classList.add("is-flipped");
          setTimeout(() => {
            card.classList.remove("is-flipped");
          }, 1000);
        }
      });
    }
  };

  const flipCard = (card, index) => {
    const currentTurn = turn;
    var user = currentUser;
    var nextCard, position, currentConveyor, nextTurn;
    if (currentTurn === undefined || user === undefined) {
      currentTurn = sessionStorage.getItem("turn");
      user = sessionStorage.getItem("user");
      position = parseInt(sessionStorage.getItem("position"));
      currentConveyor = sessionStorage.getItem("conveyor").split(",");
    } else {
      if (user === "Player 1") {
        position = player1Position;
        currentConveyor = player1Conveyor;
      } else if (user === "Player 2") {
        position = player2Position;
        currentConveyor = player2Conveyor;
      } else {
        return;
      }
    }
    if (currentTurn !== user) {
      return;
    }
    nextCard = currentConveyor[position - 1].split("|");
    if (
      nextCard[0] + "|" + nextCard[2] ===
      card
        .getElementsByClassName("tile__face--back")[0]
        .getElementsByTagName("img")[0]
        .getAttribute("alt")
    ) {
      console.log("Correct");
      position--;
      var newConveyor = [...currentConveyor];
      if (currentTurn === "Player 1") {
        nextTurn = "Player 1";
      } else {
        nextTurn = "Player 2";
      }
    } else {
      position++;
      var newConveyor = [...currentConveyor];
      newConveyor.pop();
      newConveyor.unshift(shuffle[Math.floor(Math.random() * shuffle.length)]);
      console.log("Wrong");
      if (currentTurn === "Player 1") {
        nextTurn = "Player 2";
      } else {
        nextTurn = "Player 1";
      }
    }
    if (currentTurn === "Player 1") {
      socket.emit("updateGameState", {
        gameOver: checkWinner(position, currentTurn),
        turn: nextTurn,
        player1Conveyor: [...newConveyor],
        player1Position: position,
        cardFlip: index,
      });
    } else {
      socket.emit("updateGameState", {
        gameOver: checkWinner(position, currentTurn),
        turn: nextTurn,
        player2Conveyor: [...newConveyor],
        player2Position: position,
        cardFlip: index,
      });
    }
    return;
  };
  var isFlipped = false;
  const flip = (e) => {
    if (isFlipped) {
      return;
    }
    isFlipped = true;
    e.preventDefault();
    var card = undefined;
    if (e.target.tagName !== "DIV") {
      card = e.target.parentElement.parentElement;
    } else {
      card = e.target.parentElement;
    }
    [...document.getElementById("grid").children].map((value, index) => {
      if (value.getElementsByClassName("tile__inner")[0] == card) {
        flipCard(card, index);
      }
    });
  };
  setTimeout(function () {
    isFlipped = false;
  }, 500);
  return (
    <div
      className={`Game`}
      id="background"
      // style={
      //   roomFull || users.length === 1
      //     ? { justifyContent: "center" }
      //     : (window.innerWidth >= 768 && window.innerWidth < 992) ||
      //       window.innerWidth >= 1920
      //     ? { justifyContent: "space-around" }
      //     : { justifyContent: "start" }
      // }
    >
      {!roomFull ? (
        <>
          <div className="container mb-0 mb-md-2">
            <div className="py-md-3 py-0">
              <header className="row align-items-center justify-content-between">
                <h2 className="col-12 col-md-4 text-left text-md-center m-0">
                  Game Code: {room}
                </h2>
                {/* Turn message */}
                {!gameOver &&
                  users.length === 2 &&
                  currentUser === "Player 1" &&
                  turn === "Player 2" && (
                    <h2 className="col-12 col-md-4 topInfoText d-none d-md-block m-0 m-md-auto">
                      Opponent's Turn
                    </h2>
                  )}
                {!gameOver &&
                  users.length === 2 &&
                  currentUser === "Player 2" &&
                  turn === "Player 1" && (
                    <h2 className="col-12 col-md-4 topInfoText  d-none d-md-block m-0 m-md-auto">
                      Opponent's Turn
                    </h2>
                  )}
                {!gameOver &&
                  users.length === 2 &&
                  currentUser === "Player 1" &&
                  turn === "Player 1" && (
                    <h2 className="col-12 col-md-4 topInfoText  d-none d-md-block m-0 m-md-auto">
                      Your Turn
                    </h2>
                  )}
                {!gameOver &&
                  users.length === 2 &&
                  currentUser === "Player 2" &&
                  turn === "Player 2" && (
                    <h2
                      c
                      className="col-12 col-md-4 topInfoText  d-none d-md-block m-0 m-md-auto"
                    >
                      Your Turn
                    </h2>
                  )}
                <a
                  href="/"
                  className="col-12 col-md-4 text-center d-none d-md-inline-block"
                >
                  <button className="bubbly-button quit">QUIT</button>
                </a>
              </header>
            </div>
            {/* PLAYER LEFT MESSAGES */}
            {users.length === 1 && (
              <div className="col-12 d-flex align-items-center justify-content-center">
                <h1 className="topInfoText  m-0">
                  Waiting for a Player to join the game
                </h1>
                <Spinner />
              </div>
            )}
          </div>
          {users.length === 2 && (
            <>
              {gameOver ? (
                <div>
                  {gameOver !== "" && (
                    <>
                      <h1>GAME OVER</h1>
                      <h2 className="text-center">
                        {gameOver == currentUser ? "You win!" : "You lose."}
                      </h2>
                    </>
                  )}
                </div>
              ) : (
                <div className="container">
                  <div
                    id="middle"
                    className="row justify-content-center align-items-center"
                  >
                    {/* PLAYER 1 VIEW */}
                    {currentUser === "Player 1" && (
                      <>
                        <div className="d-flex col-2 col-md-12 flex-column my-2 w-100">
                          <div
                            className="d-none d-md-flex w-100 align-items-center justify-content-center"
                            style={{ margin: "0 auto 20px auto" }}
                          >
                            <p
                              className="mb-0 mr-md-3"
                              style={{ marginTop: "20px" }}
                            >
                              END
                            </p>
                            {player1Conveyor.map((value, key) => {
                              if (key == player1Position)
                                return (
                                  <div
                                    className="arrow currentPlayer"
                                    style={{
                                      width: "5.3vw",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  ></div>
                                );
                              else
                                return (
                                  <div
                                    style={{
                                      width: "7.5vw",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      border: "2px solid transparent",
                                    }}
                                  >
                                    &nbsp;
                                  </div>
                                );
                            })}
                          </div>
                          <div
                            className="d-flex w-100 align-items-center justify-content-center"
                            id="player1"
                          >
                            <p className="mb-0 mr-md-3">
                              {window.innerWidth >= 576 ? (
                                <>
                                  <mark
                                    style={{ opacity: 0 }}
                                    className="p-0 hide"
                                  >
                                    1
                                  </mark>
                                  P1
                                </>
                              ) : (
                                <>END</>
                              )}
                            </p>
                            {player1Conveyor.map((value, key) => {
                              var src = value.split("|")[0] + ".png";
                              return (
                                <div
                                  style={{
                                    background: "white",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "7.5vw",
                                    border: "2px solid black",
                                    aspectRatio: 1,
                                    position: "relative",
                                  }}
                                >
                                  {window.innerWidth < 576 &&
                                  key == player1Position ? (
                                    <div
                                      style={{
                                        width: "100%",
                                        aspectRatio: 1,
                                        borderRadius: "100%",
                                        position: "absolute",
                                        zIndex: 100,
                                        border: "2px solid black",
                                        aspectRatio: 1,
                                        boxSizing: "content-box",
                                      }}
                                      className="currentPlayer"
                                    >
                                      &nbsp;
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                  <img
                                    src={images[src]["default"]}
                                    alt={
                                      value.split("|")[0] +
                                      "|" +
                                      value.split("|")[2]
                                    }
                                    style={{
                                      filter: value.split("|")[1],
                                      width: "100%",
                                      aspectRatio: 1,
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className=" col-8 col-md-6 col-lg-4 d-flex flex-column">
                          {/* Turn message */}
                          {!gameOver &&
                            users.length === 2 &&
                            currentUser === "Player 1" &&
                            turn === "Player 2" && (
                              <h4 className="col-12 col-md-4 topInfoText d-md-none d-block">
                                {currentUser}
                                <br />
                                Opponent's Turn
                              </h4>
                            )}
                          {!gameOver &&
                            users.length === 2 &&
                            currentUser === "Player 2" &&
                            turn === "Player 1" && (
                              <h4 className="col-12 col-md-4 topInfoText  d-md-none d-block">
                                {currentUser}
                                <br />
                                Opponent's Turn
                              </h4>
                            )}
                          {!gameOver &&
                            users.length === 2 &&
                            currentUser === "Player 1" &&
                            turn === "Player 1" && (
                              <h4 className="col-12 col-md-4 topInfoText  d-md-none d-block">
                                {currentUser}
                                <br />
                                Your Turn
                              </h4>
                            )}
                          {!gameOver &&
                            users.length === 2 &&
                            currentUser === "Player 2" &&
                            turn === "Player 2" && (
                              <h4 className="col-12 col-md-4 topInfoText  d-md-none d-block">
                                {currentUser}
                                <br />
                                Your Turn
                              </h4>
                            )}
                          <div
                            id="grid"
                            style={
                              turn === "Player 2"
                                ? {
                                    pointerEvents: "none",
                                    gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
                                  }
                                : {
                                    gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
                                  }
                            }
                          >
                            {shuffle.map((value, key) => {
                              var src = value.split("|")[0] + ".png";
                              return (
                                <div className="tile">
                                  <div
                                    className="tile__inner"
                                    onClick={(e) => flip(e)}
                                  >
                                    <div className="tile__face tile__face--front">
                                      <h2>{shuffleLetter[key]}</h2>
                                    </div>
                                    <div className="tile__face tile__face--back">
                                      <img
                                        src={images[src]["default"]}
                                        alt={
                                          value.split("|")[0] +
                                          "|" +
                                          value.split("|")[2]
                                        }
                                        style={{ filter: value.split("|")[1] }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <a
                            href="/"
                            className="col-12 col-md-4 text-center d-md-none d-inline-block my-3"
                          >
                            <button className="bubbly-button quit">QUIT</button>
                          </a>
                        </div>
                        <div className="d-flex col-2 col-md-12  w-100 flex-column  my-2">
                          <div
                            className="d-none d-md-flex w-100 align-items-center justify-content-center"
                            style={{ margin: "0 auto 20px auto" }}
                          >
                            <p
                              className="mb-0 mr-md-3"
                              style={{ marginTop: "20px" }}
                            >
                              END
                            </p>
                            {player2Conveyor.map((value, key) => {
                              if (key == player2Position)
                                return (
                                  <div
                                    className="arrow opponentPlayer"
                                    style={{
                                      width: "5.3vw",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  ></div>
                                );
                              else
                                return (
                                  <div
                                    style={{
                                      width: "7.5vw",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      border: "2px solid transparent",
                                    }}
                                  >
                                    &nbsp;
                                  </div>
                                );
                            })}
                          </div>
                          <div
                            className="d-flex  w-100 align-items-center justify-content-center"
                            id="player2"
                          >
                            <p className="mb-0 mr-md-3">
                              {window.innerWidth >= 576 ? (
                                <>
                                  <mark
                                    style={{ opacity: 0 }}
                                    className="p-0 hide"
                                  >
                                    1
                                  </mark>
                                  P2
                                </>
                              ) : (
                                <>END</>
                              )}
                            </p>
                            {player2Conveyor.map((value, key) => {
                              var src = value.split("|")[0] + ".png";
                              return (
                                <div
                                  style={{
                                    background: "white",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "7.5vw",
                                    border: "2px solid black",
                                    aspectRatio: 1,
                                    position: "relative",
                                  }}
                                >
                                  {window.innerWidth < 576 &&
                                  key == player2Position ? (
                                    <div
                                      style={{
                                        width: "100%",
                                        aspectRatio: 1,
                                        borderRadius: "100%",
                                        position: "absolute",
                                        zIndex: 100,
                                        border: "2px solid black",
                                        aspectRatio: 1,
                                        boxSizing: "content-box",
                                      }}
                                      className="opponentPlayer"
                                    >
                                      &nbsp;
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                  <img
                                    src={images[src]["default"]}
                                    alt={
                                      value.split("|")[0] +
                                      "|" +
                                      value.split("|")[2]
                                    }
                                    className="img-fluid"
                                    style={{
                                      filter: value.split("|")[1],
                                      width: "100%",
                                      aspectRatio: 1,
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                    {/* PLAYER 2 VIEW */}
                    {currentUser === "Player 2" && (
                      <>
                        <div className="d-flex  col-2 col-md-12  w-100 flex-column my-2">
                          <div
                            className="d-md-flex d-none w-100 align-items-center justify-content-center"
                            style={{ margin: "0 auto 20px auto" }}
                          >
                            <p
                              className="mb-0 mr-md-3"
                              style={{ marginTop: "20px" }}
                            >
                              END
                            </p>
                            {player2Conveyor.map((value, key) => {
                              if (key == player2Position)
                                return (
                                  <div
                                    className="arrow currentPlayer"
                                    style={{
                                      width: "5.3vw",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  ></div>
                                );
                              else
                                return (
                                  <div
                                    style={{
                                      width: "7.5vw",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      border: "2px solid transparent",
                                    }}
                                  >
                                    &nbsp;
                                  </div>
                                );
                            })}
                          </div>
                          <div
                            className="d-flex  w-100 align-items-center justify-content-center"
                            id="player2"
                          >
                            <p className="mb-0 mr-md-3">
                              {window.innerWidth >= 576 ? (
                                <>
                                  <mark
                                    style={{ opacity: 0 }}
                                    className="p-0 hide"
                                  >
                                    1
                                  </mark>
                                  P2
                                </>
                              ) : (
                                <>END</>
                              )}
                            </p>
                            {player2Conveyor.map((value, key) => {
                              var src = value.split("|")[0] + ".png";
                              return (
                                <div
                                  style={{
                                    background: "white",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "7.5vw",
                                    border: "2px solid black",
                                    aspectRatio: 1,
                                    position: "relative",
                                  }}
                                >
                                  {window.innerWidth < 576 &&
                                  key == player2Position ? (
                                    <div
                                      style={{
                                        width: "100%",
                                        aspectRatio: 1,
                                        borderRadius: "100%",
                                        position: "absolute",
                                        zIndex: 100,
                                        border: "2px solid black",
                                        aspectRatio: 1,
                                        boxSizing: "content-box",
                                      }}
                                      className="currentPlayer"
                                    >
                                      &nbsp;
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                  <img
                                    src={images[src]["default"]}
                                    alt={
                                      value.split("|")[0] +
                                      "|" +
                                      value.split("|")[2]
                                    }
                                    style={{
                                      filter: value.split("|")[1],
                                      width: "100%",
                                      aspectRatio: 1,
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className=" col-8 col-md-6 col-lg-4  d-flex flex-column">
                          {/* Turn message */}
                          {!gameOver &&
                            users.length === 2 &&
                            currentUser === "Player 1" &&
                            turn === "Player 2" && (
                              <h4 className="col-12 col-md-4 topInfoText d-md-none d-block">
                                {currentUser}
                                <br />
                                Opponent's Turn
                              </h4>
                            )}
                          {!gameOver &&
                            users.length === 2 &&
                            currentUser === "Player 2" &&
                            turn === "Player 1" && (
                              <h4 className="col-12 col-md-4 topInfoText  d-md-none d-block">
                                {currentUser}
                                <br />
                                Opponent's Turn
                              </h4>
                            )}
                          {!gameOver &&
                            users.length === 2 &&
                            currentUser === "Player 1" &&
                            turn === "Player 1" && (
                              <h4 className="col-12 col-md-4 topInfoText  d-md-none d-block">
                                {currentUser}
                                <br />
                                Your Turn
                              </h4>
                            )}
                          {!gameOver &&
                            users.length === 2 &&
                            currentUser === "Player 2" &&
                            turn === "Player 2" && (
                              <h4
                                c
                                className="col-12 col-md-4 topInfoText  d-md-none d-block"
                              >
                                {currentUser}
                                <br />
                                Your Turn
                              </h4>
                            )}
                          <div
                            id="grid"
                            style={
                              turn === "Player 1"
                                ? {
                                    pointerEvents: "none",
                                    gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
                                  }
                                : {
                                    gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
                                  }
                            }
                          >
                            {shuffle.map((value, key) => {
                              var src = value.split("|")[0] + ".png";
                              return (
                                <div className="tile">
                                  <div
                                    className="tile__inner"
                                    onClick={(e) => flip(e)}
                                  >
                                    <div className="tile__face tile__face--front">
                                      <h2>{shuffleLetter[key]}</h2>
                                    </div>
                                    <div className="tile__face tile__face--back">
                                      <img
                                        src={images[src]["default"]}
                                        alt={
                                          value.split("|")[0] +
                                          "|" +
                                          value.split("|")[2]
                                        }
                                        style={{ filter: value.split("|")[1] }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <a
                            href="/"
                            className="col-12 col-md-4 text-center d-md-none d-inline-block my-3"
                          >
                            <button className="bubbly-button quit">QUIT</button>
                          </a>
                        </div>
                        <div className="d-flex col-2 col-md-12 w-100 flex-column  my-2">
                          <div
                            className="d-md-flex d-none  w-100 align-items-center justify-content-center"
                            style={{ margin: "0 auto 20px auto" }}
                          >
                            <p
                              className="mb-0 mr-md-3"
                              style={{ marginTop: "20px" }}
                            >
                              END
                            </p>
                            {player1Conveyor.map((value, key) => {
                              if (key == player1Position)
                                return (
                                  <div
                                    className="arrow opponentPlayer"
                                    style={{
                                      width: "5.3vw",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  ></div>
                                );
                              else
                                return (
                                  <div
                                    style={{
                                      width: "7.5vw",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      border: "2px solid transparent",
                                    }}
                                  >
                                    &nbsp;
                                  </div>
                                );
                            })}
                          </div>
                          <div
                            className="d-flex  w-100 align-items-center justify-content-center"
                            id="player1"
                          >
                            <p className="mb-0 mr-md-3">
                              {window.innerWidth >= 576 ? (
                                <>
                                  <mark
                                    style={{ opacity: 0 }}
                                    className="p-0 hide"
                                  >
                                    1
                                  </mark>
                                  P1
                                </>
                              ) : (
                                <>END</>
                              )}
                            </p>
                            {player1Conveyor.map((value, key) => {
                              var src = value.split("|")[0] + ".png";
                              return (
                                <div
                                  style={{
                                    background: "white",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "7.5vw",
                                    border: "2px solid black",
                                    aspectRatio: 1,
                                    position: "relative",
                                  }}
                                >
                                  {window.innerWidth < 576 &&
                                  key == player1Position ? (
                                    <div
                                      style={{
                                        width: "100%",
                                        aspectRatio: 1,
                                        borderRadius: "100%",
                                        position: "absolute",
                                        zIndex: 100,
                                        border: "2px solid black",
                                        aspectRatio: 1,
                                        boxSizing: "content-box",
                                      }}
                                      className="opponentPlayer"
                                    >
                                      &nbsp;
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                  <img
                                    src={images[src]["default"]}
                                    className="img-fluid"
                                    style={{
                                      filter: value.split("|")[1],
                                      width: "100%",
                                      aspectRatio: 1,
                                    }}
                                    alt={
                                      value.split("|")[0] +
                                      "|" +
                                      value.split("|")[2]
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <h1>Room full</h1>
          <a href="/">
            <button className="bubbly-button quit">QUIT</button>
          </a>
        </>
      )}
    </div>
  );
};

export default Game;
