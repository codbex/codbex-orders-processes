angular.module('templateApp', ['blimpKit', 'platformView']).controller('templateController', ($scope, $http) => {
    const orderId = 1;

    const updateOrderUrl =
        "/services/ts/codbex-orders-processes/forms/finish-order/api/FinishOrderService.ts/finishOrder";

    $scope.finishOrder = () => {

        $http.post(updateOrderUrl, orderId)
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