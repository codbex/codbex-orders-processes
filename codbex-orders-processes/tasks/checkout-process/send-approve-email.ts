import { Process } from "sdk/bpm";
import { sendMail } from "codbex-order-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const orderId = executionContext.getVariable('order');
const storeName = executionContext.getVariable('storeName');
const customerName = executionContext.getVariable('customerName');
const customerEmail = executionContext.getVariable('customerEmail');

const subject = `Одобрена поръчка`;

const content = `
Уважаеми/а ${customerName},

С удоволствие Ви информираме, че поръчката Ви с номер #${orderId} беше успешно одобрена и ще бъде подготвена за изпращане в най-кратък срок.
Ще получите допълнително уведомление, когато пратката бъде изпратена, заедно с информация за проследяване.
Ако имате въпроси относно поръчката си, не се колебайте да се свържете с нашия екип за обслужване на клиенти.
Благодарим Ви, че избрахте ${storeName}!

С уважение,
Екипът на ${storeName}
`;

sendMail(customerEmail, subject, content);
