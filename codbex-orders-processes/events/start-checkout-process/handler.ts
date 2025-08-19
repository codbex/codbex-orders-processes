import { SalesOrderEntityEvent } from 'codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository';
import { Process } from "sdk/bpm";

export const trigger = (event: SalesOrderEntityEvent) => {
    if (event.operation === "create") {
        const entity = event.entity;

        Process.start('checkout-process', undefined, { 'orderId': entity.Id });
    }
}