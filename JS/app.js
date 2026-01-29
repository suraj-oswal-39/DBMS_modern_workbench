var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
    $routeProvider
        .when("/database", {
            templateUrl: "HTML/databaseView.html"
        })
        .when("/table/:dbName", {
            templateUrl: "HTML/tableView.html"
        })
        .otherwise({
            redirectTo: "/database"
        });
});
app.run(function ($rootScope, $routeParams, $location) {
    $rootScope.$on('$viewContentLoaded', function () {
        if ($location.path().startsWith('/database')) {
            initDatabaseView($location, $rootScope);
        }
        else if ($location.path().startsWith('/table')) {
            const dbName = $routeParams.dbName;
            if (dbName) {
                fetchTables(
                    document.querySelector(".SvgGridTemplate"),
                    dbName
                );
            }
            initTableView(dbName);
        }
    });
});