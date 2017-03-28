(function(angular) {
  'use strict';

  angular.module('skinder')
    .controller('CreatePostCtrl', ['$scope', '$rootScope', '$cordovaGeolocation', 'uiGmapGoogleMapApi', '$timeout', '$ionicPopup', '$state', '$ionicLoading', '$ionicModal', 'PostService', CreatePostCtrl]);
  function CreatePostCtrl($scope, $rootScope, $cordovaGeolocation, uiGmapGoogleMapApi, $timeout, $ionicPopup, $state, $ionicLoading, $ionicModal, PostService) {
    $scope.posts = [];
    //Get location of user
    var posOptions = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(getLocationSuccess, getLocationError);
    //location for displaying the map and create new room
    /*function getLocationSuccess(position) {
        $scope.map = {
          center: {
          latitude: position.coords.latitude,
          longitude:  position.coords.longitude
        },
          zoom: 14
        };
      }*/

    function getLocationError(err) {
        console.log(err);
      }

    setTimeout(getLocationSuccess, 0);

    //Create Room
    $scope.newPost = {};

    $scope.createPost = function () {
      if ($scope.newPost.name === undefined || $scope.newPost.name === '') {
        $scope.errorMes = "Post name is required";
      }
      else if ($scope.newPost.range === undefined || $scope.newPost.range === '') {
        $scope.errorMes = "*Range is required";
      }
      else {
        startLoading();
        try {
          var pushPostdata = {
            name: $scope.newPost.name,
            private: $scope.newPost.private,
            range: $scope.newPost.range,
            location: [$scope.map.center.latitude, $scope.map.center.longitude],
            createdBy: $rootScope.user.userKey
          };
          switch ($scope.newPost.private) {
            case undefined:
              pushPostData.private = false;
              pushPostData.range = $scope.newPost.range;
              PostService.createPost(pushPostData)
                .then(stopLoading, showAlertError);
              break;
            case !undefined:
              pushPostData.private = $scope.newPost.private;
              pushPostData.range = $scope.newPost.range;
              PostService.createPost(pushPostData)
                .then(stopLoading)
                .catch(showAlertError);
              break;
          }
        } catch (e) {
          showAlertError(e);
        }
      }
      $scope.newPost = {};

    };
    //modal for confirm message
    $ionicModal.fromTemplateUrl('successInfo.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
          $scope.modal = modal;
        });

    $scope.closeModal = function () {
      $timeout(function () {
        if ($state.is('tab.dash')) {
          $scope.modal.remove();
        }}, 300);
    };
    //stop loading icon
    function startLoading() {
      $ionicLoading.show({
        template: '<ion-spinner icon="ripple" class="spinner-energized"></ion-spinner>'
      });
    }
    function stopLoading() {
      $ionicLoading.hide();
      $scope.modal.show();

    }
    function showAlertError(error) {
      stopLoading();
      console.log(error)
      $ionicPopup.alert({
            title: 'Error',
            content: error
          });
    }

  }
}(window.angular));
