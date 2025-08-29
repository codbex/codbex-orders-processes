import { SalesOrderItemStatus } from '../types/Types';
import { response } from "sdk/http";
import { user } from "sdk/security";
import { CustomerRepository } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerRepository";
import { ProductRepository } from "codbex-products/gen/codbex-products/dao/Products/ProductRepository";
import { SalesOrderItemCreateEntity } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";


const ProductDao = new ProductRepository();
const CustomerDao = new CustomerRepository();


export function createSalesOrderItems(item: any, orderId: number) {

    const product = ProductDao.findById(item.productId)

    if (!product) {
        response.setStatus(response.BAD_REQUEST);
        return `No such product with Id: ${item.productId}!`;
    }

    const salesOrderItem: SalesOrderItemCreateEntity =
    {
        Product: Number(item.productId),
        Quantity: item.quantity,
        Price: product.Price | 0,
        VATRate: 20,
        SalesOrder: orderId,
        UoM: product.BaseUnit,
        Status: SalesOrderItemStatus.New
    }

    return salesOrderItem;
}

export function resolveAddress(
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


export function getCustomerByIdentifier(identifier: string) {

    const customer = CustomerDao.findAll({
        $filter: {
            equals: {
                Identifier: identifier
            }
        }
    });

    return customer[0].Id;
}
