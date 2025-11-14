import { useState } from 'react'
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tableName: string
  title: string
  columns: string[] // Required column headers
  sampleData?: string // Sample CSV content for download
}

export default function CSVImportModal({
  isOpen,
  onClose,
  onSuccess,
  tableName,
  title,
  columns,
  sampleData
}: CSVImportModalProps) {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [importStats, setImportStats] = useState({ total: 0, successful: 0, failed: 0 })

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Prosimo, naložite CSV datoteko')
        return
      }
      setFile(selectedFile)
      setError(null)
      setSuccess(false)
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV datoteka mora vsebovati glavo in vsaj eno vrstico podatkov')
    }

    // Parse header
    const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''))
    
    // Validate required columns
    const missingColumns = columns.filter(col => !headers.includes(col))
    if (missingColumns.length > 0) {
      throw new Error(`Manjkajoči stolpci: ${missingColumns.join(', ')}`)
    }

    // Parse data rows
    const data: any[] = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue // Skip empty lines
      
      const values = lines[i].split(';').map(v => v.trim().replace(/^"|"$/g, ''))
      const row: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        // Convert empty strings to null for database
        row[header] = value === '' || value === '-' ? null : value
      })
      
      data.push(row)
    }

    return data
  }

  const handleImport = async () => {
    if (!file) {
      setError('Prosimo, izberite datoteko')
      return
    }

    setImporting(true)
    setError(null)
    setSuccess(false)

    try {
      // Read file
      const text = await file.text()
      
      // Parse CSV
      const data = parseCSV(text)
      
      if (data.length === 0) {
        throw new Error('CSV datoteka ne vsebuje podatkov')
      }

      // Import data in batches
      let successful = 0
      let failed = 0
      const batchSize = 100
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        
        try {
          const { error: insertError } = await supabase
            .from(tableName)
            .insert(batch)
          
          if (insertError) {
            console.error('Batch insert error:', insertError)
            failed += batch.length
          } else {
            successful += batch.length
          }
        } catch (batchError) {
          console.error('Batch error:', batchError)
          failed += batch.length
        }
      }

      setImportStats({ total: data.length, successful, failed })
      
      if (failed === 0) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
          resetModal()
        }, 2000)
      } else if (successful > 0) {
        setError(`Uvoženih ${successful} od ${data.length} zapisov. ${failed} zapisov ni bilo mogoče uvoziti.`)
      } else {
        setError(t('modals.csvImport.importError', { error: 'Format error' }))
      }
    } catch (err: any) {
      setError(err.message || 'Napaka pri uvozu podatkov')
    } finally {
      setImporting(false)
    }
  }

  const resetModal = () => {
    setFile(null)
    setError(null)
    setSuccess(false)
    setImportStats({ total: 0, successful: 0, failed: 0 })
  }

  const handleClose = () => {
    if (!importing) {
      resetModal()
      onClose()
    }
  }

  const downloadTemplate = () => {
    if (!sampleData) return
    
    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${tableName}_template.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative bg-bg-surface border border-border-subtle rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-accent-primary" />
            <h2 className="text-h3 text-text-primary">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={importing}
            className="p-2 hover:bg-bg-near-black rounded transition-colors duration-150 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-bg-near-black p-4 rounded border border-border-subtle">
            <h3 className="text-sm font-medium text-text-primary mb-2">Navodila</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• CSV datoteka mora vsebovati naslednje stolpce: <span className="font-mono text-text-primary">{columns.join(', ')}</span></li>
              <li>• Uporabite podpičje (;) kot ločilo med vrednostmi</li>
              <li>• Prva vrstica mora biti glava s imeni stolpcev</li>
              <li>• Prazen ali "-" vrednosti bodo shranjene kot NULL</li>
            </ul>
            {sampleData && (
              <button
                onClick={downloadTemplate}
                className="mt-3 text-sm text-accent-primary hover:text-accent-primary-hover font-medium"
              >
                {t('modals.csvImport.downloadTemplate')}
              </button>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('modals.csvImport.selectFile')}
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={importing}
                className="block w-full text-sm text-text-secondary
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-medium
                  file:bg-accent-primary file:text-white
                  file:cursor-pointer
                  hover:file:bg-accent-primary-hover
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-text-secondary">
                Izbrana datoteka: <span className="font-medium text-text-primary">{file.name}</span>
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-status-error/10 border border-status-error rounded">
              <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-status-error">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-status-success/10 border border-status-success rounded">
              <CheckCircle className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
              <p className="text-sm text-status-success">
                Uspešno uvoženih {importStats.successful} zapisov!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle">
          <button
            onClick={handleClose}
            disabled={importing}
            className="px-6 py-2 bg-bg-near-black text-text-primary border border-border-subtle rounded hover:bg-bg-surface transition-colors duration-150 disabled:opacity-50"
          >
            {t('modals.csvImport.cancel')}
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="inline-flex items-center gap-2 px-6 py-2 bg-accent-primary hover:bg-accent-primary-hover text-white rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uvažam...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{t('modals.csvImport.import')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
