import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";

import { Controller, Post, response } from "sdk/http";

@Controller
class FinishOrderService {

    private readonly salesOrderDao;
    private readonly salesOrderItemDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.salesOrderItemDao = new SalesOrderItemDao();
    }

    @Post("/finishOrder")
    public finishOrder(orderId: number) {

        const salesOrders = this.salesOrderDao.findAll({
            $filter: {
                equals: {
                    Id: orderId
                }
            }
        });

        salesOrders[0].Status = 10;

        this.salesOrderDao.update(salesOrders[0]);

        const orderItems = this.salesOrderItemDao.findAll({
            $filter: { equals: { SalesOrder: orderId } }
        });

        orderItems.forEach(item => {
            item.Status = 4;
            this.salesOrderItemDao.update(item);
        });

    } catch(e: any) {
        response.setStatus(response.BAD_REQUEST);
        return { error: e.message };
    }
}