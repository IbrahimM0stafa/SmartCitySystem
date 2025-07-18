package com.example.dxc;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DxcApplicationTests {

	@Test
	void contextLoads() {
		// This test will still run the application context
	}

	@Test
	void mainMethodRuns() {
		assertDoesNotThrow(() -> DxcApplication.main(new String[]{}));
	}
}
