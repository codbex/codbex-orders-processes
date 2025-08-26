import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { CustomerRepository as CustomerDao } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerRepository";
import { SalesOrderStatusRepository as OrderStatusDao } from "codbex-orders/gen/codbex-orders/dao/Settings/SalesOrderStatusRepository";
import { SentMethodRepository as SentMethodDao } from "codbex-methods/gen/codbex-methods/dao/Settings/SentMethodRepository";
import { ProductRepository as ProductDao } from "codbex-products/gen/codbex-products/dao/Products/ProductRepository";
import { UoMRepository as UoMDao } from "codbex-uoms/gen/codbex-uoms/dao/Settings/UoMRepository";
import { StoreRepository as StoreDao } from "codbex-inventory/gen/codbex-inventory/dao/Stores/StoreRepository";

import { Controller, Post, Get } from "sdk/http";
import { Tasks } from 'sdk/bpm';

@Controller
class ReviewOrderService {

    private readonly salesOrderDao;
    private readonly customerDao;
    private readonly salesOrderItemDao;
    private readonly orderStatusDao;
    private readonly sentMethodDao;
    private readonly producDao;
    private readonly uomDao;
    private readonly storeDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.salesOrderItemDao = new SalesOrderItemDao();
        this.customerDao = new CustomerDao();
        this.orderStatusDao = new OrderStatusDao();
        this.sentMethodDao = new SentMethodDao();
        this.producDao = new ProductDao();
        this.uomDao = new UoMDao();
        this.storeDao = new StoreDao();
    }

    @Get("/getOrder/:taskId")
    public salesOrderData(_: any, ctx: any) {

        try {
            const taskId = ctx.pathParameters.taskId;

            const orderId = Tasks.getVariable(taskId, "orderId");

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

            const fullOrderItems = orderItems.map(item => {
                return {
                    ...item,
                    ItemName: this.producDao.findById(item.Product).Name,
                    BaseUnitName: this.uomDao.findById(item.UoM).Name
                }
            })

            return {
                Order: {
                    ...salesOrders[0],
                    StatusName: this.orderStatusDao.findById(salesOrders[0].Status).Name,
                    SentMethodName: this.sentMethodDao.findById(salesOrders[0].SentMethod).Name,
                    StoreName: this.storeDao.findById(salesOrders[0].Store).Name
                },
                Customer: customers[0],
                OrderItems: fullOrderItems
            };
        }
        catch (e) {
            console.log(e);
        }
    }

    @Post("/approveOrder/:taskId")
    public approveOrder(body: any, ctx: any) {

        const taskId = ctx.pathParameters.taskId;

        const orderId = Tasks.getVariable(taskId, "orderId");

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
            item.Status = 2; // Approved
            this.salesOrderItemDao.update(item);
        });

        const scheduledTime = new Date(body.Order.Due);

        Tasks.setVariable(taskId, "Order", body.Order);
        Tasks.setVariable(taskId, "Delivery", body.Order.SentMethodName);
        Tasks.setVariable(taskId, "DueDate", scheduledTime.toISOString());
        Tasks.setVariable(taskId, "Customer", body.Customer);
        Tasks.setVariable(taskId, "OrderItems", body.OrderItems);
        Tasks.setVariable(taskId, "status", "Approved");

        Tasks.complete(taskId);
    }

    @Post("/rejectOrder/:taskId")
    public rejectOrder(body: any, ctx: any) {

        const taskId = ctx.pathParameters.taskId;

        const orderId = Tasks.getVariable(taskId, "orderId");

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
            item.Status = 6; // Rejected
            this.salesOrderItemDao.update(item);
        });

        Tasks.setVariable(taskId, "Order", body.Order);
        Tasks.setVariable(taskId, "Customer", body.Customer);
        Tasks.setVariable(taskId, "OrderItems", body.OrderItems);
        Tasks.setVariable(taskId, "Reason", body.Reason);
        Tasks.setVariable(taskId, "status", "Rejected");

        Tasks.complete(taskId);
    }
}
