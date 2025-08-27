angular.module('templateApp', ['blimpKit', 'platformView', 'platformDialogs'])
    .controller('templateController', ($scope, $http) => {

        const Dialogs = new DialogHub();

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
                Dialogs.showAlert({
                    title: 'Error while getting data',
                    message: "Error while getting Sales Order data",
                    type: AlertTypes.Error
                });
            });

        $scope.approveOrder = () => {
            $http.post(approveOrderUrl, {
                Order: $scope.Order,
                Customer: $scope.Customer,
                OrderItems: $scope.OrderItems
            })
                .then(() => {
                    Dialogs.showAlert({
                        title: 'Successful Approve',
                        message: "The sales order has been approved successfully.",
                        type: AlertTypes.Success
                    });
                })
                .catch((error) => {
                    console.error("Error while approving Sales Order: ", error.data);
                    Dialogs.showAlert({
                        title: 'Approve Error',
                        message: "There was an issue processing the sales order approvement.",
                        type: AlertTypes.Error
                    });
                });
        }

        $scope.rejectOrder = () => {
            $http.post(rejectOrderUrl, {
                Order: $scope.Order,
                Customer: $scope.Customer,
                OrderItems: $scope.OrderItems,
                Reason: $scope.entity.Reason
            })
                .then(() => {
                    Dialogs.showAlert({
                        title: 'Successful Reject',
                        message: "The sales order has been rejected successfully.",
                        type: AlertTypes.Success
                    });
                })
                .catch((error) => {
                    console.error("Error while rejecting Sales Order: ", error.data);
                    Dialogs.showAlert({
                        title: 'Reject Error',
                        message: "There was an issue processing the sales order rejection.",
                        type: AlertTypes.Error
                    });
                });

        }
    });