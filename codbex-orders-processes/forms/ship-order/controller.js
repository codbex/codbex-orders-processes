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
            })
            .catch((error) => {
                console.error("Error getting Sales Order data: ", error);
                Dialogs.showAlert({
                    title: 'Error while getting data',
                    message: "Error while getting Sales Order data",
                    type: AlertTypes.Error
                });
            });

        $scope.shipOrder = () => {
            console.log("Entity: ", JSON.stringify($scope.entity));
            console.log("ship: ", $scope.entity.shippingProvider);
            console.log("track: ", $scope.entity.trackingNumber);
            $http.post(shipOrderUrl, {
                ShippingProvider: $scope.entity.shippingProvider,
                TrackingNumber: $scope.entity.trackingNumber
            })
                .then(() => {
                    Dialogs.showAlert({
                        title: 'Successful Ship',
                        message: "The sales order has been shipped successfully.",
                        type: AlertTypes.Success
                    });
                })
                .catch((error) => {
                    console.error("Error while shipping Sales Order: ", error.data);
                    Dialogs.showAlert({
                        title: 'Ship Error',
                        message: "There was an issue processing the sales order shipping.",
                        type: AlertTypes.Error
                    });
                });
        }

    });