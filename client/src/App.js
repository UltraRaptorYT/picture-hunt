import "./App.css";
import { Route } from "react-router-dom";
import Homepage from "./components/home";
import Game from "./components/Game";
import gameOver from "./components/gameOver";

const App = () => {
  return (
    <div className="App">
      <Route path="/" exact component={Homepage} />
      <Route path="/play" exact component={Game} />
      <Route path="/gameOver" exact component={gameOver} />
    </div>
  );
};

export default App;
