document.addEventListener("DOMContentLoaded", () => {
    // Cek di halaman mana kita berada
    if (document.getElementById('cert-details')) {
        initCertificateView();
    } else if (document.getElementById('cert-form')) {
        initAdminPage();
    }
});

// ===================================
// Halaman Publik (index.html)
// ===================================
function initCertificateView() {
    const certDetails = document.getElementById('cert-details');
    const urlParams = new URLSearchParams(window.location.search);
    const certId = urlParams.get('id');

    if (!certId) {
        certDetails.innerHTML = `<div class="error">Error: ID Sertifikat tidak ditemukan.</div>`;
        return;
    }

    // Panggil backend Netlify Function kita
    fetch(`/.netlify/functions/get-certificate?id=${certId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Sertifikat tidak ditemukan');
            }
            return response.json();
        })
        .then(data => {
            displayCertificate(data);
        })
        .catch(error => {
            console.error("Error:", error);
            certDetails.innerHTML = `<div class="error">Error: Sertifikat dengan ID '${certId}' tidak ditemukan.</div>`;
        });
}

function displayCertificate(data) {
    const certDetails = document.getElementById('cert-details');
    certDetails.innerHTML = ""; // Hapus 'Loading'

    const labels = [
        "Certificate Number", "Company name", "Company's address",
        "Certification Standards", "Scope", "Effective Date",
        "Surveillance 1st", "Surveillance 2nd", "Expire Date", "Status"
    ];

    const dataKeys = [
        "certificate_number", "company_name", "company_address", "certification_standards",
        "scope", "effective_date", "surveillance_1st", "surveillance_2nd", "expire_date", "status"
    ];

    labels.forEach((label, index) => {
        const key = dataKeys[index];
        const value = data[key] || "N/A";
        const row = document.createElement('div');
        row.className = 'cert-row';
        row.innerHTML = `
            <div class="cert-label">${label}</div>
            <div class="cert-data">${value}</div>
        `;
        certDetails.appendChild(row);
    });
}

// ===================================
// Halaman Admin (admin.html)
// ===================================
function initAdminPage() {
    const user = window.netlifyIdentity.currentUser();

    // Proteksi Halaman: Jika tidak ada user, tendang ke login
    if (!user) {
        window.location.replace("/login.html");
    }

    // Arahkan user ke admin setelah login
    window.netlifyIdentity.on('login', () => {
        window.location.href = "/admin.html";
    });

    // Tangani form submission
    const certForm = document.getElementById('cert-form');
    const message = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');

    certForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';

        const certData = {
            certificate_number: document.getElementById('cert-number').value,
            company_name: document.getElementById('company-name').value,
            company_address: document.getElementById('company-address').value,
            certification_standards: document.getElementById('standards').value,
            scope: document.getElementById('scope').value,
            effective_date: document.getElementById('effective-date').value,
            surveillance_1st: document.getElementById('surv-1').value,
            surveillance_2nd: document.getElementById('surv-2').value,
            expire_date: document.getElementById('expire-date').value,
            status: document.getElementById('status').value
        };

        // Dapatkan token login user
        const user = window.netlifyIdentity.currentUser();
        user.jwt().then(token => {
            // Kirim data ke backend (Netlify Function)
            fetch('/.netlify/functions/save-certificate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Kirim token untuk verifikasi
                },
                body: JSON.stringify(certData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gagal menyimpan data. Pastikan Anda login.');
                }
                return response.json();
            })
            .then(data => {
                message.style.color = 'green';
                message.textContent = `Data berhasil disimpan! Link: ${data.link}`;
                certForm.reset();
            })
            .catch(error => {
                message.style.color = 'red';
                message.textContent = error.message;
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Simpan Sertifikat';
            });
        });
    });
}
