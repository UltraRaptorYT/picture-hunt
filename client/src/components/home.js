import React, { useState } from "react";
import { Link } from "react-router-dom";
import randomCodeGenerator from "../utils/randomCodeGenerator";
import config from "../config";

const Homepage = () => {
  const [roomCode, setRoomCode] = useState("");
  return (
    <div id="background">
      <div className="d-flex w-100 h-100 align-items-center justify-content-center flex-column">
        <img
          src={require("../assets/logo.png").default}
          width="200px"
          className="img-fluid"
          id="logo"
        />
        <div>
          <div>
            <input
              type="text"
              placeholder="Game Code"
              onInput={(event) => setRoomCode(event.target.value)}
            />
            <Link to={`/play?roomCode=${roomCode}`}>
              <button
                className="bubbly-button"
                onClick={(e) => {
                  e.target.classList.remove("animate");

                  e.target.classList.add("animate");
                  setTimeout(function () {
                    e.target.classList.remove("animate");
                  }, 700);
                }}
              >
                JOIN GAME
              </button>
            </Link>
          </div>
          <h1>OR</h1>
          <div>
            <Link to={`/play?roomCode=${randomCodeGenerator(config.codeLength)}`}>
              <button
                className="bubbly-button"
                onClick={(e) => {
                  e.target.classList.remove("animate");

                  e.target.classList.add("animate");
                  setTimeout(function () {
                    e.target.classList.remove("animate");
                  }, 700);
                }}
              >
                CREATE GAME
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
