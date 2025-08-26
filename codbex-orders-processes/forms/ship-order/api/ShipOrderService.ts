import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { ShippingProviderRepository as ShippingProviderDao } from "codbex-orders/gen/codbex-orders/dao/Settings/ShippingProviderRepository";

import { Controller, Post, Get } from "sdk/http";
import { Tasks } from 'sdk/bpm';

@Controller
class ShipOrderService {

    private readonly salesOrderDao;
    private readonly shippingDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.shippingDao = new ShippingProviderDao();
    }

    @Get("/getOrder/:taskId")
    public salesOrderData(_: any, ctx: any) {
        const taskId = ctx.pathParameters.taskId;

        const shippingProviders = this.shippingDao.findAll()
            .map((value) => ({
                value: value.Id,
                text: value.Name
            }));

        return {
            Order: Tasks.getVariable(taskId, "Order"),
            Customer: Tasks.getVariable(taskId, "Customer"),
            ShippingProviders: shippingProviders
        };
    }

    @Post("shipOrder/:taskId")
    public shipOrder(_: any, ctx: any, body: any) {

        const taskId = ctx.pathParameters.taskId;

        const orderId = Tasks.getVariable(taskId, "orderId");

        const salesOrder = this.salesOrderDao.findById(orderId);
        const currentSalesOrder = {
            ...salesOrder,
            Status: 7,
            ShippingProvider: body.shippingProvider,
            TrackingNumber: body.trackingNumber
        };

        this.salesOrderDao.update(currentSalesOrder);

        Tasks.complete(taskId);
    }
}