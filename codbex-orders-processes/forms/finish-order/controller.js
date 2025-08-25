angular.module('templateApp', ['blimpKit', 'platformView']).controller('templateController', ($scope, $http) => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const taskId = urlParams.get('taskId');

    const payOrder =
        "/services/ts/codbex-orders-processes/forms/finish-order/api/FinishOrderService.ts/payOrder/" + taskId;
    const returnOrder =
        "/services/ts/codbex-orders-processes/forms/finish-order/api/FinishOrderService.ts/returnOrder/" + taskId;

    $scope.payOrder = () => {

        $http.post(payOrder)
            .then(response => {
                if (response.status == 201) {
                }
                else {
                    console.error("Error while finishing Sales Order: ", response.data);
                }
            })
            .catch((error) => {
                console.error("Error while finishing Sales Order: ", error.data);
            });

    }

    $scope.returnOrder = () => {

        $http.post(returnOrder)
            .then(response => {
                if (response.status == 201) {
                }
                else {
                    console.error("Error while finishing Sales Order: ", response.data);
                }
            })
            .catch((error) => {
                console.error("Error while finishing Sales Order: ", error.data);
            });

    }
});