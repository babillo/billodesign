// Contact form endpoint. Delivery is intentionally not implemented yet: the
// owner still has to choose an email option (docs/migration.md §3). Until
// then the form shows its standard error message.

export async function POST() {
  return Response.json({ error: "Contact form delivery is not configured yet." }, { status: 503 });
}
