<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recolectar los datos del formulario
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $agency = htmlspecialchars($_POST['agency']);
    $years = htmlspecialchars($_POST['years']);
    $affiliations = htmlspecialchars($_POST['affiliations']);
    $sold_cuba = htmlspecialchars($_POST['sold-cuba']);
    $who_used = htmlspecialchars($_POST['who-used']);
    $client_spend = htmlspecialchars($_POST['client-spend']);
    $fam_interest = htmlspecialchars($_POST['fam-interest']);
    $interest = htmlspecialchars($_POST['interest']);

    // Configurar el destinatario y el contenido del correo
    $to = "sales@cubaprivatetravel.com";  // Aquí va tu dirección de correo
    $subject = "Nuevo Formulario de Interés FAM";
    $message = "
    Nombre: $name\n
    Email: $email\n
    Agencia: $agency\n
    Años de Experiencia: $years\n
    Afiliaciones: $affiliations\n
    ¿Ha vendido Cuba antes?: $sold_cuba\n
    ¿A quién usó?: $who_used\n
    Gasto Diario por Cliente: $client_spend\n
    Interés en FAM: $fam_interest\n
    Razón de Interés: $interest
    ";
    $headers = "From: $email";

    // Enviar el correo
    if (mail($to, $subject, $message, $headers)) {
        echo "Formulario enviado correctamente. Nos pondremos en contacto contigo pronto.";
    } else {
        echo "Hubo un error al enviar el formulario. Por favor, intenta de nuevo.";
    }
}
?>