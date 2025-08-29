import { SalesOrderItemStatus } from '../types/Types';
import { response } from "sdk/http";
import { user } from "sdk/security";

import { CustomerAddressRepository } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerAddressRepository";
import { CustomerRepository } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerRepository";
import { ProductRepository } from "codbex-products/gen/codbex-products/dao/Products/ProductRepository";
import { SalesOrderItemCreateEntity, SalesOrderItemRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { SalesOrderStatusRepository } from "codbex-orders/gen/codbex-orders/dao/Settings/SalesOrderStatusRepository";
import { SalesOrderRepository } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SentMethodRepository } from "codbex-methods/gen/codbex-methods/dao/Settings/SentMethodRepository";
import { CurrencyRepository } from "codbex-currencies/gen/codbex-currencies/dao/Settings/CurrencyRepository";
import { ProductImageRepository } from "codbex-products/gen/codbex-products/dao/Products/ProductImageRepository";
import { CountryRepository } from "codbex-countries/gen/codbex-countries/dao/Settings/CountryRepository";
import { CityRepository } from "codbex-cities/gen/codbex-cities/dao/Settings/CityRepository";


const ProductDao = new ProductRepository();
const CustomerDao = new CustomerRepository();
const SentMethodDao = new SentMethodRepository();
const CurrencyDao = new CurrencyRepository();
const SalesOrderStatusDao = new SalesOrderStatusRepository();
const SalesOrderDao = new SalesOrderRepository();
const SalesOrderItemDao = new SalesOrderItemRepository();
const ProductImageDao = new ProductImageRepository();
const CountryDao = new CountryRepository();
const CityDao = new CityRepository();
const CustomerAddressDao = new CustomerAddressRepository();

export function getSentMethodName(sentMethodId: number) {
    return SentMethodDao.findById(sentMethodId)!.Name;
}

export function getCurrencyCode(currencyId: number) {
    return CurrencyDao.findById(currencyId)!.Code;
}

export function getSalesOrderStatus(statusId: number) {
    return SalesOrderStatusDao.findById(statusId)!.Name;
}

export function getCountryCode(countryId: number) {
    return CountryDao.findById(countryId)!.Code3;
}

export function getCountryName(countryId: number) {
    return CountryDao.findById(countryId)!.Name;
}

export function getCityName(cityId: number) {
    return CityDao.findById(cityId)!.Name;
}

export function mapAddresses(allAddresses: any[]) {

    const mappedAddresses = allAddresses.map(row => {

        const countryCode = getCountryCode(row.Country);
        const countryName = getCountryName(row.Country);
        const city = getCityName(row.City);

        return {
            id: String(row.Id),
            firstName: row.FirstName,
            lastName: row.LastName,
            country: countryCode,
            countryName: countryName,
            addressLine1: row.AddressLine1,
            addressLine2: row.AddressLine2,
            city: city,
            postalCode: row.PostalCode,
            phoneNumber: row.Phone,
            email: row.Email,
            addressType: String(row.AddressType)
        };
    });

    const shippingAddress = mappedAddresses
        .filter(a => a.addressType === "1")
        .map(({ addressType, ...rest }) => rest);

    const billingAddress = mappedAddresses
        .filter(a => a.addressType === "2")
        .map(({ addressType, ...rest }) => rest);

    return {
        shippingAddress,
        billingAddress
    };
}

export function getSalesOrderItems(salesorderId: number) {

    const salesOrderItemsResult = SalesOrderItemDao.findAll({
        $filter: {
            equals: {
                SalesOrder: salesorderId
            }
        }
    });

    const salesOrder = SalesOrderDao.findById(salesorderId);

    return salesOrderItemsResult.map(item => {

        const product = ProductDao.findById(item.Product);
        const currency = CurrencyDao.findById(salesOrder.Currency);

        const image = ProductImageDao.findAll({
            $filter: {
                equals: {
                    Product: product.Id,
                    IsFeature: true
                }
            }
        });

        return {
            productId: product.Id,
            quantity: item.Quantity,
            title: product.Title,
            image: image[0].ImageLink,
            price: {
                amount: product.Price,
                currency: currency.Code,
            },
        }
    })
};

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
    addressType: number
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

    const cityEntity = CityDao.findAll({
        $filter: {
            equals: {
                Name: city
            }
        }
    });

    if (!cityEntity?.[0]?.Id) {
        throw new Error(`City not found: ${city}`);
    }

    const countryObj = CountryDao.findAll({
        $filter: {
            equals: {
                Code3: country
            }
        }
    });

    const newAddress = CustomerAddressDao.create({
        Customer: getCustomerByIdentifier(user.getName()),
        Country: countryObj[0].Id,
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
