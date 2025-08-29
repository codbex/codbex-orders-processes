import { SentMethodRepository } from "codbex-methods/gen/codbex-methods/dao/Settings/SentMethodRepository";
import { CustomerAddressRepository } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerAddressRepository";
import { SalesOrderRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository, SalesOrderItemCreateEntity } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { CityRepository } from "codbex-cities/gen/codbex-cities/dao/Settings/CityRepository";

import * as utils from "./ProcessUtilsService";
import { SalesOrderStatus } from '../types/Types';
import { Controller, Post, response } from "sdk/http";
import { user } from "sdk/security";


@Controller
class ProcessService {

    private readonly sentMethodDao = new SentMethodRepository();
    private readonly customerAddressDao = new CustomerAddressRepository();
    private readonly salesOrderDao = new SalesOrderRepository();
    private readonly cityDao = new CityRepository();
    private readonly salesOrderItemDao = new SalesOrderItemRepository();

    @Post("/order")
    public startCheckout(body: any) {

        const loggedCustomer = utils.getCustomerByIdentifier(user.getName());

        const date = new Date();
        const dueDate = new Date(date);
        dueDate.setMonth(date.getMonth() + 1);

        const sentMethod = this.sentMethodDao.findAll({
            $filter: {
                equals: {
                    Name: body.shippingType
                }
            }
        });

        if (sentMethod.length < 1) {
            response.setStatus(response.BAD_REQUEST);
            return "No sent method with that name exists!";
        }

        const shippingAddress = utils.resolveAddress(body.shippingAddress, 1, this.cityDao, this.customerAddressDao);
        const billingAddress = utils.resolveAddress(body.billingAddress, 2, this.cityDao, this.customerAddressDao);

        const savedOrder = this.salesOrderDao.create({
            Date: new Date(date.toISOString()),
            Due: new Date(dueDate.toISOString()),
            Customer: loggedCustomer,
            BillingAddress: billingAddress,
            ShippingAddress: shippingAddress,
            Currency: 2,
            Conditions: body.notes,
            SentMethod: sentMethod[0].Id,
            Status: SalesOrderStatus.Initial,
            Operator: 1,
            Company: 1,
            Store: 1
        });

        const salesOrderItems: SalesOrderItemCreateEntity[] = [];

        body.items.forEach((item: SalesOrderItemCreateEntity) => {
            const soItem: SalesOrderItemCreateEntity = utils.createSalesOrderItems(item, savedOrder);

            salesOrderItems.push(soItem);

            this.salesOrderItemDao.create(soItem);
        });

        const newOrder = this.salesOrderDao.findById(savedOrder);

        if (newOrder) {
            newOrder.Status = SalesOrderStatus.New
            this.salesOrderDao.update(newOrder);

            response.setStatus(response.CREATED);
            return {
                newOrder,
                salesOrderItems
            };
        }
    }
}
