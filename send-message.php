<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Sanitize input
    $name = htmlspecialchars(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars(trim($_POST["message"]));

    // Email to villa owner
    $owner_email = "istrianvillazara@gmail.com";
    $subject_owner = "New Contact Form Message from $name";
    $body_owner = "You received a new message from the contact form:\n\n"
                . "Name: $name\n"
                . "Email: $email\n\n"
                . "Message:\n$message";
    $headers_owner = "From: Istrian Villas Website <$owner_email>\r\nReply-To: $email";

    // Email to user (confirmation)
    $subject_user = "Thank you for contacting us!";
    $body_user = "Hi $name,\n\n"
               . "Thank you for your message. We’ve received your message and will get back to you as soon as possible.\n\n"
               . "Here’s a copy of your message:\n$message\n\n"
               . "Best regards,\nThe Istrian Villas";
    $headers_user = "From: Istrian Villas <$owner_email>\r\nReply-To: $owner_email";

    // Send emails
    $sent_to_owner = mail($owner_email, $subject_owner, $body_owner, $headers_owner);
    $sent_to_user = mail($email, $subject_user, $body_user, $headers_user);

    if ($sent_to_owner && $sent_to_user) {
        echo "Message sent successfully.";
    } else {
        echo "There was a problem sending the message. Please try again.";
    }
} else {
    echo "Invalid request.";
}
?>