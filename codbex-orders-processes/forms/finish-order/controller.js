angular.module('templateApp', ['blimpKit', 'platformView', 'platformDialogs'])
    .controller('templateController', ($scope, $http) => {

        const Dialogs = new DialogHub();

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
                Dialogs.showAlert({
                    title: 'Error while getting data',
                    message: "Error while getting Sales Order data",
                    type: AlertTypes.Error
                });
            });

        $scope.payOrder = () => {
            $http.post(payOrder)
                .then(() => {
                    Dialogs.showAlert({
                        title: 'Payment Successful',
                        message: "The sales order has been paid successfully.",
                        type: AlertTypes.Success
                    });
                })
                .catch((error) => {
                    console.error("Error while paying Sales Order: ", error.data);
                    Dialogs.showAlert({
                        title: 'Payment Error',
                        message: "There was an issue processing the sales order payment.",
                        type: AlertTypes.Error
                    });
                });
        }

        $scope.returnOrder = () => {
            $http.post(returnOrder)
                .then(() => {
                    Dialogs.showAlert({
                        title: 'Successful Return',
                        message: "The sales order has been returned successfully.",
                        type: AlertTypes.Success
                    });
                })
                .catch((error) => {
                    console.error("Error while returning Sales Order: ", error.data);
                    Dialogs.showAlert({
                        title: 'Return Error',
                        message: "There was an issue processing the sales order return.",
                        type: AlertTypes.Error
                    });
                });
        }

    });