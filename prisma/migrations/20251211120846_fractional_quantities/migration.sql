-- Change Stock.quantity from Int to Decimal(10,2)
ALTER TABLE "Stock"
  ALTER COLUMN "quantity" TYPE DECIMAL(10,2) USING "quantity"::DECIMAL(10,2),
  ALTER COLUMN "quantity" SET DEFAULT 0;

-- Change SaleItem.quantity from Int to Decimal(10,2)
ALTER TABLE "SaleItem"
  ALTER COLUMN "quantity" TYPE DECIMAL(10,2) USING "quantity"::DECIMAL(10,2);