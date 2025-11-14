import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Edit, Download, Trash2 } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  title: string
  columns: Column<T>[]
  data: T[]
  onViewAll?: () => void
  onViewItem?: (item: T) => void
  onEditItem?: (item: T) => void
  onDeleteItem?: (item: T) => void
  customActions?: (item: T) => ReactNode
}

export default function DataTable<T extends { id: number | string }>({ 
  title, 
  columns, 
  data,
  onViewAll,
  onViewItem,
  onEditItem,
  onDeleteItem,
  customActions 
}: DataTableProps<T>) {
  const { t } = useTranslation()
  return (
    <div className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-heading-md font-semibold text-text-primary">{title}</h3>
        {onViewAll && (
          <button
            onClick={() => {
              console.log('DataTable: View All button clicked')
              onViewAll()
            }}
            className="text-body-sm font-medium text-accent-primary hover:text-accent-primary-hover transition-colors duration-150"
          >
            {t('common.viewAll')}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border border-border-subtle rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-near-black border-b border-border-moderate">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
                {(onViewItem || onEditItem || onDeleteItem || customActions) && (
                  <th className="px-4 py-3 text-left text-body-sm font-medium text-text-secondary uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item, rowIndex) => (
                <tr
                  key={item.id}
                  className={`
                    border-b border-border-subtle hover:bg-bg-surface-hover transition-colors duration-200
                    ${rowIndex === data.length - 1 ? 'border-b-0' : ''}
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-4 py-4 text-body-sm text-text-primary ${column.className || ''}`}
                    >
                      {column.render 
                        ? column.render(item)
                        : String(item[column.key as keyof T] || '-')
                      }
                    </td>
                  ))}
                  {(onViewItem || onEditItem || onDeleteItem || customActions) && (
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {onViewItem && (
                          <button
                            onClick={() => {
                              console.log('DataTable: View button clicked for item:', item)
                              onViewItem(item)
                            }}
                            className="h-8 w-8 p-0 text-accent-primary border border-accent-primary rounded-sm
                                       hover:bg-accent-primary hover:text-white transition-all duration-200 flex items-center justify-center"
                            title={t('common.view')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEditItem && (
                          <button
                            onClick={() => {
                              console.log('DataTable: Edit button clicked for item:', item)
                              onEditItem(item)
                            }}
                            className="h-8 w-8 p-0 text-blue-600 border border-blue-600 rounded-sm
                                       hover:bg-blue-600 hover:text-white transition-all duration-200 flex items-center justify-center"
                            title={t('common.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {customActions && customActions(item)}
                        {onDeleteItem && (
                          <button
                            onClick={() => {
                              console.log('DataTable: Delete button clicked for item:', item)
                              onDeleteItem(item)
                            }}
                            className="h-8 w-8 p-0 text-risk-high border border-risk-high rounded-sm
                                       hover:bg-risk-high hover:text-white transition-all duration-200 flex items-center justify-center"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
