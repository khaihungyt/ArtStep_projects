export async function GET() {
    const artisans = [
        { id: 1, name: "Nghệ nhân A", specialty: "Sơn dầu" },
        { id: 2, name: "Nghệ nhân B", specialty: "Trừu tượng" }
    ];
    return Response.json(artisans);
}
