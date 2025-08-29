import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const order = executionContext.getVariable('Order');
const customer = executionContext.getVariable('Customer');

const subject = `Потвърждение за отказана поръчка #${order.Number}`;

const content = `
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
Уважаеми/а ${customer.Name},<br><br>

Бихме искали да потвърдим, че Вашата поръчка с номер #${order.Number} беше успешно отказана по Ваше желание.<br>
Ако това е било направено погрешка или желаете да направите нова поръчка, винаги сте добре дошли в ${order.StoreName}.<br>
Благодарим Ви, че избрахте нас!<br><br>

С уважение,<br>
Екипът на ${order.StoreName}
</meta>
`;

sendMail(customer.Email, subject, content);
