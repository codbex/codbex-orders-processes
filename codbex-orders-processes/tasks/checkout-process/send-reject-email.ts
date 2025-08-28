import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const order = executionContext.getVariable('Order');
const customer = executionContext.getVariable('Customer');
const reason = executionContext.getVariable("Reason");

const subject = `Отказана поръчка`;

const content = `
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
Уважаеми/а ${customer.Name},<br><br>

Благодарим Ви, че направихте поръчка при нас. За съжаление, трябва да Ви уведомим, че поръчката Ви с номер #${order.Number} не можа да бъде обработена в момента поради следните причини:<br><br>

${reason}<br><br>

Разбираме, че това може да е разочароващо, и искрено се извиняваме за причиненото неудобство.<br>
Ако имате въпроси или желаете помощ при създаването на нова поръчка, не се колебайте да се свържете с нашия екип за поддръжка.<br>
Благодарим Ви за проявения интерес към ${order.StoreName} и се надяваме скоро отново да Ви обслужим.<br><br>

С уважение,<br>
Екипът на ${order.StoreName}
</meta>
`;

sendMail(customer.Email, subject, content);
