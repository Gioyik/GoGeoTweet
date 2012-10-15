"use strict";
(function($) {
    $(function() {
        var LatLng = google.maps.LatLng;

        var buildQuery = function(location) {
            return "geocode:"+location.lat()+","+location.lng()+",1km";
        }

        var approxLocation = new LatLng(geoip_latitude(), geoip_longitude());

        var $tweets = $('#tweets').tweets({
            query: buildQuery(approxLocation),
            template: '#tweet-template'
        });

        var $map = $('#map').map({
            initialLocation: approxLocation,
            radius: 1000,
            locationChanged: function(location) {
                $tweets.tweets('setQuery', buildQuery(location));
            }
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                $map.map('setLocation', new LatLng(position.coords.latitude, position.coords.longitude), true);
            });
        }

        twttr.anywhere(function (T) {
            var $logout = $('#logout'),
                $watingForRetweet = null;

            var retweet = function($tweet) {
                $("#retweet-box").remove();
                
                var message = $tweet.attr('data-message');
                if (!message.match(/^RT @/)) {
                    message = "RT @" + $tweet.attr('data-user') + " " + message;
                }
                
                var $popup = $('<div id="retweet-box" />'),
                    $closeBtn = $('<a class="close">X</a>').click(function() {$popup.remove();}).appendTo($popup);
                $tweet.after($popup);
                
                T("#retweet-box").tweetBox({
                    label: "Retweet?",
                    onTweet: function() {$closeBtn.click();},
                    defaultContent: message
                });
            };
            
            T("#login").connectButton({
                authComplete: function(user) {
                    $logout.show();
                    if ($watingForRetweet) {
                        retweet($watingForRetweet);
                        $watingForRetweet = null;
                    }
                },
                signOut: function() {
                    $logout.hide();
                    $watingForRetweet = null;
                }
            });
            if (T.isConnected()) {
                $logout.show();
            };
            $logout.click(function() {
                twttr.anywhere.signOut();
            });
            
            T.hovercards();
            
            $('a.retweet').live('click', function() {
                if (!T.isConnected()) {
                    T.signIn();
                    $watingForRetweet = $(this);
                } else {
                    retweet($(this));
                }
                return false;
            });
        });

        $('#toggle-map').click(function() {
            $('#map').slideToggle('quick');
        });
    });
})(jQuery);
