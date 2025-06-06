export async function GET() {
    const designs = [
        { id: 1, name: "Thiết kế A", author: "Nghệ nhân 1" },
        { id: 2, name: "Thiết kế B", author: "Nghệ nhân 2" }
    ];
    return Response.json(designs);
}
