export async function GET() {
    const orders = [
        { id: 1, userId: 1, items: [1, 2], total: 300000 },
        { id: 2, userId: 2, items: [3], total: 150000 }
    ];
    return Response.json(orders);
}
