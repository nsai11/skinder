(function (angular) {
  "use strict";
  angular.module('skinder')
   .controller('DashCtrl', ['$scope', '$rootScope', '$log', '$timeout', '$cordovaGeolocation', '$ionicLoading', '$ionicPopup', 'uiGmapGoogleMapApi', 'GetProfileService', 'rx', 'PostService', DashCtrl]);

  function DashCtrl($scope, $rootScope, $log, $timeout, $cordovaGeolocation, $ionicLoading, $ionicPopup, uiGmapGoogleMapApi, GetProfileService, rx, PostService) {
      //initila value for radius
      startLoading();
      console.log('Logged in');
      $scope.activePost = $rootScope.activePost;
      $scope.radius = 100;
      $scope.control = {
        showDelete: false
      };
      var range = $scope.radius;
      //get user profile
      GetProfileService.userProfile()
      .then(getUserSuccess, getUserError);

      var posOptions = {timeout: 15000, enableHighAccuracy: true};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(getLocationSuccess, getLocationError);

      //google maps interactive
      $scope.options = {scrollwheel: true};

      //delete room
      $scope.deletePost = function (postID) {
        var confirmPopup = $ionicPopup.confirm({
           title: 'Deleting your post',
           template: 'Are you sure you want delete this post'
         });
        confirmPopup.then(function(res) {
           if (res) {
             $scope.posts.splice($scope.posts.indexOf(postID), 1);
             $ionicLoading.show({template: '<ion-spinner icon="spiral" class="spiral-energized"></ion-spinner>'});
             PostService.delete(postID)
               .then($ionicLoading.hide())
               .catch(showAlertError);
           }
         });
      };

      //Querying the posts
      $scope.allPosts = function(radius) {
        //data for callback
        var key = $rootScope.userKey; // key for querying geofire
        var distance = Number(radius) * 0.001;//geofire take the distance para in kilometer
        var location = $scope.currentLocation;

        PostService.all(key, location, distance, $scope.currentLocation, range).
          then(allPostSuccess, allPostError);
        $scope.$broadcast('scroll.refreshComplete');
      };

      //declare=========================================================
      function getLocationSuccess(position) {
        var coords = {
          latitude: position.coords.latitude,
          longitude:  position.coords.longitude
        };
        $scope.map = {
          center: Object.create(coords),
          events: { // event return query value from firebase base on Viewport of user map
            tilesloaded: function (map) {
              $scope.$apply(function () {
                uiGmapGoogleMapApi.then(function(maps) {
                   var key = $rootScope.userKey; // key for querying geofire
                   var zoomLevel = map.getZoom();
                   var viewPort = map.getBounds();
                   var locationObj = viewPort.getCenter();
                   var neObj = viewPort.getNorthEast();
                   var swObj = viewPort.getSouthWest();
                   // convert object to array for geofire query
                   var neArr = objToArray(neObj);
                   var locationArr = objToArray(locationObj);

                   function objToArray(obj) {
                     var arr = Object.keys(obj).map(function (i) {
                       return obj[i];
                     });
                     return arr;
                   }
                   var distance = maps.geometry.spherical.computeDistanceBetween(neObj, locationObj) * 0.001;
                   $log.info('this is the map instance', locationArr);
                   //PostService.all(key, locationArr, distance, user_location, range).
                   //   then(mapAllPostSuccess, allPostError);
                   var promise = PostService.all(key, locationArr, distance, user_location, range);
                   var observable = rx.Observable
                     .fromPromise(promise)
                     .map(function (container) {
                       return container.circles;
                     });

                   observable.subscribe(function (circles) {
                     $scope.circles = circles;
                   });
                 });
              });
            }
          },
          zoom: 13
        };
        //Google map marker
        $scope.marker = {
          id: 0,
          coords: coords,
          options: {draggable: false}
        };
        //saving user location in 2 differnt types of data
        $scope.currentLocation = [position.coords.latitude, position.coords.longitude];
        var user_location = $scope.currentLocation;
        //  save current user location to the firebase for Geoquery every 1s
        GetProfileService.userLocationKey($scope.currentLocation);
        //  initialize the the posts
        $scope.allPosts(1000);
      }

      function getLocationError(err) {
        console.log(err);
      }
      function getUserSuccess (user) {
        $rootScope.user = user;
        $scope.userKey = $rootScope.user.userKey;
      }

      function getUserError () {
        console.log("Error happen");
      }

      function allPostSuccess(container) {
          $scope.posts = container.posts;
          stopLoading();
        }

      function allPostError(e) {
        console.log(e);
      }

      function mapAllPostSuccess(container) {
        $scope.circles = container.circles;
      }
      //stop loading icon
      function startLoading(template) {
        template = typeof template !== 'undefined' ? template : {template: '<ion-spinner icon="ripple" class="spinner-energized"></ion-spinner>'};
        $ionicLoading.show(template);
      }
      function stopLoading() {
        $ionicLoading.hide();
      }
      function showAlertError(error) {
        stopLoading();
        console.log(error);
        $ionicPopup.alert({
              title: 'Error',
              content: error
            });
      }

    }
})(window.angular);
