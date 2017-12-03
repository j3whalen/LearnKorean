// Define the Application module
var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope, $http) {
  $http.get("http://localhost:3000/test.angular")
  .then(function(response){
    $scope.english = response.data.english;
    $scope.korean = response.data.korean;
    $scope.category = response.data.category;
    $scope.transliteration = response.data.transliteration;
  }, function(error) {
    console.log("ERROR", error);
  });
});
