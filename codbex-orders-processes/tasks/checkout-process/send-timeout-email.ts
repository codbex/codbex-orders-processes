import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const orderId = executionContext.getVariable('order');
const storeName = executionContext.getVariable('storeName');
const customerName = executionContext.getVariable('customerName');
const customerEmail = executionContext.getVariable('customerEmail');

const subject = `Поръчка #${orderId} приключена със статус "timeout"`;

const content = `
Уважаеми/а ${customerName},

Бихме искали да Ви уведомим, че поръчката Ви с номер #${orderId} беше върната обратно към нас, тъй като не беше взета в рамките на допустимия срок.
Съжаляваме за неудобството и сме на разположение, ако желаете да направим повторно изпращане или имате въпроси относно следващите стъпки.
Можете да се свържете с нашия екип, за да уточним как да процедираме с поръчката Ви.

Благодарим Ви за разбирането и интереса към ${storeName}.

С уважение,
Екипът на ${storeName}
`;

// sendMail(customerEmail, subject, content);
