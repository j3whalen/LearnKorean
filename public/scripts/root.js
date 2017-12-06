// Define the Application module
var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope, $http) {
  $http.get("http://localhost:3000/test.angular")
  .then(function(response){
    $scope.x = response.data.x;
    $scope.category = response.data.x.category;
    console.log('Angular app: '+response.data);
  }, function(error) {
    console.log("ERROR", error);
  });
});
