package com.example.DXC;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DxcApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().load();
		System.out.println("MAIL_USERNAME: " + dotenv.get("MAIL_USERNAME"));

		SpringApplication.run(DxcApplication.class, args);
	}

}
