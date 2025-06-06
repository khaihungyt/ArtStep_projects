export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;

  if (username === "admin" && password === "123") {
    return Response.json({ message: "Đăng nhập thành công", userId: 1 });
  }

  return new Response(JSON.stringify({ message: "Đăng nhập thất bại" }), { status: 401 });
}
