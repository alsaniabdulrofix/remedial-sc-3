1. Memuat Data Saat Halaman Dibuka (Inisialisasi)
Saat Anda pertama kali membuka atau memuat ulang (refresh) halaman, aplikasi akan langsung memeriksa penyimpanan lokal browser (LocalStorage).

Jika ada data tugas yang tersimpan dari sesi sebelumnya, data tersebut akan diambil dan diubah kembali menjadi daftar objek dalam memori kerja (state).

Jika kosong, aplikasi akan menyiapkan daftar kosong baru.

2. Proses Menambah Tugas Baru

Anda mengetik nama rencana kerja pada kolom input dan menekan tombol "Tambah" atau Enter.

Aplikasi secara otomatis menahan halaman agar tidak melakukan pemuatan ulang (refresh page) menggunakan perintah event.preventDefault().

Sistem memeriksa keabsahan teks (tidak boleh kosong atau hanya berisi spasi).

Teks tersebut kemudian dikemas menjadi sebuah objek data baru dengan status belum selesai (done: false) dan penanda waktu unik sebagai ID. Objek ini lalu dimasukkan ke dalam daftar utama di memori.

3. Menyimpan Data & Memperbarui Tampilan (Render)
Setiap kali terjadi perubahan data (baik saat menambah, menghapus, atau mengubah status tugas) :

Penyimpanan: Daftar data terbaru di memori langsung disimpan secara otomatis ke dalam LocalStorage.

Pembaruan Tampilan: Daftar tampilan HTML dikosongkan terlebih dahulu. Setelah itu, aplikasi menggambar ulang baris-baris tugas baru secara aman menggunakan perintah textContent (bukan innerHTML) untuk menjamin tidak ada celah keamanan berupa injeksi kode berbahaya (XSS).

4. Mengubah Status & Menghapus Tugas (Pendelegasian Peristiwa)
Aplikasi menggunakan metode hemat memori yang disebut Event Delegation. Alih-alih memasang fungsi pendengar klik pada setiap tombol atau kotak centang secara individual, aplikasi hanya memasang satu fungsi pendengar klik terpusat pada elemen induk <ul>.

Saat Anda mengklik area daftar tugas, sistem akan mendeteksi objek spesifik yang Anda klik (event.target) :

Jika mengklik Kotak Centang (Checkbox): Aplikasi mencari ID tugas tersebut dan mengubah status selesai (done) dari salah (false) menjadi benar (true), atau sebaliknya.

Jika mengklik Tombol Hapus: Aplikasi mencari ID tugas tersebut dan membuangnya dari daftar data utama.

Setelah proses deteksi ini selesai, aplikasi kembali menyimpan perubahan ke LocalStorage dan merender ulang tampilan agar Anda bisa langsung melihat hasilnya di layar.