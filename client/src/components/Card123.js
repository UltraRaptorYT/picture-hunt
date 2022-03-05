import React from "react";

class Card extends React.Component {
  flipCard(e) {
    e.preventDefault();
    var card = undefined;
    if (e.target.tagName !== "DIV") {
      card = e.target.parentElement.parentElement;
    } else {
      card = e.target.parentElement;
    }
    card.classList.add("is-flipped");
    setTimeout(() => {
      card.classList.remove("is-flipped");
    }, 1000);
  }
  render() {
    var pokemon = this.props.pokemon;
    return (
      <div className="tile">
        <div className="tile__inner" onClick={(e) => this.flipCard(e)}>
          <div className="tile__face tile__face--front">
            <h2>{this.props.letter}</h2>
          </div>
          <div className="tile__face tile__face--back">
            <img src={this.props.src} alt="" style={{ filter: pokemon }} />
          </div>
        </div>
      </div>
    );
  }
}

export default Card;
