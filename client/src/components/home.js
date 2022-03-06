import React, { useState } from "react";
import { Link } from "react-router-dom";
import randomCodeGenerator from "../utils/randomCodeGenerator";
import config from "../config";

const Homepage = () => {
  const [roomCode, setRoomCode] = useState("");
  return (
    <div id="background">
      <div className="d-flex w-100 h-100 align-items-center justify-content-center flex-column">
        <div
          style={{ width: "200px" }}
          className="animate__repeat-1 animate__animated animate__rollIn animate__fadeInLeft position-relative m-5"
        >
          <img
            src={require("../assets/logo.png").default}
            className="img-fluid p-1"
            style={{ aspectRatio: 1, background: "white" }}
            id="logo"
          />
          <h1
            className="position-absolute m-0 text-center"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            {/* {
            var text = "Picture Hunt"
            } */}
          </h1>
        </div>
        <div className="d-flex align-items-center justify-content-between w-50">
          <div className="d-flex flex-column">
            <input
              type="text"
              placeholder="Game Code"
              className="form-control"
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
            <Link
              to={`/play?roomCode=${randomCodeGenerator(config.codeLength)}`}
            >
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
