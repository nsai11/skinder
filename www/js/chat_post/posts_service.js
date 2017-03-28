/*global Firebase*/
/*global GeoFire*/
(function (angular) {
  'use strict';

  angular.module('skinder')
    .service('PostService', ['POSTURL', 'MSGURL', 'MEMBERURL', 'LOCATIONURL', '$q', '$firebaseArray', 'uiGmapGoogleMapApi', PostsService]);
    
  function PostsService(POSTURL, MSGURL, MEMBERURL, LOCATIONURL, $q, $firebaseArray, uiGmapGoogleMapApi) {
    var postRef = new Firebase(POSTURL);

    var geoPostRef = new Firebase(LOCATIONURL);
    var geoFire = new GeoFire(geoPostRef);
    var geoRef = geoFire.ref();

    var messageRef = new Firebase(MSGURL);

    var memberRef = new Firebase(MEMBERURL);
    var fireMember = $firebaseArray(memberRef);

    return {
      createPost: function CreatePost(newPost) {
        var deferred = $q.defer();
        //todo fix the memberRef and MessageRef creation base on newRoomRef.key(()
        var newPostRef = postRef.push(newPost, function(error) {
          if (error === null) {
            var successMessage = "Your post is created";
            deferred.resolve(successMessage);
          }
          else {
            console.log(error);
            deferred.reject(error);
          }
        });
        var newPostID = newPostRef.key();
        //using newPostID to set ID for messages, locations, members
        memberRef.child(newPostRef.key()).set({
          info: {}
        });
        messageRef.child(newPostRef.key()).set({
          info: {}
        });
        //setting location for the Post
        geoFire.set(newPostRef.key(), newPost.location);
        return deferred.promise;
      },
      //todo function to add user to the post
      //all function for querying all the posts
      all: function allPosts(key, location, distance, user_location, range) {
        var posts = [];
        var circles = [];
        var DISTANCE_ADDED = 1; //query more posts than calculate to display
        var deferred = $q.defer();
        var geoQuery = geoFire.query({
          center: location,
          radius: distance + DISTANCE_ADDED
          //radius in kilometers
        });

        uiGmapGoogleMapApi.then(function(maps) {
          geoQuery.on("key_entered", function(key, location, distance) {
            postRef.child(key).once("value", function (data) {
              //todo remove this in production
              //console.log(key + " entered query at " + location + " (" + distance + " km from center)");
              //console.log(data.val());
              var post = {};
              var circle = {};
              var radius = Number(data.val().range);
              var post_location = data.val().location;
              var user_locationObj = new maps.LatLng(user_location[0], user_location[1]);
              var post_locationObj = new maps.LatLng(post_location[0], post_location[1]);
              var distanceToPost = maps.geometry.spherical.computeDistanceBetween(user_locationObj, post_locationObj);
              userInCircleDetection();
              //  decorator function
              function userInCircleDetection() {
                if (distanceToPost <= radius) {//distance comeback in kilometer
                  post = {
                    postID:  data.key(),
                    postData: data.val()
                  };
                  circle = {
                    id: key,
                    center: {
                        latitude: post.postData.location[0],
                        longitude: post.postData.location[1]
                      },
                    radius: Number(post.postData.range),
                    stroke: {
                        color: '#08B21F', //green color indicate for accessible rooms
                        weight: 2,
                        opacity: 1
                      },
                    fill: {
                        color: '#08B21F',
                        opacity: 0.5
                      }
                  };
                  posts.push(post);
                  circles.push(circle);
                }
                else {
                  post = {
                    postID:  data.key(),
                    postData: data.val()
                  };
                  var outOfRangeCircle = {
                    id: key,
                    center: {
                        latitude: post.postData.location[0],
                        longitude: post.postData.location[1]
                      },
                    radius: Number(post.postData.range),
                    stroke: {
                        color: '#ff4081', //red color indicate for non-accessible rooms
                        weight: 2,
                        opacity: 1
                      },
                    fill: {
                        color: '#ff4081',
                        opacity: 0.5
                      }
                  };
                  circles.push(outOfRangeCircle);
                }
              }
            });
          });
          var container = {
            posts: posts,
            circles: circles
          };
          deferred.resolve(container);
          return deferred.promise;
        });
        return deferred.promise;
      },
      delete: function (postID) {
        var deferred = $q.defer();
        //todo fix the memberRef and MessageRef creation base on newRoomRef.key(()
        var deletePostRef = postRef.child(postID).remove(onComplete);
        //using newRoomID to set ID for messages, locations, members
        memberRef.child(postID).remove(onComplete);
        messageRef.child(postID).remove(onComplete);
        //setting location for the room
        geoFire.remove(postID);
        //
        function onComplete(error) {
          if (error === null) {
            var successMessage = "Your post is deleted";
            deferred.resolve(successMessage);
          }
          else{
            deferred.reject(error);
          }
        }
        return deferred.promise;
      }
    };
  }

})(window.angular);
