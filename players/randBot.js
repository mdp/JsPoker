module.exports = function () {

  var info = {
    name: "RandBot"
  };

  function play(game) {
    if (game.state !== "complete") {
      var heads = Math.random() > 0.5;
      if (heads) {
        return game.betting.raise;
      } else {return game.betting.call}
    }
  };

  return { play: play, info: info }

}
