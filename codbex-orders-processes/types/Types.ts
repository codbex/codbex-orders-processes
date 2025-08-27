export enum SalesOrderStatus {
    New = 1,
    Approved,
    Rejected,
    Sent,
    PartiallyPaid,
    Paid,
    Shipped,
    Returned,
    Canceled,
    Finished,
    Expired,
    Initial
}

export enum SalesOrderItemStatus {
    New = 1,
    Issued,
    NeedsRestock,
    Delivered,
    Canceled,
    Rejected,
    Returned,
    Approved,
    Expired
}