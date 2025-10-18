import { TableColumn } from "@/types/blocks/table";
import TableSlot from "@/components/dashboard/slots/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { getPaiedOrders } from "@/models/order";
import moment from "moment";
import { getTranslations } from 'next-intl/server';

export default async function OrdersPage() {
  const t = await getTranslations('admin.orders');
  const orders = await getPaiedOrders(1, 50);

  const columns: TableColumn[] = [
    { name: "order_no", title: t('order_no') },
    { name: "paid_email", title: t('paid_email') },
    { name: "product_name", title: t('product_name') },
    { name: "amount", title: t('amount') },
    {
      name: "created_at",
      title: t('created_at'),
      callback: (row) => moment(row.created_at).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  const table: TableSlotType = {
    title: t('title'),
    columns,
    data: orders,
  };

  return <TableSlot {...table} />;
}
