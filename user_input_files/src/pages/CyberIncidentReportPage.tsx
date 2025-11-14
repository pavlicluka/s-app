import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { CyberIncidentReport } from '../lib/supabase'
import { AlertTriangle, Clock, CheckCircle, X, Eye, Download, Send, Mail } from 'lucide-react'
import { AccordionSection } from '../components/AccordionSection'

// Incident taxonomy from NOKI standard
const INCIDENT_TYPES = [
  { category: 'Zlonamerna vsebina', value: 'zlonamerna_vsebina' },
  { category: 'Zlonamerna koda', value: 'zlonamerna_koda' },
  { category: 'Zbiranje informacij', value: 'zbiranje_informacij' },
  { category: 'Poizkusi vdora', value: 'poizkusi_vdora' },
  { category: 'Vdori', value: 'vdori' },
  { category: 'Razpoložljivost', value: 'razpolozljivost' },
  { category: 'Varnost informacijskih virov', value: 'varnost_informacijskih_virov' },
  { category: 'Goljufije', value: 'goljufije' },
  { category: 'Ranljivost', value: 'ranljivost' },
  { category: 'Drugo', value: 'drugo' },
  { category: 'Test', value: 'test' }
]

const INCIDENT_CAUSES = [
  { label: 'Tehnična napaka', value: 'tehnična napaka' },
  { label: 'Človeška napaka', value: 'človeška napaka' },
  { label: 'Zlonamerno dejanje', value: 'zlonamerno dejanje' },
  { label: 'Naravna nesreča', value: 'naravna nesreča' },
  { label: 'Drugo', value: 'drugo' }
]

const REPORT_TYPES = [
  { label: 'Prvo poročilo zavezanca', value: 'prvo_porocilo' },
  { label: 'Vmesno/končno poročilo', value: 'vmesno_porocilo' },
  { label: 'Prvo obveščanje PNO', value: 'obvescanje_pno' }
]

const TIP_POROCILA_OPTIONS = [
  { value: 'prostovoljna_priglasitev', label: 'Prostovoljna priglasitev incidenta' },
  { value: 'prvo_porocilo', label: 'Prvo poročilo o incidentu zavezanca' },
  { value: 'vmesno_porocilo', label: 'Vmesno poročilo o incidentu zavezanca' },
  { value: 'koncno_porocilo', label: 'Končno poročilo o incidentu zavezanca' }
]

const SEKTOR_OPTIONS = [
  'Energetika', 'Promet', 'Bančništvo', 'Infrastruktura finančnega trga',
  'Zdravstvo', 'Pitna voda', 'Odpadna voda', 'Digitalna infrastruktura',
  'Javna uprava', 'Vesolje', 'Drugo'
]

const OCENA_NEVARNOSTI_OPTIONS = ['Nizka', 'Srednja', 'Visoka', 'Kritična']
const STOPNJA_INCIDENTA_OPTIONS = ['1', '2', '3', '4', '5']
const TRENUTNO_STANJE_OPTIONS = ['V reševanju', 'Zaključen']

// Demo zapisi za prikaz, ko je baza prazna
const DEMO_INCIDENTS: CyberIncidentReport[] = [
  {
    id: 'demo-1',
    incident_number: null,
    detection_datetime: '2024-10-15T08:30:00Z',
    incident_type: 'zlonamerna_koda',
    incident_description: 'Ransomware napad na glavni datotečni strežnik',
    impact_assessment: 'Visok vpliv na poslovanje, 500+ uporabnikov prizadetih',
    incident_status: 'v teku',
    entity_identifier: 'ORG-001',
    contact_name: 'Janez Novak',
    contact_phone: '+386 41 123 456',
    contact_email: 'janez.novak@podjetje.si',
    report_datetime: '2024-10-15T09:15:00Z',
    incident_cause: 'zlonamerno dejanje',
    incident_impact: 'Šifriranje datotek, zahteva za odkupnino',
    response_measures: 'Izolacija prizadetega sistema, aktiviran incidentni načrt',
    lessons_learned: 'Potreba po boljšem rednem varnostnem kopiranju',
    report_type: 'prvo_porocilo',
    created_at: '2024-10-15T09:20:00Z',
    updated_at: '2024-10-15T09:20:00Z',
    // Sekcija 0: Osnovni podatki
    referencna_stevilka: 'INC-2024-001',
    zadeva: 'Ransomware napad na datotečni strežnik',
    tip_porocila: 'prvo_porocilo',
    // Sekcija 1: Splošne informacije
    naziv_subjekta: 'Podjetje d.o.o.',
    sektor: 'Digitalna infrastruktura',
    kontakt_tehnicni_ime: 'Marko Bergant',
    kontakt_tehnicni_email: 'marko.bergant@podjetje.si',
    kontakt_tehnicni_telefon: '+386 41 234 567',
    kontakt_oseba_ime: 'Janez Novak',
    kontakt_oseba_email: 'janez.novak@podjetje.si',
    kontakt_oseba_telefon: '+386 41 123 456',
    // Sekcija 2: Začetne informacije
    zacetek_incidenta: '2024-10-15T08:30:00Z',
    cas_zaznave: '2024-10-15T08:45:00Z',
    opis_incidenta: 'Ransomware napad je prizadel glavni datotečni strežnik. Datoteke so bile šifrirane z .locked ekstenzijo. Zahtevana je bila odkupnina v Bitcoin vrednosti 50.000 EUR.',
    taksonomija: 'zlonamerna_koda',
    ocena_nevarnosti: 'Kritična',
    ocena_vpliva: 'Visok vpliv na poslovanje - 500+ uporabnikov ne more dostopati do svojih datotek. Kritične poslovne aplikacije so na voljo.',
    stopnja_incidenta: '4',
    opombe: 'Napad se je verjetno začel prek phishing e-pošte',
    // Sekcija 3: Vmesno/končno poročanje
    cas_zadnjega_porocanja: '2024-10-15T09:15:00Z',
    trenutno_stanje: 'V reševanju',
    opis_napake_sistem: 'Windows Server 2019 datotečni strežnik',
    opis_napake_streznik: 'Primarni file server DC01',
    opis_napake_aplikacije: 'Shared folders, print services',
    opis_napake_drugo: null,
    izvor_usb: false,
    izvor_email: true,
    izvor_vdor: false,
    izvor_spletno: false,
    izvor_datoteke: false,
    izvor_drugo: 'Phishing e-pošta',
    ogrozena_storitev_zinfv: false,
    ogrozena_storitev_ostale: true,
    cezmejni_vpliv_da_ne: false,
    cezmejni_vpliv_opis: null,
    akcijski_ze_sprejeti: 'Izolacija prizadetega strežnika iz mreže, aktiviran incidentni načrt, kontaktiranje SI-CERT',
    akcijski_nacrtovani: 'Obnova podatkov iz varnostnih kopij, popravila varnostnih lukenj, šolanja zaposlenih',
    povzrocena_skoda: 'Ocenjena na 25.000 EUR (stroški obnove, izpad delovanja)',
    potrebe_odprava: 'Boljši backup sistem, spam filter, security awareness training',
    casovni_okvir: '7 dni',
    priloge_seznam: 'Email screenshot, virus scan report, network diagram'
  },
  {
    id: 'demo-2',
    incident_number: null,
    detection_datetime: '2024-10-10T14:20:00Z',
    incident_type: 'varnost_informacijskih_virov',
    incident_description: 'Napačno pošiljanje e-pošte z osebnimi podatki',
    impact_assessment: 'Srednji vpliv, prizadetih 50 posameznikov',
    incident_status: 'rešen',
    entity_identifier: 'ORG-001',
    contact_name: 'Ana Kovač',
    contact_phone: '+386 51 789 123',
    contact_email: 'ana.kovac@podjetje.si',
    report_datetime: '2024-10-10T15:00:00Z',
    incident_cause: 'človeška napaka',
    incident_impact: 'Razkritje osebnih podatkov (ime, priimek, naslov, davčna številka)',
    response_measures: 'Takojšen umik e-pošte, obveščanje prejemnikov',
    lessons_learned: 'Potreba po implementaciji DLP rešitve',
    report_type: 'koncno_porocilo',
    created_at: '2024-10-10T15:05:00Z',
    updated_at: '2024-10-12T10:30:00Z',
    // Sekcija 0: Osnovni podatki
    referencna_stevilka: 'INC-2024-002',
    zadeva: 'Napačno pošiljanje osebnih podatkov',
    tip_porocila: 'koncno_porocilo',
    // Sekcija 1: Splošne informacije
    naziv_subjekta: 'Podjetje d.o.o.',
    sektor: 'Javna uprava',
    kontakt_tehnicni_ime: 'Tomaž Zorman',
    kontakt_tehnicni_email: 'tomaz.zorman@podjetje.si',
    kontakt_tehnicni_telefon: '+386 51 345 678',
    kontakt_oseba_ime: 'Ana Kovač',
    kontakt_oseba_email: 'ana.kovac@podjetje.si',
    kontakt_oseba_telefon: '+386 51 789 123',
    // Sekcija 2: Začetne informacije
    zacetek_incidenta: '2024-10-10T14:20:00Z',
    cas_zaznave: '2024-10-10T14:20:00Z',
    opis_incidenta: 'Zaposleni je po pomoti poslal e-pošto z Excel datoteko, ki je vsebovala seznam zaposlenih z osebnimi podatki na napačen e-poštni naslov namesto internega.',
    taksonomija: 'varnost_informacijskih_virov',
    ocena_nevarnosti: 'Srednja',
    ocena_vpliva: 'Srednji vpliv - prizadetih 50 posameznikov, podatki so bili poslani na neznano e-pošto, vendar smo uspeli kontaktirati prejemnika.',
    stopnja_incidenta: '2',
    opombe: 'Prejemnik je bil ustrezno obveščen in je datoteko izbrisal',
    // Sekcija 3: Vmesno/končno poročanje
    cas_zadnjega_porocanja: '2024-10-12T10:30:00Z',
    trenutno_stanje: 'Zaključen',
    opis_napake_sistem: null,
    opis_napake_streznik: null,
    opis_napake_aplikacije: 'Microsoft Outlook',
    opis_napake_drugo: null,
    izvor_usb: false,
    izvor_email: true,
    izvor_vdor: false,
    izvor_spletno: false,
    izvor_datoteke: false,
    izvor_drugo: 'Človeška napaka',
    ogrozena_storitev_zinfv: false,
    ogrozena_storitev_ostale: false,
    cezmejni_vpliv_da_ne: false,
    cezmejni_vpliv_opis: null,
    akcijski_ze_sprejeti: 'Takojšen umik e-pošte, obveščanje prejemnika, izbris datoteke, obveščanje prizadetih',
    akcijski_nacrtovani: 'Implementacija DLP rešitve, šolanja zaposlenih',
    povzrocena_skoda: 'Ocenjena na 2.000 EUR (administrativni stroški, čas)',
    potrebe_odprava: 'DLP rešitev, varnostno šolanja',
    casovni_okvir: '30 dni',
    priloge_seznam: 'Email screenshot, acknowledgment from recipient, notification to affected individuals'
  },
  {
    id: 'demo-3',
    incident_number: null,
    detection_datetime: '2024-10-08T22:15:00Z',
    incident_type: 'vdori',
    incident_description: 'Neavtoriziran dostop do strežnika prek RDP',
    impact_assessment: 'Visok vpliv, sistem je bil ogrožen 4 ure',
    incident_status: 'v teku',
    entity_identifier: 'ORG-001',
    contact_name: 'Peter Medved',
    contact_phone: '+386 40 987 654',
    contact_email: 'peter.medved@podjetje.si',
    report_datetime: '2024-10-08T22:30:00Z',
    incident_cause: 'zlonamerno dejanje',
    incident_impact: 'Neavtoriziran dostop do interno mreže',
    response_measures: 'Brisanje uporabniških računov, sprememba gesel',
    lessons_learned: 'Potreba po RDP gateway in MFA',
    report_type: 'vmesno_porocilo',
    created_at: '2024-10-08T22:35:00Z',
    updated_at: '2024-10-09T08:00:00Z',
    // Sekcija 0: Osnovni podatki
    referencna_stevilka: 'INC-2024-003',
    zadeva: 'Neavtoriziran dostop do sistema',
    tip_porocila: 'vmesno_porocilo',
    // Sekcija 1: Splošne informacije
    naziv_subjekta: 'Podjetje d.o.o.',
    sektor: 'Digitalna infrastruktura',
    kontakt_tehnicni_ime: 'Miha Dragar',
    kontakt_tehnicni_email: 'miha.dragar@podjetje.si',
    kontakt_tehnicni_telefon: '+386 40 876 543',
    kontakt_oseba_ime: 'Peter Medved',
    kontakt_oseba_email: 'peter.medved@podjetje.si',
    kontakt_oseba_telefon: '+386 40 987 654',
    // Sekcija 2: Začetne informacije
    zacetek_incidenta: '2024-10-08T18:30:00Z',
    cas_zaznave: '2024-10-08T22:15:00Z',
    opis_incidenta: 'Zaznali smo neavtoriziran dostop do Windows strežnika prek RDP protokola. Napadalec je uporabil brute force napad na RDP dostop in uspešno vstopil v sistem.',
    taksonomija: 'vdori',
    ocena_nevarnosti: 'Visoka',
    ocena_vpliva: 'Visok vpliv - napadalec je imel dostop do interne mreže 4 ure, vendar ni uspel pridobiti dostopa do kritičnih sistemov.',
    stopnja_incidenta: '3',
    opombe: 'Napad je prišel iz IP naslova iz Romunije',
    // Sekcija 3: Vmesno/končno poročanje
    cas_zadnjega_porocanja: '2024-10-09T08:00:00Z',
    trenutno_stanje: 'V reševanju',
    opis_napake_sistem: 'Windows Server 2019, RDP enabled',
    opis_napake_streznik: 'PRIMARY-DC01',
    opis_napake_aplikacije: 'File services, Active Directory',
    opis_napake_drugo: null,
    izvor_usb: false,
    izvor_email: false,
    izvor_vdor: true,
    izvor_spletno: true,
    izvor_datoteke: false,
    izvor_drugo: 'Brute force RDP attack',
    ogrozena_storitev_zinfv: false,
    ogrozena_storitev_ostale: true,
    cezmejni_vpliv_da_ne: false,
    cezmejni_vpliv_opis: null,
    akcijski_ze_sprejeti: 'Onemogočen RDP dostop, sprememba vseh gesel, log audit',
    akcijski_nacrtovani: 'Namestitev RDP Gateway, implementacija MFA, VPN rešitev',
    povzrocena_skoda: 'Ocenjena na 8.000 EUR (forensics, ukrepi)',
    potrebe_odprava: 'RDP Gateway, MFA, SIEM sistem',
    casovni_okvir: '14 dni',
    priloge_seznam: 'RDP login logs, network traffic analysis, forensic report'
  },
  {
    id: 'demo-4',
    incident_number: null,
    detection_datetime: '2024-10-05T11:45:00Z',
    incident_type: 'ranljivost',
    incident_description: 'Kompromitacija gesla sistemskega administratorja',
    impact_assessment: 'Visok vpliv, administratorjevo geslo je bilo ukradeno',
    incident_status: 'rešen',
    entity_identifier: 'ORG-001',
    contact_name: 'Sandra Horvat',
    contact_phone: '+386 30 654 321',
    contact_email: 'sandra.horvat@podjetje.si',
    report_datetime: '2024-10-05T12:00:00Z',
    incident_cause: 'zlonamerno dejanje',
    incident_impact: 'Dostop do vseh sistemov za 2 uri',
    response_measures: 'Takojšnja sprememba gesel, two-factor authentication',
    lessons_learned: 'Implementacija MFA je nujna',
    report_type: 'koncno_porocilo',
    created_at: '2024-10-05T12:10:00Z',
    updated_at: '2024-10-06T16:45:00Z',
    // Sekcija 0: Osnovni podatki
    referencna_stevilka: 'INC-2024-004',
    zadeva: 'Kompromitacija gesla',
    tip_porocila: 'koncno_porocilo',
    // Sekcija 1: Splošne informacije
    naziv_subjekta: 'Podjetje d.o.o.',
    sektor: 'Bančništvo',
    kontakt_tehnicni_ime: 'Aljaž Košir',
    kontakt_tehnicni_email: 'aljaz.kosir@podjetje.si',
    kontakt_tehnicni_telefon: '+386 30 765 432',
    kontakt_oseba_ime: 'Sandra Horvat',
    kontakt_oseba_email: 'sandra.horvat@podjetje.si',
    kontakt_oseba_telefon: '+386 30 654 321',
    // Sekcija 2: Začetne informacije
    zacetek_incidenta: '2024-10-05T09:00:00Z',
    cas_zaznave: '2024-10-05T11:45:00Z',
    opis_incidenta: 'Sistemski administrator je kliknil na phishing povezavo v e-pošti, kar je privedlo do kraja uporabniških podatkov prek keyloggerja. Napadalec je nato zlorabil njegove podatke za dostop do sistema.',
    taksonomija: 'ranljivost',
    ocena_nevarnosti: 'Kritična',
    ocena_vpliva: 'Kritičen vpliv - napadalec je z administratorjevimi pravicami imel dostop do vseh sistemov za 2 uri. Možno je bilo ogroženi podatkov in konfiguracij.',
    stopnja_incidenta: '5',
    opombe: 'Incident je bil odkrit s pomočjo SIEM sistema',
    // Sekcija 3: Vmesno/končno poročanje
    cas_zadnjega_porocanja: '2024-10-06T16:45:00Z',
    trenutno_stanje: 'Zaključen',
    opis_napake_sistem: 'Windows Domain Controller',
    opis_napake_streznik: 'DC-PRIMARY',
    opis_napake_aplikacije: 'Active Directory, File Server, Database Server',
    opis_napake_drugo: null,
    izvor_usb: false,
    izvor_email: true,
    izvor_vdor: false,
    izvor_spletno: true,
    izvor_datoteke: false,
    izvor_drugo: 'Phishing with keylogger',
    ogrozena_storitev_zinfv: true,
    ogrozena_storitev_ostale: true,
    cezmejni_vpliv_da_ne: false,
    cezmejni_vpliv_opis: null,
    akcijski_ze_sprejeti: 'Sprememba vseh gesel, onemogočenje računa, antivirus scan, SIEM monitoring',
    akcijski_nacrtovani: 'MFA za vse administratorske račune, security awareness training, email filtering',
    povzrocena_skoda: 'Ocenjena na 35.000 EUR (investigacija, obnovitev, preventivni ukrepi)',
    potrebe_odprava: 'MFA rešitev, napredna email security, redna šolanja',
    casovni_okvir: '7 dni',
    priloge_seznam: 'SIEM logs, phishing email, system audit, security assessment report'
  },
  {
    id: 'demo-5',
    incident_number: null,
    detection_datetime: '2024-10-02T16:30:00Z',
    incident_type: 'varnost_informacijskih_virov',
    incident_description: 'Izguba prenosne naprave z zaupnimi podatki',
    impact_assessment: 'Srednji vpliv, naprava z medsebojnimi podatki',
    incident_status: 'rešen',
    entity_identifier: 'ORG-001',
    contact_name: 'Martin Kosec',
    contact_phone: '+386 70 111 222',
    contact_email: 'martin.kosec@podjetje.si',
    report_datetime: '2024-10-02T17:00:00Z',
    incident_cause: 'človeška napaka',
    incident_impact: 'Izguba prenosnega računalnika z zaupnimi podatki',
    response_measures: 'Oddaljena blokada naprave, sprememba gesel',
    lessons_learned: 'Potreba po BitLocker šifriranju in MDM',
    report_type: 'koncno_porocilo',
    created_at: '2024-10-02T17:05:00Z',
    updated_at: '2024-10-04T14:20:00Z',
    // Sekcija 0: Osnovni podatki
    referencna_stevilka: 'INC-2024-005',
    zadeva: 'Izguba prenosne naprave',
    tip_porocila: 'koncno_porocilo',
    // Sekcija 1: Splošne informacije
    naziv_subjekta: 'Podjetje d.o.o.',
    sektor: 'Javna uprava',
    kontakt_tehnicni_ime: 'Katja Pavlin',
    kontakt_tehnicni_email: 'katja.pavlin@podjetje.si',
    kontakt_tehnicni_telefon: '+386 70 333 444',
    kontakt_oseba_ime: 'Martin Kosec',
    kontakt_oseba_email: 'martin.kosec@podjetje.si',
    kontakt_oseba_telefon: '+386 70 111 222',
    // Sekcija 2: Začetne informacije
    zacetek_incidenta: '2024-10-02T14:00:00Z',
    cas_zaznave: '2024-10-02T16:30:00Z',
    opis_incidenta: 'Zaposleni je na potovanju v Ljubljani izgubil prenosni računalnik z delovnega potovanja. Naprava je vsebovala Excel datoteke s projektnimi podatki in seznamom strank.',
    taksonomija: 'varnost_informacijskih_virov',
    ocena_nevarnosti: 'Nizka',
    ocena_vpliva: 'Nizek do srednji vpliv - naprava je bila šifrirana z BitLocker, vendar je bil možen dostop do podatkov prek gesla, če ga je napadalec poznal. Prizadeti so projektni podatki in podatki strank.',
    stopnja_incidenta: '2',
    opombe: 'Naprava je bila pozneje najdena, vendar je bila vklopljena',
    // Sekcija 3: Vmesno/končno poročanje
    cas_zadnjega_porocanja: '2024-10-04T14:20:00Z',
    trenutno_stanje: 'Zaključen',
    opis_napake_sistem: 'Windows 11 laptop',
    opis_napake_streznik: null,
    opis_napake_aplikacije: 'Microsoft Office, project management software',
    opis_napake_drugo: null,
    izvor_usb: false,
    izvor_email: false,
    izvor_vdor: false,
    izvor_spletno: false,
    izvor_datoteke: false,
    izvor_drugo: 'Človeška napaka - izguba',
    ogrozena_storitev_zinfv: false,
    ogrozena_storitev_ostale: false,
    cezmejni_vpliv_da_ne: false,
    cezmejni_vpliv_opis: null,
    akcijski_ze_sprejeti: 'Oddaljena blokada naprave, sprememba gesel, sprememba pristopnih podatkov do sistemov',
    akcijski_nacrtovani: 'Implementacija MDM rešitve, izboljšanje šifriranja, politika za prenosne naprave',
    povzrocena_skoda: 'Ocenjena na 3.500 EUR (nakup nove naprave, administrativni stroški)',
    potrebe_odprava: 'MDM sistem, BitLocker with TPM, device usage policy',
    casovni_okvir: '14 dni',
    priloge_seznam: 'Incident report, device tracking logs, recovery confirmation, policy update'
  }
]

export default function CyberIncidentReportPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form')
  const [reports, setReports] = useState<CyberIncidentReport[]>([])
  const [filteredReports, setFilteredReports] = useState<CyberIncidentReport[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedReport, setSelectedReport] = useState<CyberIncidentReport | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isSendingToSICERT, setIsSendingToSICERT] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isDemoMode] = useState(new URLSearchParams(window.location.search).get('demo') === 'true')

  // Form state with extended fields
  const [formData, setFormData] = useState<any>({
    // Legacy fields
    incident_number: '',
    detection_datetime: '',
    incident_type: '',
    incident_description: '',
    impact_assessment: '',
    incident_status: 'v teku',
    entity_identifier: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    report_datetime: new Date().toISOString().slice(0, 16),
    incident_cause: '',
    incident_impact: '',
    response_measures: '',
    lessons_learned: '',
    report_type: 'prvo_porocilo',
    // Sekcija 0: Osnovni podatki
    referencna_stevilka: '',
    zadeva: '',
    tip_porocila: 'prvo_porocilo',
    // Sekcija 1: Splošne informacije
    naziv_subjekta: '',
    sektor: '',
    kontakt_tehnicni_ime: '',
    kontakt_tehnicni_email: '',
    kontakt_tehnicni_telefon: '',
    kontakt_oseba_ime: '',
    kontakt_oseba_email: '',
    kontakt_oseba_telefon: '',
    // Sekcija 2: Začetne informacije
    zacetek_incidenta: '',
    cas_zaznave: '',
    opis_incidenta: '',
    taksonomija: '',
    ocena_nevarnosti: '',
    ocena_vpliva: '',
    stopnja_incidenta: '',
    opombe: '',
    // Sekcija 3: Vmesno/končno poročanje
    cas_zadnjega_porocanja: '',
    trenutno_stanje: '',
    opis_napake_sistem: '',
    opis_napake_streznik: '',
    opis_napake_aplikacije: '',
    opis_napake_drugo: '',
    izvor_usb: false,
    izvor_email: false,
    izvor_vdor: false,
    izvor_spletno: false,
    izvor_datoteke: false,
    izvor_drugo: '',
    ogrozena_storitev_zinfv: false,
    ogrozena_storitev_ostale: false,
    cezmejni_vpliv_da_ne: false,
    cezmejni_vpliv_opis: '',
    akcijski_ze_sprejeti: '',
    akcijski_nacrtovani: '',
    povzrocena_skoda: '',
    potrebe_odprava: '',
    casovni_okvir: '',
    priloge_seznam: ''
  })

  // Get user profile with organization context
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, organization_id')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user])

  // Load reports when organization is available (or in demo mode)
  useEffect(() => {
    if (isDemoMode || userProfile?.organization_id) {
      fetchReports()
    }
  }, [userProfile, isDemoMode])

  // Filter reports when filter changes
  useEffect(() => {
    let displayReports = reports
    
    // Pokaži demo zapise, če ni podatkov iz baze
    if (reports.length === 0) {
      displayReports = DEMO_INCIDENTS
    }
    
    if (filterType === 'all') {
      setFilteredReports(displayReports)
    } else {
      setFilteredReports(displayReports.filter(report => report.report_type === filterType || report.tip_porocila === filterType))
    }
  }, [reports, filterType])

  const fetchReports = async () => {
    // V demo načinu ne potrebujemo organizacije
    if (!isDemoMode && !userProfile?.organization_id) {
      setLoading(false)
      return
    }

    setLoading(true)
    
    if (isDemoMode) {
      // V demo načinu prikaži samo demo podatke
      setReports([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('cyber_incident_reports')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Napaka pri nalaganju poročil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const requiredFields = [
      'zadeva',
      'naziv_subjekta',
      'sektor',
      'kontakt_oseba_ime',
      'kontakt_oseba_email',
      'zacetek_incidenta',
      'cas_zaznave',
      'opis_incidenta',
      'taksonomija',
      'ocena_nevarnosti',
      'ocena_vpliva',
      'stopnja_incidenta'
    ]

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
    
    if (missingFields.length > 0) {
      setSubmitMessage({
        type: 'error',
        text: `Manjkajo obvezna polja: ${missingFields.join(', ')}`
      })
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.kontakt_oseba_email)) {
      setSubmitMessage({
        type: 'error',
        text: 'Neveljaven format e-poštnega naslova'
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      // Clean formData - convert empty strings to null for database
      const cleanedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      )

      // Add organization_id to the data
      cleanedData.organization_id = userProfile.organization_id

      const { error } = await supabase
        .from('cyber_incident_reports')
        .insert([cleanedData])

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Napaka pri shranjevanju: ${error.message}`)
      }

      setSubmitMessage({
        type: 'success',
        text: 'Poročilo je bilo uspešno shranjeno in si ga lahko ogledate med ostalimi poročili, tako da zgoraj kliknete na opcijo Seznam poročil. V podrobnostih posameznega poročila lahko poročilo izvozite in kot Prilogo E pošljete na SI-CERT.'
      })

      // Switch to list tab after 3 seconds
      setTimeout(() => {
        setActiveTab('list')
        setSubmitMessage(null)
      }, 5000)

      // Reset form
      setFormData({
        incident_number: '',
        detection_datetime: '',
        incident_type: '',
        incident_description: '',
        impact_assessment: '',
        incident_status: 'v teku',
        entity_identifier: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        report_datetime: new Date().toISOString().slice(0, 16),
        incident_cause: '',
        incident_impact: '',
        response_measures: '',
        lessons_learned: '',
        report_type: 'prvo_porocilo',
        referencna_stevilka: '',
        zadeva: '',
        tip_porocila: 'prvo_porocilo',
        naziv_subjekta: '',
        sektor: '',
        kontakt_tehnicni_ime: '',
        kontakt_tehnicni_email: '',
        kontakt_tehnicni_telefon: '',
        kontakt_oseba_ime: '',
        kontakt_oseba_email: '',
        kontakt_oseba_telefon: '',
        zacetek_incidenta: '',
        cas_zaznave: '',
        opis_incidenta: '',
        taksonomija: '',
        ocena_nevarnosti: '',
        ocena_vpliva: '',
        stopnja_incidenta: '',
        opombe: '',
        cas_zadnjega_porocanja: '',
        trenutno_stanje: '',
        opis_napake_sistem: '',
        opis_napake_streznik: '',
        opis_napake_aplikacije: '',
        opis_napake_drugo: '',
        izvor_usb: false,
        izvor_email: false,
        izvor_vdor: false,
        izvor_spletno: false,
        izvor_datoteke: false,
        izvor_drugo: '',
        ogrozena_storitev_zinfv: false,
        ogrozena_storitev_ostale: false,
        cezmejni_vpliv_da_ne: false,
        cezmejni_vpliv_opis: '',
        akcijski_ze_sprejeti: '',
        akcijski_nacrtovani: '',
        povzrocena_skoda: '',
        potrebe_odprava: '',
        casovni_okvir: '',
        priloge_seznam: ''
      })

      // Refresh reports list
      fetchReports()

    } catch (error) {
      console.error('Napaka pri pošiljanju poročila:', error)
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Napaka pri pošiljanju poročila. Poskusite ponovno.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendReportToSICERT = async (report: CyberIncidentReport) => {
    setIsSendingToSICERT(true)

    try {
      // Step 1: Generate PDF
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-incident-report-pdf', {
        body: { reportId: report.id }
      })

      if (pdfError) throw new Error('Napaka pri generiranju PDF')

      // Step 2: Download PDF automatically
      const blob = new Blob([pdfData], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      const incidentNumber = report.incident_number || report.referencna_stevilka || `INC-${report.id.slice(0, 8)}`
      const date = new Date().toISOString().split('T')[0]
      const fileName = `Porocilo_${incidentNumber}_${date}.html`
      
      const downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.download = fileName
      downloadLink.click()
      URL.revokeObjectURL(url)

      // Step 3: Prepare and open mailto
      const subject = encodeURIComponent(`Prijava incidenta - ${report.zadeva || report.referencna_stevilka || 'Nov incident'}`)
      const body = encodeURIComponent(`Spoštovani,

v prilogi vam pošiljam poročilo o kibernetskem incidentu.

Osnovni podatki:
- Zadeva: ${report.zadeva || 'N/A'}
- Referenčna številka: ${report.referencna_stevilka || 'N/A'}
- Tip poročila: ${TIP_POROCILA_OPTIONS.find(t => t.value === report.tip_porocila)?.label || report.tip_porocila || 'N/A'}
- Subjekt: ${report.naziv_subjekta || 'N/A'}

NAVODILA:
1. PDF poročilo je bilo avtomatsko preneseno na vaš računalnik (${fileName})
2. Odprite HTML datoteko v brskalniku
3. Natisnite v PDF (File → Print → Save as PDF)
4. Priložite končni PDF k temu sporočilu pred pošiljanjem

Lep pozdrav,
${report.kontakt_oseba_ime || report.contact_name || ''}`)

      // Small delay to ensure PDF download started
      setTimeout(() => {
        window.location.href = `mailto:cert@cert.si?subject=${subject}&body=${body}`
      }, 500)

      // Show success message
      alert('Dokument (Priloga E - NOKI) je prenesen, e-poštni odjemalec se bo odprl. Sledite navodilom v sporočilu za dokončanje pošiljanja na SI-CERT.')

    } catch (error) {
      console.error('Napaka pri pošiljanju na SI-CERT:', error)
      alert(`Napaka: ${error instanceof Error ? error.message : 'Poskusite ponovno.'}`)
    } finally {
      setIsSendingToSICERT(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'v teku':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'rešen':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'zaprt':
        return <X className="w-4 h-4 text-gray-400" />
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'v teku':
        return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`
      case 'rešen':
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`
      case 'zaprt':
        return `${baseClasses} bg-gray-500/20 text-gray-400 border border-gray-500/30`
      default:
        return `${baseClasses} bg-orange-500/20 text-orange-400 border border-orange-500/30`
    }
  }

  const getReportTypeBadge = (type: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    switch (type) {
      case 'prvo_porocilo':
        return `${baseClasses} bg-blue-500/20 text-blue-400 border border-blue-500/30`
      case 'vmesno_porocilo':
        return `${baseClasses} bg-purple-500/20 text-purple-400 border border-purple-500/30`
      case 'obvescanje_pno':
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`
      default:
        return `${baseClasses} bg-gray-500/20 text-gray-400 border border-gray-500/30`
    }
  }

  const getReportTypeLabel = (type: string) => {
    const reportType = REPORT_TYPES.find(rt => rt.value === type)
    return reportType ? reportType.label : type
  }

  const handleViewDetails = (report: CyberIncidentReport) => {
    setSelectedReport(report)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedReport(null)
  }

  const handleExportPDF = async (report: CyberIncidentReport) => {
    setIsExportingPDF(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-incident-report-pdf', {
        body: { reportId: report.id }
      })

      if (error) throw error

      // Create blob from HTML and trigger download with print-to-PDF
      const blob = new Blob([data], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Open in new window for printing to PDF
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 250)
        }
      }

      // Alternative: Direct HTML download
      const incidentNumber = report.incident_number || `INC-${report.id.slice(0, 8)}`
      const date = new Date().toISOString().split('T')[0]
      const fileName = `Porocilo_${incidentNumber}_${date}.html`
      
      const downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.download = fileName
      downloadLink.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Napaka pri izvozu PDF. Poskusite ponovno.')
    } finally {
      setIsExportingPDF(false)
    }
  }

  // Show loading state (skip in demo mode)
  if (!isDemoMode && !userProfile?.organization_id && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show organization required message (skip in demo mode)
  if (!isDemoMode && !userProfile?.organization_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Organizacija je obvezna
          </h3>
          <p className="text-gray-400">
            Dostop do poročil zahteva povezavo z organizacijo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Poročanje o kibernetskih incidentih</h1>
          <p className="text-gray-400 mt-1">NOKI - Nacionalni načrt odzivanja na kibernetske incidente</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('form')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'form'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          Novo poročilo
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          Seznam poročil
        </button>
      </div>

      {/* Form Tab with Accordion Sections */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Sekcija 0: Osnovni podatki incidenta */}
            <AccordionSection 
              title="Osnovni podatki incidenta" 
              subtitle="Referenčna številka, zadeva in tip poročila"
              sectionNumber="0"
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Referenčna številka
                  </label>
                  <input
                    type="text"
                    value={formData.referencna_stevilka}
                    onChange={(e) => handleInputChange('referencna_stevilka', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="Določi odzivni center"
                    disabled
                    readOnly
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Zadeva *
                  </label>
                  <input
                    type="text"
                    value={formData.zadeva}
                    onChange={(e) => handleInputChange('zadeva', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="Zadeva incidenta"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Tip poročila *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TIP_POROCILA_OPTIONS.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('tip_porocila', type.value)}
                        className={`p-3 text-left rounded-lg border transition-all ${
                          formData.tip_porocila === type.value
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-gray-600/50 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="font-medium text-sm">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* Sekcija 1: Splošne informacije o poročevalcu */}
            <AccordionSection 
              title="Splošne informacije o poročevalcu" 
              subtitle="Podatki o subjektu in kontaktne informacije"
              sectionNumber="1"
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Naziv subjekta, ki poroča *
                  </label>
                  <input
                    type="text"
                    value={formData.naziv_subjekta}
                    onChange={(e) => handleInputChange('naziv_subjekta', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="Ime organizacije"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sektor zavezanca *
                  </label>
                  <select
                    value={formData.sektor}
                    onChange={(e) => handleInputChange('sektor', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    required
                  >
                    <option value="">Izberite sektor</option>
                    {SEKTOR_OPTIONS.map((sektor) => (
                      <option key={sektor} value={sektor}>
                        {sektor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-400 mb-3">Kontaktni podatki za tehnična vprašanja</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ime in priimek
                      </label>
                      <input
                        type="text"
                        value={formData.kontakt_tehnicni_ime}
                        onChange={(e) => handleInputChange('kontakt_tehnicni_ime', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Ime priimek"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        E-pošta
                      </label>
                      <input
                        type="email"
                        value={formData.kontakt_tehnicni_email}
                        onChange={(e) => handleInputChange('kontakt_tehnicni_email', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="ime@podjetje.si"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.kontakt_tehnicni_telefon}
                        onChange={(e) => handleInputChange('kontakt_tehnicni_telefon', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="+386 XX XXX XXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-400 mb-3">Kontaktna oseba zavezanca</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ime in priimek *
                      </label>
                      <input
                        type="text"
                        value={formData.kontakt_oseba_ime}
                        onChange={(e) => handleInputChange('kontakt_oseba_ime', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Ime priimek"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        E-pošta *
                      </label>
                      <input
                        type="email"
                        value={formData.kontakt_oseba_email}
                        onChange={(e) => handleInputChange('kontakt_oseba_email', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="ime@podjetje.si"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.kontakt_oseba_telefon}
                        onChange={(e) => handleInputChange('kontakt_oseba_telefon', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="+386 XX XXX XXX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* Sekcija 2: Začetne informacije o incidentu */}
            <AccordionSection 
              title="Začetne informacije o incidentu" 
              subtitle="Podrobnosti o incidentu in oceni vpliva"
              sectionNumber="2"
              defaultOpen={false}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Začetek/nastanek incidenta *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.zacetek_incidenta}
                    onChange={(e) => handleInputChange('zacetek_incidenta', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Čas zaznave incidenta v sistemu *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.cas_zaznave}
                    onChange={(e) => handleInputChange('cas_zaznave', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Opis incidenta *
                  </label>
                  <textarea
                    value={formData.opis_incidenta}
                    onChange={(e) => handleInputChange('opis_incidenta', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="Opišite incident..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Taksonomija *
                  </label>
                  <select
                    value={formData.taksonomija}
                    onChange={(e) => handleInputChange('taksonomija', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    required
                  >
                    <option value="">Izberite taksonomijo</option>
                    {INCIDENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ocena stopnje nevarnosti *
                  </label>
                  <select
                    value={formData.ocena_nevarnosti}
                    onChange={(e) => handleInputChange('ocena_nevarnosti', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    required
                  >
                    <option value="">Izberite oceno</option>
                    {OCENA_NEVARNOSTI_OPTIONS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ocena možnega vpliva *
                  </label>
                  <textarea
                    value={formData.ocena_vpliva}
                    onChange={(e) => handleInputChange('ocena_vpliva', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="Ocenite možni vpliv incidenta..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ocena stopnje incidenta (1-5) *
                  </label>
                  <select
                    value={formData.stopnja_incidenta}
                    onChange={(e) => handleInputChange('stopnja_incidenta', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    required
                  >
                    <option value="">Izberite stopnjo</option>
                    {STOPNJA_INCIDENTA_OPTIONS.map((level) => (
                      <option key={level} value={level}>
                        Stopnja {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Opombe
                  </label>
                  <textarea
                    value={formData.opombe}
                    onChange={(e) => handleInputChange('opombe', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    placeholder="Dodatne opombe..."
                  />
                </div>
              </div>
            </AccordionSection>

            {/* Sekcija 3: Vmesno/končno poročanje */}
            <AccordionSection 
              title="Vmesno/končno poročanje" 
              subtitle="Stanje incidenta, ukrepi in posledice"
              sectionNumber="3"
              defaultOpen={false}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Čas zadnjega poročanja
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.cas_zadnjega_porocanja}
                      onChange={(e) => handleInputChange('cas_zadnjega_porocanja', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Trenutno stanje kibernetskega incidenta
                    </label>
                    <select
                      value={formData.trenutno_stanje}
                      onChange={(e) => handleInputChange('trenutno_stanje', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    >
                      <option value="">Izberite stanje</option>
                      {TRENUTNO_STANJE_OPTIONS.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-400 mb-3">Opis napake - Prizadeta sredstva</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sistem
                      </label>
                      <textarea
                        value={formData.opis_napake_sistem}
                        onChange={(e) => handleInputChange('opis_napake_sistem', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Okvara/zloraba sistema..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Strežnik
                      </label>
                      <textarea
                        value={formData.opis_napake_streznik}
                        onChange={(e) => handleInputChange('opis_napake_streznik', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Okvara/zloraba strežnika..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Aplikacije
                      </label>
                      <textarea
                        value={formData.opis_napake_aplikacije}
                        onChange={(e) => handleInputChange('opis_napake_aplikacije', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Nedelujoče aplikacije..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Drugo
                      </label>
                      <textarea
                        value={formData.opis_napake_drugo}
                        onChange={(e) => handleInputChange('opis_napake_drugo', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Druge napake..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-400 mb-3">Izvor incidenta</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.izvor_usb}
                        onChange={(e) => handleInputChange('izvor_usb', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">USB ključ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.izvor_email}
                        onChange={(e) => handleInputChange('izvor_email', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">Elektronsko sporočilo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.izvor_vdor}
                        onChange={(e) => handleInputChange('izvor_vdor', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">Vdor v sistem</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.izvor_spletno}
                        onChange={(e) => handleInputChange('izvor_spletno', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">Spletno mesto</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.izvor_datoteke}
                        onChange={(e) => handleInputChange('izvor_datoteke', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">Zlonamerne datoteke</span>
                    </label>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Drugo (opredelite)
                      </label>
                      <input
                        type="text"
                        value={formData.izvor_drugo}
                        onChange={(e) => handleInputChange('izvor_drugo', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Opredelite drug izvor..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ogrozena_storitev_zinfv}
                        onChange={(e) => handleInputChange('ogrozena_storitev_zinfv', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">Bistvena storitev ZInfV</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ogrozena_storitev_ostale}
                        onChange={(e) => handleInputChange('ogrozena_storitev_ostale', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">Ostale storitve</span>
                    </label>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-orange-400 mb-3">Čezmejni vpliv incidenta</h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.cezmejni_vpliv_da_ne}
                        onChange={(e) => handleInputChange('cezmejni_vpliv_da_ne', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-sm text-gray-300">Ali ima incident vpliv na druge države?</span>
                    </label>
                    {formData.cezmejni_vpliv_da_ne && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Opis čezmejnega vpliva (katera država, kakšen vpliv)
                        </label>
                        <textarea
                          value={formData.cezmejni_vpliv_opis}
                          onChange={(e) => handleInputChange('cezmejni_vpliv_opis', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                          placeholder="Opišite čezmejni vpliv..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-400 mb-3">Akcijski načrt in protiukrepi</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Že sprejeti ukrepi
                      </label>
                      <textarea
                        value={formData.akcijski_ze_sprejeti}
                        onChange={(e) => handleInputChange('akcijski_ze_sprejeti', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Opišite ukrepe, ki so bili že sprejeti..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Načrtovani ukrepi
                      </label>
                      <textarea
                        value={formData.akcijski_nacrtovani}
                        onChange={(e) => handleInputChange('akcijski_nacrtovani', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Opišite načrtovane ukrepe..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Povzročena škoda
                    </label>
                    <textarea
                      value={formData.povzrocena_skoda}
                      onChange={(e) => handleInputChange('povzrocena_skoda', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder="Opišite povzročeno škodo..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Potrebe za odpravo posledic
                    </label>
                    <textarea
                      value={formData.potrebe_odprava}
                      onChange={(e) => handleInputChange('potrebe_odprava', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder="Opišite potrebe za odpravo..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Časovni okvir odprave posledic
                    </label>
                    <input
                      type="text"
                      value={formData.casovni_okvir}
                      onChange={(e) => handleInputChange('casovni_okvir', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder="npr. 24 ur, 3 dni..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priloge (seznam dokumentov)
                    </label>
                    <textarea
                      value={formData.priloge_seznam}
                      onChange={(e) => handleInputChange('priloge_seznam', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder="Seznam priloženih dokumentov..."
                    />
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`p-4 rounded-lg border ${
                submitMessage.type === 'success'
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {submitMessage.text}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25"
              >
                {isSubmitting ? 'Shranjujem...' : 'Shrani poročilo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filtriraj po vrsti poročila
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              >
                <option value="all">Vsi tipi</option>
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReports}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-200"
              >
                {loading ? 'Nalagam...' : 'Osveži'}
              </button>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/30 border-b border-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Incident
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Naziv subjekta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tip poročila
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Datum začetka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-white font-medium flex items-center gap-2">
                          <span>{report.referencna_stevilka || report.incident_number || `INC-${report.id.slice(0, 8)}`}</span>
                          {report.id.startsWith('demo-') && (
                            <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full">
                              DEMO
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 max-w-xs truncate">
                          {report.zadeva || report.opis_incidenta || report.incident_description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{report.naziv_subjekta || report.entity_identifier || '-'}</div>
                        <div className="text-sm text-gray-400">{report.sektor || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getReportTypeBadge(report.tip_porocila || report.report_type)}>
                          {TIP_POROCILA_OPTIONS.find(t => t.value === report.tip_porocila)?.label || 
                           REPORT_TYPES.find(t => t.value === report.report_type)?.label || 
                           report.tip_porocila || report.report_type || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {report.zacetek_incidenta 
                            ? new Date(report.zacetek_incidenta).toLocaleDateString('sl-SI')
                            : report.detection_datetime 
                            ? new Date(report.detection_datetime).toLocaleDateString('sl-SI')
                            : '-'
                          }
                        </div>
                        <div className="text-sm text-gray-400">
                          {report.zacetek_incidenta 
                            ? new Date(report.zacetek_incidenta).toLocaleTimeString('sl-SI')
                            : report.detection_datetime 
                            ? new Date(report.detection_datetime).toLocaleTimeString('sl-SI')
                            : ''
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(report.trenutno_stanje || report.incident_status)}>
                          {getStatusIcon(report.trenutno_stanje || report.incident_status)}
                          {report.trenutno_stanje || report.incident_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(report)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 transition-all duration-200 group"
                          title="Podrobnosti poročila"
                        >
                          <Eye className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredReports.length === 0 && !loading && (
                <div className="text-center py-12">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-300">Ni poročil</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {filterType === 'all' 
                      ? 'Še ni bilo ustvarjenih poročil.'
                      : 'Ni poročil za izbrani tip.'
                    }
                  </p>
                </div>
              )}
              
              {reports.length === 0 && !loading && filteredReports.length > 0 && (
                <div className="text-center py-6">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-blue-400" />
                      <h3 className="text-sm font-medium text-blue-400">Demo podatki</h3>
                    </div>
                    <p className="text-sm text-blue-300">
                      Prikazani so primeri testnih zapisov incidentov. V bazi podatkov ni realnih poročil za to organizacijo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Podrobnosti poročila</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedReport.incident_number || `INC-${selectedReport.id.slice(0, 8)}`}
                </p>
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Report Type and Status */}
              <div className="flex flex-wrap gap-3">
                <span className={getReportTypeBadge(selectedReport.report_type)}>
                  {getReportTypeLabel(selectedReport.report_type)}
                </span>
                <span className={getStatusBadge(selectedReport.incident_status)}>
                  {getStatusIcon(selectedReport.incident_status)}
                  {selectedReport.incident_status || selectedReport.trenutno_stanje}
                </span>
              </div>

              {/* Sekcija 0: Osnovni podatki */}
              {(selectedReport.referencna_stevilka || selectedReport.zadeva || selectedReport.tip_porocila) && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-400 mb-4">0. Osnovni podatki incidenta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedReport.referencna_stevilka && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Referenčna številka</div>
                        <div className="text-sm text-white">{selectedReport.referencna_stevilka}</div>
                      </div>
                    )}
                    {selectedReport.tip_porocila && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Tip poročila</div>
                        <div className="text-sm text-white">
                          {TIP_POROCILA_OPTIONS.find(t => t.value === selectedReport.tip_porocila)?.label || selectedReport.tip_porocila}
                        </div>
                      </div>
                    )}
                    {selectedReport.zadeva && (
                      <div className="md:col-span-2">
                        <div className="text-xs text-gray-400 mb-1">Zadeva</div>
                        <div className="text-sm text-white">{selectedReport.zadeva}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sekcija 1: Splošne informacije */}
              {(selectedReport.naziv_subjekta || selectedReport.sektor || selectedReport.kontakt_tehnicni_ime || selectedReport.kontakt_oseba_ime) && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-400 mb-4">1. Splošne informacije o poročevalcu</h3>
                  {selectedReport.naziv_subjekta && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-1">Naziv subjekta</div>
                      <div className="text-sm text-white">{selectedReport.naziv_subjekta}</div>
                    </div>
                  )}
                  {selectedReport.sektor && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-1">Sektor</div>
                      <div className="text-sm text-white">{selectedReport.sektor}</div>
                    </div>
                  )}
                  {selectedReport.kontakt_tehnicni_ime && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Kontakt za tehnična vprašanja</div>
                      <div className="text-sm text-white">{selectedReport.kontakt_tehnicni_ime}</div>
                      {selectedReport.kontakt_tehnicni_email && (
                        <div className="text-xs text-gray-500">{selectedReport.kontakt_tehnicni_email}</div>
                      )}
                      {selectedReport.kontakt_tehnicni_telefon && (
                        <div className="text-xs text-gray-500">{selectedReport.kontakt_tehnicni_telefon}</div>
                      )}
                    </div>
                  )}
                  {selectedReport.kontakt_oseba_ime && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Kontaktna oseba zavezanca</div>
                      <div className="text-sm text-white">{selectedReport.kontakt_oseba_ime}</div>
                      {selectedReport.kontakt_oseba_email && (
                        <div className="text-xs text-gray-500">{selectedReport.kontakt_oseba_email}</div>
                      )}
                      {selectedReport.kontakt_oseba_telefon && (
                        <div className="text-xs text-gray-500">{selectedReport.kontakt_oseba_telefon}</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Sekcija 2: Začetne informacije */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-orange-400 mb-4">2. Začetne informacije o incidentu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {(selectedReport.zacetek_incidenta || selectedReport.detection_datetime) && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        {selectedReport.zacetek_incidenta ? 'Začetek incidenta' : 'Datum in čas odkritja'}
                      </div>
                      <div className="text-sm text-white font-medium">
                        {selectedReport.zacetek_incidenta 
                          ? new Date(selectedReport.zacetek_incidenta).toLocaleString('sl-SI')
                          : selectedReport.detection_datetime 
                            ? new Date(selectedReport.detection_datetime).toLocaleString('sl-SI')
                            : '-'
                        }
                      </div>
                    </div>
                  )}
                  {selectedReport.report_datetime && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Datum poročanja</div>
                      <div className="text-sm text-white font-medium">
                        {new Date(selectedReport.report_datetime).toLocaleString('sl-SI')}
                      </div>
                    </div>
                  )}
                  {(selectedReport.taksonomija || selectedReport.incident_type) && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Vrsta incidenta</div>
                      <div className="text-sm text-white font-medium">
                        {selectedReport.taksonomija 
                          ? INCIDENT_TYPES.find(t => t.value === selectedReport.taksonomija)?.category || selectedReport.taksonomija
                          : selectedReport.incident_type 
                            ? INCIDENT_TYPES.find(t => t.value === selectedReport.incident_type)?.category || selectedReport.incident_type
                            : '-'
                        }
                      </div>
                    </div>
                  )}
                  {selectedReport.ocena_nevarnosti && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Ocena nevarnosti</div>
                      <div className="text-sm text-white font-medium">{selectedReport.ocena_nevarnosti}</div>
                    </div>
                  )}
                  {selectedReport.ocena_vpliva && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Ocena vpliva</div>
                      <div className="text-sm text-white font-medium">{selectedReport.ocena_vpliva}</div>
                    </div>
                  )}
                  {selectedReport.stopnja_incidenta && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Stopnja incidenta</div>
                      <div className="text-sm text-white font-medium">{selectedReport.stopnja_incidenta}</div>
                    </div>
                  )}
                  {selectedReport.entity_identifier && (
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Identifikator entitete</div>
                      <div className="text-sm text-white font-medium">{selectedReport.entity_identifier}</div>
                    </div>
                  )}
                </div>

                {(selectedReport.opis_incidenta || selectedReport.incident_description) && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Opis incidenta</div>
                    <div className="text-sm text-white whitespace-pre-wrap">
                      {selectedReport.opis_incidenta || selectedReport.incident_description || '-'}
                    </div>
                  </div>
                )}

                {(selectedReport.impact_assessment || selectedReport.opombe) && (
                  <div>
                    {selectedReport.impact_assessment && (
                      <div className="mb-4">
                        <div className="text-xs text-gray-400 mb-2">Ocena vpliva</div>
                        <div className="text-sm text-white whitespace-pre-wrap">{selectedReport.impact_assessment}</div>
                      </div>
                    )}
                    {selectedReport.opombe && (
                      <div>
                        <div className="text-xs text-gray-400 mb-2">Opombe</div>
                        <div className="text-sm text-white whitespace-pre-wrap">{selectedReport.opombe}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sekcija 3: Vmesno/končno poročanje */}
              {(selectedReport.cas_zadnjega_porocanja || selectedReport.trenutno_stanje || selectedReport.akcijski_ze_sprejeti || selectedReport.opis_napake_sistem) && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-400 mb-4">3. Vmesno/končno poročanje</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {selectedReport.cas_zadnjega_porocanja && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Čas zadnjega poročanja</div>
                        <div className="text-sm text-white">
                          {new Date(selectedReport.cas_zadnjega_porocanja).toLocaleString('sl-SI')}
                        </div>
                      </div>
                    )}
                    {selectedReport.trenutno_stanje && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Trenutno stanje</div>
                        <div className="text-sm text-white">{selectedReport.trenutno_stanje}</div>
                      </div>
                    )}
                    {selectedReport.cezmejni_vpliv_da_ne !== null && selectedReport.cezmejni_vpliv_da_ne !== undefined && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Čezmejni vpliv</div>
                        <div className="text-sm text-white">{selectedReport.cezmejni_vpliv_da_ne ? 'DA' : 'NE'}</div>
                      </div>
                    )}
                  </div>

                  {(selectedReport.opis_napake_sistem || selectedReport.opis_napake_streznik || selectedReport.opis_napake_aplikacije || selectedReport.opis_napake_drugo) && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Opis napake</div>
                      <div className="text-sm text-white space-y-1">
                        {selectedReport.opis_napake_sistem && (
                          <div><strong>Sistem:</strong> {selectedReport.opis_napake_sistem}</div>
                        )}
                        {selectedReport.opis_napake_streznik && (
                          <div><strong>Strežnik:</strong> {selectedReport.opis_napake_streznik}</div>
                        )}
                        {selectedReport.opis_napake_aplikacije && (
                          <div><strong>Aplikacije:</strong> {selectedReport.opis_napake_aplikacije}</div>
                        )}
                        {selectedReport.opis_napake_drugo && (
                          <div><strong>Drugo:</strong> {selectedReport.opis_napake_drugo}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {(selectedReport.izvor_usb || selectedReport.izvor_email || selectedReport.izvor_vdor || selectedReport.izvor_spletno || selectedReport.izvor_datoteke || selectedReport.izvor_drugo) && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Izvor incidenta</div>
                      <div className="text-sm text-white space-y-1">
                        {selectedReport.izvor_usb && <div>• USB ključ</div>}
                        {selectedReport.izvor_email && <div>• Elektronsko sporočilo</div>}
                        {selectedReport.izvor_vdor && <div>• Vdor v sistem</div>}
                        {selectedReport.izvor_spletno && <div>• Spletno mesto</div>}
                        {selectedReport.izvor_datoteke && <div>• Zlonamerne datoteke</div>}
                        {selectedReport.izvor_drugo && <div>• Drugo: {selectedReport.izvor_drugo}</div>}
                      </div>
                    </div>
                  )}

                  {selectedReport.akcijski_ze_sprejeti && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Že sprejeti ukrepi</div>
                      <div className="text-sm text-white whitespace-pre-wrap">{selectedReport.akcijski_ze_sprejeti}</div>
                    </div>
                  )}

                  {selectedReport.akcijski_nacrtovani && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Načrtovani ukrepi</div>
                      <div className="text-sm text-white whitespace-pre-wrap">{selectedReport.akcijski_nacrtovani}</div>
                    </div>
                  )}

                  {selectedReport.povzrocena_skoda && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Povzročena škoda</div>
                      <div className="text-sm text-white whitespace-pre-wrap">{selectedReport.povzrocena_skoda}</div>
                    </div>
                  )}

                  {selectedReport.potrebe_odprava && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Potrebe za odpravo posledic</div>
                      <div className="text-sm text-white whitespace-pre-wrap">{selectedReport.potrebe_odprava}</div>
                    </div>
                  )}

                  {selectedReport.casovni_okvir && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Časovni okvir odprave</div>
                      <div className="text-sm text-white whitespace-pre-wrap">{selectedReport.casovni_okvir}</div>
                    </div>
                  )}

                  {selectedReport.response_measures && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Odzivni ukrepi</div>
                      <div className="text-sm text-white whitespace-pre-wrap">{selectedReport.response_measures}</div>
                    </div>
                  )}

                  {selectedReport.lessons_learned && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Pridobljene izkušnje</div>
                      <div className="text-sm text-white whitespace-pre-wrap">{selectedReport.lessons_learned}</div>
                    </div>
                  )}

                  {selectedReport.priloge_seznam && (
                    <div className="mt-4">
                      <div className="text-xs text-gray-400 mb-2">Priloge</div>
                      <div className="text-sm text-white whitespace-pre-wrap">{selectedReport.priloge_seznam}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Legacy kontaktne informacije (če novejši kontakti ne obstajajo) */}
              {!selectedReport.kontakt_oseba_ime && (selectedReport.contact_name || selectedReport.contact_email || selectedReport.contact_phone) && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-3">Kontaktne informacije</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedReport.contact_name && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Ime</div>
                        <div className="text-sm text-white">{selectedReport.contact_name}</div>
                      </div>
                    )}
                    {selectedReport.contact_email && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">E-pošta</div>
                        <div className="text-sm text-white">{selectedReport.contact_email}</div>
                      </div>
                    )}
                    {selectedReport.contact_phone && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Telefon</div>
                        <div className="text-sm text-white">{selectedReport.contact_phone}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                <div className="text-xs text-gray-400 mb-3">Metapodatki</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">ID poročila</div>
                    <div className="text-sm text-white font-mono">{selectedReport.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Ustvarjeno</div>
                    <div className="text-sm text-white">
                      {new Date(selectedReport.created_at).toLocaleString('sl-SI')}
                    </div>
                  </div>
                  {selectedReport.updated_at && (
                    <>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Posodobljeno</div>
                        <div className="text-sm text-white">
                          {new Date(selectedReport.updated_at).toLocaleString('sl-SI')}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700/50 px-6 py-4 flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => handleExportPDF(selectedReport)}
                  disabled={isExportingPDF}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25"
                >
                  <Download className="w-4 h-4" />
                  {isExportingPDF ? 'Pripravljam...' : 'Ustvari obrazec za poročanje na SI-CERT - Priloga E'}
                </button>
                <button
                  onClick={() => handleSendReportToSICERT(selectedReport)}
                  disabled={isSendingToSICERT}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-green-600/25"
                >
                  <Mail className="w-4 h-4" />
                  {isSendingToSICERT ? 'Pošiljam...' : 'Pošlji na SI-CERT'}
                </button>
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Zapri
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}