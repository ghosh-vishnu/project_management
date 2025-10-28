const EMAIL_REGEX = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,15}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{7,}$/;
const AADHAR_REGEX = /^[2-9][0-9]{11}$/;

const NUMBER_ONLY_REGEX = /^[0-9]+$/ ;

export {
    EMAIL_REGEX,
    PHONE_REGEX,
    PASSWORD_REGEX,
    AADHAR_REGEX,
    NUMBER_ONLY_REGEX,
}