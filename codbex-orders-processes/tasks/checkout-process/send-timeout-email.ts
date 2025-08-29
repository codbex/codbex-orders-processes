import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const order = executionContext.getVariable('Order');
const customer = executionContext.getVariable('Customer');

const subject = `Поръчка #${order.Number} приключена със статус "timeout"`;

const content = `
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
Уважаеми/а ${customer.Name},<br><br>

Бихме искали да Ви уведомим, че поръчката Ви с номер #${order.Number} беше прекратена, тъй като не беше взета в рамките на допустимия срок.<br>
Съжаляваме за неудобството и сме на разположение, ако желаете да направим повторно изпращане или имате въпроси относно следващите стъпки.<br>
Можете да се свържете с нашия екип, за да уточним как да процедираме с поръчката Ви.<br><br>

Благодарим Ви за разбирането и интереса към ${order.StoreName}.<br><br>

С уважение,<br>
Екипът на ${order.StoreName}
</meta>
`;

sendMail(customer.Email, subject, content);
