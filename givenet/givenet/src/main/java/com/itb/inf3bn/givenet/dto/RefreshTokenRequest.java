package com.itb.inf3bn.givenet.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(@NotBlank String refresh_token) {
}
