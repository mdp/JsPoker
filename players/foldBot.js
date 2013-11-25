module.exports = function () {

  var info = {
    name: "FoldBot"
  };

  function update(game) {
    if (game.state !== "complete") {
      return 0
    }
  };

  return { update: update, info: info }

}
