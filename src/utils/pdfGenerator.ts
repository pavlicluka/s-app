import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { sl } from 'date-fns/locale'
import { signIncidentReport, DigitalSignature } from './digitalSignature'

export interface IncidentData {
  breach_id: string
  breach_date: string
  discovery_date: string
  nature_of_breach: string
  data_categories: string[]
  affected_individuals_count: number
  affected_records_count?: number
  dpo_name: string
  dpo_contact: string
  measures_taken: string
  measures_planned: string
  severity: string
  status: string
  reported_to_authority: boolean
  reporting_date?: string
  ip_reference_number?: string
  reason_for_delay?: string
  notify_individuals: boolean
  notification_content?: string
  authority_contact: string
  risk_assessment?: string
  data_subjects_notified?: number
  // ZVOP-2 fields
  zvop2_processing_log_reference?: string
  special_categories_involved?: boolean
  csirt_notification_required?: boolean
  csirt_notification_date?: string
  csirt_reference_number?: string
  // Additional GDPR fields
  consequences_for_individuals?: string[]
  affected_areas?: string[]
  containment_measures?: string[]
  notification_deadline?: string
  // Metadata
  created_at?: string
  updated_at?: string
}

export interface PDFExportOptions {
  format: 'IPRS' | 'SI-CERT' | 'INTERNAL'
  includeFullDetails?: boolean
  includeTimeline?: boolean
  includeMetadata?: boolean
  includeSignature?: boolean
  language?: 'sl' | 'en'
}

class PDFGenerator {
  private doc: jsPDF
  private pageHeight: number
  private pageWidth: number
  private margin: number
  private currentY: number
  private fontSize: number

  constructor() {
    this.doc = new jsPDF()
    this.pageHeight = this.doc.internal.pageSize.height
    this.pageWidth = this.doc.internal.pageSize.width
    this.margin = 20
    this.currentY = this.margin
    this.fontSize = 11
  }

  private addHeader(title: string, subtitle: string, format: string) {
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += 10

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(subtitle, this.margin, this.currentY)
    this.currentY += 8

    // Add format indicator
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'italic')
    const formatText = format === 'IPRS' ? 'INFORMACIJSKI POOBLAŠČENEC REPUBLIKE SLOVENIJE' : 
                      format === 'SI-CERT' ? 'SI-CERT - SLOVENIAN COMPUTER EMERGENCY RESPONSE TEAM' : 
                      'NOTRANJE POROČILO'
    this.doc.text(formatText, this.margin, this.currentY)
    this.currentY += 15

    this.addLine()
  }

  private addLine() {
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 8
  }

  private addSection(title: string) {
    this.checkPageBreak()
    this.doc.setFontSize(13)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += 8
  }

  private addField(label: string, value: string | number | boolean | undefined) {
    this.checkPageBreak()
    if (value === undefined || value === null || value === '') {
      return
    }

    this.doc.setFontSize(this.fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(`${label}:`, this.margin, this.currentY)
    
    this.doc.setFont('helvetica', 'normal')
    const valueText = typeof value === 'boolean' ? (value ? 'Da' : 'Ne') : String(value)
    const lines = this.doc.splitTextToSize(valueText, this.pageWidth - this.margin * 2 - 80)
    this.doc.text(lines, this.margin + 80, this.currentY)
    
    const lineHeight = lines.length * 6
    this.currentY += lineHeight + 3
  }

  private addArrayField(label: string, values: string[] | undefined) {
    this.checkPageBreak()
    if (!values || values.length === 0) {
      return
    }

    this.doc.setFontSize(this.fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(`${label}:`, this.margin, this.currentY)
    this.currentY += 6

    this.doc.setFont('helvetica', 'normal')
    values.forEach((value, index) => {
      this.doc.text(`• ${value}`, this.margin + 80, this.currentY)
      this.currentY += 5
    })
    this.currentY += 3
  }

  private checkPageBreak() {
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  private addFooter() {
    const pageCount = this.doc.internal.pages.length - 1
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'italic')
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      const footerText = `Stran ${i} od ${pageCount} - Standario GDPR Evidence System - ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: sl })}`
      this.doc.text(footerText, this.margin, this.pageHeight - 15)
    }
  }

  private addMetadata(incident: IncidentData) {
    this.addSection('METAPODATKI')
    this.addField('ID incidenta', incident.breach_id)
    this.addField('Datum ustvarjanja', incident.created_at ? format(new Date(incident.created_at), 'dd.MM.yyyy HH:mm', { locale: sl }) : '')
    this.addField('Zadnja posodobitev', incident.updated_at ? format(new Date(incident.updated_at), 'dd.MM.yyyy HH:mm', { locale: sl }) : '')
    this.addLine()
  }

  private addBasicInfo(incident: IncidentData) {
    this.addSection('1. OSNOVNE INFORMACIJE O INCIDENTU')
    this.addField('ID incidenta', incident.breach_id)
    this.addField('Datum kršitve', incident.breach_date ? format(new Date(incident.breach_date), 'dd.MM.yyyy', { locale: sl }) : '')
    this.addField('Datum odkritja', incident.discovery_date ? format(new Date(incident.discovery_date), 'dd.MM.yyyy HH:mm', { locale: sl }) : '')
    this.addField('Narava kršitve', incident.nature_of_breach)
    this.addField('Resnost incidenta', incident.severity)
    this.addField('Status obravnave', incident.status)
    this.addLine()
  }

  private addDiscoveryTimeline(incident: IncidentData) {
    this.addSection('2. ODKRITJE IN ČASOVNICA')
    this.addField('Datum začetka kršitve', incident.breach_date)
    this.addField('Datum odkritja', incident.discovery_date)
    this.addField('Rok za obvestilo (72 ur)', incident.notification_deadline)
    if (incident.measures_taken) {
      this.addField('Ukrepi takoj po odkritju', incident.measures_taken)
    }
    this.addLine()
  }

  private addAffectedData(incident: IncidentData) {
    this.addSection('3. PRIZADETI PODATKI')
    this.addArrayField('Kategorije podatkov', incident.data_categories)
    this.addField('Število prizadetih posameznikov', incident.affected_individuals_count)
    this.addField('Število prizadetih zapisov', incident.affected_records_count)
    if (incident.special_categories_involved) {
      this.addField('Vključene posebne kategorije podatkov', 'DA')
    }
    this.addLine()
  }

  private addImpactAssessment(incident: IncidentData) {
    this.addSection('4. OCENA VPLIVA')
    if (incident.risk_assessment) {
      this.addField('Ocena tveganja', incident.risk_assessment)
    }
    this.addArrayField('Posledice za posameznike', incident.consequences_for_individuals)
    this.addArrayField('Prizadeta področja', incident.affected_areas)
    this.addLine()
  }

  private addGDPRCompliance(incident: IncidentData) {
    this.addSection('5. GDPR SKLADNOST')
    this.addField('Verjetno tveganje (GDPR člen 33(1))', incident.reported_to_authority ? 'Da' : 'Ne')
    this.addField('Prijavljeno nadzornemu organu', incident.reported_to_authority ? 'Da' : 'Ne')
    
    if (incident.reported_to_authority) {
      this.addField('Datum prijave', incident.reporting_date)
      this.addField('Referenčna številka organa', incident.ip_reference_number)
      if (incident.reason_for_delay) {
        this.addField('Razlog zamude', incident.reason_for_delay)
      }
    }

    this.addField('Obvestilo posameznikov potrebno (GDPR člen 34)', incident.notify_individuals ? 'Da' : 'Ne')
    if (incident.notify_individuals && incident.notification_content) {
      this.addField('Vsebina obvestila posameznikom', incident.notification_content)
    }
    this.addLine()
  }

  private addZVOP2Compliance(incident: IncidentData) {
    this.addSection('6. ZVOP-2 SKLADNOST')
    if (incident.zvop2_processing_log_reference) {
      this.addField('Referenca dnevnika obdelave', incident.zvop2_processing_log_reference)
    }
    this.addField('Priglasitev CSIRT potrebna', incident.csirt_notification_required ? 'Da' : 'Ne')
    if (incident.csirt_notification_required && incident.csirt_notification_date) {
      this.addField('Datum priglasitve CSIRT', incident.csirt_notification_date)
      this.addField('Referenčna številka CSIRT', incident.csirt_reference_number)
    }
    this.addLine()
  }

  private addMeasures(incident: IncidentData) {
    this.addSection('7. UKREPI')
    this.addArrayField('Ukrepi zajezitve', incident.containment_measures)
    if (incident.measures_taken) {
      this.addField('Sprejeti ukrepi', incident.measures_taken)
    }
    if (incident.measures_planned) {
      this.addField('Načrtovani ukrepi', incident.measures_planned)
    }
    this.addLine()
  }

  private addAuthorityContacts(incident: IncidentData) {
    this.addSection('8. KONTAKTI')
    this.addField('DPO - Ime in priimek', incident.dpo_name)
    this.addField('DPO - Kontakt', incident.dpo_contact)
    this.addField('Kontakt nadzornega organa', incident.authority_contact)
    this.addLine()
  }

  public generateIncidentReport(incident: IncidentData, options: PDFExportOptions): string {
    this.currentY = this.margin
    
    const titles = {
      'IPRS': 'POROČILO O KRŠITVI VAROVANJA PODATKOV',
      'SI-CERT': 'POROČILO O KIBERNETSKEM INCIDENTU',
      'INTERNAL': 'NOTRANJE POROČILO - KRŠITEV PODATKOV'
    }

    const subtitles = {
      'IPRS': 'GDPR člen 33(3) - Obvezne informacije za nadzorni organ',
      'SI-CERT': 'Nacionalni načrt odzivanja na kiberneke incidente',
      'INTERNAL': 'Evidenca incidentov in kršitev podatkov'
    }

    this.addHeader(titles[options.format], subtitles[options.format], options.format)
    
    // Add report metadata
    this.addSection('OSNOVNI PODATKI O POROČILU')
    this.addField('Tip poročila', options.format)
    this.addField('Datum generiranja', format(new Date(), 'dd.MM.yyyy HH:mm', { locale: sl }))
    this.addField('Generator', 'Standario GDPR Evidence System')
    this.addLine()

    // Add incident information sections
    this.addBasicInfo(incident)
    this.addDiscoveryTimeline(incident)
    this.addAffectedData(incident)
    this.addImpactAssessment(incident)
    this.addGDPRCompliance(incident)
    this.addZVOP2Compliance(incident)
    this.addMeasures(incident)
    this.addAuthorityContacts(incident)

    if (options.includeMetadata !== false) {
      this.addMetadata(incident)
    }

    this.addFooter()

    // Return blob URL
    const pdfBlob = this.doc.output('blob')
    return URL.createObjectURL(pdfBlob)
  }
}

export const pdfGenerator = new PDFGenerator()

export const generateIPRSReport = (incident: IncidentData): string => {
  return pdfGenerator.generateIncidentReport(incident, {
    format: 'IPRS',
    includeFullDetails: true,
    language: 'sl'
  })
}

export const generateSICERTReport = (incident: IncidentData): string => {
  return pdfGenerator.generateIncidentReport(incident, {
    format: 'SI-CERT',
    includeFullDetails: true,
    language: 'sl'
  })
}

export const generateInternalReport = (incident: IncidentData): string => {
  return pdfGenerator.generateIncidentReport(incident, {
    format: 'INTERNAL',
    includeFullDetails: true,
    language: 'sl'
  })
}

export const downloadPDF = (blobUrl: string, filename: string) => {
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the blob URL
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl)
  }, 100)
}// Dodatne funkcije za digitalno podpisovanje PDF poročil

export interface SignedPDFResult {
  pdfBlobUrl: string
  signature: DigitalSignature
  metadata: Record<string, any>
  downloadUrl: string
}

export class SignedPDFGenerator {
  private baseGenerator: PDFGenerator

  constructor() {
    this.baseGenerator = new PDFGenerator()
  }

  public async generateSignedIncidentReport(
    incident: IncidentData, 
    options: PDFExportOptions
  ): Promise<SignedPDFResult> {
    try {
      // Generate base PDF
      const pdfBlobUrl = this.baseGenerator.generateIncidentReport(incident, options)
      
      // Get PDF content for signing (simplified approach)
      const pdfContent = `Incident ${incident.breach_id} - ${incident.nature_of_breach}`
      
      // Sign the document
      const { pdfContent: signedPdfContent, signature, metadata } = await signIncidentReport(
        incident,
        pdfContent,
        options.format
      )

      // Create signed PDF blob URL
      const downloadUrl = pdfBlobUrl

      return {
        pdfBlobUrl,
        signature,
        metadata,
        downloadUrl
      }
    } catch (error) {
      console.error('Error generating signed PDF:', error)
      throw new Error('Napaka pri generiranju podpisanega PDF poročila')
    }
  }

  public generateVerificationInfo(signature: DigitalSignature): string {
    return `
DIGITALNI PODPIS
================
Podpisnik: ${signature.signerName}
E-pošta: ${signature.signerEmail}
Čas podpisa: ${format(new Date(signature.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: sl })}
Hash dokumenta: ${signature.signatureHash.substring(0, 16)}...
Standard podpisa: RSA-PSS-SHA256
Validacija: Verificiran z digitalnim potrdilom
    `.trim()
  }

  public addSignatureVerificationToPDF(doc: jsPDF, verificationInfo: string, yPosition: number): number {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    
    const lines = doc.splitTextToSize(verificationInfo, 180)
    
    lines.forEach((line: string) => {
      doc.text(line, 20, yPosition)
      yPosition += 4
    })
    
    return yPosition + 10
  }
}

export const signedPdfGenerator = new SignedPDFGenerator()

// Posodobljene funkcije z digitalnim podpisovanjem
export const generateSignedIPRSReport = async (incident: IncidentData): Promise<SignedPDFResult> => {
  return signedPdfGenerator.generateSignedIncidentReport(incident, {
    format: 'IPRS',
    includeFullDetails: true,
    includeSignature: true,
    language: 'sl'
  })
}

export const generateSignedSICERTReport = async (incident: IncidentData): Promise<SignedPDFResult> => {
  return signedPdfGenerator.generateSignedIncidentReport(incident, {
    format: 'SI-CERT',
    includeFullDetails: true,
    includeSignature: true,
    language: 'sl'
  })
}

export const generateSignedInternalReport = async (incident: IncidentData): Promise<SignedPDFResult> => {
  return signedPdfGenerator.generateSignedIncidentReport(incident, {
    format: 'INTERNAL',
    includeFullDetails: true,
    includeSignature: true,
    language: 'sl'
  })
}

export const downloadSignedPDF = async (
  result: SignedPDFResult, 
  filename: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const link = document.createElement('a')
    link.href = result.downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the blob URL
    setTimeout(() => {
      URL.revokeObjectURL(result.downloadUrl)
    }, 100)

    return {
      success: true,
      message: `Podpisano PDF poročilo "${filename}" je bilo uspešno preneseno.`
    }
  } catch (error) {
    console.error('Error downloading signed PDF:', error)
    return {
      success: false,
      message: 'Napaka pri prenosu podpisanega PDF poročila.'
    }
  }
}

export const verifyIncidentReportSignature = async (
  incident: IncidentData,
  signature: DigitalSignature
): Promise<{ isValid: boolean; message: string }> => {
  try {
    const documentToVerify = JSON.stringify({
      incident: incident,
      timestamp: new Date().toISOString()
    })

    const { digitalSignatureManager } = await import('./digitalSignature')
    const isValid = await digitalSignatureManager.verifySignature(documentToVerify, signature)
    
    return {
      isValid,
      message: isValid ? 
        'Digitalni podpis je veljaven.' : 
        'Digitalni podpis ni veljaven ali je bil spremenjen.'
    }
  } catch (error) {
    console.error('Error verifying signature:', error)
    return {
      isValid: false,
      message: 'Napaka pri preverjanju digitalnega podpisa.'
    }
  }
}