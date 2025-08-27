angular.module('templateApp', ['blimpKit', 'platformView']).controller('templateController', ($scope, $http) => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const taskId = urlParams.get('taskId');

    const payOrder =
        "/services/ts/codbex-orders-processes/forms/finish-order/api/FinishOrderService.ts/payOrder/" + taskId;
    const returnOrder =
        "/services/ts/codbex-orders-processes/forms/finish-order/api/FinishOrderService.ts/returnOrder/" + taskId;
    const getOrderUrl =
        "/services/ts/codbex-orders-processes/forms/finish-order/api/FinishOrderService.ts/getOrder/" + taskId;

    $http.get(getOrderUrl)
        .then(response => {
            $scope.Order = response.data.Order;
            $scope.Customer = response.data.Customer;
        }).catch((error) => {
            console.error("Error getting Sales Order data: ", error);
            $scope.resetForm();
        });

    $scope.payOrder = () => {
        $http.post(payOrder)
            .catch((error) => {
                console.error("Error while paying Sales Order: ", error.data);
            });
    }

    $scope.returnOrder = () => {
        $http.post(returnOrder)
            .catch((error) => {
                console.error("Error while returning Sales Order: ", error.data);
            });
    }

});