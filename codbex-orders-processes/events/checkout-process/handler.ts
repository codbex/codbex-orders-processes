import { SalesOrderEntityEvent, SalesOrderUpdateEntityEvent, SalesOrderRepository } from 'codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository';
import { Process } from "sdk/bpm";
import { SalesOrderStatus } from '../../types/Types';


export function onMessage(message: string) {
    try {

        const salesOrderRepository = new SalesOrderRepository();
        const messageEvent: SalesOrderEntityEvent | SalesOrderUpdateEntityEvent = JSON.parse(message);

        if (messageEvent.operation == 'update') {

            const entity = messageEvent.entity;
            const salesOrder = salesOrderRepository.findById(entity.Id);

            if (entity.Status == SalesOrderStatus.New && salesOrder.Process == undefined) {

                const processId = Process.start('checkout-process', undefined, {
                    'orderId': entity.Id,
                    "Order": entity
                });

                salesOrder.Process = processId;
                salesOrderRepository.update(salesOrder);
            }
            else {
                if (entity.Status == SalesOrderStatus.Canceled) {
                    console.log("Cancel entity: ", JSON.stringify(entity));
                    Process.correlateMessageEvent(entity.Process ?? "1", "cancel-process", new Map<string, any>([["event", true]]));
                }
            }
        }
    }
    catch (e) {
        console.log(e);
    }
}