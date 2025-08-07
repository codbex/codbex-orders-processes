import { Process } from "sdk/bpm";
import { sendMail } from "codbex-order-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const orderId = executionContext.getVariable('order');
const storeName = executionContext.getVariable('storeName');
const customerName = executionContext.getVariable('customerName');
const customerEmail = executionContext.getVariable('customerEmail');
const trackingLink = executionContext.getVariable('trackingLink');
const orderLink = executionContext.getVariable('orderLink');

const subject = `Пратката е изпратена успешно!`;

const content = `
Уважаеми/а ${customerName},

Радваме се да Ви уведомим, че поръчката Ви с номер #${orderId} беше успешно изпратена и е вече на път към Вас.
Можете да проследите движението на пратката си чрез следния линк: ${trackingLink}
Проследи пратката и номер на товарителница: ${orderLink}
Ако имате въпроси или нужда от съдействие, нашият екип за обслужване на клиенти е на разположение.
Благодарим Ви, че пазарувате с ${storeName}!

С уважение,
Екипът на ${storeName}
`;

sendMail(customerEmail, subject, content);
