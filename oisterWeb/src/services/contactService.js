const CONTACT_URL =
  import.meta.env.VITE_CONTACT_URL || "http://localhost:5000/api/contact";

export async function sendContact(formData) {
    const response = await fetch(CONTACT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    return response.json();
}