// Impor Supabase
const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    
    // Ambil variabel rahasia dari Netlify
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    // Buat koneksi Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Ambil 'id' dari URL, contoh: ?id=QMS0251025
    const certId = event.queryStringParameters.id;

    if (!certId) {
        return { statusCode: 400, body: 'ID tidak ditemukan' };
    }

    try {
        // Ambil data dari tabel 'certificates'
        const { data, error } = await supabase
            .from('certificates')
            .select('*')
            .eq('certificate_number', certId)
            .single(); // .single() untuk ambil 1 data

        if (error) {
            throw error;
        }

        // Kirim data sebagai respon
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        return { statusCode: 404, body: `Sertifikat tidak ditemukan: ${error.message}` };
    }
};
