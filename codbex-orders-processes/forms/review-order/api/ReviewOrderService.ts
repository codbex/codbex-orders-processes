import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { CustomerRepository as CustomerDao } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerRepository";

import { Controller, Post, Get } from "sdk/http";

@Controller
class ReviewOrderService {

    private readonly salesOrderDao;
    private readonly customerDao;
    private readonly salesOrderItemDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.salesOrderItemDao = new SalesOrderItemDao();
        this.customerDao = new CustomerDao();
    }

    @Get("/getOrder/:orderId")
    public salesOrderData(ctx: any) {

        const orderId = ctx.pathParameters.orderId;

        const salesOrders = this.salesOrderDao.findAll({
            $filter: {
                equals: {
                    Id: orderId
                }
            }
        });

        const customers = this.customerDao.findAll({
            $filter: {
                equals: {
                    Id: salesOrders[0].Customer
                }
            }
        });

        const orderItems = this.salesOrderItemDao.findAll({
            $filter: { equals: { SalesOrder: orderId } }
        });

        return {
            Order: salesOrders[0],
            Customer: customers[0],
            OrderItems: orderItems
        };
    }

    @Post("/approveOrder")
    public approveOrder(orderId: number) {

        const salesOrders = this.salesOrderDao.findAll({
            $filter: {
                equals: {
                    Id: orderId
                }
            }
        });

        salesOrders[0].Status = 2;

        this.salesOrderDao.update(salesOrders[0]);

        const orderItems = this.salesOrderItemDao.findAll({
            $filter: { equals: { SalesOrder: orderId } }
        });

        orderItems.forEach(item => {
            item.Status = 2;
            this.salesOrderItemDao.update(item);
        });

    }

    @Post("/rejectOrder")
    public rejectOrder(orderId: number) {

        const salesOrders = this.salesOrderDao.findAll({
            $filter: {
                equals: {
                    Id: orderId
                }
            }
        });

        salesOrders[0].Status = 3;

        this.salesOrderDao.update(salesOrders[0]);

        const orderItems = this.salesOrderItemDao.findAll({
            $filter: { equals: { SalesOrder: orderId } }
        });

        orderItems.forEach(item => {
            item.Status = 6;
            this.salesOrderItemDao.update(item);
        });

    }
}
