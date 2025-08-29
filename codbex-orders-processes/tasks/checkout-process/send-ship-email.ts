import { Process } from "sdk/bpm";
import { sendMail } from "codbex-orders-processes/utils/mail-utils";

const executionContext = Process.getExecutionContext();

const order = executionContext.getVariable('Order');
const customer = executionContext.getVariable('Customer');
const shippingProviderName = executionContext.getVariable('ShippingProviderName');
const trackingNumber = executionContext.getVariable('TrackingNumber');

const subject = `Пратката е изпратена успешно!`;

const content = `
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
Уважаеми/а ${customer.Name},<br><br>

Радваме се да Ви уведомим, че поръчката Ви с номер #${order.Number} беше успешно изпратена и е вече на път към Вас.<br>
Пратката е изпратена чрез услугите на куриерска фирма ${shippingProviderName}<br>
Можете да проследите движението на пратката си чрез следния номер: ${trackingNumber}.<br>
Ако имате въпроси или нужда от съдействие, нашият екип за обслужване на клиенти е на разположение.<br>
Благодарим Ви, че пазарувате с ${order.StoreName}!<br><br>

С уважение,<br>
Екипът на ${order.StoreName}
</meta>
`;

sendMail(customer.Email, subject, content);
