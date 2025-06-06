export async function GET(_: Request, { params }: { params: { id: string } }) {
    const messages = [
        { from: "admin", text: "Chào bạn!" },
        { from: "user", text: "Chào bạn, tôi muốn đặt tranh" }
    ];
    return Response.json({ chatWith: params.id, messages });
}
