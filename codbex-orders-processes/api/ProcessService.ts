import { SentMethodRepository } from "codbex-methods/gen/codbex-methods/dao/Settings/SentMethodRepository";
import { CustomerAddressRepository } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerAddressRepository";
import { SalesOrderRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository, SalesOrderItemCreateEntity } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";

import * as utils from "./ProcessUtilsService";
import { SalesOrderStatus } from '../types/Types';
import { Controller, Post, response } from "sdk/http";
import { user } from "sdk/security";


@Controller
class ProcessService {

    private readonly sentMethodDao = new SentMethodRepository();
    private readonly customerAddressDao = new CustomerAddressRepository();
    private readonly salesOrderDao = new SalesOrderRepository();
    private readonly salesOrderItemDao = new SalesOrderItemRepository();

    @Post("/order")
    public startCheckout(body: any) {
        try {
            const loggedCustomer = utils.getCustomerByIdentifier(user.getName());

            if (!loggedCustomer) {
                response.setStatus(response.BAD_REQUEST);
                return utils.createErrorResponse(
                    response.BAD_REQUEST,
                    'Invalid Customer',
                    'No customer found with the given identifier'
                );
            }
            var Timestamp = Java.type("java.sql.Timestamp");
            
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + 1);

            const dueDateSql = new Timestamp(dueDateJs.getTime());

            const sentMethod = this.sentMethodDao.findAll({
                $filter: {
                    equals: {
                        Name: body.shippingType
                    }
                }
            });

            if (!sentMethod || sentMethod.length < 1) {
                response.setStatus(response.UNPROCESSABLE_CONTENT);
                return utils.createErrorResponse(
                    response.UNPROCESSABLE_CONTENT,
                    'Invalid Shipping Method',
                    'No sent method with that name exists!'
                );
            }

            const shippingAddress = utils.resolveAddress(body.shippingAddress, 1);
            const billingAddress = utils.resolveAddress(body.billingAddress, 2);

            const savedOrder = this.salesOrderDao.create({
                Due: dueDateSql,
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

            if (!savedOrder) {
                response.setStatus(response.INTERNAL_SERVER_ERROR);
                return utils.createErrorResponse(
                    response.INTERNAL_SERVER_ERROR,
                    'Order Creation Failed',
                    'Unable to create sales order'
                );
            }


            const salesOrderItems: SalesOrderItemCreateEntity[] = [];

            body.items.forEach((item: SalesOrderItemCreateEntity) => {
                const soItem: SalesOrderItemCreateEntity = utils.createSalesOrderItems(item, savedOrder);

                salesOrderItems.push(soItem);

                this.salesOrderItemDao.create(soItem);
            });

            const newOrder = this.salesOrderDao.findById(savedOrder);

            if (!newOrder) {
                response.setStatus(response.INTERNAL_SERVER_ERROR);
                return utils.createErrorResponse(
                    response.INTERNAL_SERVER_ERROR,
                    'Order Retrieval Failed',
                    'Unable to retrieve created sales order'
                );
            }

            if (newOrder) {
                newOrder.Status = SalesOrderStatus.New
                this.salesOrderDao.update(newOrder);

                const billingAddress = this.customerAddressDao.findById(newOrder.BillingAddress);
                const shippingAddress = this.customerAddressDao.findById(newOrder.ShippingAddress);

                let mappedAddresses;
                if (billingAddress && shippingAddress) {
                    mappedAddresses = utils.mapAddresses([billingAddress, shippingAddress]);
                }

                return {
                    id: String(newOrder.Id),
                    paymentMethod: "Cash",
                    shippingType: utils.getSentMethodName(newOrder.SentMethod),
                    shippingAddress: mappedAddresses?.shippingAddress?.[0] ?? undefined,
                    billingAddress: mappedAddresses?.billingAddress[0] ?? undefined,
                    creationDate: newOrder.Date,
                    totalAmount: {
                        amount: newOrder.Total,
                        currency: utils.getCurrencyCode(newOrder.Currency)
                    },
                    status: utils.getSalesOrderStatus(newOrder.Status),
                    notes: newOrder.Conditions,
                    items: utils.getSalesOrderItems(savedOrder)
                }
            }
        } catch (error: any) {
            response.setStatus(response.INTERNAL_SERVER_ERROR);
            return utils.createErrorResponse(
                response.INTERNAL_SERVER_ERROR,
                'Something went wrong',
                error.message || error
            );
        }
    }
}
