import { Process } from "sdk/bpm";
import { sendMail } from "codbex-order-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const orderId = executionContext.getVariable('order');
const storeName = executionContext.getVariable('storeName');
const customerName = executionContext.getVariable('customerName');
const customerEmail = executionContext.getVariable('customerEmail');

const subject = `Отказана поръчка`;

const content = `
Уважаеми/а ${customerName},

Благодарим Ви, че направихте поръчка при нас. За съжаление, трябва да Ви уведомим, че поръчката Ви с номер #${orderId} не можа да бъде обработена в момента. Разбираме, че това може да е разочароващо, и искрено се извиняваме за причиненото неудобство.
Ако имате въпроси или желаете помощ при създаването на нова поръчка, не се колебайте да се свържете с нашия екип за поддръжка.
Благодарим Ви за проявения интерес към ${storeName} и се надяваме скоро отново да Ви обслужим.

С уважение,
Екипът на ${storeName} 
`;

sendMail(customerEmail, subject, content);
