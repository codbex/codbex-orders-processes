angular.module('templateApp', ['blimpKit', 'platformView']).controller('templateController', ($scope, $http) => {

    $scope.entity = {};
    $scope.forms = {
        details: {},
    };

    const orderId = 1;

    const updateOrderUrl =
        "/services/ts/codbex-order-processes/forms/cancel-order/api/CancelOrderService.ts/cancelOrder";
    const getOrderUrl =
        "/services/ts/codbex-sample-hyperion-employee-onboarding/forms/NewHireDetails/api/NewHireDetailsFormService.ts/getOrder/" + orderId;

    $http.get(getOrderUrl)
        .then(response => {
            $scope.Order = response.data.Order;
            $scope.Customer = response.data.Customer;
        })
        .catch((error) => {
            console.error("Error getting departments data: ", error);
            $scope.resetForm();
        });

    $scope.cancelOrder = () => {

        const orderBody = {
            Id: orderId,
            Conditions: $scope.entity.Reason,
            Status: 9
        }

        $http.post(updateOrderUrl, orderBody)
            .then(response => {
                if (response.status == 201) {
                    $scope.resetForm();
                }
                else {
                    console.error("Error canceling Sales Order: ", response.data);
                }
            })
            .catch((error) => {
                console.error("Error canceling Sales Order: ", error.data);
                $scope.resetForm();
            });

    }

    $scope.resetForm = () => {
        $scope.entity = {};
    };

});