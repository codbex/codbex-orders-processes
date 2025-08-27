import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";

import { Controller, Post, Get } from "sdk/http";
import { Tasks } from 'sdk/bpm';
import { SalesOrderStatus, SalesOrderItemStatus } from '../../../types/Types';

@Controller
class FinishOrderService {

    private readonly salesOrderDao;
    private readonly salesOrderItemDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.salesOrderItemDao = new SalesOrderItemDao();
    }

    @Get("/getOrder/:taskId")
    public salesOrderData(_: any, ctx: any) {
        const taskId = ctx.pathParameters.taskId;

        return {
            Order: Tasks.getVariable(taskId, "Order"),
            Customer: Tasks.getVariable(taskId, "Customer")
        };
    }

    @Post("/payOrder/:taskId")
    public payOrder(_: any, ctx: any) {

        const taskId = ctx.pathParameters.taskId;

        const orderId = Tasks.getVariable(taskId, "orderId");

        const salesOrders = this.salesOrderDao.findAll({
            $filter: {
                equals: {
                    Id: orderId
                }
            }
        });

        salesOrders[0].Status = SalesOrderStatus.Paid;

        this.salesOrderDao.update(salesOrders[0]);

        const orderItems = this.salesOrderItemDao.findAll({
            $filter: { equals: { SalesOrder: orderId } }
        });

        orderItems.forEach(item => {
            item.Status = SalesOrderItemStatus.Delivered;
            this.salesOrderItemDao.update(item);
        });

        Tasks.setVariable(taskId, "IsReturned", "false");
        Tasks.complete(taskId);
    }

    @Post("/returnOrder/:taskId")
    public returnOrder(_: any, ctx: any) {

        const taskId = ctx.pathParameters.taskId;

        const orderId = Tasks.getVariable(taskId, "orderId");

        const salesOrders = this.salesOrderDao.findAll({
            $filter: {
                equals: {
                    Id: orderId
                }
            }
        });

        salesOrders[0].Status = SalesOrderStatus.Returned;

        this.salesOrderDao.update(salesOrders[0]);

        const orderItems = this.salesOrderItemDao.findAll({
            $filter: { equals: { SalesOrder: orderId } }
        });

        orderItems.forEach(item => {
            item.Status = SalesOrderItemStatus.Returned;
            this.salesOrderItemDao.update(item);
        });

        Tasks.setVariable(taskId, "IsReturned", "true");
        Tasks.complete(taskId);
    }

}