function init() {
  >>>> Twiter stuff
  var twitter = new Twitter();

  var followers = twitter.getFollowers();
  for (var i = 0; i < followers.length; i++) {
    Logger.log('>>>> ' + i + '.- ' + followers[i].screen_name + ' @' + followers[i].screen_name);
  }
}
