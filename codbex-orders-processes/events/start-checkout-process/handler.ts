import { SalesOrderEntityEvent, SalesOrderUpdateEntityEvent } from 'codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository';
import { Process } from "sdk/bpm";

export function onMessage(message: string) {

    const messageEvent: SalesOrderEntityEvent | SalesOrderUpdateEntityEvent = JSON.parse(message);

    if (messageEvent.operation == 'update') {
        const entity = messageEvent.entity;

        if (entity.Status == 1) {
            Process.start('checkout-process', undefined, {
                'orderId': entity.Id,
                'status': "New"
            });

        }
    }
}