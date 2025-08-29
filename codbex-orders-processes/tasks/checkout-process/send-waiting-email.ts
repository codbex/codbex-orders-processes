import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const order = executionContext.getVariable('Order');
const customer = executionContext.getVariable('Customer');

const subject = `Поръчка #${order.Number} е готова за получаване`;

const content = `
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
Уважаеми/а ${customer.Name},<br><br>

Бихме искали да Ви уведомим, че поръчката Ви с номер #${order.Number} е готова и Ви очаква на адреса на нашия магазин:<br><br>

${order.StoreAddress}<br><br>

Молим Ви да я вземете в рамките на допустимия срок, за да избегнем автоматичното ѝ анулиране.<br>
Ако имате нужда от допълнителна информация или съдействие, не се колебайте да се свържете с нас.<br><br>

Благодарим Ви, че избрахте ${order.StoreName}!<br><br>

С уважение,<br>
 Екипът на ${order.StoreName}
 </meta>
`;

sendMail(customer.Email, subject, content);
