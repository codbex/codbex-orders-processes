import { SalesOrderEntityEvent, SalesOrderUpdateEntityEvent } from 'codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository';
import { Process } from "sdk/bpm";

export function onMessage(message: string) {

    const messageEvent: SalesOrderEntityEvent | SalesOrderUpdateEntityEvent = JSON.parse(message);

    if (messageEvent.operation == 'update') {
        const entity = messageEvent.entity;

        if (entity.Status == 9) {
            Process.correlateMessageEvent(entity.Process ?? "1", "cancel-order", new Map<string, any>([["event", true]]));
        }
    }
}