import React from 'react'
import { X, FileText, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface GDPRControllerProcessorViewModalProps {
  isOpen: boolean
  onClose: () => void
  record?: any
}

const GDPRControllerProcessorViewModal: React.FC<GDPRControllerProcessorViewModalProps> = ({ isOpen, onClose, record }) => {
  const { t } = useTranslation()

  if (!isOpen || !record) return null

  const renderField = (label: string, value: any, type: 'text' | 'boolean' | 'link' = 'text') => {
    if (!value) return null

    let displayValue = value
    if (type === 'boolean') {
      displayValue = value ? t('gdprController.yes_no.yes') : t('gdprController.yes_no.no')
    }

    return (
      <div className="py-4 border-b border-gray-700/30 last:border-b-0">
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <p className={`text-body ${type === 'link' ? 'text-blue-400' : 'text-gray-300'}`}>
          {type === 'link' ? (
            <a href={`mailto:${displayValue}`} className="hover:underline" target="_blank" rel="noopener noreferrer">
              {displayValue}
            </a>
          ) : (
            displayValue
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50 sticky top-0 bg-gray-800">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">{record.entity_name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{t('gdprController.basicInfo')}</h3>
            <div className="space-y-0 divide-y divide-gray-700/30">
              {renderField(t('gdprController.fields.company_name'), record.entity_name)}
              {renderField(t('gdprController.typeColumnName'), record.entity_type ? t(`gdprController.options.${record.entity_type}`) : null)}
              {renderField(t('gdprController.fields.headquarters_address'), record.headquarters_address)}
            </div>
          </div>

          {/* Contact Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{t('gdprController.contactInfo')}</h3>
            <div className="space-y-0 divide-y divide-gray-700/30">
              {renderField(t('modals.add.common.contactPerson'), record.contact_person)}
              {renderField(t('modals.add.common.contactEmail'), record.contact_email, 'link')}
              {renderField(t('modals.add.common.contactPhone'), record.contact_phone)}
              {renderField(t('gdprController.fields.dpo_contact'), record.dpo_contact)}
            </div>
          </div>

          {/* Legal and Processing Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{t('gdprController.legalProcessing')}</h3>
            <div className="space-y-0 divide-y divide-gray-700/30">
              {renderField(
                t('gdprController.fields.legal_basis'),
                record.legal_basis ? t(`gdprController.legal_basis_options.${record.legal_basis}`) : null
              )}
              {renderField(t('gdprController.fields.processing_type'), record.processing_type)}
              {renderField(t('gdprController.fields.data_categories'), record.data_categories)}
              {renderField(t('gdprController.fields.recipients'), record.recipients)}
            </div>
          </div>

          {/* Data Management Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{t('gdprController.dataManagement')}</h3>
            <div className="space-y-0 divide-y divide-gray-700/30">
              {renderField(t('gdprController.fields.retention_period'), record.retention_period)}
              {renderField(t('gdprController.fields.security_measures'), record.security_measures)}
              {renderField(t('gdprController.fields.international_transfers'), record.international_transfers, 'boolean')}
              {renderField(t('gdprController.fields.sub_processors'), record.sub_processors)}
            </div>
          </div>

          {/* Role and Activities Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{t('gdprController.roleActivities')}</h3>
            <div className="space-y-0 divide-y divide-gray-700/30">
              {renderField(t('gdprController.roleDescription'), record.role_description)}
              {renderField(t('gdprController.dataProcessingActivities'), record.data_processing_activities)}
            </div>
          </div>

          {/* Agreement Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{t('gdprController.agreementInfo')}</h3>
            <div className="space-y-0 divide-y divide-gray-700/30">
              {renderField(t('gdprController.agreementSigned'), record.agreement_signed, 'boolean')}
              {renderField(t('forms.agreementDate'), record.agreement_date)}
            </div>
          </div>

          {/* File Attachment Section */}
          {record.file_url && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('forms.attachFile')}</h3>
              <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{record.file_name || 'Priložena datoteka'}</p>
                    {record.file_size && (
                      <p className="text-sm text-gray-400">{Math.round(record.file_size / 1024)} KB</p>
                    )}
                  </div>
                </div>
                <a
                  href={record.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                  title={t('common.download')}
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>
          )}

          {/* Metadata Section */}
          <div className="pt-4 border-t border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Podatki o zapisu</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {record.id && (
                <div>
                  <p className="text-gray-500">ID:</p>
                  <p className="text-gray-300 font-mono truncate">{record.id}</p>
                </div>
              )}
              {record.created_at && (
                <div>
                  <p className="text-gray-500">Ustvarjeno:</p>
                  <p className="text-gray-300">{new Date(record.created_at).toLocaleString('sl-SI')}</p>
                </div>
              )}
              {record.updated_at && (
                <div>
                  <p className="text-gray-500">Posodobljeno:</p>
                  <p className="text-gray-300">{new Date(record.updated_at).toLocaleString('sl-SI')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-700/50 sticky bottom-0 bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {t('forms.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GDPRControllerProcessorViewModal
