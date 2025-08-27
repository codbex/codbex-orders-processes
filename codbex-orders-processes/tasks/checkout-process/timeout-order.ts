import { Process } from "sdk/bpm";
import { SalesOrderStatus, SalesOrderItemStatus } from "../../types/Types"
import { SalesOrderRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";

const SalesOrderDao = new SalesOrderRepository();
const SalesOrderItemDao = new SalesOrderItemRepository();

const executionContext = Process.getExecutionContext();

const orderId = executionContext.getVariable('orderId');

const order = SalesOrderDao.findById(orderId);

order.Status = SalesOrderStatus.Expired;

SalesOrderDao.update(order);

const orderItems = SalesOrderItemDao.findAll({
    $filter: { equals: { SalesOrder: orderId } }
});

orderItems.forEach(item => {
    item.Status = SalesOrderItemStatus.Expired;
    SalesOrderItemDao.update(item);
});