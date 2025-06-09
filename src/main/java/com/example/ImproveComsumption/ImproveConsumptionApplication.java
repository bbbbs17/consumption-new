package com.example.ImproveComsumption;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ImproveConsumptionApplication {
	public static void main(String[] args) {
		SpringApplication.run(ImproveConsumptionApplication.class, args);
	}
}
