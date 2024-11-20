
export async function POST(request) {
    try {
        const body = await request.json();
        const result = await fetch('https://submagic-free-tools.fly.dev/api/youtube-info', {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await result.json();
    console.log(data);
    return Response.json(data);
    } catch (error) {
        console.error(error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
