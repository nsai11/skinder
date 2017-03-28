/*global Firebase*/
(function(angular) {
  'use strict';
  var config = {
    apiKey: "AIzaSyDPCScioFS49tW0rPCjQliUKh5j0Rcw72M",
    authDomain: "skinder-858b9.firebaseapp.com",
    databaseURL: "https://skinder-858b9.firebaseio.com",
    storageBucket: "skinder-858b9.appspot.com",
    messagingSenderId: "280323404236"
  };
  firebase.initializeApp(config);
  angular.module('skinder')
    .controller('LoginCtrl', ['$scope', '$firebase', '$firebaseAuth','$firebaseObject', '$window', '$rootScope', '$state', LoginCtrl]);
  function LoginCtrl($scope, $firebase, $firebaseAuth,$firebaseObject, $window, $rootScope, $state) {
     
      $scope.login = function () {
        var userKey = firebase.auth().currentUser;
        var provider = new firebase.auth.FacebookAuthProvider();
        var fbRef = firebase.database().ref();
        firebase.auth().signInWithPopup(provider)
          .then(function(authData) {
            if (userKey != null) 
              { 
              userKey.providerData.forEach(function (profile) { 
                console.log("Sign-in provider: "+profile.providerId); 
                console.log(" Provider-specific UID: "+profile.uid); 
                console.log(" Name: "+profile.displayName); 
                console.log(" Email: "+profile.email); 
                console.log(" Photo URL: "+profile.photoURL); 
              }); 
              } 
            console.log("Logged in as:", authData);
            $rootScope.userKey = authData.uid;  
            $state.go('tab.dash');
            console.log('value of fbRef is:',fbRef);
            console.log("value of userKey is:",userKey);

              
                /*fbRef.set({
                provider: profile.providerId;  
                user_name: profile.displayName; 
                picture: profile.photoURL; }); */
              
            //todo refactor this to service
            //add new user ref to fireabase
            fbRef.child('users').set({
              provider: authData.provider,
              user_name: authData.displayName,
              picture: authData.photoURL
            });
            return authData;
          })
          .catch(function(error) {
            console.error("Authentication failed:", error);
          });
      };

      //$scope.simpleLogin = $firebaseSimpleLogin(fbRef);
      //$scope.errors = [];
      //$scope.user = {
      //  email: '',
      //  password: ''
      //};
      //
      //$scope.login = function() {
      //  $scope.errors = [];
      //
      //  if ($scope.user.email === '') {
      //    $scope.errors.push('Please enter your email');
      //  }
      //
      //  if ($scope.user.password === '') {
      //    $scope.errors.push('Please enter your password');
      //  }
      //
      //  if ($scope.errors.length > 0) {
      //    return;
      //  }
      //
      //  var promise = $scope.simpleLogin.$login('password', {
      //    email: $scope.user.email,
      //    password: $scope.user.password
      //  });
      //
      //  promise.then(function(user) {
      //    console.log(user);
      //    $rootScope.user = user;
      //    $window.location.href = '/#/main';
      //  }, function(error) {
      //    console.error(error);
      //    if (error.code === 'INVALID_EMAIL') {
      //      $scope.errors.push('The email was invalid');
      //    }
      //    if (error.code === 'INVALID_PASSWORD') {
      //      $scope.errors.push('The password was invalid');
      //    }
      //  });
      //
      //};

    }

}(window.angular));


