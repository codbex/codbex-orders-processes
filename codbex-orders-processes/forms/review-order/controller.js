angular.module('templateApp', ['blimpKit', 'platformView']).controller('templateController', ($scope, $http) => {

    $scope.entity = {};
    $scope.forms = {
        details: {},
    };

    const orderId = 1;

    const approveOrderUrl =
        "/services/ts/codbex-order-processes/forms/review-order/api/ReviewOrderService.ts/approveOrder";
    const rejectOrderUrl =
        "/services/ts/codbex-order-processes/forms/review-order/api/ReviewOrderService.ts/rejectOrder";
    const getOrderUrl =
        "/services/ts/codbex-order-processes/forms/review-order/api/ReviewOrderService.ts/getOrder/" + orderId;

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
        $http.post(approveOrderUrl, orderId)
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
        $http.post(rejectOrderUrl, orderId)
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