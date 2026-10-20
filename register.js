// Vercel serverless function: validates on the server, then saves to Supabase.
const AGES = ['Teenager', 'Adult', 'Middle-aged'];

function validate(b) {
  const e = {};
  const name = String(b.name ?? '').trim();
  const phone = String(b.phone ?? '').trim();
  const age = String(b.age ?? '');
  const address = String(b.address ?? '').trim();
  if (!name) e.name = 'Customer name is required.';
  else if (name.length < 2 || name.length > 100) e.name = 'Enter your full name.';
  if (!phone) e.phone = 'Contact number is required.';
  else if (!/^\d{10}$/.test(phone)) e.phone = 'Enter exactly 10 digits (numbers only).';
  if (!AGES.includes(age)) e.age = 'Please select an age group.';
  if (!address) e.address = 'Full delivery address is required.';
  else if (address.length < 10 || address.length > 300) e.address = 'Enter your complete address.';
  return { errors: e, clean: { name, phone, age_group: age, address } };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (body.website) return res.status(200).json({ ok: true }); // honeypot: silently drop bots

  const { errors, clean } = validate(body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ message: 'Server not configured' });

  const r = await fetch(`${url}/rest/v1/customers`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ ...clean, delivery_location: 'Guntur' }),
  });
  if (r.status === 409) return res.status(409).json({ errors: { phone: 'This number is already registered.' } });
  if (!r.ok) return res.status(500).json({ message: 'Could not save registration' });
  return res.status(200).json({ ok: true });
};
