const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

export type Mood = "happy" | "sad" | "angry" | "tired" | "calm";

export interface Diary {
    _id: string;
    userId: string;
    title: string;
    content: string;
    mood: Mood;
    imageUrls: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ImageAsset {
    uri: string;
    name?: string;
    type?: string;
}

export interface CreateDiaryParams {
    title: string;
    content: string;
    mood: Mood;
    images?: ImageAsset[];
}

export interface UpdateDiaryParams {
    title?: string;
    content?: string;
    mood?: Mood;
}

function validateDiaryId(diaryId: string) {
    if (!diaryId || diaryId === "undefined") {
        throw new Error("diaryId가 없습니다.");
    }
}

async function apiFetch<T>(
    path: string,
    token: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: HeadersInit = {
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error ?? "알 수 없는 오류가 발생했습니다");
    }

    return data as T;
}

export async function getDiaries(token: string): Promise<Diary[]> {
    return apiFetch<Diary[]>("/api/diary", token, { method: "GET" });
}

export async function getDiary(token: string, diaryId: string): Promise<Diary> {
    validateDiaryId(diaryId);
    return apiFetch<Diary>(`/api/diary/${diaryId}`, token, { method: "GET" });
}

export async function createDiary(
    token: string,
    { title, content, mood, images = [] }: CreateDiaryParams
): Promise<Diary> {
    const form = new FormData();
    form.append("title", title);
    form.append("content", content);
    form.append("mood", mood);

    images.forEach((img) => {
        form.append("images", {
            uri: img.uri,
            name: img.name ?? "photo.jpg",
            type: img.type ?? "image/jpeg",
        } as unknown as Blob);
    });

    return apiFetch<Diary>("/api/diary", token, {
        method: "POST",
        body: form,
    });
}

export async function updateDiary(
    token: string,
    diaryId: string,
    fields: UpdateDiaryParams
): Promise<Diary> {
    validateDiaryId(diaryId);

    return apiFetch<Diary>(
        `/api/diary/${diaryId}`,
        token,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fields),
        }
    );
}

export async function deleteDiary(
    token: string,
    diaryId: string
): Promise<{ message: string }> {
    validateDiaryId(diaryId);

    return apiFetch<{ message: string }>(
        `/api/diary/${diaryId}`,
        token,
        { method: "DELETE" }
    );
}