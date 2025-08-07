import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { CustomerRepository as CustomerDao } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerRepository";

import { Controller, Get, Post, response } from "sdk/http";

@Controller
class CancelOrderService {

    private readonly salesOrderDao;
    private readonly salesOrderItemDao;
    private readonly customerDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.customerDao = new CustomerDao();
        this.salesOrderItemDao = new SalesOrderItemDao();
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

        return {
            Order: salesOrders[0],
            Customer: customers[0]
        };
    }

    @Post("/cancelOrder")
    public cancelOrder(body: any) {

        const salesOrders = this.salesOrderDao.findAll({
            $filter: {
                equals: {
                    Id: body.Id
                }
            }
        });

        try {

            if (!body.hasOwnProperty("Reason")) {
                response.setStatus(response.BAD_REQUEST);
                return;
            }

            salesOrders[0].Conditions = body.Conditions;
            salesOrders[0].Status = body.Status;

            this.salesOrderDao.update(salesOrders[0]);

            const orderItems = this.salesOrderItemDao.findAll({
                $filter: { equals: { SalesOrder: body.Id } }
            });

            orderItems.forEach(item => {
                item.Status = 5;
                this.salesOrderItemDao.update(item);
            });

        } catch (e: any) {
            response.setStatus(response.BAD_REQUEST);
            return { error: e.message };
        }
    }

}

