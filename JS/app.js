var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
    $routeProvider
        .when("/database", {
            templateUrl: "HTML/databaseView.html"
        })
        .when("/table/:dbName", {
            templateUrl: "HTML/tableView.html"
        })
        .when("/tableDataView/:dbName/:tableName", {
            templateUrl: "HTML/tableDataView.html"
        })
        .otherwise({
            redirectTo: "/database"
        });
});
app.run(function ($rootScope, $routeParams, $location) {
    $rootScope.$on('$viewContentLoaded', function () {
        if ($location.path().startsWith('/database')) {
            initDatabaseView($location, $rootScope);
        } else if ($location.path().startsWith('/tableDataView')) {
            const dbName = $routeParams.dbName;
            const tableName = $routeParams.tableName;
            if (dbName && tableName) {
                initTableDataView(dbName, tableName);
            }
        } else if ($location.path().startsWith('/table')) {
            const dbName = $routeParams.dbName;
            if (dbName) {
                initTableView($location, $rootScope, dbName);
            }
        }
    });
});