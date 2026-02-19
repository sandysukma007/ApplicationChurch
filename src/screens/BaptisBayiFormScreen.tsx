import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as RNHTMLtoPDF from 'react-native-html-to-pdf';

import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../styles/theme';




interface BaptisBayiFormScreenProps {

  navigation: any;
}

export const BaptisBayiFormScreen: React.FC<BaptisBayiFormScreenProps> = ({ navigation }) => {
  // Data Calon Baptis
  const [namaBaptis, setNamaBaptis] = useState('');
  const [namaSendiri, setNamaSendiri] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [usia, setUsia] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P' | ''>('');
  const [tanggalBaptis, setTanggalBaptis] = useState('');

  // Data Orang Tua Kandung
  const [namaAyah, setNamaAyah] = useState('');
  const [agamaAyah, setAgamaAyah] = useState('');
  const [namaIbu, setNamaIbu] = useState('');
  const [agamaIbu, setAgamaIbu] = useState('');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [hp, setHp] = useState('');
  const [noKKGereja, setNoKKGereja] = useState('');
  const [wilayah, setWilayah] = useState('');

  // Wali Baptis
  const [namaWali, setNamaWali] = useState('');
  const [wilayahWali, setWilayahWali] = useState('');
  const [parokiWali, setParokiWali] = useState('');

  // Lainnya
  const [nikAnak, setNikAnak] = useState('');
  const [tanggalPengisian, setTanggalPengisian] = useState('');

  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const generateFormHTML = (): string => {
    const jenisKelaminText = jenisKelamin === 'L' ? 'L' : jenisKelamin === 'P' ? 'P' : '....';
    const displayTanggalPengisian = tanggalPengisian || '....................';

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
    .data-inline {
      display: inline-block;
      border-bottom: 1px dotted #000;
      min-width: 50px;
      padding: 0 5px;
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
    .dotted-line {
      border-bottom: 1px dotted #000;
      display: inline-block;
      min-width: 100px;
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
      <span class="data-value">${namaBaptis || ''}</span>
      <span style="margin-left: 10px;">${jenisKelaminText}</span>
    </div>
    <div class="data-row">
      <span class="data-label">2. Nama Sendiri :</span>
      <span class="data-value">${namaSendiri || ''}</span>
    </div>
    <div class="data-row">
      <span class="data-label">3. Tempat, tgl. Lahir :</span>
      <span class="data-value">${tempatLahir || ''}, ${tanggalLahir || ''}</span>
      <span style="margin-left: 10px;">Usia ${usia || '....'} tahun</span>
    </div>
    <div class="data-row">
      <span class="data-label">4. Pembaptisan : tanggal</span>
      <span class="data-value">${tanggalBaptis || ''}</span>
      <span style="margin-left: 10px;">( rencana )</span>
    </div>
    <div class="data-row">
      <span class="data-label">5. Nomor Induk Kependudukan (NIK) Anak :</span>
      <span class="data-value">${nikAnak || ''}</span>
    </div>
  </div>

  <div class="section-title">DATA ORANG TUA KANDUNG ( lengkap dengan nama baptis )</div>
  <div class="data-table">
    <div class="data-row">
      <span class="data-label">1. Nama Ayah :</span>
      <span class="data-value">${namaAyah || ''}</span>
    </div>
    <div class="data-row">
      <span class="data-label">2. Agama Ayah :</span>
      <span class="data-value">${agamaAyah || ''}</span>
    </div>
    <div class="data-row">
      <span class="data-label">3. Nama Ibu :</span>
      <span class="data-value">${namaIbu || ''}</span>
    </div>
    <div class="data-row">
      <span class="data-label">4. Agama Ibu :</span>
      <span class="data-value">${agamaIbu || ''}</span>
    </div>
    <div class="data-row">
      <span class="data-label">5. Alamat :</span>
      <span class="data-value">${alamat || ''}</span>
    </div>
    <div class="data-row">
      <span class="data-label">6. Telepon :</span>
      <span class="data-value">${telepon || ''}</span>
      <span style="margin-left: 20px;">HP : ${hp || ''}</span>
    </div>
    <div class="data-row">
      <span class="data-label">7. No. KK. gereja :</span>
      <span class="data-value">${noKKGereja || ''}</span>
      <span style="margin-left: 20px;">Wilayah / Lingkungan : ${wilayah || ''}</span>
    </div>
  </div>

  <div class="section-title">WALI BAPTIS ( lengkap dengan nama baptis )</div>
  <div class="data-table">
    <div class="data-row">
      <span class="data-label">1. Nama Lengkap :</span>
      <span class="data-value">${namaWali || ''}</span>
    </div>
    <div class="data-row">
      <span class="data-label">2. Wilayah/Lingkungan:</span>
      <span class="data-value">${wilayahWali || ''}</span>
      <span style="margin-left: 20px;">Paroki : ${parokiWali || ''}</span>
    </div>
  </div>

  <div style="margin-top: 20px;">
    Bekasi , ${displayTanggalPengisian}
  </div>

  <div style="margin-top: 10px; font-size: 10pt;">
    Diterima pihak sekretariat<br>
    Tanggal : .........................<br>
    Oleh : .........................
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div>Orangtua,</div>
      <div class="signature-line">(.............................................)</div>
    </div>
    <div class="signature-box">
      <div>Mengetahui</div>
      <div>Ketua Lingkungan....................</div>
      <div class="signature-line">(...................................................)</div>
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


  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const htmlContent = generateFormHTML();
      const fileName = `Formulir_Baptis_Bayi_${namaSendiri.replace(/\s+/g, '_')}_${Date.now()}`;

      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: 'Documents',
        base64: false,
        height: 297,  // A4 height in mm
        width: 210,   // A4 width in mm
      };

      const pdf = await RNHTMLtoPDF.convert(options);

      if (pdf.filePath) {
        Alert.alert(
          'Berhasil!',
          `File PDF telah disimpan di:\n${pdf.filePath}\n\nAnda dapat menemukan file di folder Documents.`,
          [{ text: 'OK', onPress: () => setIsLoading(false) } ]
        );
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Error',
        'Gagal membuat PDF. Pastikan storage permission diizinkan.',
        [{ text: 'OK', onPress: () => setIsLoading(false) } ]
      );
    }
  };


  const validateForm = (): boolean => {

    if (!namaBaptis.trim()) {
      Alert.alert('Error', 'Nama Baptis harus diisi!');
      return false;
    }
    if (!namaSendiri.trim()) {
      Alert.alert('Error', 'Nama Sendiri harus diisi!');
      return false;
    }
    if (!tempatLahir.trim()) {
      Alert.alert('Error', 'Tempat Lahir harus diisi!');
      return false;
    }
    if (!tanggalLahir.trim()) {
      Alert.alert('Error', 'Tanggal Lahir harus diisi!');
      return false;
    }
    if (!jenisKelamin) {
      Alert.alert('Error', 'Jenis Kelamin harus dipilih!');
      return false;
    }
    if (!namaAyah.trim()) {
      Alert.alert('Error', 'Nama Ayah harus diisi!');
      return false;
    }
    if (!namaIbu.trim()) {
      Alert.alert('Error', 'Nama Ibu harus diisi!');
      return false;
    }
    if (!alamat.trim()) {
      Alert.alert('Error', 'Alamat harus diisi!');
      return false;
    }
    if (!hp.trim()) {
      Alert.alert('Error', 'Nomor HP harus diisi!');
      return false;
    }
    if (!namaWali.trim()) {
      Alert.alert('Error', 'Nama Wali Baptis harus diisi!');
      return false;
    }
    return true;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setIsPreview(true);
    }
  };

  const handleEdit = () => {
    setIsPreview(false);
  };




  const resetForm = () => {
    setNamaBaptis('');
    setNamaSendiri('');
    setTempatLahir('');
    setTanggalLahir('');
    setUsia('');
    setJenisKelamin('');
    setTanggalBaptis('');
    setNamaAyah('');
    setAgamaAyah('');
    setNamaIbu('');
    setAgamaIbu('');
    setAlamat('');
    setTelepon('');
    setHp('');
    setNoKKGereja('');
    setWilayah('');
    setNamaWali('');
    setWilayahWali('');
    setParokiWali('');
    setNikAnak('');
    setTanggalPengisian('');
  };


  const renderFormField = (label: string, value: string) => (
    <View style={styles.previewField}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue}>{value || '-'}</Text>
    </View>
  );

  if (isPreview) {
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
              onPress={() => handleEdit()}
            >
              <Icon name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Icon name="preview" size={32} color={colors.white} />
              <Text style={styles.headerTitle}>Preview Formulir</Text>
              <Text style={styles.headerSubtitle}>Formulir Sakramen Baptis Bayi</Text>
            </View>
          </LinearGradient>
        </View>

        <ScrollView style={styles.previewContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.previewCard}>
            <Text style={styles.previewSectionTitle}>DATA CALON BAPTIS</Text>
            {renderFormField('Nama Baptis', namaBaptis)}
            {renderFormField('Nama Sendiri', namaSendiri)}
            {renderFormField('Tempat, Tgl Lahir', `${tempatLahir}, ${tanggalLahir}`)}
            {renderFormField('Usia', `${usia} tahun`)}
            {renderFormField('Jenis Kelamin', jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan')}
            {renderFormField('Tanggal Baptis Rencana', tanggalBaptis)}

            <Text style={styles.previewSectionTitle}>DATA ORANG TUA KANDUNG</Text>
            {renderFormField('Nama Ayah', namaAyah)}
            {renderFormField('Agama Ayah', agamaAyah)}
            {renderFormField('Nama Ibu', namaIbu)}
            {renderFormField('Agama Ibu', agamaIbu)}
            {renderFormField('Alamat', alamat)}
            {renderFormField('Telepon', telepon)}
            {renderFormField('HP', hp)}
            {renderFormField('No. KK Gereja', noKKGereja)}
            {renderFormField('Wilayah/Lingkungan', wilayah)}

            <Text style={styles.previewSectionTitle}>WALI BAPTIS</Text>
            {renderFormField('Nama Lengkap', namaWali)}
            {renderFormField('Wilayah/Lingkungan', wilayahWali)}
            {renderFormField('Paroki', parokiWali)}

            <Text style={styles.previewSectionTitle}>LAINNYA</Text>
            {renderFormField('NIK Anak', nikAnak)}
            {renderFormField('Tanggal Pengisian', tanggalPengisian)}
          </View>
        </ScrollView>


        <View style={styles.previewButtonContainer}>
          <Button
            title="Edit Formulir"
            onPress={handleEdit}
            variant="secondary"
            icon="edit"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Download PDF"
            onPress={handleDownload}
            variant="gradient"
            icon="download"
            loading={isLoading}
          />
        </View>
      </View>
    );
  }

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
            <Icon name="child-care" size={32} color={colors.white} />
            <Text style={styles.headerTitle}>Form Baptis Bayi</Text>
            <Text style={styles.headerSubtitle}>Paroki Santa Clara Bekasi</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Data Calon Baptis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Calon Baptis</Text>

          <Input
            placeholder="Nama Baptis"
            value={namaBaptis}
            onChangeText={setNamaBaptis}
          />
          <Input
            placeholder="Nama Sendiri"
            value={namaSendiri}
            onChangeText={setNamaSendiri}
          />
          <Input
            placeholder="Tempat Lahir"
            value={tempatLahir}
            onChangeText={setTempatLahir}
          />
          <Input
            placeholder="Tanggal Lahir (contoh: 15 Januari 2024)"
            value={tanggalLahir}
            onChangeText={setTanggalLahir}
          />
          <Input
            placeholder="Usia (dalam tahun)"
            value={usia}
            onChangeText={setUsia}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Jenis Kelamin</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                jenisKelamin === 'L' && styles.genderButtonActive,
              ]}
              onPress={() => setJenisKelamin('L')}
            >
              <Icon
                name="male"
                size={24}
                color={jenisKelamin === 'L' ? colors.white : colors.text}
              />
              <Text
                style={[
                  styles.genderText,
                  jenisKelamin === 'L' && styles.genderTextActive,
                ]}
              >
                Laki-laki
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                jenisKelamin === 'P' && styles.genderButtonActive,
              ]}
              onPress={() => setJenisKelamin('P')}
            >
              <Icon
                name="female"
                size={24}
                color={jenisKelamin === 'P' ? colors.white : colors.text}
              />
              <Text
                style={[
                  styles.genderText,
                  jenisKelamin === 'P' && styles.genderTextActive,
                ]}
              >
                Perempuan
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            placeholder="Tanggal Baptis Rencana (contoh: 15 Februari 2024)"
            value={tanggalBaptis}
            onChangeText={setTanggalBaptis}
          />
        </View>

        {/* Data Orang Tua Kandung */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Orang Tua Kandung</Text>

          <Input
            placeholder="Nama Ayah ( Lengkap dengan nama baptis )"
            value={namaAyah}
            onChangeText={setNamaAyah}
          />
          <Input
            placeholder="Agama Ayah"
            value={agamaAyah}
            onChangeText={setAgamaAyah}
          />
          <Input
            placeholder="Nama Ibu ( Lengkap dengan nama baptis )"
            value={namaIbu}
            onChangeText={setNamaIbu}
          />
          <Input
            placeholder="Agama Ibu"
            value={agamaIbu}
            onChangeText={setAgamaIbu}
          />
          <Input
            placeholder="Alamat"
            value={alamat}
            onChangeText={setAlamat}
          />
          <Input
            placeholder="Telepon"
            value={telepon}
            onChangeText={setTelepon}
            keyboardType="phone-pad"
          />
          <Input
            placeholder="HP"
            value={hp}
            onChangeText={setHp}
            keyboardType="phone-pad"
          />
          <Input
            placeholder="No. KK Gereja"
            value={noKKGereja}
            onChangeText={setNoKKGereja}
          />
          <Input
            placeholder="Wilayah / Lingkungan"
            value={wilayah}
            onChangeText={setWilayah}
          />
        </View>

        {/* Wali Baptis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wali Baptis</Text>

          <Input
            placeholder="Nama Lengkap ( Lengkap dengan nama baptis )"
            value={namaWali}
            onChangeText={setNamaWali}
          />
          <Input
            placeholder="Wilayah / Lingkungan"
            value={wilayahWali}
            onChangeText={setWilayahWali}
          />
          <Input
            placeholder="Paroki"
            value={parokiWali}
            onChangeText={setParokiWali}
          />
        </View>

        {/* Lainnya */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lainnya</Text>

          <Input
            placeholder="Nomor Induk Kependudukan (NIK) Anak"
            value={nikAnak}
            onChangeText={setNikAnak}
            keyboardType="numeric"
          />
          <Input
            placeholder="Tanggal Pengisian (contoh: 15 Januari 2024)"
            value={tanggalPengisian}
            onChangeText={setTanggalPengisian}
          />
        </View>


        <View style={styles.buttonContainer}>
          <Button
            title="Preview Formulir"
            onPress={handlePreview}
            variant="gradient"
            icon="preview"
          />
        </View>
      </ScrollView>
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
  formContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: colors.white,
    gap: 8,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  genderTextActive: {
    color: colors.white,
  },
  buttonContainer: {
    paddingVertical: 20,
  },

  // Preview styles
  previewContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  previewField: {
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  previewButtonContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  buttonSpacer: {
    width: 12,
  },
});
