angular.module('templateApp', ['blimpKit', 'platformView'])
    .controller('templateController', ($scope, $http) => {

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const taskId = urlParams.get('taskId');

        $scope.entity = {};
        $scope.forms = {
            details: {},
        };

        const shipOrderUrl =
            "/services/ts/codbex-orders-processes/forms/ship-order/api/ShipOrderService.ts/shipOrder/" + taskId;
        const getOrderUrl =
            "/services/ts/codbex-orders-processes/forms/ship-order/api/ShipOrderService.ts/getOrder/" + taskId;

        $http.get(getOrderUrl)
            .then(response => {
                $scope.Order = response.data.Order;
                $scope.Customer = response.data.Customer;
                $scope.ShippingProviderOptions = response.data.ShippingProviders;
            }).catch((error) => {
                console.error("Error getting Sales Order data: ", error);
            });

        $scope.shipOrder = () => {
            $http.post(shipOrderUrl)
                .catch((error) => {
                    console.error("Error while shipping Sales Order: ", error.data);
                });
        }

    });