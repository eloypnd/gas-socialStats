var config = (function () {

  var _sheetsDesc = {
    followers: {
      name: 'followers',
      definition: 'twitterUser',
      displayName: 'screen_name',
      index: 'id_str'
    },
    following: {
      name: 'following',
      definition: 'twitterUser',
      displayName: 'screen_name',
      index: 'id_str'
    },
    twitterStats: {
      name: 'twitterStats',
      definition: 'twitterStats'
    },
    logs: {
      name: 'logs',
      definition: 'log'
    }
  };

  var _definitions = {
    twitterStats: [
      'created_at',
      'event', // events: follower, unfollower, following, unfollowing
      'user_id',
      'screen_name'
    ],
    log: [
      'created_at',
      'level', // trace, debug, info, warn, error
      'message'
    ],
    twitterUser: [
      'id',
      'id_str',
      'name',
      'screen_name',
      'location',
      'profile_location',
      'description',
      'url',
      'protected',
      'followers_count',
      'friends_count',
      'listed_count',
      'created_at',
      'favourites_count',
      'utc_offset',
      'time_zone',
      'geo_enabled',
      'verified',
      'statuses_count',
      'lang',
      'contributors_enabled',
      'is_translator',
      'is_translation_enabled',
      'profile_background_color',
      'profile_background_image_url',
      'profile_background_image_url_https',
      'profile_background_tile',
      'profile_image_url',
      'profile_image_url_https',
      'profile_link_color',
      'profile_sidebar_border_color',
      'profile_sidebar_fill_color',
      'profile_text_color',
      'profile_use_background_image',
      'has_extended_profile',
      'default_profile',
      'default_profile_image',
      'following',
      'follow_request_sent',
      'notifications',
      'muting',
      'blocking',
      'blocked_by'
    ]
  };

  return {
    sheets: {
      descriptions: _sheetsDesc,
      definitions: _definitions
    }
  }

})();
