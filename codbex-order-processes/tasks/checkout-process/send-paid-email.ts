import { Process } from "sdk/bpm";
import { sendMail } from "codbex-order-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const orderId = executionContext.getVariable('order');
const storeName = executionContext.getVariable('storeName');
const customerName = executionContext.getVariable('customerName');
const customerEmail = executionContext.getVariable('customerEmail');

const subject = `Успешно платена поръчка`;

const content = `
Уважаеми/а ${customerName},

Плащането за Вашата поръчка с номер #${orderId} беше успешно получено. Благодарим Ви, че избрахте ${storeName}!
Оценяваме доверието Ви и сме благодарни, че сте наш клиент.
Ако имате въпроси относно поръчката си, не се колебайте да се свържете с нас.

С най-добри пожелания,
Екипът на ${storeName} 
`;

sendMail(customerEmail, subject, content);
