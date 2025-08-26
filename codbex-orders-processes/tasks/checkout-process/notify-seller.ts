import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const orderId = executionContext.getVariable('order');
const sellerName = executionContext.getVariable('sellerName');
const customerName = executionContext.getVariable('customerName');
const sellerEmail = executionContext.getVariable('sellerEmail');

const subject = `Поръчка #${orderId} приключена със статус "timeout"`;

const content = `
Уважаеми/а ${sellerName},

Бихме искали да Ви уведомим, че поръчката с номер #${orderId}, направена от клиент ${customerName}, беше маркирана със статус timeout, тъй като клиентът не я взе в рамките на допустимия срок.
Съгласно нашите условия, поръчката се счита за приключена.
`;

// sendMail(sellerEmail, subject, content);
