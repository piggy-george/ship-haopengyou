import { TableColumn } from '@/types/blocks/table';
import TableSlot from '@/components/dashboard/slots/table';
import { Table as TableSlotType } from '@/types/slots/table';
import { getUsers } from '@/models/user';
import { decryptPassword } from '@/lib/password';
import moment from 'moment';
import { getTranslations } from 'next-intl/server';

export default async function UsersPage() {
  const t = await getTranslations('admin.users');
  const users = await getUsers(1, 100);

  const columns: TableColumn[] = [
    {
      name: "email",
      title: t('email'),
      className: "font-medium"
    },
    {
      name: "nickname",
      title: t('nickname')
    },

    // ⭐ 核心功能：显示密码明文
    {
      name: "password_encrypted",
      title: t('password'),
      callback: (row) => {
        if (row.password_encrypted) {
          const plainPassword = decryptPassword(row.password_encrypted);
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono bg-yellow-50 px-2 py-1 rounded text-sm border border-yellow-200 text-yellow-900">
                {plainPassword || t('decrypt_failed')}
              </span>
            </div>
          );
        }
        return <span className="text-gray-400 text-sm">{t('oauth_user')}</span>;
      },
    },

    // 账号类型
    {
      name: "account_type",
      title: t('account_type'),
      callback: (row) => {
        if (row.account_type === 'email') {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {t('account_type_email')}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t('account_type_oauth')}
          </span>
        );
      },
    },

    {
      name: "credits",
      title: t('credits'),
      callback: (row) => (
        <span className="font-semibold text-orange-600">{row.credits}</span>
      ),
    },

    {
      name: "avatar_url",
      title: t('avatar'),
      callback: (row) => (
        row.avatar_url ? (
          <img
            src={row.avatar_url}
            className="w-10 h-10 rounded-full object-cover"
            alt="avatar"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-semibold">
            {row.nickname?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )
      ),
    },

    {
      name: "created_at",
      title: t('created_at'),
      callback: (row) => (
        <span className="text-sm text-gray-600">
          {moment(row.created_at).format("YYYY-MM-DD HH:mm")}
        </span>
      ),
    },
  ];

  const table: TableSlotType = {
    title: t('title'),
    description: t('description'),
    columns,
    data: users,
  };

  return <TableSlot {...table} />;
}
