function init() {
  var twitter = new Twitter();
  var archive = new Archive();

  archive.setFollowers(twitter.getFollowers());
}
