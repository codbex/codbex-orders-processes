import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const reviewBody = executionContext.getVariable('reviewBody');

const subject = `Отказана поръчка`;

const content = `
Уважаеми/а ${reviewBody.Customer.Name},

Благодарим Ви, че направихте поръчка при нас. За съжаление, трябва да Ви уведомим, че поръчката Ви с номер #${reviewBody.Order.Number} не можа да бъде обработена в момента. Разбираме, че това може да е разочароващо, и искрено се извиняваме за причиненото неудобство.
Ако имате въпроси или желаете помощ при създаването на нова поръчка, не се колебайте да се свържете с нашия екип за поддръжка.
Благодарим Ви за проявения интерес към ${reviewBody.Order.StoreName} и се надяваме скоро отново да Ви обслужим.

С уважение,
Екипът на ${reviewBody.Order.StoreName} 
`;

sendMail(reviewBody.Customer.Email, subject, content);
