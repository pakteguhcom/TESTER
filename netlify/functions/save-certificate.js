const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    
    // 1. Verifikasi Admin (Security)
    const { user } = context.clientContext;
    if (!user) {
        return { statusCode: 401, body: 'Anda harus login untuk menyimpan data' };
    }
    
    // 2. Ambil variabel rahasia
    const SUPABASE_URL = process.env.SUPABASE_URL;
    // Gunakan KUNCI RAHASIA (service_role) karena kita akan MENULIS data
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    // 3. Buat koneksi Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // 4. Ambil data dari frontend
    const certData = JSON.parse(event.body);

    try {
        // 5. Simpan data ke tabel
        // .upsert() akan update jika ada, atau buat baru jika belum ada
        const { data, error } = await supabase
            .from('certificates')
            .upsert(certData)
            .select();

        if (error) {
            throw error;
        }

        // 6. Buat link untuk di-copy
        // Ambil URL situs dari Netlify
        const siteUrl = process.env.URL || 'https://situs-anda.netlify.app';
        const finalLink = `${siteUrl}/index.html?id=${certData.certificate_number}`;

        // 7. Kirim respon sukses
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data berhasil disimpan', link: finalLink, data: data[0] })
        };

    } catch (error) {
        return { statusCode: 500, body: `Error: ${error.message}` };
    }
};
