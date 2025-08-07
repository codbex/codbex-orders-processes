import { SentMethodRepository } from "codbex-methods/gen/codbex-methods/dao/Settings/SentMethodRepository";
import { CustomerAddressRepository } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerAddressRepository";
import { SalesOrderRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository, SalesOrderItemEntity, SalesOrderItemCreateEntity } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { CityRepository } from "codbex-cities/gen/codbex-cities/dao/Settings/CityRepository";
import { ProductRepository } from "codbex-products/gen/codbex-products/dao/Products/ProductRepository";

import { Process } from 'sdk/bpm';

const orderData = Process.getExecutionContext().getVariable('orderData');

const sentMethodDao = new SentMethodRepository();
const customerAddressDao = new CustomerAddressRepository();
const salesOrderDao = new SalesOrderRepository();
const cityDao = new CityRepository();
const salesOrderItemDao = new SalesOrderItemRepository();
const productDao = new ProductRepository();

startCheckout(orderData);

function startCheckout(entity: any) {

    const date = new Date();
    const dueDate = new Date(date);
    dueDate.setMonth(date.getMonth() + 1);

    const sentMethod = sentMethodDao.findAll({
        $filter: {
            equals: {
                Name: entity.shippingType
            }
        }
    });

    const shippingAddress = resolveAddress(entity.shippingAddress, 1, cityDao, customerAddressDao);
    const billingAddress = resolveAddress(entity.billingAddress, 2, cityDao, customerAddressDao);

    const order = {
        Date: date.toLocaleDateString(),
        Due: dueDate.toLocaleDateString(),
        Customer: 1,
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

    const savedOrder = salesOrderDao.create(order);

    const salesOrderItems: SalesOrderItemEntity[] = [];

    entity.items.forEach((item: SalesOrderItemCreateEntity) => {
        const soItem: SalesOrderItemCreateEntity = createSalesOrderItems(item, productDao, savedOrder);

        salesOrderItems.push(soItem);

        salesOrderItemDao.create(soItem);
    });

    const fullOrder = {
        ...order,
        Id: savedOrder
    };

    console.log(JSON.stringify(fullOrder));
    console.log("items");
    console.log(JSON.stringify(salesOrderItems));

    return {
        fullOrder,
        salesOrderItems
    };
}

function createSalesOrderItems(item: any, productDao: ProductRepository, orderId: number) {

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

function resolveAddress(
    address: any,
    addressType: number,
    cityDao: any,
    customerAddressDao: any
): { id: number } | null {
    if (!address) return null;

    if (address.id) {
        return { id: address.id };
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
        Customer: 1,
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