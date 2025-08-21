import { SentMethodRepository } from "codbex-methods/gen/codbex-methods/dao/Settings/SentMethodRepository";
import { CustomerAddressRepository } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerAddressRepository";
import { SalesOrderRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository, SalesOrderItemCreateEntity } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { CityRepository } from "codbex-cities/gen/codbex-cities/dao/Settings/CityRepository";
import { ProductRepository } from "codbex-products/gen/codbex-products/dao/Products/ProductRepository";

import { Controller, Post, response } from "sdk/http";
import { user } from 'sdk/security';
import { query, sql } from 'sdk/db';

@Controller
class ProcessService {

    private readonly sentMethodDao = new SentMethodRepository();
    private readonly customerAddressDao = new CustomerAddressRepository();
    private readonly salesOrderDao = new SalesOrderRepository();
    private readonly cityDao = new CityRepository();
    private readonly salesOrderItemDao = new SalesOrderItemRepository();
    private readonly productDao = new ProductRepository();


    @Post("/order")
    public startCheckout(entity: any) {

        const loggedCustomer = getCustomerByIdentifier(user.getName());

        const date = new Date();
        const dueDate = new Date(date);
        dueDate.setMonth(date.getMonth() + 1);

        const sentMethod = this.sentMethodDao.findAll({
            $filter: {
                equals: {
                    Name: entity.shippingType
                }
            }
        });

        const shippingAddress = this.resolveAddress(entity.shippingAddress, 1, this.cityDao, this.customerAddressDao);
        const billingAddress = this.resolveAddress(entity.billingAddress, 2, this.cityDao, this.customerAddressDao);

        const order = {
            Date: new Date(date.toISOString()),
            Due: new Date(dueDate.toISOString()),
            Customer: loggedCustomer,
            BillingAddress: billingAddress,
            ShippingAddress: shippingAddress,
            Currency: 2,
            Conditions: entity.notes,
            SentMethod: sentMethod[0].Id,
            Status: 1,
            Operator: 1,
            Company: 1,
            Store: 1
        };

        const savedOrder = this.salesOrderDao.create(order);

        const salesOrderItems: SalesOrderItemCreateEntity[] = [];

        entity.items.forEach((item: SalesOrderItemCreateEntity) => {
            const soItem: SalesOrderItemCreateEntity = this.createSalesOrderItems(item, this.productDao, savedOrder);

            salesOrderItems.push(soItem);

            this.salesOrderItemDao.create(soItem);
        });

        const fullOrder = {
            ...order,
            Id: savedOrder
        };

        response.setStatus(response.CREATED);
        return {
            fullOrder,
            salesOrderItems
        };
    }

    private createSalesOrderItems(item: any, productDao: ProductRepository, orderId: number) {

        const product = productDao.findAll({
            $filter: {
                equals: {
                    Id: item.productId
                }
            }
        });

        const salesOrderItem: SalesOrderItemCreateEntity =
        {
            Product: Number(item.productId),
            Quantity: item.quantity,
            Price: product[0].Price | 0,
            VATRate: 20,
            SalesOrder: orderId,
            UoM: product[0].BaseUnit,
            Status: 1
        }

        return salesOrderItem;
    }

    private resolveAddress(
        address: any,
        addressType: number,
        cityDao: any,
        customerAddressDao: any
    ): number {
        if (!address) return 0;

        if (address.id) {
            return address.id;
        }

        const {
            country,
            addressLine1,
            addressLine2,
            city,
            postalCode,
        } = address;

        const cityEntity = cityDao.findAll({
            $filter: {
                equals: {
                    Name: city
                }
            }
        });

        if (!cityEntity?.[0]?.Id) {
            throw new Error(`City not found: ${city}`);
        }

        const newAddress = customerAddressDao.create({
            Customer: getCustomerByIdentifier(user.getName()),
            Country: country,
            City: cityEntity[0].Id,
            AddressLine1: addressLine1,
            AddressLine2: addressLine2 ?? null,
            PostalCode: postalCode,
            AddressType: addressType,
            IsActive: false
        });

        return newAddress;
    }
}

function getCustomerByIdentifier(identifier: string) {

    const customerQuery = sql.getDialect()
        .select()
        .column('CUSTOMER_ID')
        .from('CODBEX_CUSTOMER')
        .where('CUSTOMER_IDENTIFIER = ?')
        .build();

    const queryResult = query.execute(customerQuery, [identifier]);

    return queryResult[0];
}
