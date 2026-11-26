// ==========================================
// DATABASE LOKAL (LOCAL STORAGE)
// ==========================================
// Inisialisasi data awal jika belum ada di localStorage
if (!localStorage.getItem('mm_customers')) {
    const defaultCustomers = [
        { id: 'C1', nama: 'PT. DAIKIN AIRCONDITIONING INDONESIA', alamat: 'JL. Wahid Hasyim II No. 8 Sempaja Selatan, Samarinda Utara, Kalimantan Timur' },
        { id: 'C2', nama: 'PT. JAPFA', alamat: 'Pangkalan Banteng, Kotawaringin Barat, Kalimantan Tengah' }
    ];
    localStorage.setItem('mm_customers', JSON.stringify(defaultCustomers));
}

// State Aplikasi
let customers = JSON.parse(localStorage.getItem('mm_customers'));
let cartInvoice = [];
let cartPenawaran = [];

// ==========================================
// NAVIGASI & INISIALISASI
// ==========================================
function bukaForm(type) {
    document.getElementById('dashboard').classList.add('hidden');

    if (type === 'invoice' || type === 'po') {
        document.getElementById('form-invoice').classList.remove('hidden');
        document.getElementById('title-form-invoice').innerText = type === 'po' ? 'Buat Purchase Order' : 'Buat Invoice';
        document.getElementById('docType').value = type === 'po' ? 'PURCHASE ORDER' : 'INVOICE';
        document.getElementById('docDate').valueAsDate = new Date();
        renderCustomerDropdown('customerSelect');
        cartInvoice = []; // Reset keranjang
        renderTabelInput();
    } else if (type === 'penawaran') {
        document.getElementById('form-penawaran').classList.remove('hidden');
        document.getElementById('penDate').valueAsDate = new Date();
        renderCustomerDropdown('penCustomerSelect');
        cartPenawaran = []; // Reset keranjang
        renderTabelPenawaran();
    }
}

function kembaliKeDashboard() {
    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
    document.getElementById('dashboard').classList.remove('hidden');
}

function tutupPreview() {
    document.querySelectorAll('.preview-container').forEach(el => el.classList.add('hidden'));
    // Kembalikan ke form sebelumnya
    if (!document.getElementById('form-invoice').classList.contains('hidden') ||
        !document.getElementById('form-penawaran').classList.contains('hidden')) {
        // Biarkan form tetap terbuka
    } else {
        document.getElementById('form-invoice').classList.remove('hidden');
    }
}

// ==========================================
// MANAJEMEN CUSTOMER
// ==========================================
function renderCustomerDropdown(elementId) {
    const select = document.getElementById(elementId);
    select.innerHTML = '';
    customers.forEach(c => {
        let opt = document.createElement('option');
        opt.value = c.id;
        opt.innerText = c.nama;
        select.appendChild(opt);
    });
}

function tambahCustomerBaru() {
    let nama = prompt("Masukkan Nama Customer / Perusahaan:");
    if (!nama) return;
    let alamat = prompt("Masukkan Alamat Lengkap:");
    if (!alamat) return;

    const newCustomer = {
        id: 'C' + Date.now(),
        nama: nama,
        alamat: alamat
    };

    customers.push(newCustomer);
    localStorage.setItem('mm_customers', JSON.stringify(customers));

    // Refresh dropdown
    renderCustomerDropdown('customerSelect');
    renderCustomerDropdown('penCustomerSelect');

    // Pilih customer baru tersebut
    document.getElementById('customerSelect').value = newCustomer.id;
    alert("Customer berhasil ditambahkan!");
}

// ==========================================
// LOGIKA INVOICE / PO
// ==========================================
function tambahItemManual() {
    const nama = document.getElementById('itemName').value;
    const harga = parseInt(document.getElementById('itemPrice').value);
    const qty = parseInt(document.getElementById('itemQty').value);

    if (!nama || isNaN(harga) || isNaN(qty)) {
        alert("Harap isi Nama, Harga, dan Qty dengan benar!");
        return;
    }

    cartInvoice.push({
        nama: nama,
        harga: harga,
        qty: qty,
        subTotal: harga * qty
    });

    // Reset form input
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemQty').value = '1';

    renderTabelInput();
}

function renderTabelInput() {
    const tbody = document.getElementById('tbodyInput');
    tbody.innerHTML = '';
    let total = 0;

    cartInvoice.forEach((item, index) => {
        total += item.subTotal;
        tbody.innerHTML += `
            <tr>
                <td>${item.nama}</td>
                <td>${item.qty}</td>
                <td>Rp ${formatRupiah(item.harga)}</td>
                <td>Rp ${formatRupiah(item.subTotal)}</td>
                <td><button class="btn-danger" style="padding:5px 10px;" onclick="hapusItemInvoice(${index})">X</button></td>
            </tr>
        `;
    });

    document.getElementById('totalHarga').innerText = formatRupiah(total);
}

function hapusItemInvoice(index) {
    cartInvoice.splice(index, 1);
    renderTabelInput();
}

function cetakInvoicePO() {
    if (cartInvoice.length === 0) return alert("Tambahkan item terlebih dahulu!");

    document.getElementById('form-invoice').classList.add('hidden');
    document.getElementById('preview-invoice-po').classList.remove('hidden');

    // Isi Data Header
    document.getElementById('p-docType').innerText = document.getElementById('docType').value;
    document.getElementById('p-docNumber').innerText = document.getElementById('docNumber').value || "-";

    const dateVal = document.getElementById('docDate').value;
    const dateObj = new Date(dateVal);
    document.getElementById('p-docDate').innerText = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Isi Customer
    const custId = document.getElementById('customerSelect').value;
    const customer = customers.find(c => c.id === custId);
    document.getElementById('p-customerName').innerText = customer.nama;
    document.getElementById('p-customerAddress').innerText = customer.alamat;

    // Isi Tabel
    const tbodyPrint = document.getElementById('tbodyPrint');
    tbodyPrint.innerHTML = '';
    let grandTotal = 0;

    cartInvoice.forEach((item, index) => {
        grandTotal += item.subTotal;
        tbodyPrint.innerHTML += `
            <tr>
                <td style="text-align:center;">${index + 1}</td>
                <td>${item.nama}</td>
                <td style="text-align:center;">${item.qty}</td>
                <td style="text-align:right;">${formatRupiah(item.harga)}</td>
                <td style="text-align:right;">${formatRupiah(item.subTotal)}</td>
            </tr>
        `;
    });

    document.getElementById('p-total').innerText = "Rp " + formatRupiah(grandTotal);
    document.getElementById('p-terbilang').innerText = "Terbilang : " + terbilang(grandTotal) + " Rupiah";
}

// ==========================================
// LOGIKA PENAWARAN
// ==========================================
function tambahItemPenawaran() {
    const nama = document.getElementById('penItemName').value;
    const harga = parseInt(document.getElementById('penItemPrice').value);
    const qty = parseInt(document.getElementById('penItemQty').value);
    const unit = document.getElementById('penItemUnit').value;

    if (!nama || isNaN(harga) || isNaN(qty)) {
        alert("Harap isi Deskripsi, Harga, dan Qty dengan benar!");
        return;
    }

    cartPenawaran.push({
        nama: nama,
        harga: harga,
        qty: qty,
        unit: unit,
        subTotal: harga * qty
    });

    document.getElementById('penItemName').value = '';
    document.getElementById('penItemPrice').value = '';
    document.getElementById('penItemQty').value = '1';

    renderTabelPenawaran();
}

function renderTabelPenawaran() {
    const tbody = document.getElementById('tbodyPenawaran');
    tbody.innerHTML = '';

    cartPenawaran.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${item.nama}</td>
                <td>${item.qty}</td>
                <td>${item.unit}</td>
                <td>Rp ${formatRupiah(item.harga)}</td>
                <td>Rp ${formatRupiah(item.subTotal)}</td>
                <td><button class="btn-danger" style="padding:5px 10px;" onclick="hapusItemPenawaran(${index})">X</button></td>
            </tr>
        `;
    });
}

function hapusItemPenawaran(index) {
    cartPenawaran.splice(index, 1);
    renderTabelPenawaran();
}

function cetakPenawaran() {
    if (cartPenawaran.length === 0) return alert("Tambahkan item penawaran terlebih dahulu!");

    document.getElementById('form-penawaran').classList.add('hidden');
    document.getElementById('preview-penawaran').classList.remove('hidden');

    // Isi Tanggal
    const dateVal = document.getElementById('penDate').value;
    const dateObj = new Date(dateVal);
    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('p-pen-date').innerText = `Pangkalan Bun, ${dateStr}`;

    // Isi Customer
    const custId = document.getElementById('penCustomerSelect').value;
    const customer = customers.find(c => c.id === custId);
    document.getElementById('p-pen-customerName').innerText = customer.nama;
    document.getElementById('p-pen-customerAddress').innerText = customer.alamat;

    // Isi Perihal & Keterangan
    document.getElementById('p-pen-subject').innerText = document.getElementById('penSubject').value;

    const notes = document.getElementById('penNotes').value.split('\n');
    const notesHtml = notes.map(n => `<li>${n.replace('-', '').trim()}</li>`).join('');
    document.getElementById('p-pen-notes').innerHTML = `<ul>${notesHtml}</ul>`;

    // Isi Tabel
    const tbodyPrint = document.getElementById('tbodyPrintPenawaran');
    tbodyPrint.innerHTML = '';

    cartPenawaran.forEach((item, index) => {
        tbodyPrint.innerHTML += `
            <tr>
                <td style="text-align:center;">${index + 1}.</td>
                <td>${item.nama}</td>
                <td style="text-align:center;">${item.qty}</td>
                <td style="text-align:center;">${item.unit}</td>
                <td style="text-align:right;">${formatRupiah(item.harga)}</td>
                <td style="text-align:right;">${formatRupiah(item.subTotal)}</td>
            </tr>
        `;
    });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID').format(angka);
}

function terbilang(nilai) {
    const bilangan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let temp = "";

    if (nilai < 12) {
        temp = " " + bilangan[nilai];
    } else if (nilai < 20) {
        temp = terbilang(nilai - 10) + " Belas";
    } else if (nilai < 100) {
        temp = terbilang(Math.floor(nilai / 10)) + " Puluh" + terbilang(nilai % 10);
    } else if (nilai < 200) {
        temp = " Seratus" + terbilang(nilai - 100);
    } else if (nilai < 1000) {
        temp = terbilang(Math.floor(nilai / 100)) + " Ratus" + terbilang(nilai % 100);
    } else if (nilai < 2000) {
        temp = " Seribu" + terbilang(nilai - 1000);
    } else if (nilai < 1000000) {
        temp = terbilang(Math.floor(nilai / 1000)) + " Ribu" + terbilang(nilai % 1000);
    } else if (nilai < 1000000000) {
        temp = terbilang(Math.floor(nilai / 1000000)) + " Juta" + terbilang(nilai % 1000000);
    }
    return temp.trim();
}

// Fungsi untuk mereset LocalStorage (jika ingin mulai dari nol)
function hapusDataTersimpan() {
    if (confirm("Apakah Anda yakin ingin menghapus semua data Customer yang tersimpan?")) {
        localStorage.removeItem('mm_customers');
        location.reload();
    }
}