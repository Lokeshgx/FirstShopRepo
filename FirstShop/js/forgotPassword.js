document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const successMessage = document.getElementById('successMessage');

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const submitButton = forgotPasswordForm.querySelector('.submit-btn');

        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Simulate API call (replace with your actual API endpoint)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            forgotPasswordForm.style.display = 'none';
            successMessage.style.display = 'block';

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send reset link. Please try again.');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = 'Reset Password';
        }
    });
});
