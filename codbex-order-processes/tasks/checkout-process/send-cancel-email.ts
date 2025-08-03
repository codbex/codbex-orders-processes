import { Process } from "sdk/bpm";
import { sendMail } from "codbex-order-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const orderId = executionContext.getVariable('order');
const storeName = executionContext.getVariable('storeName');
const customerName = executionContext.getVariable('customerName');
const customerEmail = executionContext.getVariable('customerEmail');

const subject = `Потвърждение за отказана поръчка #${orderId}`;

const content = `
Уважаеми/а ${customerName},

Бихме искали да потвърдим, че Вашата поръчка с номер #${orderId} беше успешно отказана по Ваше желание.
Ако това е било направено погрешка или желаете да направите нова поръчка, винаги сте добре дошли в ${storeName}.
Благодарим Ви, че избрахте нас!

С уважение,
Екипът на ${storeName}
`;

sendMail(customerEmail, subject, content);
