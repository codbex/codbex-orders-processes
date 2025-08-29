import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const order = executionContext.getVariable('Order');
const customer = executionContext.getVariable('Customer');

const subject = `Поръчка #${order.Number} приключена със статус "timeout"`;

const content = `
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
Здравейте!<br><br>

Бихме искали да Ви уведомим, че поръчката с номер #${order.Number}, направена от клиент ${customer.Name}, беше маркирана със статус timeout, тъй като клиентът не я взе в рамките на допустимия срок.<br>
Съгласно нашите условия, поръчката се счита за приключена.
</meta>
`;

sendMail(order.StoreEmail, subject, content);
