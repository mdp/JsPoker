module.exports = function () {

  var info = {
    name: "CallBot"
  };

  function play(game) {
    if (game.state !== "complete") {
      return game.betting.call
    }
  };

  return { play: play, info: info }

}
