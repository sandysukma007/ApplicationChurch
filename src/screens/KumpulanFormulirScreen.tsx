import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import { colors } from '../styles/theme';
import { supabase } from '../supabaseClient';
import type { Form } from '../types';
import {
  checkStoragePermission,
  requestStoragePermissionWithExplanation,
  showPermissionDeniedAlert,
} from '../utils/permissions';




interface FormulirItem {
  id: string;
  title: string;
  icon: string;
  gradient: string[];
  available: boolean;
  file_path?: string;
  file_name?: string;
  is_downloadable: boolean;
}


interface KumpulanFormulirScreenProps {
  navigation: any;
}

// Hardcoded formulir list with download support for Baptis Bayi
const formulirList: FormulirItem[] = [
  {
    id: '1',
    title: 'FORM SAKRAMEN BAPTIS BAYI',
    icon: 'child-care',
    gradient: ['#4299e1', '#3182ce'],
    available: true,
    is_downloadable: true,
  },

  { id: '2', title: 'FORM CALON KATEKUMEN', icon: 'school', gradient: ['#48bb78', '#38a169'], available: false, is_downloadable: false },
  { id: '3', title: 'FORM BAPTIS DARURAT', icon: 'emergency', gradient: ['#f56565', '#e53e3e'], available: false, is_downloadable: false },
  { id: '4', title: 'FORM PERNYATAAN MEMBERI IZIN ANAK UNTUK MENJADI KATOLIK', icon: 'assignment', gradient: ['#ed8936', '#dd6b20'], available: false, is_downloadable: false },
  { id: '5', title: 'FORM KOMUNI PERTAMA', icon: 'restaurant', gradient: ['#9f7aea', '#805ad5'], available: false, is_downloadable: false },
  { id: '6', title: 'FORM SAKRAMEN PENGUATAN', icon: 'verified-user', gradient: ['#38b2ac', '#319795'], available: false, is_downloadable: false },
  { id: '7', title: 'FORM PENDAFTARAN PERKAWINAN', icon: 'favorite', gradient: ['#ed64a6', '#d53f8c'], available: false, is_downloadable: false },
  { id: '8', title: 'FORM SURAT PENGANTAR LINGKUNGAN', icon: 'mail', gradient: ['#667eea', '#5a67d8'], available: false, is_downloadable: false },
  { id: '9', title: 'FORM SURAT KETERANGAN DOMISILI', icon: 'home', gradient: ['#48bb78', '#38a169'], available: false, is_downloadable: false },
  { id: '10', title: 'FORM SAKSI PERKAWINAN', icon: 'person-pin', gradient: ['#fbbf24', '#d69e2e'], available: false, is_downloadable: false },
  { id: '11', title: 'FORM MEMBANGUN RUMAH TANGGA', icon: 'family-restroom', gradient: ['#f687b3', '#ed64a6'], available: false, is_downloadable: false },
  { id: '12', title: 'FORM LAPORAN SAKRAMEN PENGURAPAN', icon: 'local-hospital', gradient: ['#fc8181', '#e53e3e'], available: false, is_downloadable: false },
  { id: '13', title: 'FORM LAPORAN KEMATIAN', icon: 'sentiment-dissatisfied', gradient: ['#718096', '#4a5568'], available: false, is_downloadable: false },
  { id: '14', title: 'FORM PINDAH DOMISILI KK', icon: 'swap-horiz', gradient: ['#4299e1', '#3182ce'], available: false, is_downloadable: false },
  { id: '15', title: 'FORM PENAMBAHAN ANGGOTA KK', icon: 'person-add', gradient: ['#48bb78', '#38a169'], available: false, is_downloadable: false },
  { id: '16', title: 'FORM CETAK ULANG KK', icon: 'replay', gradient: ['#ed8936', '#dd6b20'], available: false, is_downloadable: false },
  { id: '17', title: 'FORM PERUBAHAN BIODATA KK', icon: 'edit', gradient: ['#9f7aea', '#805ad5'], available: false, is_downloadable: false },
];


export const KumpulanFormulirScreen: React.FC<KumpulanFormulirScreenProps> = ({ navigation }) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [forms, setForms] = useState<FormulirItem[]>(formulirList);

  // Fetch forms from Supabase (for future admin functionality)
  useEffect(() => {
    fetchFormsFromSupabase();
  }, []);

  const fetchFormsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.log('Supabase forms fetch error (using hardcoded):', error);
        // Keep using hardcoded list if Supabase fails
        return;
      }

      if (data && data.length > 0) {
        // Map Supabase data to FormulirItem format
        const mappedForms: FormulirItem[] = data.map((form: Form) => ({
          id: form.id,
          title: form.title,
          icon: form.icon,
          gradient: form.gradient_colors,
          available: form.is_active,
          is_downloadable: form.is_active,
        }));
        setForms(mappedForms);
      }
    } catch (err) {
      console.log('Error fetching forms:', err);
      // Keep using hardcoded list
    }
  };


  const generateBaptisBayiHTML = (): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Formulir Sakramen Baptis Bayi - Gereja Santa Clara</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
      max-width: 210mm;
      margin: 0 auto;
      padding: 10mm;
    }
    .header {
      text-align: center;
      margin-bottom: 5px;
    }
    .header-title {
      font-size: 14pt;
      font-weight: bold;
      margin: 0;
    }
    .header-subtitle {
      font-size: 12pt;
      font-weight: bold;
      margin: 3px 0;
    }
    .contact-info {
      text-align: center;
      font-size: 9pt;
      margin-bottom: 15px;
      border-bottom: 1px solid #000;
      padding-bottom: 10px;
    }
    .form-title {
      text-align: center;
      font-size: 12pt;
      font-weight: bold;
      margin: 15px 0 5px 0;
    }
    .form-code {
      text-align: center;
      font-size: 9pt;
      margin-bottom: 10px;
    }
    .section-title {
      font-weight: bold;
      font-size: 11pt;
      margin-top: 12px;
      margin-bottom: 8px;
    }
    .syarat {
      margin: 10px 0;
      font-size: 10pt;
    }
    .syarat ul {
      margin: 5px 0;
      padding-left: 20px;
    }
    .syarat li {
      margin-bottom: 3px;
    }
    .data-table {
      width: 100%;
      margin: 8px 0;
    }
    .data-row {
      display: flex;
      margin-bottom: 5px;
      align-items: baseline;
    }
    .data-label {
      min-width: 180px;
      font-weight: normal;
    }
    .data-value {
      flex: 1;
      border-bottom: 1px dotted #000;
      min-height: 18px;
      padding-left: 5px;
    }
    .signature-section {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      text-align: center;
      width: 45%;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 100%;
      margin-top: 50px;
      padding-top: 5px;
    }
    .catatan {
      margin-top: 20px;
      font-size: 9pt;
      border-top: 1px solid #000;
      padding-top: 10px;
    }
    .petugas-section {
      margin-top: 15px;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">Pengurus Gereja dan Dana Papa</div>
    <div class="header-subtitle">SANTA CLARA</div>
    <div style="font-size: 10pt;">Pengurus Dewan Paroki</div>
  </div>

  <div class="contact-info">
    Pastoran & Sekretariat : Jl. Lingkar Utara RT 03 RW 06 Kel. Harapan Baru Bekasi Utara<br>
    Telp. 021-8870327, e-mail : parokisantaklara@gmail.com
  </div>

  <div class="form-title">Formulir Sakramen BAPTIS BAYI/ANAK</div>
  <div class="form-code">FSakr-KAJ-2017-B/001 --- Paroki : Bekasi Utara – St. Clara</div>

  <div class="syarat">
    <strong>Syarat :</strong>
    <ul>
      <li>Anak berusia maksimal 7 tahun.</li>
      <li>Kedua orang tua dan wali baptis wajib mengikuti rekoleksi persiapan pada waktu yang ditentukan.</li>
    </ul>
    <strong>Syarat wali baptis :</strong>
    <ul>
      <li>Seorang katolik yang berusia dewasa dan telah menerima Sakramen Inisiasi (Baptis, Komuni dan Penguatan)</li>
    </ul>
    <strong>Hal yang perlu dilampirkan :</strong>
    <ul>
      <li>Fotocopy akte kelahiran/surat tanda lahir</li>
      <li>Fotocopy KK Gereja</li>
      <li>Fotocopy akte perkawinan agama</li>
      <li>Fotocopy akte perkawinan sipil</li>
      <li>Surat Pengantar Pastor Paroki, jika dari luar Paroki .......................</li>
      <li>Fotocopy surat baptis wali baptis; Jika di surat baptis belum tercatatkan Sakramen Penguatan maka dilampirkan juga fotocopy sertifikat penerimaan Sakramen Penguatan</li>
    </ul>
  </div>

  <div class="section-title">DATA CALON BAPTIS</div>
  <div class="data-table">
    <div class="data-row">
      <span class="data-label">1. Nama Baptis :</span>
      <span class="data-value">..................................................................</span>
      <span style="margin-left: 10px;">L/P</span>
    </div>
    <div class="data-row">
      <span class="data-label">2. Nama Sendiri :</span>
      <span class="data-value">..................................................................</span>
    </div>
    <div class="data-row">
      <span class="data-label">3. Tempat, tgl. Lahir :</span>
      <span class="data-value">..................................................................</span>
      <span style="margin-left: 10px;">Usia .... tahun</span>
    </div>
    <div class="data-row">
      <span class="data-label">4. Pembaptisan : tanggal</span>
      <span class="data-value">..................................................................</span>
      <span style="margin-left: 10px;">( rencana )</span>
    </div>
    <div class="data-row">
      <span class="data-label">5. Nomor Induk Kependudukan (NIK) Anak :</span>
      <span class="data-value">..................................................................</span>
    </div>
  </div>

  <div class="section-title">DATA ORANG TUA KANDUNG ( lengkap dengan nama baptis )</div>
  <div class="data-table">
    <div class="data-row">
      <span class="data-label">1. Nama Ayah :</span>
      <span class="data-value">..................................................................</span>
    </div>
    <div class="data-row">
      <span class="data-label">2. Agama Ayah :</span>
      <span class="data-value">..................................................................</span>
    </div>
    <div class="data-row">
      <span class="data-label">3. Nama Ibu :</span>
      <span class="data-value">..................................................................</span>
    </div>
    <div class="data-row">
      <span class="data-label">4. Agama Ibu :</span>
      <span class="data-value">..................................................................</span>
    </div>
    <div class="data-row">
      <span class="data-label">5. Alamat :</span>
      <span class="data-value">..................................................................</span>
    </div>
    <div class="data-row">
      <span class="data-label">6. Telepon :</span>
      <span class="data-value">..................................................................</span>
      <span style="margin-left: 20px;">HP : ..................................................................</span>
    </div>
    <div class="data-row">
      <span class="data-label">7. No. KK. gereja :</span>
      <span class="data-value">..................................................................</span>
      <span style="margin-left: 20px;">Wilayah / Lingkungan : ..................................................................</span>
    </div>
  </div>

  <div class="section-title">WALI BAPTIS ( lengkap dengan nama baptis )</div>
  <div class="data-table">
    <div class="data-row">
      <span class="data-label">1. Nama Lengkap :</span>
      <span class="data-value">..................................................................</span>
    </div>
    <div class="data-row">
      <span class="data-label">2. Wilayah/Lingkungan:</span>
      <span class="data-value">..................................................................</span>
      <span style="margin-left: 20px;">Paroki : ..................................................................</span>
    </div>
  </div>

  <div style="margin-top: 20px;">
    Bekasi , ..................................................................
  </div>

  <div style="margin-top: 10px; font-size: 10pt;">
    Diterima pihak sekretariat<br>
    Tanggal : ..........................<br>
    Oleh : ..........................
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div>Orangtua,</div>
      <div class="signature-line">(..............................................)</div>
    </div>
    <div class="signature-box">
      <div>Mengetahui</div>
      <div>Ketua Lingkungan....................</div>
      <div class="signature-line">(....................................................)</div>
    </div>
  </div>

  <div class="catatan">
    <strong>Catatan:</strong><br>
    Formulir dan hal-hal yang dilampirkan diserahkan setelah lengkap ke sekretariat maksimal batas tanggal yang telah ditentukan/diumumkan. Lewat dari tanggal penutupan tanggal pendaftaran maka ikut periode baptisan selanjutnya.
  </div>

  <div class="petugas-section">
    <strong>Diisi oleh petugas Sekretariat Paroki :</strong><br>
    Dibaptis pada Tgl. .....................Jam............ Oleh ...............................................
  </div>
</body>
</html>
    `;
  };

  const generateAndDownloadPDF = async (item: FormulirItem) => {
    setDownloadingId(item.id);
    try {
      // Check storage permission first
      if (Platform.OS === 'android') {
        const hasPermission = await checkStoragePermission();
        if (!hasPermission) {
          const granted = await requestStoragePermissionWithExplanation();
          if (!granted) {
            showPermissionDeniedAlert();
            setDownloadingId(null);
            return;
          }
        }
      }

      const htmlContent = generateBaptisBayiHTML();
      const fileName = `Formulir_Baptis_Bayi_${Date.now()}.pdf`;

      // Use app's document directory which doesn't require external storage permission
      const directory = Platform.OS === 'ios' ? 'Documents' : RNFS.DocumentDirectoryPath;

      const options = {
        html: htmlContent,
        fileName: fileName.replace('.pdf', ''), // react-native-html-to-pdf adds .pdf automatically
        directory: Platform.OS === 'ios' ? 'Documents' : undefined,
        base64: false,
        height: 297,
        width: 210,
      };

      const pdf = await RNHTMLtoPDF.convert(options);

      if (pdf.filePath) {
        Alert.alert(
          'Berhasil!',
          `File PDF telah disimpan.\n\nLokasi: ${pdf.filePath}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Optionally open the PDF
                console.log('PDF saved at:', pdf.filePath);
              }
            }
          ]
        );
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Error',
        'Gagal membuat PDF. Silakan coba lagi atau periksa pengaturan izin aplikasi.'
      );
    } finally {
      setDownloadingId(null);
    }
  };


  const handleFormPress = async (item: FormulirItem) => {
    if (!item.available) {
      Alert.alert('Info', 'Formulir ini akan segera tersedia!');
      return;
    }

    if (item.is_downloadable) {
      if (item.id === '1') {
        // Generate PDF for Baptis Bayi form
        await generateAndDownloadPDF(item);
      } else {
        Alert.alert('Info', 'Fitur download untuk formulir ini sedang dalam pengembangan.');
      }
    } else {
      Alert.alert('Info', 'Fitur download untuk formulir ini sedang dalam pengembangan.');
    }
  };



  const renderFormItem = ({ item }: { item: FormulirItem }) => {
    const isDownloading = downloadingId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleFormPress(item)}
        style={styles.formCard}
        disabled={isDownloading}
      >
        <LinearGradient
          colors={item.available ? item.gradient : ['#e2e8f0', '#cbd5e0']}
          style={styles.formCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.formCardContent}>
            <View style={styles.iconContainer}>
              <Icon
                name={item.icon}
                size={32}
                color={item.available ? '#fff' : '#a0aec0'}
              />
            </View>
            <View style={styles.formInfo}>
              <Text style={[styles.formTitle, !item.available && styles.formTitleDisabled]}>
                {item.title}
              </Text>
              {!item.available && (
                <Text style={styles.comingSoon}>Segera Hadir</Text>
              )}
              {item.available && item.is_downloadable && (
                <Text style={styles.available}>Download Tersedia</Text>
              )}
              {item.available && !item.is_downloadable && (
                <Text style={styles.available}>Tersedia</Text>
              )}
            </View>
            {isDownloading ? (
              <ActivityIndicator size="small" color={item.available ? '#fff' : '#a0aec0'} />
            ) : (
              <Icon
                name={item.is_downloadable ? 'download' : 'chevron-right'}
                size={24}
                color={item.available ? '#fff' : '#a0aec0'}
              />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <LinearGradient
          colors={['#1a365d', colors.primary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Icon name="description" size={32} color={colors.white} />
            <Text style={styles.headerTitle}>Kumpulan Formulir</Text>
            <Text style={styles.headerSubtitle}>Paroki Santa Clara Bekasi</Text>
          </View>
        </LinearGradient>
      </View>

      <FlatList
        data={forms}
        renderItem={renderFormItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  formCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formCardGradient: {
    padding: 16,
  },
  formCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  formInfo: {
    flex: 1,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 20,
  },
  formTitleDisabled: {
    color: '#718096',
  },
  available: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  comingSoon: {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
