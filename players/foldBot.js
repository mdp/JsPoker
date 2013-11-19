module.exports = function () {

  var info = {
    name: "FoldBot"
  };

  function play(game) {
    if (game.state !== "complete") {
      return 0
    }
  };

  return { play: play, info: info }

}
