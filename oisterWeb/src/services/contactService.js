export async function sendContact(formData) {
    const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    return response.json();
}