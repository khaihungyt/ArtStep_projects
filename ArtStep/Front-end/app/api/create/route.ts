export async function POST(req: Request) {
    const body = await req.json();
    return Response.json({ message: "Tạo thiết kế thành công", data: body });
}
