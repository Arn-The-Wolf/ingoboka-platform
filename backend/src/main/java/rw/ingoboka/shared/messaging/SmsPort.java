package rw.ingoboka.shared.messaging;

public interface SmsPort {

    void sendOtp(String phone, String otpCode);

    void sendMessage(String phone, String message);
}
