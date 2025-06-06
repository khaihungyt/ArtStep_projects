import { proxy } from 'valtio'

const state = proxy({
    color: '#ffffff',             // Màu giày
    logoDecal: './logo.png',      // Logo mặc định
    isLogoTexture: true,          // Có hiển thị logo không
    isFullTexture: false,         // (Tuỳ chọn sau)
})

export default state
