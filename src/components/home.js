import React, { useState } from "react";
import { Link } from "react-router-dom";
import randomCodeGenerator from "../utils/randomCodeGenerator";
import config from "../config";
import useEventListener from "@use-it/event-listener";

const Homepage = () => {
  const [roomCode, setRoomCode] = useState("");
  const Title = "";
  // useEventListener("animationend", (e) => {
  //   if (e.target.id === "logo") {
  //     Title.split("").map((value, index) => {
  //       document.getElementById("title").innerHTML += `${value}`;
  //     });
  //   }
  // });
  return (
    <div id="background" style={{ width: "100vw", height: "100vh" }}>
      <div className="d-flex w-100 h-100 align-items-center justify-content-center flex-column">
        <div
          style={{ width: "200px" }}
          className="animate__repeat-1 animate__animated animate__rollIn animate__fadeInLeft position-relative m-5"
          id="logo"
        >
          <img
            src={require("../assets/logo.png").default}
            className="img-fluid p-1"
            style={{ aspectRatio: 1, background: "white" }}
          />
          <h1
            className="position-absolute m-0 text-center animate__animated animate__fadeInUp animate__delay-1s"
            style={{
              top: "25%",
              textShadow: "2px 2px 4px rgba(255,255,255,1)",
            }}
            id="title"
          >
            Picture Hunt
          </h1>
        </div>
        <div
          className="modal fade"
          id="howTo"
          tabindex="-1"
          aria-labelledby="howToLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <p
                  className="modal-title"
                  style={{ textTransform: "uppercase" }}
                  id="howToLabel"
                >
                  How to play?
                </p>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div
                  id="carouselExampleControlsNoTouching"
                  className="carousel slide"
                  data-touch="false"
                  data-interval="false"
                >
                  <div className="carousel-inner mx-auto">
                    <div className="carousel-item active">hi</div>
                    <div className="carousel-item">hi</div>
                    <div className="carousel-item">hi</div>
                  </div>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-target="#carouselExampleControlsNoTouching"
                    data-slide="prev"
                    style={{
                      filter: "brightness(0)",
                      width: "auto",
                    }}
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="sr-only">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-target="#carouselExampleControlsNoTouching"
                    data-slide="next"
                    style={{
                      filter: "brightness(0)",
                      width: "auto",
                    }}
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="sr-only">Next</span>
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="modal fade"
          id="joinGame"
          tabindex="-1"
          aria-labelledby="joinGameLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="joinGameLabel">
                  Game Code:
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="d-flex w-100 align-items-center">
                  <input
                    type="text"
                    placeholder="Game Code"
                    className="form-control"
                    id="code"
                    onInput={(event) => setRoomCode(event.target.value)}
                  />
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      navigator.clipboard.readText().then(
                        (cliptext) => {
                          console.log(cliptext);
                          if (
                            cliptext.includes("=") &&
                            cliptext.includes("http")
                          ) {
                            cliptext = cliptext.split("=")[1];
                          }
                          document.getElementById("code").value = cliptext;
                          setRoomCode(cliptext);
                        },
                        (err) => console.log(err)
                      );
                    }}
                  >
                    <i class="fa-regular fa-paste"></i>
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Close
                </button>
                <Link
                  to={`/play?roomCode=${roomCode}`}
                  onClick={() => {
                    document
                      .getElementsByClassName("modal-backdrop")[0]
                      .remove();
                  }}
                >
                  <button type="button" className="btn btn-primary">
                    Join Game
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div
            className="row  align-items-center justify-content-center mx-auto "
            style={{ gap: "10px" }}
          >
            <div className="col-12 col-md-4 col-lg-3 text-center">
              <button
                className="bubbly-button"
                onClick={(e) => {
                  e.target.classList.remove("animate");
                  e.target.classList.add("animate");
                  setTimeout(function () {
                    e.target.classList.remove("animate");
                  }, 700);
                }}
                data-toggle="modal"
                data-target="#joinGame"
              >
                JOIN GAME
              </button>
            </div>
            <h1 className="d-none d-md-block col-2 col-lg-1 text-center m-0 font-weight-bold">
              OR
            </h1>
            <div className="col-12 col-md-4 col-lg-3 text-center">
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
            <div className="col-12 text-center mt-md-3">
              <button
                className="bubbly-button"
                onClick={(e) => {
                  e.target.classList.remove("animate");
                  e.target.classList.add("animate");
                  setTimeout(function () {
                    e.target.classList.remove("animate");
                  }, 700);
                }}
                style={{ textTransform: "uppercase" }}
                data-toggle="modal"
                data-target="#howTo"
              >
                How to play?
              </button>
            </div>
          </div>
        </div>
        {/* <div className="d-flex align-items-center justify-content-between w-50">
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
        </div> */}
      </div>
    </div>
  );
};

export default Homepage;
