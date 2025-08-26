import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { ShippingProviderRepository as ShippingProviderDao } from "codbex-orders/gen/codbex-orders/dao/Settings/ShippingProviderRepository";
import { CustomerRepository as CustomerDao } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerRepository";

import { Controller, Post, Get } from "sdk/http";
import { Tasks } from 'sdk/bpm';

@Controller
class ShipOrderService {

    private readonly salesOrderDao;
    private readonly customerDao;
    private readonly shippingDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.customerDao = new CustomerDao();
        this.shippingDao = new ShippingProviderDao();
    }

    @Get("/getOrder/:taskId")
    public salesOrderData(_: any, ctx: any) {

        const taskId = ctx.pathParameters.taskId;

        const orderId = Tasks.getVariable(taskId, "orderId");

        const salesOrder = this.salesOrderDao.findById(orderId);

        const customers = this.customerDao.findAll({
            $filter: {
                equals: {
                    Id: salesOrder.Customer
                }
            }
        });

        const shippingProviders = this.shippingDao.findAll()
            .map((value) => ({
                value: value.Id,
                text: value.Name
            }));

        return {
            Order: salesOrder,
            Customer: customers[0],
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
        Tasks.setVariable(taskId, "status", "Shipped");
    }
}