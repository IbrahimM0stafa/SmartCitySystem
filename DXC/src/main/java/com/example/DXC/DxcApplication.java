package com.example.DXC;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class DxcApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

		System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET", System.getenv("JWT_SECRET")));
		System.setProperty("MAIL_USERNAME", dotenv.get("MAIL_USERNAME", System.getenv("MAIL_USERNAME")));
		System.setProperty("MAIL_PASSWORD", dotenv.get("MAIL_PASSWORD", System.getenv("MAIL_PASSWORD")));
		System.setProperty("GOOGLE_CLIENT_ID", dotenv.get("GOOGLE_CLIENT_ID", System.getenv("GOOGLE_CLIENT_ID")));
		System.setProperty("GOOGLE_CLIENT_SECRET", dotenv.get("GOOGLE_CLIENT_SECRET", System.getenv("GOOGLE_CLIENT_SECRET")));
		SpringApplication.run(DxcApplication.class, args);
	}

}
