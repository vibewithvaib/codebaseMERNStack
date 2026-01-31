package com.campus.campusradargateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CampusradarGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusradarGatewayApplication.class, args);
    }

}
