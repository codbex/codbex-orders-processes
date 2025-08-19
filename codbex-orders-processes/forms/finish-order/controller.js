angular.module('templateApp', ['blimpKit', 'platformView']).controller('templateController', ($scope, $http) => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const taskId = urlParams.get('taskId');

    const updateOrderUrl =
        "/services/ts/codbex-orders-processes/forms/finish-order/api/FinishOrderService.ts/finishOrder/" + taskId;

    $scope.finishOrder = () => {

        $http.post(updateOrderUrl)
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