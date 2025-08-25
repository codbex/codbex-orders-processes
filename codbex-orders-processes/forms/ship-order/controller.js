angular.module('templateApp', ['blimpKit', 'platformView']).controller('templateController', ($scope, $http) => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const taskId = urlParams.get('taskId');

    $scope.entity = {};
    $scope.forms = {
        details: {},
    };

    const shipOrderUrl =
        "/services/ts/codbex-orders-processes/forms/review-order/api/ShipOrderService.ts/shipOrder/" + taskId;
    const getOrderUrl =
        "/services/ts/codbex-orders-processes/forms/review-order/api/ShipOrderService.ts/getOrder/" + taskId;

    $http.get(getOrderUrl)
        .then(response => {
            $scope.Order = response.data.Order;
            $scope.Customer = response.data.Customer;
            $scope.ShippingProviders = response.data.ShippingProviders;
        })
        .catch((error) => {
            console.error("Error getting Sales Order data: ", error);
            $scope.resetForm();
        });

    $scope.shipOrder = () => {
        $http.post(shipOrderUrl)
            .then(response => {
                if (response.status == 201) {
                }
                else {
                    console.error("Error while shipping Sales Order: ", response.data);
                }
            })
            .catch((error) => {
                console.error("Error while shipping Sales Order: ", error.data);
            });
    }

    $scope.resetForm = () => {
        $scope.entity = {};
    };
});