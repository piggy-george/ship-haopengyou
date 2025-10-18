import { TableColumn } from "@/types/blocks/table";
import TableSlot from "@/components/dashboard/slots/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { getFeedbacks } from "@/models/feedback";
import moment from "moment";
import { getTranslations } from 'next-intl/server';

export default async function FeedbacksPage() {
  const t = await getTranslations('admin.feedbacks');
  const feedbacks = await getFeedbacks(1, 50);

  const columns: TableColumn[] = [
    {
      title: t('user'),
      name: "user",
      callback: (row) => {
        if (!row.user || !row.user.avatar_url) {
          return "-";
        }

        return (
          <div className="flex items-center gap-2">
            <img
              src={row.user?.avatar_url || ""}
              className="w-8 h-8 rounded-full"
            />
            <span>{row.user?.nickname}</span>
          </div>
        );
      },
    },
    {
      name: "content",
      title: t('content'),
      callback: (row) => row.content,
    },
    {
      name: "rating",
      title: t('rating'),
      callback: (row) => row.rating,
    },
    {
      name: "created_at",
      title: t('created_at'),
      callback: (row) => moment(row.created_at).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      name: "actions",
      title: t('actions'),
      callback: (row) => (
        <a href={`/admin/users?user_uuid=${row.user_uuid}`} target="_blank">
          {t('view_user')}
        </a>
      ),
    },
  ];

  const table: TableSlotType = {
    title: t('title'),
    columns,
    data: feedbacks,
  };

  return <TableSlot {...table} />;
}
