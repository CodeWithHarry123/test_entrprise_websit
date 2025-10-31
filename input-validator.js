class InputValidator {
    static sanitizeHTML(input) {
        const temp = document.createElement('div');
        temp.textContent = input;
        return temp.innerHTML;
    }
    
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static validatePhone(phone) {
        const re = /^[6-9]\d{9}$/; // Indian phone number
        return re.test(phone);
    }
    
    static validatePincode(pincode) {
        const re = /^[1-9][0-9]{5}$/;
        return re.test(pincode);
    }
    
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input
            .trim()
            .replace(/[<>\"\']/g, '') // Remove potentially harmful characters
            .substring(0, 500); // Limit length
    }
}
