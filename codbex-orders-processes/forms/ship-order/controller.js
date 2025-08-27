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

        const shipOrderUrl =
            "/services/ts/codbex-orders-processes/forms/ship-order/api/ShipOrderService.ts/shipOrder/" + taskId;
        const getOrderUrl =
            "/services/ts/codbex-orders-processes/forms/ship-order/api/ShipOrderService.ts/getOrder/" + taskId;

        $http.get(getOrderUrl)
            .then(response => {
                $scope.Order = response.data.Order;
                $scope.Customer = response.data.Customer;
                $scope.ShippingProviderOptions = response.data.ShippingProviders;
            }).catch((error) => {
                console.error("Error getting Sales Order data: ", error);
                Dialogs.showAlert({
                    title: 'Error while getting data',
                    message: "Error while getting Sales Order data",
                    type: AlertTypes.Error
                });
            });

        $scope.shipOrder = () => {
            $http.post(shipOrderUrl)
                .then(() => {
                    Dialogs.showAlert({
                        title: 'Successful shipped order',
                        message: "Sales order is shipped successfully!",
                        type: AlertTypes.Success
                    });
                })
                .catch((error) => {
                    console.error("Error while shipping Sales Order: ", error.data);
                    Dialogs.showAlert({
                        title: 'Unsuccessful shipped order',
                        message: "Sales order is shipped unsuccessfully!",
                        type: AlertTypes.Error
                    });
                });
        }

    });