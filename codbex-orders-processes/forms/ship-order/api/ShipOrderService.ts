import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { ShippingProviderRepository as ShippingProviderDao } from "codbex-orders/gen/codbex-orders/dao/Settings/ShippingProviderRepository";

import { Controller, Post, Get } from "sdk/http";
import { Tasks } from 'sdk/bpm';
import { SalesOrderStatus } from '../../../types/Types';

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
    public shipOrder(body: any, ctx: any) {

        const taskId = ctx.pathParameters.taskId;

        const orderId = Tasks.getVariable(taskId, "orderId");

        const salesOrder = this.salesOrderDao.findById(orderId);
        const currentSalesOrder = {
            ...salesOrder,
            Status: SalesOrderStatus.Shipped,
            ShippingProvider: body.ShippingProvider,
            TrackingNumber: body.TrackingNumber
        };

        console.log("Shipping PR: ", body.ShippingProvider);

        this.salesOrderDao.update(currentSalesOrder);


        const shippingProviderName = this.shippingDao.findById(body.ShippingProvider).Name;

        Tasks.setVariable(taskId, "ShippingProviderName", shippingProviderName);
        Tasks.setVariable(taskId, "TrackingNumber", body.TrackingNumber);
        Tasks.complete(taskId);
    }
}