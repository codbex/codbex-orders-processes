import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const order = executionContext.getVariable('Order');
const customer = executionContext.getVariable('Customer');

const subject = `Успешно платена поръчка`;

const content = `
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
Уважаеми/а ${customer.Name},<br><br>

Плащането за Вашата поръчка с номер #${order.Number} беше успешно получено. Благодарим Ви, че избрахте ${order.StoreName}!<br>
Оценяваме доверието Ви и сме благодарни, че сте наш клиент.<br>
Ако имате въпроси относно поръчката си, не се колебайте да се свържете с нас.<br><br>

С най-добри пожелания,<br>
Екипът на ${order.StoreName}
</meta>
`;

sendMail(customer.Email, subject, content);
