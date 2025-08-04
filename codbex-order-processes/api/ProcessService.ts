import { SentMethodRepository as SentMethodDao } from "codbex-methods/gen/codbex-methods/dao/Settings/SentMethodRepository";
import { CustomerAddressRepository as CustomerAddressDao } from "codbex-partners/gen/codbex-partners/dao/Customers/CustomerAddressRepository";
import { SalesOrderRepository as SalesOrderDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDao } from "codbex-orders/gen/codbex-orders/dao/SalesOrder/SalesOrderItemRepository";
import { CityRepository as CityDao } from "codbex-cities/gen/codbex-cities/dao/Settings/CityRepository";
import { ProductRepository as ProductDao } from "codbex-products/gen/codbex-products/dao/Products/ProductRepository";

import { Controller, Post } from "sdk/http";

@Controller
class ProcessService {

    private readonly sentMethodDao;
    private readonly customerAddressDao;
    private readonly salesOrderDao;
    private readonly cityDao;
    private readonly salesOrderItemDao;
    private readonly productDao;

    constructor() {
        this.sentMethodDao = new SentMethodDao();
        this.customerAddressDao = new CustomerAddressDao();
        this.salesOrderDao = new SalesOrderDao();
        this.cityDao = new CityDao();
        this.salesOrderItemDao = new SalesOrderItemDao();
        this.productDao = new ProductDao();
    }

    @Post("/order")
    public startCheckout(entity: any) {
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

        const shippingAddress = resolveAddress(entity.address?.shippingAddress, 1, this.cityDao, this.customerAddressDao);
        const billingAddress = resolveAddress(entity.address?.billingAddress, 2, this.cityDao, this.customerAddressDao);

        const orderId = this.salesOrderDao.count();

        const order = {
            Id: orderId + 1,
            Date: date,
            Due: dueDate,
            // Customer: from auth
            BillingAddress: billingAddress.Id,
            ShippingAddress: shippingAddress.Id,
            Currency: 2,
            Conditions: entity.notes,
            SentMethod: sentMethod[0]?.Id,
            Status: 1,
            Operator: 1,
            // Company: 1,
            // Store: 1
        };

        const savedOrder = this.salesOrderDao.create(order);

        entity.items.forEach((item) => {
            createSalesOrderItems(item, this.salesOrderItemDao, this.productDao);
        });

        return savedOrder;
    }
}

function createSalesOrderItems(item: any, salesOrderItemDao: SalesOrderItemDao, productDao: ProductDao) {

    const product = productDao.findAll({
        $filter: {
            equals: {
                Id: item.productId
            }
        }
    });

    const salesOrderItem =
    {
        Product: Number(item.productId),
        Quantity: item.quantity,
        Price: product[0].Price,
        VATRate: 20,
    }

    return salesOrderItemDao.create(salesOrderItem);
}

function resolveAddress(
    address: any,
    addressType: number,
    cityDao: any,
    customerAddressDao: any
): { Id: number } | null {
    if (!address) return null;

    if (address.id) {
        return { Id: address.id };
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

    return { Id: newAddress.Id };
}
