import { getUserDataFromDb, saveUserToDb } from "$lib/server/database/functions";
import type { RequestHandler } from "@sveltejs/kit";


export const GET: RequestHandler = async ({ request }) => {
    const { headers } = request;
    const username = headers.get('Username');
    const userKey = headers.get('UserKey');

    if (!username) return new Response();

    const result = await getUserDataFromDb(username, userKey);

    return new Response(JSON.stringify({
        success: result !== null,
        message: result ? "User found." : "User not found.",
        data: result
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const POST: RequestHandler = async ({ request, locals }) => {
    const { username, userKey, content } = await request.json();

    console.log('POST:', {username, userKey})
    const result = await saveUserToDb(username, userKey ?? "", content);

    return new Response(JSON.stringify({
        success: result !== null,
        message: result ? "User found & data synchronized." : "Something happened. Please try again later.",
        data: result
    }));
}