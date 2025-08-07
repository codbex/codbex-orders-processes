import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const orderId = executionContext.getVariable('order');
const storeName = executionContext.getVariable('storeName');
const customerName = executionContext.getVariable('customerName');
const customerEmail = executionContext.getVariable('customerEmail');
const storeAddress = executionContext.getVariable('storeAddress');

const subject = `Поръчка #${orderId} е готова за получаване`;

const content = `
Уважаеми/а ${customerName},

Бихме искали да Ви уведомим, че поръчката Ви с номер #${orderId} е готова и Ви очаква на адреса на нашия магазин:
${storeAddress}
Молим Ви да я вземете в рамките на допустимия срок, за да избегнем автоматичното ѝ анулиране.
Ако имате нужда от допълнителна информация или съдействие, не се колебайте да се свържете с нас.

Благодарим Ви, че избрахте ${storeName}!

С уважение,
 Екипът на ${storeName}
`;

sendMail(customerEmail, subject, content);
