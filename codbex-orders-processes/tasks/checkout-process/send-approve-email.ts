import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

// const orderId = executionContext.getVariable('order');
// const storeName = executionContext.getVariable('storeName');
// const customerName = executionContext.getVariable('customerName');
// const customerEmail = executionContext.getVariable('customerEmail');

const order = executionContext.getVariable('Order');
const customer = executionContext.getVariable('Customer');

const subject = `Одобрена поръчка`;

const content = `
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
Уважаеми/а ${customer.Name},<br><br>

С удоволствие Ви информираме, че поръчката Ви с номер #${order.Number} беше успешно одобрена и ще бъде подготвена за изпращане в най-кратък срок.<br>
Ще получите допълнително уведомление, когато пратката бъде изпратена, заедно с информация за проследяване.<br>
Ако имате въпроси относно поръчката си, не се колебайте да се свържете с нашия екип за обслужване на клиенти.<br>
Благодарим Ви, че избрахте ${order.StoreName}!<br><br>

С уважение,<br>
Екипът на ${order.StoreName}
</meta>
`;

sendMail(customer.Email, subject, content);
