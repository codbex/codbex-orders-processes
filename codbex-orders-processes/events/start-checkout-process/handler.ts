import { SalesOrderEntityEvent, SalesOrderUpdateEntityEvent, SalesOrderRepository } from 'codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository';
import { Process } from "sdk/bpm";

export function onMessage(message: string) {

    const salesOrderRepository = new SalesOrderRepository();
    const messageEvent: SalesOrderEntityEvent | SalesOrderUpdateEntityEvent = JSON.parse(message);

    if (messageEvent.operation == 'update') {

        const entity = messageEvent.entity;
        const salesOrder = salesOrderRepository.findById(entity.Id);

        if (entity.Status == 1 && salesOrder.Process == undefined) {

            const processId = Process.start('checkout-process', undefined, {
                'orderId': entity.Id,
                'status': "New",
                'delivery': entity.SentMethod == 2
            });

            salesOrder.Process = processId;
            salesOrderRepository.update(salesOrder);
        }
    }
}