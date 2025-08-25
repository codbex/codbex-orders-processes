import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";

import { Controller, Post } from "sdk/http";
import { Tasks } from 'sdk/bpm';

@Controller
class FinishOrderService {

    private readonly salesOrderDao;
    private readonly salesOrderItemDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.salesOrderItemDao = new SalesOrderItemDao();
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

        salesOrders[0].Status = 6;

        this.salesOrderDao.update(salesOrders[0]);

        const orderItems = this.salesOrderItemDao.findAll({
            $filter: { equals: { SalesOrder: orderId } }
        });

        orderItems.forEach(item => {
            item.Status = 4;
            this.salesOrderItemDao.update(item);
        });

        Tasks.setVariable(taskId, "status", "Paid");
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

        salesOrders[0].Status = 8;

        this.salesOrderDao.update(salesOrders[0]);

        const orderItems = this.salesOrderItemDao.findAll({
            $filter: { equals: { SalesOrder: orderId } }
        });

        orderItems.forEach(item => {
            item.Status = 7;
            this.salesOrderItemDao.update(item);
        });

        Tasks.setVariable(taskId, "status", "Returned");
        Tasks.complete(taskId);
    }

}