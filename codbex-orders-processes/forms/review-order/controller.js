angular.module('templateApp', ['blimpKit', 'platformView']).controller('templateController', ($scope, $http) => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const taskId = urlParams.get('taskId');

    $scope.entity = {};
    $scope.forms = {
        details: {},
    };

    const approveOrderUrl =
        "/services/ts/codbex-orders-processes/forms/review-order/api/ReviewOrderService.ts/approveOrder/" + taskId;
    const rejectOrderUrl =
        "/services/ts/codbex-orders-processes/forms/review-order/api/ReviewOrderService.ts/rejectOrder/" + taskId;
    const getOrderUrl =
        "/services/ts/codbex-orders-processes/forms/review-order/api/ReviewOrderService.ts/getOrder/" + taskId;

    $http.get(getOrderUrl)
        .then(response => {
            $scope.Order = response.data.Order;
            $scope.Customer = response.data.Customer;
            $scope.OrderItems = response.data.OrderItems;
        })
        .catch((error) => {
            console.error("Error getting Sales Order data: ", error);
            $scope.resetForm();
        });

    $scope.approveOrder = () => {
        $http.post(approveOrderUrl)
            .then(response => {
                if (response.status == 201) {
                }
                else {
                    console.error("Error while approving Sales Order: ", response.data);
                }
            })
            .catch((error) => {
                console.error("Error while approving Sales Order: ", error.data);
            });
    }

    $scope.rejectOrder = () => {
        $http.post(rejectOrderUrl)
            .then(response => {
                if (response.status == 201) {
                }
                else {
                    console.error("Error while rejecting Sales Order: ", response.data);
                }
            })
            .catch((error) => {
                console.error("Error while rejecting Sales Order: ", error.data);
            });
    }

    $scope.resetForm = () => {
        $scope.entity = {};
    };
});